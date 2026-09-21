import { TILES } from '../tiles.js';
import { mulberry32 } from '../../game/canvasUtil.js';

// A tiny helper for building tile maps in code. Every map has two layers:
//   ground - always filled with a ground tile
//   top    - optional overlay tile (trees, walls, furniture ...)
export class MapBuilder {
  constructor(w, h, ground = 'grass') {
    this.w = w;
    this.h = h;
    this.ground = Array.from({ length: h }, () => Array(w).fill(ground));
    this.top = Array.from({ length: h }, () => Array(w).fill(null));
    this.reserved = [];
  }

  inb(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  // Place one tile. Ground tiles replace the ground (and clear the overlay); other tiles go on top.
  put(x, y, id) {
    if (!this.inb(x, y)) return this;
    const def = TILES[id];
    if (!def) throw new Error(`Unknown tile "${id}"`);
    if (def.layer === 'ground') {
      this.ground[y][x] = id;
      this.top[y][x] = null;
    } else {
      this.top[y][x] = id;
    }
    return this;
  }

  fill(x, y, w, h, id) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, id);
    return this;
  }

  hline(x1, x2, y, id) {
    return this.fill(x1, y, x2 - x1 + 1, 1, id);
  }

  vline(x, y1, y2, id) {
    return this.fill(x, y1, 1, y2 - y1 + 1, id);
  }

  frame(x, y, w, h, id) {
    this.hline(x, x + w - 1, y, id);
    this.hline(x, x + w - 1, y + h - 1, id);
    this.vline(x, y, y + h - 1, id);
    this.vline(x + w - 1, y, y + h - 1, id);
    return this;
  }

  border(id, t = 1) {
    for (let k = 0; k < t; k++) this.frame(k, k, this.w - 2 * k, this.h - 2 * k, id);
    return this;
  }

  // Remove overlay tiles from a rectangle (used to open exits in borders).
  clear(x, y, w = 1, h = 1) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.inb(i, j)) this.top[j][i] = null;
    return this;
  }

  // Carve walkable ground (caves / interior rooms) and clear anything on top.
  carve(x, y, w, h, ground) {
    for (let j = y; j < y + h; j++)
      for (let i = x; i < x + w; i++)
        if (this.inb(i, j)) {
          this.ground[j][i] = ground;
          this.top[j][i] = null;
        }
    return this;
  }

  ellipse(cx, cy, rx, ry, id) {
    for (let y = cy - ry; y <= cy + ry; y++)
      for (let x = cx - rx; x <= cx + rx; x++) {
        const dx = (x - cx) / (rx + 0.35);
        const dy = (y - cy) / (ry + 0.35);
        if (dx * dx + dy * dy <= 1) this.put(x, y, id);
      }
    return this;
  }

  // A house: (h - 1) roof rows plus one facade row. `door` is the x offset of the door in the facade row.
  house(x, y, w, h, { roof = 'roofRed', facade = 'facade', door = null, doorTile = 'doorClosed' } = {}) {
    this.fill(x, y, w, h - 1, roof);
    this.fill(x, y + h - 1, w, 1, facade);
    if (door !== null) this.put(x + door, y + h - 1, doorTile);
    return this;
  }

  reserve(x, y, w, h) {
    this.reserved.push({ x, y, w, h });
    return this;
  }

  isReserved(x, y) {
    return this.reserved.some((r) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h);
  }

  // Randomly sprinkle a tile over free ground. Deterministic per seed.
  scatter(id, count, { x = 0, y = 0, w = this.w, h = this.h, seed = 1, on = ['grass'] } = {}) {
    const rnd = mulberry32(seed * 7919 + count);
    let placed = 0;
    let guard = 0;
    while (placed < count && guard++ < count * 60) {
      const px = x + Math.floor(rnd() * w);
      const py = y + Math.floor(rnd() * h);
      if (!this.inb(px, py) || this.top[py][px] || this.isReserved(px, py)) continue;
      if (!on.includes(this.ground[py][px])) continue;
      this.top[py][px] = id;
      placed++;
    }
    return this;
  }

  build() {
    return { width: this.w, height: this.h, ground: this.ground, top: this.top };
  }
}
