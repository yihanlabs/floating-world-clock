'use strict';

/**
 * Window position restore with multi-display safety.
 *
 * Only the position is persisted -- the window's size is always derived from the
 * renderer's measured content, so a stale size can never fight the layout.
 */

const { screen } = require('electron');

/** A restored window must overlap some display's work area by at least this much. */
const MIN_VISIBLE = 100;
const EDGE_MARGIN = 24;

function visibleAreaOn(bounds, workArea) {
  const overlapX = Math.min(bounds.x + bounds.width, workArea.x + workArea.width) -
    Math.max(bounds.x, workArea.x);
  const overlapY = Math.min(bounds.y + bounds.height, workArea.y + workArea.height) -
    Math.max(bounds.y, workArea.y);
  return { overlapX, overlapY };
}

function isReachable(bounds) {
  return screen.getAllDisplays().some((display) => {
    const { overlapX, overlapY } = visibleAreaOn(bounds, display.workArea);
    return overlapX >= MIN_VISIBLE && overlapY >= MIN_VISIBLE;
  });
}

/**
 * Top-right of the primary work area: out of the way of the main work region,
 * and clear of the taskbar.
 */
function defaultPosition(size) {
  const { workArea } = screen.getPrimaryDisplay();
  return {
    x: workArea.x + workArea.width - size.width - EDGE_MARGIN,
    y: workArea.y + EDGE_MARGIN
  };
}

/**
 * @param {{x:number,y:number}|null} saved previously persisted position
 * @param {{width:number,height:number}} size initial window size
 * @returns {{x:number,y:number}}
 */
function restorePosition(saved, size) {
  if (saved && isReachable({ ...saved, width: size.width, height: size.height })) {
    return { x: Math.round(saved.x), y: Math.round(saved.y) };
  }
  // Monitor was unplugged, resolution changed, or first run.
  return defaultPosition(size);
}

/**
 * Clamp a desired window box so it stays inside the display it currently sits on.
 * Used when the content grows (settings panel) near a screen edge.
 */
function clampToDisplay(display, box) {
  const { workArea } = display;
  const width = Math.min(box.width, workArea.width);
  const height = Math.min(box.height, workArea.height);
  return {
    x: Math.round(Math.min(Math.max(box.x, workArea.x), workArea.x + workArea.width - width)),
    y: Math.round(Math.min(Math.max(box.y, workArea.y), workArea.y + workArea.height - height)),
    width,
    height
  };
}

module.exports = { restorePosition, clampToDisplay, defaultPosition, isReachable };
