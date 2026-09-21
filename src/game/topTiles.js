// Overlay ("top") tile painters. Transparent background unless the tile is a solid block.
import { px, disc, line, speckle, shadow } from './paint.js';
import { mulberry32 } from './canvasUtil.js';

// ---------------------------------------------------------------- shared building blocks
function roof(g, base, dark, light, v) {
  px(g, base, 0, 0, 16, 16);
  for (let row = 0; row < 4; row++) {
    px(g, dark, 0, row * 4 + 3, 16, 1);
    const off = (row + v) % 2 ? 0 : 4;
    for (let x = off; x < 16; x += 8) px(g, dark, x, row * 4, 1, 3);
    px(g, light, 0, row * 4, 16, 1);
  }
}

function windows(g, glass = '#8fd3f0') {
  for (const x of [2, 9]) {
    px(g, '#5a4a3a', x, 4, 5, 6);
    px(g, glass, x + 1, 5, 3, 4);
    px(g, '#e8f8ff', x + 1, 5, 1, 2);
    px(g, '#5a4a3a', x + 2, 5, 1, 4);
  }
}

function facadeBase(g, wall, shade) {
  px(g, wall, 0, 0, 16, 16);
  px(g, shade, 0, 0, 16, 2);
  px(g, 'rgba(0,0,0,0.18)', 0, 14, 16, 2);
}

function doorTile(g, wall, doorColor) {
  facadeBase(g, wall, '#00000022');
  px(g, '#4a3220', 3, 1, 10, 15);
  px(g, doorColor, 4, 2, 8, 14);
  px(g, 'rgba(255,255,255,0.15)', 4, 2, 8, 1);
  px(g, 'rgba(0,0,0,0.2)', 7, 2, 2, 14);
  px(g, '#f2c14e', 10, 9, 1, 2);
}

function brickWall(g, base, mortar, hi) {
  px(g, base, 0, 0, 16, 16);
  for (let row = 0; row < 4; row++) {
    px(g, mortar, 0, row * 4 + 3, 16, 1);
    const off = row % 2 ? 0 : 4;
    px(g, mortar, off, row * 4, 1, 3);
    px(g, mortar, off + 8, row * 4, 1, 3);
  }
  px(g, hi, 0, 0, 16, 1);
}

function stallTile(g, color, v) {
  shadow(g, 1, 14, 14, 2);
  px(g, '#7a4a25', 1, 6, 1, 9);
  px(g, '#7a4a25', 14, 6, 1, 9);
  for (let x = 0; x < 16; x += 2) {
    px(g, (x / 2) % 2 ? '#f5f0e6' : color, x, 1, 2, 5);
    px(g, (x / 2) % 2 ? '#f5f0e6' : color, x, 6, 2, 1);
  }
  px(g, 'rgba(0,0,0,0.18)', 0, 6, 16, 1);
  px(g, '#c99a5c', 1, 9, 14, 4);
  px(g, '#a67a44', 1, 13, 14, 2);
  const goods = ['#e2574c', '#f2c14e', '#62d26f', '#ff9a3c'];
  for (let i = 0; i < 5; i++) px(g, goods[(i + v) % 4], 2 + i * 3, 8, 2, 2);
}

// ---------------------------------------------------------------- painters
export const TOP = {
  // ------------------------------------------------ nature
  flowers(g, v) {
    const cols = [['#ff5d8f', '#ffffff'], ['#ffd23f', '#ffffff'], ['#c77dff', '#ffffff']];
    const pts = [[3, 4], [10, 8], [5, 12], [12, 3]];
    pts.forEach(([x, y], i) => {
      const [p] = cols[(i + v) % 3];
      px(g, p, x, y - 1);
      px(g, p, x - 1, y);
      px(g, p, x + 1, y);
      px(g, p, x, y + 1);
      px(g, '#ffe27a', x, y);
    });
  },
  rubble(g, v) {
    px(g, '#8a8478', 3 + v, 9, 4, 3);
    px(g, '#6f6a5f', 3 + v, 11, 4, 1);
    px(g, '#a8a296', 9, 7, 3, 3);
    px(g, '#6f6a5f', 9, 9, 3, 1);
    px(g, '#8a8478', 6, 12, 2, 2);
  },
  tree(g, v) {
    shadow(g, 3, 13, 10, 2);
    px(g, '#7b4a25', 7, 9, 3, 6);
    px(g, '#5e3719', 9, 9, 1, 6);
    disc(g, v === 1 ? '#2a7440' : '#2b7d36', 8, 6, 7);
    disc(g, '#3a9645', 7, 5, 5);
    disc(g, '#5cb85a', 5, 3, 2);
    px(g, '#226b2c', 9, 10, 4, 2);
    px(g, '#7ad67a', 4, 3, 2, 1);
  },
  pine(g, v) {
    shadow(g, 3, 13, 10, 2);
    px(g, '#6b4225', 7, 12, 2, 3);
    for (let y = 1; y <= 12; y++) {
      const hw = Math.min(6, Math.floor(y * 0.55) + 1);
      const band = Math.floor((y - 1) / 3) % 2;
      px(g, band ? '#2f8a4a' : '#236b3a', 8 - hw, y, hw * 2, 1);
    }
    px(g, '#4bab66', 7, 1, 1, 1);
    px(g, '#4bab66', 5, 5, 1, 1);
    if (v === 2) px(g, '#4bab66', 10, 8, 1, 1);
  },
  palm(g, v) {
    shadow(g, 4, 14, 8, 1);
    const trunk = [[7, 15], [7, 14], [8, 13], [8, 12], [8, 11], [8, 10], [9, 9], [9, 8]];
    trunk.forEach(([x, y]) => px(g, '#a86a3a', x, y, 2, 1));
    px(g, '#7a4a25', 9, 9, 1, 6);
    const fr = [[2, 6], [4, 2], [9, 0], [14, 3], [15, 7], [11, 10], [5, 9]];
    fr.forEach(([x, y], i) => line(g, i % 2 ? '#3ea044' : '#5cc35a', 9, 8, x, y));
    fr.forEach(([x, y]) => px(g, '#2f8a3a', x, y + 1));
    px(g, '#6b4a2a', 8, 8, 2, 2);
    px(g, '#6b4a2a', 10, 9, 1, 1);
    if (v === 1) px(g, '#ffd23f', 7, 9, 1, 1);
  },
  bush(g, v) {
    px(g, 'rgba(0,0,0,0.2)', 3, 14, 10, 1);
    disc(g, '#348f40', 8, 10, 5);
    disc(g, '#4bb058', 7, 9, 3);
    px(g, '#7ad67a', 5, 8, 2, 1);
    px(g, '#7ad67a', 9, 7, 1, 1);
    if (v === 1) px(g, '#ff5d8f', 10, 9, 1, 1);
  },
  rock(g, v) {
    px(g, 'rgba(0,0,0,0.22)', 3, 14, 10, 1);
    disc(g, '#8a909a', 8, 11, 4);
    disc(g, '#9aa0aa', 7, 10, 2);
    px(g, '#b4bac4', 6, 9, 3, 1);
    px(g, '#6a707a', 6, 14, 7, 1);
    if (v === 2) px(g, '#5f6570', 10, 11, 1, 2);
  },
  boulder(g) {
    px(g, 'rgba(0,0,0,0.25)', 2, 14, 12, 2);
    disc(g, '#7f858f', 8, 9, 6);
    disc(g, '#9096a0', 7, 8, 4);
    px(g, '#b4bac4', 5, 5, 4, 1);
    line(g, '#5c626c', 9, 8, 11, 12);
    line(g, '#5c626c', 6, 10, 8, 13);
    px(g, '#5c626c', 3, 12, 10, 1);
  },
  fence(g) {
    px(g, '#a9743b', 0, 6, 16, 2);
    px(g, '#a9743b', 0, 10, 16, 2);
    px(g, '#c48a4c', 0, 6, 16, 1);
    for (const x of [1, 7, 13]) {
      px(g, '#8a5a2a', x, 3, 2, 11);
      px(g, '#c48a4c', x, 3, 1, 11);
    }
  },

  // ------------------------------------------------ roofs
  roofRed: (g, v) => roof(g, '#c2453b', '#9a2f2b', '#e0645a', v),
  roofBlue: (g, v) => roof(g, '#3f6fbf', '#2c4f92', '#6a97e0', v),
  roofGreen: (g, v) => roof(g, '#3f9a55', '#2c7040', '#67c27c', v),
  roofGray: (g, v) => roof(g, '#7d838f', '#5c626e', '#a3a9b5', v),
  roofOrange: (g, v) => roof(g, '#d9822b', '#b05f1a', '#f0a95a', v),
  roofBrown: (g, v) => roof(g, '#8a5a3a', '#684226', '#ab7a55', v),

  // ------------------------------------------------ facades and doors
  facade(g) {
    facadeBase(g, '#efe2c2', 'rgba(0,0,0,0.25)');
    windows(g);
  },
  facadeBlue(g) {
    facadeBase(g, '#c9dcf0', 'rgba(0,0,0,0.25)');
    windows(g);
  },
  facadeBrick(g) {
    brickWall(g, '#b5654a', '#8f4a34', '#d08466');
    px(g, 'rgba(0,0,0,0.22)', 0, 0, 16, 2);
    windows(g, '#6f8faa');
  },
  facadeShop(g) {
    px(g, '#f0e4c8', 0, 0, 16, 16);
    for (let x = 0; x < 16; x += 2) px(g, (x / 2) % 2 ? '#ffffff' : '#e2574c', x, 0, 2, 5);
    px(g, 'rgba(0,0,0,0.2)', 0, 5, 16, 1);
    px(g, '#5a4a3a', 2, 7, 12, 7);
    px(g, '#8fd3f0', 3, 8, 10, 5);
    px(g, '#e8f8ff', 3, 8, 3, 1);
    px(g, '#f2c14e', 6, 10, 4, 2);
  },
  facadeBank(g) {
    px(g, '#e9e6df', 0, 0, 16, 16);
    px(g, '#cfcac0', 0, 0, 16, 3);
    for (const x of [1, 5, 9, 13]) {
      px(g, '#f6f4ef', x, 3, 2, 11);
      px(g, '#c3beb2', x + 2, 3, 1, 11);
    }
    px(g, '#b9b5ab', 0, 14, 16, 2);
  },
  facadeDark(g) {
    px(g, '#4b4448', 0, 0, 16, 16);
    px(g, 'rgba(0,0,0,0.3)', 0, 0, 16, 2);
    for (const x of [2, 9]) {
      px(g, '#2a2528', x, 4, 5, 6);
      line(g, '#6b5a4a', x, 4, x + 4, 9);
      line(g, '#6b5a4a', x + 4, 4, x, 9);
    }
    px(g, '#5a5054', 0, 13, 16, 1);
  },
  door: (g) => doorTile(g, '#efe2c2', '#8a5a2a'),
  doorClosed: (g) => doorTile(g, '#efe2c2', '#6b4a2a'),

  // ------------------------------------------------ interior walls and columns
  wall(g) {
    brickWall(g, '#8b7d78', '#6e625e', '#a89a94');
    px(g, 'rgba(0,0,0,0.15)', 0, 13, 16, 3);
  },
  caveWall(g, v) {
    px(g, '#3a3446', 0, 0, 16, 16);
    speckle(g, 200 + v, ['#4c455c', '#2d283a', '#5a5270'], 28);
    px(g, '#4c455c', 1, 1, 5, 3);
    px(g, '#4c455c', 9, 7, 5, 4);
    px(g, '#2d283a', 3, 10, 6, 2);
    px(g, '#5a5270', 0, 0, 16, 1);
  },
  ruinWall(g, v) {
    brickWall(g, '#a89468', '#8a7850', '#c4b07f');
    px(g, '#6f8f4a', 1 + v * 3, 13, 4, 2);
    px(g, '#6f8f4a', 10, 12, 3, 1);
  },
  pillar(g) {
    shadow(g, 3, 14, 10, 1);
    px(g, '#c9bd9b', 3, 12, 10, 3);
    px(g, '#d8cca9', 5, 3, 6, 10);
    px(g, '#b8ab86', 9, 3, 2, 10);
    px(g, '#c9bd9b', 3, 1, 10, 3);
    px(g, '#e8dfc4', 3, 1, 10, 1);
  },
  statue(g) {
    shadow(g, 3, 14, 10, 1);
    px(g, '#b5b0a5', 4, 10, 8, 5);
    px(g, '#d3cec2', 4, 10, 8, 1);
    px(g, '#d8d3c8', 6, 4, 4, 6);
    px(g, '#e8e3d8', 6, 1, 4, 3);
    px(g, '#b5b0a5', 9, 4, 1, 6);
    px(g, '#c3beb2', 5, 6, 1, 4);
    px(g, '#f2c14e', 7, 0, 2, 1);
  },

  // ------------------------------------------------ street and furniture
  stall: (g, v) => stallTile(g, '#e2574c', v),
  stallBlue: (g, v) => stallTile(g, '#3f6fbf', v),
  stallGreen: (g, v) => stallTile(g, '#3f9a55', v),
  crate(g) {
    shadow(g, 2, 14, 12, 2);
    px(g, '#6b4a25', 2, 4, 12, 11);
    px(g, '#b98b4f', 3, 5, 10, 9);
    px(g, '#8a6634', 3, 9, 10, 1);
    line(g, '#8a6634', 3, 5, 12, 13);
    line(g, '#8a6634', 12, 5, 3, 13);
    px(g, '#d4a868', 3, 5, 10, 1);
  },
  barrel(g) {
    shadow(g, 3, 14, 10, 2);
    px(g, '#7a4a25', 3, 3, 10, 12);
    px(g, '#9a6a3a', 4, 3, 8, 12);
    px(g, '#b98b4f', 5, 3, 2, 12);
    px(g, '#5a5a62', 3, 5, 10, 1);
    px(g, '#5a5a62', 3, 11, 10, 1);
    px(g, '#3a3a42', 4, 2, 8, 1);
  },
  shelf(g, v) {
    px(g, '#6b4a2a', 0, 0, 16, 16);
    for (const y of [1, 6, 11]) {
      px(g, '#4a3220', 0, y + 4, 16, 1);
      const cols = ['#c2453b', '#3f6fbf', '#f2c14e', '#3f9a55', '#8a5aa8'];
      for (let i = 0; i < 6; i++) px(g, cols[(i + y + v) % 5], 1 + i * 2 + (i > 2 ? 1 : 0), y, 2, 4);
    }
  },
  counter(g) {
    px(g, '#8a6634', 0, 8, 16, 7);
    px(g, '#d4a868', 0, 6, 16, 3);
    px(g, '#e8c38a', 0, 6, 16, 1);
    px(g, '#6b4a25', 0, 14, 16, 1);
  },
  display(g) {
    shadow(g, 1, 14, 14, 1);
    px(g, '#d6cfb8', 1, 9, 14, 6);
    px(g, '#bfe6f5', 2, 3, 12, 7);
    px(g, '#e8f8ff', 3, 3, 2, 5);
    px(g, '#5a5a62', 2, 3, 12, 1);
    disc(g, '#f2c14e', 8, 7, 2);
    px(g, '#fff3b8', 7, 6, 1, 1);
  },
  vending(g) {
    shadow(g, 2, 14, 12, 2);
    px(g, '#1f4f8f', 2, 1, 12, 14);
    px(g, '#2f6fbf', 3, 2, 10, 12);
    px(g, '#bfe6f5', 4, 3, 8, 6);
    const cols = ['#e2574c', '#f2c14e', '#62d26f', '#ff9a3c'];
    for (let i = 0; i < 8; i++) px(g, cols[i % 4], 5 + (i % 4) * 2, 4 + Math.floor(i / 4) * 3, 1, 2);
    px(g, '#1a2a4a', 5, 11, 6, 2);
    px(g, '#f2c14e', 11, 10, 1, 1);
  },
  bench(g) {
    shadow(g, 1, 14, 14, 1);
    px(g, '#8a5a2a', 1, 4, 14, 2);
    px(g, '#a9743b', 1, 7, 14, 3);
    px(g, '#c48a4c', 1, 7, 14, 1);
    px(g, '#3a3a42', 2, 10, 2, 4);
    px(g, '#3a3a42', 12, 10, 2, 4);
  },
  lamp(g) {
    shadow(g, 5, 14, 6, 1);
    px(g, '#3a3f4a', 7, 4, 2, 11);
    px(g, '#3a3f4a', 5, 13, 6, 2);
    px(g, '#fff3b0', 5, 1, 6, 4);
    px(g, '#f2c14e', 6, 2, 4, 2);
    px(g, '#3a3f4a', 5, 0, 6, 1);
  },
  sign(g) {
    shadow(g, 4, 14, 8, 1);
    px(g, '#7a4a25', 7, 8, 2, 7);
    px(g, '#7a4a25', 1, 1, 14, 8);
    px(g, '#c99a5c', 2, 2, 12, 6);
    px(g, '#5a3a1a', 4, 4, 8, 1);
    px(g, '#5a3a1a', 4, 6, 5, 1);
  },
  fountain(g, v, f) {
    px(g, '#a9a49a', 1, 3, 14, 12);
    px(g, '#d3cec2', 2, 3, 12, 2);
    px(g, '#8e897f', 1, 13, 14, 2);
    px(g, '#5cc2f0', 3, 5, 10, 8);
    px(g, '#a9e8ff', 3 + f * 3, 7, 4, 1);
    px(g, '#a9e8ff', 8 - f * 2, 10, 4, 1);
    px(g, '#8e897f', 6, 4, 4, 8);
    px(g, '#d3cec2', 7, 2 + f, 2, 6);
    px(g, '#e8fbff', 7, 1 + f, 2, 2);
  },
  boat(g) {
    px(g, 'rgba(0,0,0,0.2)', 1, 11, 14, 3);
    disc(g, '#6b4225', 8, 8, 6);
    px(g, '#00000000', 0, 0, 0, 0);
    px(g, '#8a5a2a', 2, 4, 12, 8);
    px(g, '#b98b4f', 3, 5, 10, 6);
    px(g, '#3f6fbf', 3, 8, 10, 1);
    px(g, '#8a5a2a', 7, 5, 2, 6);
    px(g, '#f5f0e6', 12, 6, 2, 1);
  },
  table(g) {
    shadow(g, 1, 14, 14, 1);
    px(g, '#5a3a1a', 2, 10, 2, 5);
    px(g, '#5a3a1a', 12, 10, 2, 5);
    px(g, '#a9743b', 1, 5, 14, 6);
    px(g, '#c99a5c', 1, 5, 14, 1);
  },
  bus(g) {
    shadow(g, 0, 14, 16, 2);
    px(g, '#d9a01f', 0, 3, 16, 11);
    px(g, '#f2c14e', 0, 3, 16, 3);
    px(g, '#8fd3f0', 1, 6, 4, 4);
    px(g, '#8fd3f0', 6, 6, 4, 4);
    px(g, '#8fd3f0', 11, 6, 4, 4);
    px(g, '#2a2a32', 2, 13, 3, 2);
    px(g, '#2a2a32', 11, 13, 3, 2);
    px(g, '#c2453b', 0, 10, 16, 1);
  },
  train(g) {
    shadow(g, 0, 14, 16, 2);
    px(g, '#3f6fbf', 0, 2, 16, 12);
    px(g, '#e8ecf5', 0, 9, 16, 2);
    px(g, '#8fd3f0', 1, 4, 6, 4);
    px(g, '#8fd3f0', 9, 4, 6, 4);
    px(g, '#2a2a32', 2, 13, 3, 2);
    px(g, '#2a2a32', 11, 13, 3, 2);
  },
  brazier(g, v, f) {
    shadow(g, 4, 14, 8, 1);
    px(g, '#3a3a42', 6, 11, 4, 4);
    px(g, '#4a4a52', 4, 9, 8, 3);
    px(g, '#ff9a3c', 5, 6 + f, 6, 3);
    px(g, '#ffd86b', 6, 4 + f, 4, 4);
    px(g, '#fff3b0', 7, 3 + f, 2, 3);
  },

  // ------------------------------------------------ barrier looks (secret walls, locked doors)
  crackedWall(g) {
    brickWall(g, '#8b7d78', '#6e625e', '#a89a94');
    px(g, 'rgba(0,0,0,0.15)', 0, 13, 16, 3);
    line(g, '#3d3232', 8, 0, 6, 4);
    line(g, '#3d3232', 6, 4, 9, 8);
    line(g, '#3d3232', 9, 8, 7, 12);
    line(g, '#3d3232', 7, 12, 8, 15);
  },
  bushSecret(g) {
    TOP.bush(g, 0);
    px(g, '#5fd070', 6, 10, 1, 1);
    px(g, '#2a7a36', 8, 12, 2, 1);
  },
  boulderSecret(g) {
    TOP.boulder(g);
    line(g, '#b8a878', 1, 15, 14, 15);
  },
  crateSecret(g) {
    TOP.crate(g);
    px(g, 'rgba(0,0,0,0.18)', 0, 14, 16, 1);
    px(g, 'rgba(0,0,0,0.12)', 0, 15, 16, 1);
  },
  gateClosed(g) {
    px(g, '#26232b', 0, 0, 16, 16);
    for (const x of [2, 5, 8, 11, 14]) px(g, '#7a808c', x, 1, 1, 14);
    px(g, '#5a5f6a', 0, 4, 16, 2);
    px(g, '#5a5f6a', 0, 11, 16, 2);
    px(g, '#f2c14e', 6, 7, 4, 3);
    px(g, '#b8862b', 7, 8, 2, 1);
  },
  vaultDoor(g) {
    px(g, '#3a3f4a', 0, 0, 16, 16);
    disc(g, '#6c7480', 8, 8, 7);
    disc(g, '#9aa3b0', 8, 8, 5);
    disc(g, '#6c7480', 8, 8, 2);
    line(g, '#6c7480', 8, 3, 8, 13);
    line(g, '#6c7480', 3, 8, 13, 8);
    px(g, '#f2c14e', 8, 8, 1, 1);
  },
  velvetGate(g) {
    shadow(g, 0, 14, 16, 1);
    for (const x of [1, 13]) {
      px(g, '#b8862b', x, 5, 2, 10);
      px(g, '#f2c14e', x, 4, 2, 2);
    }
    px(g, '#c23a3a', 3, 7, 10, 2);
    px(g, '#8f2a2a', 4, 9, 8, 1);
  },
  sealedGate(g) {
    px(g, '#5f5236', 0, 0, 16, 16);
    px(g, '#7f6f4a', 1, 1, 14, 14);
    disc(g, '#e8c24a', 8, 8, 4);
    disc(g, '#7f6f4a', 8, 8, 2);
    px(g, '#e8c24a', 8, 2, 1, 12);
    px(g, '#e8c24a', 2, 8, 12, 1);
  },
};

export const ANIMATED_TOP = new Set(['fountain', 'brazier']);
export { mulberry32 };
