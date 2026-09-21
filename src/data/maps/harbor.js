import { MapBuilder } from './builder.js';

const b = new MapBuilder(34, 22, 'plaza');

const npcs = [
  { id: 'sailor_sam', x: 12, y: 9, dir: 'down' },
  { id: 'captain_delos', x: 26, y: 17, dir: 'down' },
  { id: 'yuki', x: 6, y: 9, dir: 'right' },
  { id: 'merchant_haji', x: 22, y: 8, dir: 'left' },
];

const collectibles = [
  { id: 'hb_thb10', x: 14, y: 6, look: 'sparkle', currency: 'thb10' },
  { id: 'hb_krw100', x: 3, y: 9, look: 'none', currency: 'krw100' },
  { id: 'hb_jpy100', x: 30, y: 6, look: 'crate', currency: 'jpy100' },
  { id: 'hb_sgd1', x: 22, y: 10, look: 'barrel', currency: 'sgd1' },
  { id: 'hb_myr50n', x: 8, y: 5, look: 'none', currency: 'myr50n' },
  { id: 'hb_cny10n', x: 9, y: 18, look: 'chest', currency: 'cny10n' },
  { id: 'hb_jpy500', x: 17, y: 10, look: 'none', currency: 'jpy500' },
  { id: 'hb_sgd10n', x: 31, y: 10, look: 'none', currency: 'sgd10n', requires: 'shovel' },
  { id: 'hb_thb_pot', x: 19, y: 17, look: 'none', currency: 'thb_pot' },
];

const objects = [
  {
    id: 'hb_sign',
    x: 11,
    y: 10,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: {
      speaker: 'Sign',
      pages: ['SUNNY HARBOR. Travelers arrive from everywhere, and they lose coins from everywhere.', 'Boats to Coral Isle leave from the east pier. Ask Captain Delos. A Boat Pass is required.'],
    },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// water, piers, sandy patch
b.fill(0, 12, 34, 10, 'water');
b.fill(8, 12, 2, 8, 'dock');
b.fill(18, 12, 2, 6, 'dock');
b.fill(26, 12, 2, 7, 'dock');
b.fill(28, 9, 5, 3, 'sand');

// fence border on the land part
b.hline(0, 33, 0, 'fence');
b.vline(0, 0, 11, 'fence');
b.vline(33, 0, 11, 'fence');
b.clear(0, 9, 1, 2);
b.clear(30, 0, 2, 1);

// warehouses
b.house(2, 0, 8, 4, { roof: 'roofGray', facade: 'facadeBrick', door: 3 });
b.house(12, 0, 8, 4, { roof: 'roofBlue', facade: 'facadeBrick', door: 4 });
b.house(22, 0, 6, 4, { roof: 'roofBrown', facade: 'facadeBrick', door: 2 });

// cargo and boats
for (const [x, y] of [[4, 6], [5, 6], [4, 7]]) b.put(x, y, 'crate');
for (const [x, y] of [[15, 8], [16, 8], [25, 6]]) b.put(x, y, 'barrel');
for (const [x, y] of [[11, 14], [16, 15], [21, 15], [24, 14], [30, 15]]) b.put(x, y, 'boat');
for (const [x, y] of [[5, 11], [14, 11], [24, 11]]) b.put(x, y, 'lamp');

export default {
  id: 'harbor',
  area: 'Harbor',
  name: 'Sunny Harbor',
  unlockRequirement: 40,
  theme: 'harbor',
  dark: false,
  description: 'Ships, sailors and travelers. Foreign money is easy to find here, if you know where they dropped it.',
  landmarks: ['East pier', 'Warehouses', 'Captain Delos\'s boat', 'Sandy patch'],
  mapPos: { x: 62, y: 54 },
  ...b.build(),
  spawns: {
    default: { x: 2, y: 9, dir: 'right' },
    beach: { x: 2, y: 9, dir: 'right' },
    city: { x: 30, y: 2, dir: 'down' },
    island: { x: 26, y: 15, dir: 'down' },
  },
  exits: [
    { x: 0, y: 9, w: 1, h: 2, to: 'beach' },
    { x: 30, y: 0, w: 2, h: 1, to: 'city' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [],
  puzzles: [],
};
