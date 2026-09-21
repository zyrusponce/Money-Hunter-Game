import { MapBuilder } from './builder.js';

const b = new MapBuilder(34, 22, 'sand');

const npcs = [
  { id: 'kiko', x: 12, y: 7, dir: 'down' },
  { id: 'tomas', x: 26, y: 12, dir: 'right' },
  { id: 'lifeguard_ana', x: 20, y: 5, dir: 'down' },
];

const collectibles = [
  { id: 'bc_usd25c', x: 7, y: 6, look: 'sparkle', currency: 'usd25c' },
  { id: 'bc_jpy5', x: 14, y: 13, look: 'none', currency: 'jpy5' },
  { id: 'bc_eur1', x: 18, y: 9, look: 'sparkle', currency: 'eur1' },
  { id: 'bc_gbp1', x: 24, y: 6, look: 'none', currency: 'gbp1' },
  { id: 'bc_cowrie', x: 30, y: 13, look: 'none', currency: 'cowrie' },
  { id: 'bc_aud2', x: 5, y: 12, look: 'none', currency: 'aud2', requires: 'shovel' },
  { id: 'bc_krw500', x: 3, y: 4, look: 'chest', currency: 'krw500' },
  { id: 'bc_usd_silver', x: 31, y: 3, look: 'none', currency: 'usd_silver', requires: 'shovel' },
  // Lost Coin quest: the pouch is hidden near the large rocks
  { id: 'bc_pouch', x: 8, y: 12, look: 'none', item: 'lost_pouch', verb: 'search' },
];

const objects = [
  {
    id: 'bc_sign',
    x: 16,
    y: 3,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: {
      speaker: 'Sign',
      pages: ['SUNNY BEACH. Swim at your own risk. Dig at your own reward.', 'Things wash up here and get buried. A shovel would really help.'],
    },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);
b.reserve(14, 0, 4, 7);
b.reserve(26, 7, 8, 5);

// water and shoreline
b.fill(0, 0, 34, 1, 'grass');
b.fill(0, 14, 34, 1, 'sandWet');
b.fill(0, 15, 34, 1, 'shallow');
b.fill(0, 16, 34, 6, 'water');
b.fill(0, 1, 34, 1, 'grass');

// border trees on the land edges (top, left, right), with exits opened
b.hline(0, 33, 0, 'tree');
b.vline(0, 0, 14, 'palm');
b.vline(33, 0, 14, 'palm');
b.clear(15, 0, 2, 1);
b.clear(33, 9, 1, 2);

// the large rocks (Lost Coin quest area)
b.put(9, 10, 'boulder');
b.put(10, 10, 'boulder');
b.put(9, 11, 'boulder');
b.put(11, 11, 'rock');
b.put(8, 10, 'rock');

// fishing boat and lifeguard stand
b.put(27, 12, 'boat');
b.put(21, 5, 'stallBlue');
b.put(22, 5, 'stallBlue');

// palms around the buried silver dollar
for (const [x, y] of [[30, 2], [32, 2], [30, 4], [32, 4], [31, 5]]) b.put(x, y, 'palm');

b.scatter('palm', 18, { x: 1, y: 2, w: 32, h: 11, seed: 21, on: ['sand'] });

export default {
  id: 'beach',
  area: 'Beach',
  name: 'Sunny Beach',
  unlockRequirement: 0,
  theme: 'beach',
  dark: false,
  description: 'Warm sand, big rocks and a shoreline that hides more than it shows.',
  landmarks: ['The Large Rocks', 'Fishing boat', 'Lifeguard stand', 'Palm grove'],
  mapPos: { x: 38, y: 54 },
  ...b.build(),
  spawns: {
    default: { x: 15, y: 2, dir: 'down' },
    town: { x: 15, y: 2, dir: 'down' },
    harbor: { x: 31, y: 9, dir: 'left' },
  },
  exits: [
    { x: 15, y: 0, w: 2, h: 1, to: 'town' },
    { x: 33, y: 9, w: 1, h: 2, to: 'harbor' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [],
  puzzles: [],
};
