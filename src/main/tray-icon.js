'use strict';

/**
 * Tray icon, inlined as a base64 PNG data URL so the app ships with no binary assets.
 *
 * Generated from a 128x128 supersampled render downsampled to 32x32:
 * a #1f5fbf disc with white clock hands at 3:00 (bold shapes survive tray downscaling).
 */
const TRAY_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABIklEQVR42s2XsQ2DMBBFXVCwRRag8BgM4DphBA+SjVykTBmlygguowhFLijIGR2IECDYB9iWXoPA/3O2z3eMOY7D6ZICHBBAgQh8lrItBopaIQUYoJ7A4DvFKmZgkgSQgJ4RnULjt4mveAbcPISH2DkyV/EcKFcQb7Fz5S7i1YriLdVfExj2cgPxfiSyuQ3ntObH873BY08kYwak6x9dH88Gj0jIsXOudzSgv/IEJo56RwOWom9ABTCg+uE3AQyYZhnwEqkDGLBwhjdZKAPCewO2Bl7vqjMyZNFGpBjoR4FiQGyYehctAQ9ogJOOIRHTZUPfREREkVMxkYJ8GRHQP0Wrz3VMQK5SkBCK1CS+kiyKojSKsjyKxiSK1iyK5nSP9vwDnHb7K6vEJO8AAAAASUVORK5CYII=';

module.exports = { TRAY_ICON_DATA_URL };
