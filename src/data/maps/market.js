import { MapBuilder } from './builder.js';

const b = new MapBuilder(30, 22, 'plaza');

const npcs = [
  { id: 'tita_lorna', x: 4, y: 6, dir: 'down' },
  { id: 'kuya_mando', x: 10, y: 6, dir: 'down' },
  { id: 'vendor_joy', x: 16, y: 6, dir: 'down' },
  { id: 'emma', x: 14, y: 10, dir: 'right' },
  { id: 'mang_dodong', x: 12, y: 15, dir: 'up' },
];

const collectibles = [
  { id: 'mk_php10', x: 8, y: 9, look: 'sparkle', currency: 'php10' },
  { id: 'mk_php50n', x: 2, y: 13, look: 'barrel', currency: 'php50n' },
  { id: 'mk_sgd10c', x: 17, y: 11, look: 'sparkle', currency: 'sgd10c' },
  { id: 'mk_myr50s', x: 21, y: 13, look: 'none', currency: 'myr50s' },
  { id: 'mk_thb1', x: 27, y: 12, look: 'none', currency: 'thb1' },
  { id: 'mk_idr1000', x: 14, y: 18, look: 'crate', currency: 'idr1000' },
  { id: 'mk_krw10', x: 6, y: 18, look: 'none', currency: 'krw10' },
  { id: 'mk_php100n', x: 11, y: 16, look: 'none', currency: 'php100n' },
  { id: 'mk_loonie', x: 22, y: 17, look: 'none', currency: 'cad_loonie' },
  { id: 'mk_aud50c', x: 28, y: 5, look: 'crate', currency: 'aud50c' },
  // hidden nook behind a movable crate
  { id: 'mk_red_env', x: 27, y: 19, look: 'chest', currency: 'red_env' },
  // vending machines refill over time
  { id: 'mk_vend1', x: 2, y: 5, look: 'vending', random: { pool: 'Common', cooldown: 120 }, verb: 'use' },
  { id: 'mk_vend2', x: 26, y: 5, look: 'vending', random: { pool: 'Common', cooldown: 120 }, verb: 'use' },
  // night lamp parts (Tita Lorna's quest)
  { id: 'mk_lamp_bulb', x: 2, y: 16, look: 'crate', item: 'lamp_bulb' },
  { id: 'mk_lamp_shell', x: 21, y: 10, look: 'sparkle', item: 'lamp_shell' },
  { id: 'mk_lamp_battery', x: 9, y: 19, look: 'barrel', item: 'lamp_battery' },
];

const objects = [
  {
    id: 'mk_sign',
    x: 2,
    y: 9,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: {
      speaker: 'Sign',
      pages: ['GRAND MARKET. Fresh fruit, fresh fish, fresh gossip.', 'Vending machines by the shops sometimes cough up loose change. Come back later, they refill!'],
    },
  },
  {
    id: 'mk_board',
    x: 27,
    y: 9,
    kind: 'board',
    look: 'board',
    prompt: 'read',
    script: {
      speaker: 'Notice Board',
      pages: ['East gate: CITY. Locked until the Encyclopedia reaches 30%.', 'Rumor: someone saw a crate that looks a little too easy to push, in the far south-east corner.'],
    },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// outer ring is grass so border trees look right
b.fill(0, 0, 1, 22, 'grass');
b.fill(29, 0, 1, 22, 'grass');
b.fill(0, 21, 30, 1, 'grass');
b.border('tree');
b.clear(0, 10, 1, 2);
b.clear(29, 10, 1, 2);

// shop row
b.house(1, 0, 6, 4, { roof: 'roofRed', facade: 'facadeShop', door: 2 });
b.house(8, 0, 6, 4, { roof: 'roofBlue', facade: 'facadeShop', door: 3 });
b.house(15, 0, 6, 4, { roof: 'roofGreen', facade: 'facadeShop', door: 2 });
b.house(22, 0, 7, 4, { roof: 'roofOrange', facade: 'facadeShop', door: 3 });

// stalls
b.put(4, 7, 'stall'); b.put(5, 7, 'stall');
b.put(10, 7, 'stallBlue'); b.put(11, 7, 'stallBlue');
b.put(16, 7, 'stallGreen'); b.put(17, 7, 'stallGreen');
b.put(22, 7, 'stall'); b.put(23, 7, 'stall');
b.put(6, 14, 'stallBlue'); b.put(7, 14, 'stallBlue');
b.put(12, 14, 'stallGreen'); b.put(13, 14, 'stallGreen');
b.put(18, 14, 'stall'); b.put(19, 14, 'stall');
b.put(24, 14, 'stallBlue'); b.put(25, 14, 'stallBlue');

// lamps and benches for tourists
for (const [x, y] of [[8, 11], [20, 11], [16, 17], [4, 19]]) b.put(x, y, 'lamp');
b.put(13, 11, 'bench');
b.put(18, 19, 'bench');

// the secret nook (south-east)
b.hline(24, 28, 17, 'fence');
b.vline(24, 17, 20, 'fence');

export default {
  id: 'market',
  area: 'Market',
  name: 'Grand Market',
  unlockRequirement: 10,
  theme: 'market',
  dark: false,
  description: 'Stalls, vending machines, vendors and tourists. Small change is everywhere if you look.',
  landmarks: ['Vending machines', 'Night lamp stall', 'Old map stall', 'South-east corner'],
  mapPos: { x: 60, y: 36 },
  ...b.build(),
  spawns: {
    default: { x: 2, y: 10, dir: 'right' },
    town: { x: 2, y: 10, dir: 'right' },
    city: { x: 27, y: 10, dir: 'left' },
  },
  exits: [
    { x: 0, y: 10, w: 1, h: 2, to: 'town' },
    { x: 29, y: 10, w: 1, h: 2, to: 'city' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'nook_crate',
      x: 24,
      y: 19,
      look: 'crateSecret',
      prompt: 'push',
      hint: 'Something about this crate looks movable.',
      openText: 'You shove the crate aside. There is a hidden nook behind it!',
    },
  ],
  puzzles: [],
};
