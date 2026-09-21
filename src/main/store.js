'use strict';

/**
 * Tiny JSON state store in Electron's userData directory.
 * Zero dependencies; writes are debounced so window drags don't hammer the disk.
 */

const fs = require('node:fs');
const path = require('node:path');
const { app } = require('electron');

const MAX_ZONES = 12;
const MIN_OPACITY = 0.3;

const DEFAULTS = {
  zones: ['Asia/Shanghai', 'America/Los_Angeles'],
  opacity: 1,
  density: 'comfortable',
  alwaysOnTop: true,
  autoLaunch: false,
  position: null
};

let statePath = null;
let cache = null;
let flushTimer = null;

function file() {
  if (!statePath) statePath = path.join(app.getPath('userData'), 'state.json');
  return statePath;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Coerce anything read from disk into a shape we can trust. */
function sanitize(raw) {
  const next = { ...DEFAULTS, zones: [...DEFAULTS.zones] };
  if (!isPlainObject(raw)) return next;

  if (Array.isArray(raw.zones)) {
    const zones = raw.zones.filter(
      (tz) => typeof tz === 'string' && tz.length > 0 && tz.length <= 64
    );
    if (zones.length > 0) next.zones = zones.slice(0, MAX_ZONES);
  }

  if (typeof raw.opacity === 'number' && Number.isFinite(raw.opacity)) {
    next.opacity = clamp(raw.opacity, MIN_OPACITY, 1);
  }

  if (raw.density === 'compact' || raw.density === 'comfortable') {
    next.density = raw.density;
  }

  if (typeof raw.alwaysOnTop === 'boolean') next.alwaysOnTop = raw.alwaysOnTop;
  if (typeof raw.autoLaunch === 'boolean') next.autoLaunch = raw.autoLaunch;

  if (
    isPlainObject(raw.position) &&
    Number.isFinite(raw.position.x) &&
    Number.isFinite(raw.position.y)
  ) {
    next.position = { x: Math.round(raw.position.x), y: Math.round(raw.position.y) };
  }

  return next;
}

function load() {
  if (cache) return cache;
  try {
    cache = sanitize(JSON.parse(fs.readFileSync(file(), 'utf8')));
  } catch {
    cache = sanitize(null); // missing or corrupt file -> defaults
  }
  return cache;
}

function writeNow() {
  if (!cache) return;
  try {
    fs.mkdirSync(path.dirname(file()), { recursive: true });
    fs.writeFileSync(file(), JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[store] could not persist state:', err.message);
  }
}

function save() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    writeNow();
  }, 300);
}

/** Merge a patch into state, sanitize, and schedule a write. Returns the new state. */
function update(patch) {
  const current = load();
  cache = sanitize({ ...current, ...patch });
  save();
  return cache;
}

/** Cancel the debounce and write synchronously (used on quit). */
function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  writeNow();
}

module.exports = {
  DEFAULTS,
  MAX_ZONES,
  MIN_OPACITY,
  load,
  update,
  flush
};
