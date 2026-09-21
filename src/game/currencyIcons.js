// Original pixel-art currency icons, generated in code. No photographs of real banknotes are used;
// every icon is a simple stylised coin, note, shell, bead, ingot, gem or artifact.
import { makeCanvas, mulberry32 } from './canvasUtil.js';
import { px, disc, line } from './paint.js';

const N = 32; // icon canvas size

// [dark, mid, base, light]
const TONES = {
  gold: ['#8a5f14', '#d9a01f', '#f6c744', '#fff0a8'],
  silver: ['#56606e', '#98a4b2', '#c9d3dc', '#f4f8fc'],
  copper: ['#6b3416', '#b3622f', '#d9834c', '#f6b58a'],
  bronze: ['#4f3a1a', '#8a6a34', '#b98b4e', '#e0b878'],
  jade: ['#1f5a44', '#3f9a76', '#6fd0a4', '#c0f5dc'],
  red: ['#6b1a1a', '#b23a3a', '#e2574c', '#ff9a90'],
  blue: ['#1a3a6b', '#3a6fbf', '#5b93e8', '#a8caff'],
  purple: ['#3f2a6b', '#7a55c2', '#a37ce8', '#d8c0ff'],
  teal: ['#134f4f', '#2a9a9a', '#4fd0c8', '#a8f5ee'],
  green: ['#1f4f2a', '#3f8f4f', '#62b872', '#b0e8ba'],
  orange: ['#7a3a10', '#d9822b', '#f5a24a', '#ffd39a'],
  brown: ['#3f2a16', '#7a5230', '#a67a4a', '#d8b384'],
  pink: ['#7a1f4a', '#c2477a', '#f27aa8', '#ffc0d8'],
  pearl: ['#5a6a8a', '#b8c8e8', '#f0f5ff', '#ffffff'],
};

const NOTE_TONES = ['green', 'blue', 'red', 'purple', 'teal', 'orange', 'brown'];
const COIN_TONES = ['silver', 'silver', 'gold', 'copper', 'bronze'];

const ORIGIN_GLYPH = {
  Philippines: 'P',
  'United States': '$',
  Japan: 'Y',
  Eurozone: 'E',
  'United Kingdom': 'L',
  China: 'Y',
  'South Korea': 'W',
  Singapore: '$',
  Malaysia: 'R',
  Thailand: 'B',
  Indonesia: 'R',
  Australia: '$',
  Canada: '$',
  India: 'R',
  Germany: 'M',
};
const CATEGORY_GLYPH = { Ancient: 'sun', Historical: 'crown', Commemorative: 'star', 'Special Edition': 'star', Fictional: 'dia' };

// 5x7 bitmaps
const GLYPHS = {
  $: ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..'],
  P: ['#####', '#...#', '#####', '#...#', '####.', '#....', '#....'],
  E: ['..###', '.#...', '####.', '.#...', '####.', '.#...', '..###'],
  L: ['..##.', '.#..#', '.#...', '####.', '.#...', '.#...', '#####'],
  Y: ['#...#', '.#.#.', '..#..', '#####', '..#..', '#####', '..#..'],
  W: ['#...#', '#.#.#', '#####', '#.#.#', '#####', '.#.#.', '.#.#.'],
  B: ['..#..', '####.', '#...#', '####.', '#...#', '####.', '..#..'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#', '#...#', '#...#'],
  star: ['..#..', '.###.', '#####', '.###.', '.#.#.', '#...#', '.....'],
  sun: ['..#..', '#.#.#', '.###.', '##.##', '.###.', '#.#.#', '..#..'],
  crown: ['.....', '#.#.#', '#####', '#####', '#####', '.....', '.....'],
  dia: ['..#..', '.###.', '#####', '.###.', '..#..', '.....', '.....'],
};

function glyph(g, name, color, cx, cy, scale = 2) {
  if (name === 'none') return;
  const bits = GLYPHS[name] || GLYPHS.star;
  const w = 5 * scale;
  const h = 7 * scale;
  const x0 = Math.round(cx - w / 2);
  const y0 = Math.round(cy - h / 2);
  bits.forEach((row, j) => {
    for (let i = 0; i < 5; i++) if (row[i] === '#') px(g, color, x0 + i * scale, y0 + j * scale, scale, scale);
  });
}

const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

function ring(g, c, cx, cy, r) {
  for (let a = 0; a < 360; a += 4) px(g, c, Math.round(cx + Math.cos((a * Math.PI) / 180) * r), Math.round(cy + Math.sin((a * Math.PI) / 180) * r));
}

function discWobble(g, c, cx, cy, r, seed) {
  const rnd = mulberry32(seed);
  for (let y = -r; y <= r; y++) {
    const w = Math.max(1, Math.floor(Math.sqrt(r * r - y * y) + 0.5 + (rnd() - 0.5) * 1.6));
    px(g, c, cx - w, cy + y, w * 2 + 1, 1);
  }
}

const clearDisc = (g, cx, cy, r) => {
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y) + 0.5);
    g.clearRect(cx - w, cy + y, w * 2 + 1, 1);
  }
};

// ------------------------------------------------------------------ shapes
function coin(g, t, spec, seed) {
  const [dark, mid, base, light] = t;
  if (spec.wobble) {
    discWobble(g, dark, 16, 16, 13, seed);
    discWobble(g, mid, 16, 16, 12, seed + 1);
    discWobble(g, base, 16, 16, 10, seed + 2);
  } else {
    disc(g, dark, 16, 16, 13);
    disc(g, mid, 16, 16, 12);
    disc(g, base, 16, 16, 10);
    ring(g, mid, 16, 16, 8.5);
  }
  for (let a = 200; a <= 285; a += 5) px(g, light, Math.round(16 + Math.cos((a * Math.PI) / 180) * 11), Math.round(16 + Math.sin((a * Math.PI) / 180) * 11));
  px(g, light, 10, 9, 3, 1);
  glyph(g, spec.glyph, light, 16, 15, 2);
  glyph(g, spec.glyph, dark, 16, 16, 2);
}

function note(g, t, spec) {
  const [dark, mid, base, light] = t;
  px(g, dark, 2, 7, 28, 18);
  px(g, mid, 3, 8, 26, 16);
  px(g, base, 4, 9, 24, 14);
  px(g, light, 4, 9, 24, 1);
  px(g, mid, 6, 11, 20, 10);
  px(g, base, 7, 12, 18, 8);
  for (const [x, y] of [[5, 10], [25, 10], [5, 20], [25, 20]]) px(g, light, x, y, 2, 2);
  for (let x = 8; x < 24; x += 2) px(g, mid, x, 12, 1, 1);
  for (let x = 8; x < 24; x += 2) px(g, mid, x, 19, 1, 1);
  disc(g, mid, 16, 16, 5);
  disc(g, base, 16, 16, 4);
  glyph(g, spec.glyph, dark, 16, 16, 1);
  px(g, light, 8, 15, 3, 1);
  px(g, light, 21, 17, 3, 1);
}

function holeCoin(g, t, spec, seed, square) {
  coin(g, t, { ...spec, glyph: 'none' }, seed);
  if (square) {
    g.clearRect(13, 13, 6, 6);
    px(g, t[0], 12, 12, 8, 1);
    px(g, t[0], 12, 19, 8, 1);
    px(g, t[0], 12, 12, 1, 8);
    px(g, t[0], 19, 12, 1, 8);
  } else {
    clearDisc(g, 16, 16, spec.big ? 5 : 3);
    ring(g, t[0], 16, 16, spec.big ? 6 : 4);
  }
}

function shell(g, t) {
  const rx = 12;
  const ry = 8;
  for (let y = -ry; y <= ry; y++) {
    const w = Math.floor(rx * Math.sqrt(1 - (y / ry) ** 2) + 0.5);
    px(g, '#b89a78', 16 - w, 16 + y, w * 2 + 1, 1);
    if (Math.abs(y) < ry - 1) px(g, '#f3e6d0', 16 - w + 1, 16 + y, Math.max(0, w * 2 - 1), 1);
  }
  px(g, '#ffffff', 9, 11, 6, 1);
  for (let x = 8; x <= 24; x++) px(g, '#7a5a3a', x, 16, 1, 1);
  for (let x = 9; x <= 23; x += 2) {
    px(g, '#7a5a3a', x, 15, 1, 1);
    px(g, '#7a5a3a', x, 17, 1, 1);
  }
  px(g, '#c9a878', 12, 20, 1, 1);
  px(g, '#c9a878', 20, 12, 1, 1);
}

function bean(g) {
  for (let y = -7; y <= 7; y++) {
    const w = Math.floor(11 * Math.sqrt(1 - (y / 7) ** 2) + 0.5);
    px(g, '#3f2416', 16 - w, 16 + y, w * 2 + 1, 1);
    if (Math.abs(y) < 6) px(g, '#6b4226', 16 - w + 1, 16 + y, Math.max(0, w * 2 - 1), 1);
  }
  line(g, '#3f2416', 7, 19, 25, 13);
  px(g, '#a67a4a', 10, 12, 4, 1);
  px(g, '#a67a4a', 20, 18, 3, 1);
}

function bead(g, t) {
  const [dark, mid, base, light] = t;
  for (const [x, y, r] of [[10, 21, 5], [22, 21, 5], [16, 11, 5]]) {
    disc(g, dark, x, y, r);
    disc(g, mid, x, y, r - 1);
    disc(g, base, x - 1, y - 1, r - 2);
    px(g, light, x - 2, y - 2, 2, 1);
  }
}

function ringShape(g, t) {
  const [dark, mid, base, light] = t;
  disc(g, dark, 16, 16, 12);
  disc(g, mid, 16, 16, 11);
  disc(g, base, 16, 16, 10);
  clearDisc(g, 16, 16, 6);
  ring(g, dark, 16, 16, 6.5);
  for (let a = 200; a <= 290; a += 6) px(g, light, Math.round(16 + Math.cos((a * Math.PI) / 180) * 9), Math.round(16 + Math.sin((a * Math.PI) / 180) * 9));
}

function gem(g, t, spec) {
  const [dark, mid, base, light] = t;
  if (spec.tone === 'pearl') {
    disc(g, '#8fa8d8', 16, 16, 12);
    disc(g, dark, 16, 16, 11);
    disc(g, mid, 16, 16, 10);
    disc(g, base, 16, 16, 8);
    disc(g, light, 12, 12, 3);
    px(g, '#ffffff', 11, 10, 2, 1);
    ring(g, '#bcd0ff', 16, 16, 13);
    return;
  }
  for (let y = -12; y <= 12; y++) {
    const w = 12 - Math.abs(y);
    px(g, dark, 16 - w, 16 + y, w * 2 + 1, 1);
    if (w > 1) px(g, mid, 16 - w + 1, 16 + y, w * 2 - 1, 1);
    if (y < 0 && w > 3) px(g, base, 16 - w + 3, 16 + y, w - 2, 1);
  }
  line(g, light, 10, 16, 16, 6);
  line(g, light, 16, 6, 22, 16);
  px(g, dark, 4, 16, 25, 1);
  px(g, light, 12, 10, 2, 1);
}

function stone(g, t) {
  disc(g, '#4a4f5a', 16, 16, 14);
  disc(g, '#7d838f', 16, 16, 13);
  disc(g, '#9096a0', 15, 15, 10);
  clearDisc(g, 16, 16, 3);
  ring(g, '#4a4f5a', 16, 16, 4);
  const r = mulberry32(7);
  for (let i = 0; i < 26; i++) px(g, r() > 0.5 ? '#6a707a' : '#a9afb8', 4 + Math.floor(r() * 24), 4 + Math.floor(r() * 24));
  clearDisc(g, 16, 16, 3);
}

function ingot(g, t) {
  const [dark, mid, base, light] = t;
  for (let y = 0; y < 14; y++) {
    const w = 10 + Math.floor(y * 0.6);
    px(g, dark, 16 - w, 9 + y, w * 2, 1);
    if (y > 0 && y < 13) px(g, y < 5 ? light : y < 11 ? base : mid, 16 - w + 1, 9 + y, w * 2 - 2, 1);
  }
  px(g, dark, 9, 12, 14, 1);
  glyph(g, 'dia', dark, 16, 17, 1);
}

function spade(g, t) {
  const [dark, mid, base, light] = t;
  px(g, dark, 12, 3, 8, 10);
  px(g, base, 13, 4, 6, 8);
  px(g, dark, 7, 12, 18, 15);
  px(g, base, 8, 13, 16, 13);
  px(g, light, 8, 13, 16, 1);
  g.clearRect(14, 22, 4, 5);
  px(g, dark, 13, 21, 6, 1);
  g.clearRect(15, 6, 2, 4);
  px(g, mid, 9, 15, 1, 8);
  px(g, mid, 22, 15, 1, 8);
}

function knife(g, t) {
  const [dark, mid, base, light] = t;
  for (let i = 0; i <= 20; i++) {
    const x = 6 + i;
    const y = 25 - i;
    disc(g, dark, x, y, 3);
  }
  for (let i = 0; i <= 20; i++) disc(g, base, 6 + i, 25 - i, 2);
  for (let i = 3; i <= 17; i++) px(g, light, 6 + i, 24 - i);
  disc(g, dark, 26, 6, 5);
  disc(g, mid, 26, 6, 4);
  clearDisc(g, 26, 6, 2);
}

function oval(g, t) {
  const [dark, mid, base, light] = t;
  for (let y = -13; y <= 13; y++) {
    const w = Math.floor(9 * Math.sqrt(1 - (y / 13) ** 2) + 0.5);
    px(g, dark, 16 - w, 16 + y, w * 2 + 1, 1);
    if (Math.abs(y) < 12) px(g, mid, 16 - w + 1, 16 + y, Math.max(0, w * 2 - 1), 1);
    if (Math.abs(y) < 11) px(g, base, 16 - w + 2, 16 + y, Math.max(0, w * 2 - 3), 1);
  }
  for (const y of [9, 13, 19, 23]) px(g, mid, 11, y, 10, 1);
  px(g, light, 11, 6, 4, 1);
  glyph(g, 'star', dark, 16, 16, 1);
}

function fish(g, t) {
  const [dark, mid, base, light] = t;
  for (let y = -6; y <= 6; y++) {
    const w = Math.floor(10 * Math.sqrt(1 - (y / 6) ** 2) + 0.5);
    px(g, dark, 14 - w, 16 + y, w * 2 + 1, 1);
    if (Math.abs(y) < 5) px(g, base, 14 - w + 1, 16 + y, Math.max(0, w * 2 - 1), 1);
  }
  for (let i = 0; i < 6; i++) px(g, dark, 24 + Math.floor(i / 2), 13 + i, 4 - Math.floor(i / 2), 1);
  for (let i = 0; i < 6; i++) px(g, dark, 24 + Math.floor(i / 2), 19 - i, 4 - Math.floor(i / 2), 1);
  px(g, dark, 7, 15, 2, 2);
  px(g, light, 8, 12, 6, 1);
  px(g, mid, 12, 20, 6, 1);
}

function chunk(g, t, seed) {
  const [dark, mid, base, light] = t;
  const r = mulberry32(seed);
  const blobs = [[14, 16, 8], [20, 14, 6], [11, 20, 5], [21, 20, 5]];
  for (const [x, y, rad] of blobs) discWobble(g, dark, x, y, rad, Math.floor(r() * 999));
  for (const [x, y, rad] of blobs) discWobble(g, base, x - 1, y - 1, rad - 1, Math.floor(r() * 999));
  line(g, dark, 8, 12, 14, 18);
  line(g, dark, 18, 10, 22, 16);
  px(g, light, 10, 12, 3, 1);
  px(g, light, 19, 11, 2, 1);
}

const SHAPES = {
  coin: (g, t, spec, seed) => coin(g, t, spec, seed),
  note,
  holecoin: (g, t, spec, seed) => holeCoin(g, t, spec, seed, false),
  sqholecoin: (g, t, spec, seed) => holeCoin(g, t, spec, seed, true),
  shell,
  bean,
  bead,
  ring: ringShape,
  gem,
  stone,
  ingot,
  spade,
  knife,
  oval,
  fish,
  chunk: (g, t, spec, seed) => chunk(g, t, seed),
};

// Decide the drawing recipe for a currency from its data.
export function iconSpec(c) {
  const ic = c.icon || {};
  const h = hash(c.id);
  const shape = ic.shape || (c.type === 'Banknote' ? 'note' : 'coin');
  const defaultTone = c.type === 'Banknote' ? NOTE_TONES[h % NOTE_TONES.length] : COIN_TONES[h % COIN_TONES.length];
  const glyphName = ic.glyph || ORIGIN_GLYPH[c.origin] || CATEGORY_GLYPH[c.category] || 'star';
  return { shape, tone: ic.tone || defaultTone, glyph: glyphName, wobble: !!ic.wobble, big: shape === 'holecoin' && ic.tone === 'jade', seed: h };
}

const cache = new Map();

// Returns a PNG data URL (32x32) for the currency. Show it with `image-rendering: pixelated`.
export function getCurrencyIcon(c) {
  if (cache.has(c.id)) return cache.get(c.id);
  const spec = iconSpec(c);
  const canvas = makeCanvas(N, N);
  const g = canvas.getContext('2d');
  if (g) g.imageSmoothingEnabled = false;
  const tones = TONES[spec.tone] || TONES.silver;
  const shape = SHAPES[spec.shape] || SHAPES.coin;
  shape(g, tones, spec, spec.seed);
  const url = canvas.toDataURL('image/png');
  cache.set(c.id, url);
  return url;
}

// A tiny version for the in-world pickups: 'coin', 'note' or 'item'.
export const pickupKind = (c) => (!c ? 'item' : c.type === 'Banknote' ? 'note' : 'coin');
