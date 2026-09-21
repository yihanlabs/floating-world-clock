'use strict';

/**
 * Generates the application icons from scratch -- no image libraries.
 *
 *   build/icon.ico    multi-size Windows icon (16/24/32/48/64/128/256)
 *   build/icon.png    1024x1024, from which electron-builder derives the macOS .icns
 *
 * The artwork matches the tray icon (src/main/tray-icon.js): a #1f5fbf disc with
 * white clock hands set to 3:00. Everything is drawn at 4x and box-downsampled,
 * which is what gives the disc a clean edge at small sizes.
 *
 * Why hand-rolled: this project ships with zero runtime dependencies, and pulling
 * in sharp/pngjs just to rasterise one logo once at build time is not worth it.
 * PNG and ICO are both simple containers -- see encodePNG / buildICO below.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const OUT_DIR = path.join(__dirname, '..', 'build');

const ACCENT = [0x1f, 0x5f, 0xbf]; // matches --accent in styles.css
const SUPERSAMPLE = 4;

/** Windows icon sizes. 256 is stored as PNG; everything smaller as a BMP. */
const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256];
const PNG_SIZE = 1024;

// ---------------------------------------------------------------------------
// PNG encoding
// ---------------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, crc]);
}

/**
 * @param {number} width
 * @param {number} height
 * @param {Buffer} rgba  width*height*4 bytes
 * @returns {Buffer} a complete PNG file
 */
function encodePNG(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour with alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // Each scanline is prefixed with its filter byte. A per-scanline "up" filter
  // (2) does better than filter 0 on smooth gradients, but 0 keeps this readable
  // and the images are tiny -- zlib handles the rest.
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function createCanvas(size) {
  return { size, data: Buffer.alloc(size * size * 4) };
}

/**
 * Signed distance from a point to a line segment, used for the antialiased clock
 * hands. At 4x supersampling the hands still alias visibly if drawn as plain rects.
 */
function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  let t = lengthSq === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/**
 * Renders the clock face into a canvas at SUPERSAMPLE times the requested size.
 * Coordinates are normalised to a 0..1 square so the artwork scales cleanly.
 */
function drawFace(targetSize) {
  const size = targetSize * SUPERSAMPLE;
  const canvas = createCanvas(size);
  const data = canvas.data;

  const centre = size / 2;
  // Leave a hair of margin: Windows trims icons hard at 16px and a disc flush with
  // the edge looks clipped next to other taskbar icons.
  const radius = size * 0.47;
  const ringWidth = size * 0.052;
  const handWidth = size * 0.062;

  // Hands point at 3:00, matching the tray icon.
  const handLength = radius * 0.6;
  const tailLength = radius * 0.16;
  const hands = [
    [centre, centre, centre + handLength, centre], // minute hand -> 3
    [centre, centre, centre, centre - handLength * 0.62] // hour hand  -> 12
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const px = x + 0.5;
      const py = y + 0.5;
      const dist = Math.hypot(px - centre, py - centre);

      let alpha = 0;
      if (dist <= radius) alpha = 1;

      if (alpha === 0) continue;

      let [r, g, b] = ACCENT;

      // Inner ring, inset from the rim, in white at partial opacity.
      const ringOuter = radius - size * 0.075;
      const ringInner = ringOuter - ringWidth;
      if (dist <= ringOuter && dist >= ringInner) {
        [r, g, b] = mix([r, g, b], [255, 255, 255], 0.55);
      }

      for (const [ax, ay, bx, by] of hands) {
        // Round the free end so it reads as a hand rather than a cut-off bar.
        const d = Math.min(distanceToSegment(px, py, ax, ay, bx, by), Math.hypot(px - bx, py - by));
        if (d <= handWidth / 2) {
          [r, g, b] = [255, 255, 255];
          break;
        }
      }

      // Tail opposite the minute hand, so the hands look balanced.
      const tailD = Math.min(
        distanceToSegment(px, py, centre - tailLength, centre, centre, centre),
        Math.hypot(px - (centre - tailLength), py - centre)
      );
      if (tailD <= handWidth / 2) {
        [r, g, b] = [255, 255, 255];
      }

      const [cr, cg, cb] = [Math.round(r), Math.round(g), Math.round(b)];
      // Cap the hub last so the hands meet in a clean white circle.
      if (dist <= handWidth * 0.72) {
        data[(y * size + x) * 4 + 0] = 255;
        data[(y * size + x) * 4 + 1] = 255;
        data[(y * size + x) * 4 + 2] = 255;
      } else {
        data[(y * size + x) * 4 + 0] = cr;
        data[(y * size + x) * 4 + 1] = cg;
        data[(y * size + x) * 4 + 2] = cb;
      }
      data[(y * size + x) * 4 + 3] = 255;
    }
  }

  return downsample(canvas, targetSize);
}

function mix(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Box filter from the SUPERSAMPLE canvas down to targetSize, preserving alpha. */
function downsample(canvas, target) {
  const src = canvas.data;
  const srcSize = canvas.size;
  const factor = srcSize / target;
  const out = Buffer.alloc(target * target * 4);

  for (let y = 0; y < target; y += 1) {
    for (let x = 0; x < target; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      const y0 = Math.floor(y * factor);
      const y1 = Math.min(srcSize, Math.floor((y + 1) * factor));
      const x0 = Math.floor(x * factor);
      const x1 = Math.min(srcSize, Math.floor((x + 1) * factor));

      for (let sy = y0; sy < y1; sy += 1) {
        for (let sx = x0; sx < x1; sx += 1) {
          const i = (sy * srcSize + sx) * 4;
          const sa = src[i + 3] / 255;
          r += src[i] * sa;
          g += src[i + 1] * sa;
          b += src[i + 2] * sa;
          a += sa;
          n += 1;
        }
      }

      const o = (y * target + x) * 4;
      if (a > 0) {
        out[o] = Math.round(r / a);
        out[o + 1] = Math.round(g / a);
        out[o + 2] = Math.round(b / a);
      }
      out[o + 3] = Math.round((a / n) * 255);
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// ICO container
// ---------------------------------------------------------------------------

/**
 * ICO stores bitmaps bottom-up, with an AND mask that is only consulted by very
 * old shells -- but it still has to be present and correctly sized (1bpp, padded
 * to 4-byte rows), otherwise Explorer renders the icon with black fringes.
 *
 * The 256px entry is written as a PNG instead of a BMP: that is what Vista and
 * later expect, and it keeps the file small.
 */
function buildICO(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(16 * entries.length);
  let offset = header.length + directory.length;
  const blobs = [];

  entries.forEach((entry, index) => {
    const { size, png, rgba } = entry;
    const data = png || encodeBMP(size, rgba);
    const at = index * 16;
    directory[at] = size >= 256 ? 0 : size; // 256 is encoded as 0
    directory[at + 1] = size >= 256 ? 0 : size;
    directory[at + 2] = 0; // palette size
    directory[at + 3] = 0; // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
    blobs.push(data);
  });

  return Buffer.concat([header, directory, ...blobs]);
}

/** 32bpp BGRA DIB, bottom-up, plus the legacy 1bpp AND mask. */
function encodeBMP(size, rgba) {
  const header = Buffer.alloc(40);
  header.writeUInt32LE(40, 0); // BITMAPINFOHEADER size
  header.writeInt32LE(size, 4);
  header.writeInt32LE(size * 2, 8); // height doubled: XOR bitmap + AND mask
  header.writeUInt16LE(1, 12); // planes
  header.writeUInt16LE(32, 14); // bpp
  header.writeUInt32LE(0, 16); // BI_RGB

  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    const srcRow = size - 1 - y; // flip vertically
    for (let x = 0; x < size; x += 1) {
      const s = (srcRow * size + x) * 4;
      const d = (y * size + x) * 4;
      pixels[d] = rgba[s + 2]; // B
      pixels[d + 1] = rgba[s + 1]; // G
      pixels[d + 2] = rgba[s]; // R
      pixels[d + 3] = rgba[s + 3]; // A
    }
  }

  // Fully opaque alpha channel makes the mask redundant, but the rows must exist.
  const maskStride = Math.ceil(size / 32) * 4;
  const mask = Buffer.alloc(maskStride * size);
  header.writeUInt32LE(pixels.length, 20);

  return Buffer.concat([header, pixels, mask]);
}

// ---------------------------------------------------------------------------

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // One supersampled pass per distinct size; the 4x canvas is the expensive part.
  const cache = new Map();
  const at = (size) => {
    if (!cache.has(size)) cache.set(size, drawFace(size));
    return cache.get(size);
  };

  const entries = ICO_SIZES.map((size) => ({
    size,
    rgba: at(size),
    // 256px entries are PNG-compressed; smaller ones stay uncompressed BMP.
    png: size >= 256 ? encodePNG(size, size, at(size)) : null
  }));

  const icoPath = path.join(OUT_DIR, 'icon.ico');
  fs.writeFileSync(icoPath, buildICO(entries));

  const pngPath = path.join(OUT_DIR, 'icon.png');
  fs.writeFileSync(pngPath, encodePNG(PNG_SIZE, PNG_SIZE, at(PNG_SIZE)));

  const kb = (p) => (fs.statSync(p).size / 1024).toFixed(1);
  console.log(`icon.ico  ${kb(icoPath)} KB  (${ICO_SIZES.join(', ')})`);
  console.log(`icon.png  ${kb(pngPath)} KB  (${PNG_SIZE}x${PNG_SIZE})`);
}

main();
