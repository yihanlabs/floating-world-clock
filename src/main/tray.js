'use strict';

/**
 * System tray.
 *
 * The Tray instance is kept in module scope on purpose: if it were only a local
 * variable it would be garbage collected and the icon would silently vanish.
 */

const { Tray, Menu, nativeImage } = require('electron');
const { TRAY_ICON_DATA_URL } = require('./tray-icon');

let tray = null;

function buildImage() {
  const image = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
  if (image.isEmpty()) return nativeImage.createEmpty();
  // Windows renders the notification area at 16 logical px; downsample for crispness.
  return image.resize({ width: 16, height: 16, quality: 'best' });
}

function buildMenu(handlers) {
  const win = handlers.getWindow();
  const visible = !!win && !win.isDestroyed() && win.isVisible();
  const state = handlers.getState();

  return Menu.buildFromTemplate([
    {
      label: visible ? '隐藏时钟' : '显示时钟',
      click: () => handlers.onToggleVisible()
    },
    { type: 'separator' },
    {
      label: '始终置顶',
      type: 'checkbox',
      checked: !!state.alwaysOnTop,
      click: (item) => handlers.onToggleAlwaysOnTop(item.checked)
    },
    {
      label: '开机自动启动',
      type: 'checkbox',
      checked: !!state.autoLaunch,
      click: (item) => handlers.onToggleAutoLaunch(item.checked)
    },
    { type: 'separator' },
    {
      label: '重置到默认位置',
      click: () => handlers.onResetPosition()
    },
    {
      label: '退出',
      click: () => handlers.onQuit()
    }
  ]);
}

/**
 * Create the tray icon.
 * @param {object} handlers getWindow/getState/onToggleVisible/onToggleAlwaysOnTop/
 *                          onToggleAutoLaunch/onResetPosition/onQuit
 */
function createTray(handlers) {
  tray = new Tray(buildImage());
  // An empty tooltip can make the icon invisible on Windows, so always set one.
  tray.setToolTip('Desktop Clock · 世界时钟');
  tray.on('double-click', () => handlers.onToggleVisible());
  refreshTray(handlers);
  return tray;
}

/** Rebuild the context menu so checkbox states and the show/hide label stay accurate. */
function refreshTray(handlers) {
  if (!tray || tray.isDestroyed()) return;
  tray.setContextMenu(buildMenu(handlers));
}

function destroyTray() {
  if (tray && !tray.isDestroyed()) tray.destroy();
  tray = null;
}

module.exports = { createTray, refreshTray, destroyTray };
