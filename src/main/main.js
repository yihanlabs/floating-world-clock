'use strict';

/**
 * Desktop Clock -- main process.
 *
 * Responsibilities: single-instance guard, the always-on-top frameless window,
 * content-driven sizing, the minute ticker, tray, auto-launch and IPC.
 */

const path = require('node:path');
const { app, BrowserWindow, ipcMain, screen, powerMonitor, session } = require('electron');

const store = require('./store');
const windowState = require('./window-state');
const tray = require('./tray');

const INITIAL_WIDTH = 300;
const INITIAL_HEIGHT = 190;
const MIN_WIDTH = 200;
const MAX_WIDTH = 900;
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 1600;

const RENDERER_DIR = path.join(__dirname, '..', 'renderer');
const PRELOAD_PATH = path.join(__dirname, '..', 'preload', 'preload.js');

/** @type {BrowserWindow|null} */
let win = null;
let hasShownWindow = false;
let boundsSaveTimer = null;
let tickTimer = null;
/**
 * Set while we resize the window ourselves, so the resulting 'move' is not persisted
 * as the user's chosen position. 'move' can be delivered a tick later, so the flag is
 * cleared on a short timer rather than immediately.
 */
let applyingBounds = false;
let applyingBoundsTimer = null;

/** Backstop against a renderer crash loop, so a broken GPU cannot spin us forever. */
const WINDOW_LOSS_WINDOW_MS = 30000;
const WINDOW_LOSS_LIMIT = 3;
let lastWindowLoss = 0;
let windowLossCount = 0;

function markBoundsApplied() {
  applyingBounds = true;
  if (applyingBoundsTimer) clearTimeout(applyingBoundsTimer);
  applyingBoundsTimer = setTimeout(() => {
    applyingBoundsTimer = null;
    applyingBounds = false;
  }, 150);
}

// ---------------------------------------------------------------------------
// Single instance: a second launch should surface the existing clock, not stack one.
// ---------------------------------------------------------------------------

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });

  app.whenReady().then(bootstrap);
}

// ---------------------------------------------------------------------------
// Auto-launch
// ---------------------------------------------------------------------------

/**
 * In development `process.execPath` is electron.exe, so the app directory has to be
 * passed as an argument -- without it the OS would start a bare Electron shell.
 */
function autoLaunchOptions() {
  return app.isPackaged
    ? { path: process.execPath, args: [] }
    : { path: process.execPath, args: [app.getAppPath()] };
}

function isAutoLaunchEnabled() {
  try {
    return app.getLoginItemSettings(autoLaunchOptions()).openAtLogin;
  } catch {
    return false;
  }
}

function applyAutoLaunch(enabled) {
  try {
    app.setLoginItemSettings({ openAtLogin: !!enabled, ...autoLaunchOptions() });
  } catch (err) {
    console.error('[autolaunch] could not update login item:', err.message);
  }
  return isAutoLaunchEnabled();
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function trayHandlers() {
  return {
    getWindow: () => win,
    getState: () => ({
      alwaysOnTop: !!store.load().alwaysOnTop,
      autoLaunch: isAutoLaunchEnabled()
    }),
    onToggleVisible: () => {
      if (win && !win.isDestroyed() && win.isVisible()) hideWindow();
      else showWindow();
    },
    onToggleAlwaysOnTop: (value) => setAlwaysOnTop(value),
    onToggleAutoLaunch: (value) => setAutoLaunch(value),
    onResetPosition: () => resetPosition(),
    onQuit: () => quitApp()
  };
}

function refreshTrayMenu() {
  tray.refreshTray(trayHandlers());
}

function bootstrap() {
  const state = store.load();

  // Windows: Electron needs an explicit AppUserModelID for correct shell identity.
  app.setAppUserModelId('com.yihan.desktop-clock');

  createWindow(state);

  tray.createTray(trayHandlers());

  // Self-heal a stale registry entry (e.g. the project folder was moved).
  const desiredAutoLaunch = store.load().autoLaunch;
  if (desiredAutoLaunch !== isAutoLaunchEnabled()) applyAutoLaunch(desiredAutoLaunch);

  registerIpc();
  startTicker();

  powerMonitor.on('resume', pushTick);
  powerMonitor.on('unlock-screen', pushTick);

  app.on('before-quit', () => {
    app.isQuitting = true;
    stopTicker();
    persistPosition();
    store.flush();
  });

  // The clock lives in the tray: closing the window must not end the app.
  app.on('window-all-closed', () => {});

  app.on('activate', () => showWindow());
}

function createWindow(state) {
  const size = { width: INITIAL_WIDTH, height: INITIAL_HEIGHT };
  const { x, y } = windowState.restorePosition(state.position, size);

  win = new BrowserWindow({
    width: size.width,
    height: size.height,
    x,
    y,
    frame: false,
    transparent: true,
    // A transparent window must not be given an opaque backdrop.
    backgroundColor: '#00000000',
    // Native shadows are ignored on transparent windows; the CSS card draws its own.
    hasShadow: false,
    // On Windows `transparent` and `resizable` are mutually exclusive; sizing is
    // driven from the renderer instead.
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: state.alwaysOnTop,
    show: false,
    title: 'Desktop Clock',
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      // Keep the renderer painting while hidden behind other windows.
      backgroundThrottling: false
    }
  });

  win.setMenuBarVisibility(false);
  applyAlwaysOnTopLevel(state.alwaysOnTop);

  win.loadFile(path.join(RENDERER_DIR, 'index.html'));

  win.once('ready-to-show', () => {
    // The renderer reports its measured size almost immediately; showing before that
    // would flash a wrongly sized window. Fall back to showing anyway.
    setTimeout(() => showWindow(), 500);
  });

  win.on('show', () => {
    pushTick();
    refreshTrayMenu();
  });

  win.on('hide', () => refreshTrayMenu());

  win.on('move', () => {
    if (applyingBounds) return;
    schedulePersistPosition();
  });

  // Closing means "hide to tray" -- only the tray's Quit really exits.
  win.on('close', (event) => {
    if (app.isQuitting) return;
    event.preventDefault();
    hideWindow();
  });

  // This window never navigates or opens children.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());

  // A crashed renderer leaves an empty frame behind. Rebuild instead of showing nothing.
  win.webContents.on('render-process-gone', (_event, details) => {
    if (app.isQuitting) return;
    console.warn('[window] renderer gone:', (details && details.reason) || 'unknown');
    if (win && !win.isDestroyed()) win.destroy();
    win = null;
    showWindow();
  });

  return win;
}

/**
 * `setAlwaysOnTop(true)` without a level is not enough on Windows: the default level
 * sits *below* the taskbar. 'screen-saver' is the highest documented level and is the
 * only one that reliably keeps the clock above the taskbar and other topmost windows.
 */
function applyAlwaysOnTopLevel(enabled) {
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(!!enabled, 'screen-saver');
}

/**
 * Rebuild the window when it has been lost -- a renderer crash, or the OS destroying it.
 * Without this the app degrades into a tray-only zombie: every `showWindow()` call would
 * bail out on the destroyed window and the clock could never come back.
 * Returns true when a rebuild was started (the new window shows itself on ready-to-show).
 */
function rebuildWindowIfNeeded() {
  if (win && !win.isDestroyed()) return false;

  const now = Date.now();
  if (now - lastWindowLoss > WINDOW_LOSS_WINDOW_MS) windowLossCount = 0;
  lastWindowLoss = now;
  windowLossCount += 1;

  if (windowLossCount > WINDOW_LOSS_LIMIT) {
    console.error('[window] renderer keeps dying; leaving the clock hidden');
    return false;
  }

  console.warn('[window] rebuilding the clock window');
  win = null;
  createWindow(store.load());
  return true;
}

function showWindow() {
  if (rebuildWindowIfNeeded()) return;
  if (!win || win.isDestroyed()) return;
  if (win.isMinimized()) win.restore();
  win.show();
  win.setAlwaysOnTop(!!store.load().alwaysOnTop, 'screen-saver');
  win.focus();
  pushTick();
}

function hideWindow() {
  if (!win || win.isDestroyed()) return;
  persistPosition();
  win.hide();
}

function setAlwaysOnTop(value) {
  const next = !!value;
  store.update({ alwaysOnTop: next });
  applyAlwaysOnTopLevel(next);
  refreshTrayMenu();
  return next;
}

function setAutoLaunch(value) {
  const actual = applyAutoLaunch(!!value);
  store.update({ autoLaunch: actual });
  refreshTrayMenu();
  return actual;
}

function resetPosition() {
  const bounds = win ? win.getBounds() : { width: INITIAL_WIDTH, height: INITIAL_HEIGHT };
  const { x, y } = windowState.defaultPosition(bounds);
  if (win && !win.isDestroyed()) {
    markBoundsApplied();
    win.setBounds({ x, y, width: bounds.width, height: bounds.height });
  }
  store.update({ position: { x, y } });
  showWindow();
}

function quitApp() {
  app.isQuitting = true;
  persistPosition();
  store.flush();
  app.quit();
}

// ---------------------------------------------------------------------------
// Position persistence
// ---------------------------------------------------------------------------

function persistPosition() {
  if (boundsSaveTimer) {
    clearTimeout(boundsSaveTimer);
    boundsSaveTimer = null;
  }
  if (!win || win.isDestroyed()) return;
  const { x, y } = win.getBounds();
  store.update({ position: { x, y } });
}

function schedulePersistPosition() {
  if (boundsSaveTimer) clearTimeout(boundsSaveTimer);
  boundsSaveTimer = setTimeout(() => {
    boundsSaveTimer = null;
    persistPosition();
  }, 400);
}

// ---------------------------------------------------------------------------
// Content-driven sizing
// ---------------------------------------------------------------------------

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function applyContentSize(rawWidth, rawHeight) {
  if (!win || win.isDestroyed()) return;

  const width = clamp(rawWidth, MIN_WIDTH, MAX_WIDTH);
  const height = clamp(rawHeight, MIN_HEIGHT, MAX_HEIGHT);
  const current = win.getBounds();

  const display = screen.getDisplayNearestPoint({
    x: current.x + Math.round(current.width / 2),
    y: current.y + Math.round(current.height / 2)
  });
  const next = windowState.clampToDisplay(display, {
    x: current.x,
    y: current.y,
    width,
    height
  });

  if (
    current.width === next.width &&
    current.height === next.height &&
    current.x === next.x &&
    current.y === next.y
  ) {
    return;
  }

  markBoundsApplied();
  win.setBounds(next);
}

// ---------------------------------------------------------------------------
// Ticker
// ---------------------------------------------------------------------------

/**
 * The renderer is throttled by Chromium while the window is hidden, so the clock is
 * driven from here. Each tick realigns to the next minute boundary, which keeps the
 * display accurate without accumulating setTimeout drift.
 */
function startTicker() {
  stopTicker();
  const step = () => {
    pushTick();
    const now = Date.now();
    tickTimer = setTimeout(step, 60000 - (now % 60000) + 50);
  };
  tickTimer = setTimeout(step, 250);
}

function stopTicker() {
  if (tickTimer) {
    clearTimeout(tickTimer);
    tickTimer = null;
  }
}

function pushTick() {
  if (win && !win.isDestroyed()) {
    win.webContents.send('clock:tick', Date.now());
  }
}

// ---------------------------------------------------------------------------
// IPC
// ---------------------------------------------------------------------------

function registerIpc() {
  ipcMain.handle('clock:getState', () => {
    const state = store.load();
    return {
      zones: state.zones,
      opacity: state.opacity,
      density: state.density,
      alwaysOnTop: state.alwaysOnTop,
      autoLaunch: isAutoLaunchEnabled(),
      maxZones: store.MAX_ZONES,
      minOpacity: store.MIN_OPACITY,
      now: Date.now()
    };
  });

  ipcMain.handle('clock:setZones', (_event, zones) => {
    const list = Array.isArray(zones)
      ? zones
          .filter((tz) => typeof tz === 'string' && tz.length > 0 && tz.length <= 64)
          .slice(0, store.MAX_ZONES)
      : [];
    store.update({ zones: list });
    return store.load().zones;
  });

  ipcMain.handle('clock:setOpacity', (_event, value) => {
    store.update({ opacity: value });
    return store.load().opacity;
  });

  ipcMain.handle('clock:setDensity', (_event, value) => {
    store.update({ density: value === 'compact' ? 'compact' : 'comfortable' });
    return store.load().density;
  });

  ipcMain.handle('clock:setAlwaysOnTop', (_event, value) => setAlwaysOnTop(value));

  ipcMain.handle('clock:setAutoLaunch', (_event, value) => setAutoLaunch(value));

  ipcMain.handle('clock:resize', (_event, size) => {
    if (!size || typeof size !== 'object') return;
    applyContentSize(size.width, size.height);
    if (!hasShownWindow) {
      hasShownWindow = true;
      showWindow();
    }
  });

  ipcMain.handle('clock:resetPosition', () => resetPosition());

  ipcMain.handle('clock:quit', () => quitApp());

  // Keep the app's own origin locked down.
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
}
