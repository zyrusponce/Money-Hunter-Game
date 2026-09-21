// Small helpers for drawing pixel art with canvas rectangles.
import { makeCanvas, mulberry32 } from './canvasUtil.js';

export const S = 16; // tile size in pixels

export const px = (g, c, x, y, w = 1, h = 1) => {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
};

// A filled pixel circle.
export const disc = (g, c, cx, cy, r) => {
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y) + 0.5);
    px(g, c, cx - w, cy + y, w * 2 + 1, 1);
  }
};

// Bresenham line, one pixel wide.
export const line = (g, c, x0, y0, x1, y1) => {
  let dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  let dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (let i = 0; i < 64; i++) {
    px(g, c, x, y);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
};

export const speckle = (g, seed, colors, n, w = S, h = S) => {
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) px(g, colors[Math.floor(r() * colors.length)], Math.floor(r() * w), Math.floor(r() * h));
};

export const shadow = (g, x = 3, y = 13, w = 10, h = 2) => px(g, 'rgba(0,0,0,0.22)', x, y, w, h);

// Run a painter on a fresh canvas.
export function make(fn, w = S, h = S) {
  const c = makeCanvas(w, h);
  const g = c.getContext('2d');
  if (g) g.imageSmoothingEnabled = false;
  fn(g);
  return c;
}
