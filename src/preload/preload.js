'use strict';

/**
 * Preload bridge.
 *
 * Only a fixed whitelist of operations is exposed -- `ipcRenderer` itself is never
 * handed to the renderer, so page scripts cannot reach arbitrary IPC channels.
 */

const { contextBridge, ipcRenderer } = require('electron');

const TICK_CHANNEL = 'clock:tick';

/** Subscribe to the main-process minute tick. Returns an unsubscribe function. */
function onTick(callback) {
  if (typeof callback !== 'function') return () => {};
  const listener = (_event, timestamp) => callback(timestamp);
  ipcRenderer.on(TICK_CHANNEL, listener);
  return () => ipcRenderer.removeListener(TICK_CHANNEL, listener);
}

contextBridge.exposeInMainWorld('clock', {
  getState: () => ipcRenderer.invoke('clock:getState'),
  setZones: (zones) => ipcRenderer.invoke('clock:setZones', zones),
  setOpacity: (value) => ipcRenderer.invoke('clock:setOpacity', value),
  setDensity: (value) => ipcRenderer.invoke('clock:setDensity', value),
  setAlwaysOnTop: (value) => ipcRenderer.invoke('clock:setAlwaysOnTop', value),
  setAutoLaunch: (value) => ipcRenderer.invoke('clock:setAutoLaunch', value),
  resize: (size) => ipcRenderer.invoke('clock:resize', size),
  resetPosition: () => ipcRenderer.invoke('clock:resetPosition'),
  quit: () => ipcRenderer.invoke('clock:quit'),
  onTick
});
