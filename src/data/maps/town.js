import { MapBuilder } from './builder.js';

const b = new MapBuilder(36, 26, 'grass');

// ---- entities (declared first so decoration never lands on top of them)
const npcs = [
  { id: 'aling_nena', x: 6, y: 9, dir: 'down' },
  { id: 'money_collector', x: 20, y: 11, dir: 'left' },
  { id: 'kuya_ben', x: 14, y: 15, dir: 'up' },
  { id: 'mang_ernie', x: 11, y: 9, dir: 'down' },
  { id: 'rico', x: 24, y: 8, dir: 'down' },
  { id: 'lola_pilar', x: 8, y: 18, dir: 'up' },
];

const collectibles = [
  { id: 'town_php1', x: 8, y: 9, look: 'sparkle', currency: 'php1' },
  { id: 'town_php5', x: 16, y: 8, look: 'sparkle', currency: 'php5' },
  { id: 'town_php20', x: 3, y: 9, look: 'none', currency: 'php20' },
  { id: 'town_php20n', x: 26, y: 8, look: 'barrel', currency: 'php20n' },
  { id: 'town_usd1c', x: 20, y: 15, look: 'sparkle', currency: 'usd1c' },
  { id: 'town_usd1n', x: 14, y: 11, look: 'none', currency: 'usd1n' },
  { id: 'town_jpy1', x: 33, y: 10, look: 'crate', currency: 'jpy1' },
  { id: 'town_eur1c', x: 10, y: 14, look: 'sparkle', currency: 'eur1c' },
  { id: 'town_gbp1p', x: 24, y: 14, look: 'sparkle', currency: 'gbp1p' },
  { id: 'town_inr10', x: 2, y: 12, look: 'none', currency: 'inr10' },
  // the hidden alley yard
  { id: 'town_phpold', x: 30, y: 23, look: 'none', currency: 'phpold' },
  { id: 'town_bicent', x: 24, y: 22, look: 'chest', currency: 'usd_bicent' },
  // buried in the park (needs the shovel from the Lost Coin quest)
  { id: 'town_farthing', x: 5, y: 22, look: 'mound', currency: 'gbp_farthing', requires: 'shovel' },
  { id: 'town_dem5', x: 9, y: 19, look: 'none', currency: 'dem5', requires: 'shovel' },
  // a Lost & Found box that refills over time (great for duplicates)
  { id: 'town_lostfound', x: 26, y: 23, look: 'box', random: { pool: 'Common', cooldown: 90 }, verb: 'check' },
];

const objects = [
  {
    id: 'town_sign',
    x: 16,
    y: 14,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: {
      speaker: 'Sign',
      pages: [
        'Welcome to Sunny Town! Population: friendly.',
        'TIP: Your Money Detector beeps when hidden money is close. Walk around and watch the signal meter at the bottom left.',
        'When it says "Money Nearby!", press E to search.',
      ],
    },
  },
  {
    id: 'town_board',
    x: 20,
    y: 8,
    kind: 'board',
    look: 'board',
    prompt: 'read',
    script: {
      speaker: 'Notice Board',
      pages: [
        'LOST: one old coin, near the big rocks at the beach. Ask Aling Nena.',
        'WANTED: helpers for Tita Lorna\'s night lamp at the Market. Opens at 10% Encyclopedia completion.',
        'The Museum (north-east) is open to all. The Curator is looking for sharp eyes.',
      ],
    },
  },
  { id: 'town_portal', x: 17, y: 9, kind: 'portal', look: 'portal', prompt: 'enter', visibleWhen: { complete: true }, script: { speaker: 'Portal', pages: ['A golden doorway hums. Step into the light to reach the Treasury of Worlds.'] } },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// ---- terrain
b.fill(17, 0, 2, 26, 'road');
b.fill(0, 12, 36, 2, 'road');
b.fill(13, 9, 10, 8, 'plaza');
b.fill(5, 7, 1, 5, 'path');
b.fill(12, 7, 1, 5, 'path');
b.fill(23, 7, 1, 5, 'path');
b.fill(30, 8, 3, 4, 'plaza');
b.vline(28, 14, 21, 'path');

// buildings
b.house(3, 3, 5, 4, { roof: 'roofRed', door: 2 });
b.house(10, 3, 5, 4, { roof: 'roofBlue', door: 2 });
b.house(21, 3, 6, 4, { roof: 'roofGreen', facade: 'facadeShop', door: 2 });
b.house(28, 2, 7, 6, { roof: 'roofGray', facade: 'facadeBank', door: 3, doorTile: 'door' });
b.house(23, 17, 5, 4, { roof: 'roofBlue', facade: 'facadeBlue', door: 2 });
b.house(29, 17, 5, 4, { roof: 'roofBrown', door: 2 });

// hidden alley yard
b.frame(22, 21, 13, 4, 'fence');
b.clear(28, 21, 1, 1);

// plaza dressing
b.put(17, 12, 'fountain');
for (const [x, y] of [[13, 9], [22, 9], [13, 16], [22, 16]]) b.put(x, y, 'lamp');
b.put(16, 15, 'bench');
b.put(19, 15, 'bench');

// park (south-west)
b.ellipse(6, 20, 2, 1, 'water');
for (const [x, y] of [[2, 17], [10, 17], [2, 22], [3, 23], [10, 22], [11, 20], [9, 23], [4, 23], [7, 23]]) b.put(x, y, 'tree');
b.put(4, 17, 'bench');
b.put(8, 17, 'bench');
b.put(2, 20, 'lamp');
b.put(11, 17, 'lamp');

// borders and exits
b.border('tree');
b.clear(17, 0, 2, 1);
b.clear(17, 25, 2, 1);
b.clear(35, 12, 1, 2);

b.scatter('tree', 10, { x: 1, y: 1, w: 34, h: 2, seed: 11 });
b.scatter('flowers', 26, { x: 1, y: 1, w: 34, h: 24, seed: 5 });

export default {
  id: 'town',
  area: 'Town',
  name: 'Sunny Town',
  unlockRequirement: 0,
  theme: 'town',
  dark: false,
  description: 'A peaceful starting town with a fountain plaza, friendly neighbors and a few dusty corners.',
  landmarks: ['Fountain Plaza', 'Hidden Alley', 'Lucky Store', 'Museum Steps'],
  mapPos: { x: 38, y: 36 },
  ...b.build(),
  spawns: {
    default: { x: 18, y: 14, dir: 'down' },
    forest: { x: 17, y: 2, dir: 'down' },
    beach: { x: 17, y: 23, dir: 'up' },
    market: { x: 33, y: 12, dir: 'left' },
    museum: { x: 31, y: 9, dir: 'down' },
    final: { x: 17, y: 11, dir: 'down' },
  },
  exits: [
    { x: 17, y: 0, w: 2, h: 1, to: 'forest' },
    { x: 17, y: 25, w: 2, h: 1, to: 'beach' },
    { x: 35, y: 12, w: 1, h: 2, to: 'market' },
    { x: 31, y: 7, w: 1, h: 1, to: 'museum' },
    { x: 17, y: 9, w: 2, h: 1, to: 'final', requires: { complete: true }, hidden: true },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [],
  puzzles: [],
};
