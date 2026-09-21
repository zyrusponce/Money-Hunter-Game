// Ground tile painters. Each is (g, variant 0-2, frame 0-1) and fills the whole 16x16 tile.
import { px, speckle, line } from './paint.js';
import { mulberry32 } from './canvasUtil.js';

const wobble = (seed, n) => {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => r());
};

export const GROUND = {
  grass(g, v) {
    px(g, '#5cbf5f', 0, 0, 16, 16);
    speckle(g, 11 + v, ['#52b356', '#6ccd6c', '#4aa64f'], 18);
    const r = wobble(30 + v, 6);
    for (let i = 0; i < 3; i++) {
      const x = 1 + Math.floor(r[i * 2] * 13);
      const y = 2 + Math.floor(r[i * 2 + 1] * 12);
      px(g, '#3f9a45', x, y + 1);
      px(g, '#3f9a45', x + 2, y + 1);
      px(g, '#3f9a45', x + 1, y);
    }
  },
  path(g, v) {
    px(g, '#d8b676', 0, 0, 16, 16);
    speckle(g, 21 + v, ['#c8a462', '#e8cc92', '#b99552'], 22);
  },
  road(g, v) {
    px(g, '#4b5360', 0, 0, 16, 16);
    speckle(g, 31 + v, ['#424955', '#565e6c', '#3b414c'], 20);
  },
  crosswalk(g) {
    px(g, '#4b5360', 0, 0, 16, 16);
    for (let i = 0; i < 4; i++) px(g, '#e9edf2', 0, 1 + i * 4, 16, 2);
  },
  sidewalk(g, v) {
    px(g, '#bdb9b0', 0, 0, 16, 16);
    px(g, '#a9a59c', 0, 0, 16, 1);
    px(g, '#a9a59c', 0, 0, 1, 16);
    px(g, '#cdc9c0', 1, 1, 15, 1);
    speckle(g, 41 + v, ['#b0aca3', '#c6c2b9'], 10);
  },
  plaza(g, v) {
    px(g, '#c9b98f', 0, 0, 16, 16);
    for (let row = 0; row < 4; row++) {
      px(g, '#a99a74', 0, row * 4, 16, 1);
      const off = row % 2 ? 0 : 4;
      px(g, '#a99a74', off, row * 4, 1, 4);
      px(g, '#a99a74', off + 8, row * 4, 1, 4);
    }
    speckle(g, 51 + v, ['#d6c79c', '#bbab82'], 8);
  },
  sand(g, v) {
    px(g, '#f0d98c', 0, 0, 16, 16);
    speckle(g, 61 + v, ['#e6c976', '#f9e8ab', '#deba66'], 20);
  },
  sandWet(g, v) {
    px(g, '#d7bb74', 0, 0, 16, 16);
    speckle(g, 71 + v, ['#c8ab62', '#e2c987', '#bda056'], 20);
  },
  shallow(g, v, f) {
    px(g, '#7fd6e6', 0, 0, 16, 16);
    px(g, '#9fe6f0', 0, 0, 16, 2);
    px(g, '#b8f0f7', (3 + f * 4 + v * 2) % 13, 5, 3, 1);
    px(g, '#b8f0f7', (10 - f * 3 + v) % 13, 11, 3, 1);
    speckle(g, 81 + v, ['#6cc8dc'], 6);
  },
  water(g, v, f) {
    px(g, '#2f7fc4', 0, 0, 16, 16);
    speckle(g, 91 + v, ['#276ba8', '#3a8ad0'], 14);
    for (const y of [3, 8, 13]) {
      const x = (f * 3 + y + v * 5) % 12;
      px(g, '#4b9be0', x, y, 4, 1);
      px(g, '#8cc8f5', x + 1, y, 2, 1);
    }
  },
  dock(g) {
    px(g, '#a9743b', 0, 0, 16, 16);
    for (const y of [0, 4, 8, 12]) px(g, '#8a5a2a', 0, y + 3, 16, 1);
    for (const y of [0, 4, 8, 12]) px(g, '#c48a4c', 0, y, 16, 1);
    for (const y of [1, 5, 9, 13]) {
      px(g, '#5d3a1a', 1, y + 1);
      px(g, '#5d3a1a', 14, y + 1);
    }
  },
  floorWood(g, v) {
    px(g, '#b98a56', 0, 0, 16, 16);
    for (const x of [0, 5, 10]) {
      px(g, '#9b7043', x, 0, 1, 16);
      px(g, '#c99a66', x + 1, 0, 1, 16);
    }
    speckle(g, 101 + v, ['#a87c4a'], 6);
  },
  floorTile(g) {
    px(g, '#ebe5d3', 0, 0, 16, 16);
    px(g, '#d6cfb8', 0, 0, 8, 8);
    px(g, '#d6cfb8', 8, 8, 8, 8);
    px(g, '#c4bda5', 0, 0, 16, 1);
    px(g, '#c4bda5', 0, 0, 1, 16);
    px(g, '#f7f3e6', 1, 1, 2, 1);
  },
  carpet(g, v) {
    px(g, '#8f2a38', 0, 0, 16, 16);
    px(g, '#a63848', 2, 0, 12, 16);
    px(g, '#d6a94a', 0, 0, 1, 16);
    px(g, '#d6a94a', 15, 0, 1, 16);
    for (let y = 2 + (v % 2) * 3; y < 16; y += 6) px(g, '#d6a94a', 7, y, 2, 2);
  },
  caveFloor(g, v) {
    px(g, '#5b5566', 0, 0, 16, 16);
    speckle(g, 111 + v, ['#4b4657', '#6c6679', '#3f3a4b'], 26);
  },
  darkFloor(g, v) {
    px(g, '#4a3d3a', 0, 0, 16, 16);
    for (const x of [0, 5, 11]) px(g, '#372e2c', x, 0, 1, 16);
    speckle(g, 121 + v, ['#5a4b47', '#3f3532'], 14);
  },
  ruinFloor(g, v) {
    px(g, '#bfae82', 0, 0, 16, 16);
    speckle(g, 131 + v, ['#b09e72', '#cdbc90'], 14);
    const r = wobble(140 + v, 8);
    line(g, '#9a8862', Math.floor(r[0] * 12), 0, Math.floor(r[1] * 12) + 2, 7);
    line(g, '#9a8862', Math.floor(r[2] * 12) + 2, 7, Math.floor(r[3] * 12), 15);
    if (v === 1) px(g, '#7f9a55', 10, 12, 4, 2);
    if (v === 2) px(g, '#7f9a55', 2, 3, 3, 2);
  },
  goldFloor(g, v) {
    px(g, '#e6c04a', 0, 0, 16, 16);
    px(g, '#b8862b', 0, 0, 16, 1);
    px(g, '#b8862b', 0, 0, 1, 16);
    px(g, '#f4dc86', 7, 3, 2, 10);
    px(g, '#f4dc86', 3, 7, 10, 2);
    px(g, '#f8e9a8', 7, 7, 2, 2);
    if (v === 1) px(g, '#f8e9a8', 2, 2, 2, 1);
  },
  tracks(g) {
    px(g, '#8a8478', 0, 0, 16, 16);
    speckle(g, 151, ['#7a7468', '#9a9488'], 22);
    for (const x of [2, 10]) px(g, '#6b4a2a', x, 0, 3, 16);
    px(g, '#5a5a62', 0, 4, 16, 2);
    px(g, '#5a5a62', 0, 11, 16, 2);
    px(g, '#a8a8b2', 0, 4, 16, 1);
    px(g, '#a8a8b2', 0, 11, 16, 1);
  },
};
