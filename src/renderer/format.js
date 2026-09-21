'use strict';

/**
 * Time zone formatting, built entirely on Intl -- no date library.
 */

const WEEKDAYS_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const formatterCache = new Map();

function formatterFor(timeZone) {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      // Deliberately not hour12:false -- some locales resolve that to h24 and render
      // midnight as "24:00".
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

/**
 * Break a moment down into the civil date/time observed in `timeZone`.
 *
 * formatToParts is the only safe route here: toLocaleString output varies by locale
 * and ICU version (separators, field order, U+202F narrow no-break spaces), so slicing
 * its string is not reliable.
 */
function zoneParts(timeZone, date) {
  const parts = Object.create(null);
  for (const { type, value } of formatterFor(timeZone).formatToParts(date)) {
    parts[type] = value;
  }
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: parts.hour === '24' ? '00' : parts.hour,
    minute: parts.minute
  };
}

/**
 * UTC midnight of a civil date. A calendar date has the same weekday everywhere, so
 * anchoring in UTC keeps DST transitions from skewing the result.
 */
function civilDayNumber({ year, month, day }) {
  return Date.UTC(year, month - 1, day);
}

function weekdayCN(parts) {
  return WEEKDAYS_CN[new Date(civilDayNumber(parts)).getUTCDay()];
}

/** Whole-day difference between a zone's civil date and the machine's local date. */
function dayOffset(parts, localDate) {
  const localDay = Date.UTC(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate()
  );
  return Math.round((civilDayNumber(parts) - localDay) / 86400000);
}

/** `9/21/2026` -- matches the reference layout (US order, no leading zeros). */
function formatDate(parts) {
  return `${parts.month}/${parts.day}/${parts.year}`;
}

/** `10:02` */
function formatTime(parts) {
  return `${parts.hour}:${parts.minute}`;
}

/** Signed day-delta chip, e.g. `-1d` / `+1d`; empty string when it is the same day. */
function formatDayOffset(offset) {
  if (!offset) return '';
  return offset > 0 ? `+${offset}d` : `${offset}d`;
}

const Format = {
  WEEKDAYS_CN,
  zoneParts,
  weekdayCN,
  dayOffset,
  formatDate,
  formatTime,
  formatDayOffset
};

if (typeof module !== 'undefined' && module.exports) module.exports = Format;
if (typeof window !== 'undefined') window.Format = Format;
