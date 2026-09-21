import { MapBuilder } from './builder.js';

const b = new MapBuilder(40, 28, 'sidewalk');

const npcs = [
  { id: 'banker_tan', x: 5, y: 3, dir: 'down' },
  { id: 'numismatist_lim', x: 3, y: 16, dir: 'right' },
  { id: 'tourist_carlos', x: 24, y: 8, dir: 'left' },
  { id: 'performer_jo', x: 6, y: 23, dir: 'down' },
];

const collectibles = [
  // common
  { id: 'ct_cny1', x: 16, y: 8, look: 'sparkle', currency: 'cny1' },
  { id: 'ct_jpy1000n', x: 30, y: 10, look: 'none', currency: 'jpy1000n' },
  { id: 'ct_usd5n', x: 23, y: 18, look: 'sparkle', currency: 'usd5n' },
  { id: 'ct_eur5n', x: 12, y: 18, look: 'barrel', currency: 'eur5n' },
  { id: 'ct_gbp5n', x: 34, y: 19, look: 'none', currency: 'gbp5n' },
  { id: 'ct_krw1000n', x: 28, y: 22, look: 'crate', currency: 'krw1000n' },
  // uncommon
  { id: 'ct_gbp20n', x: 5, y: 10, look: 'none', currency: 'gbp20n' },
  { id: 'ct_cny100n', x: 19, y: 26, look: 'crate', currency: 'cny100n' },
  { id: 'ct_cad20n', x: 8, y: 24, look: 'none', currency: 'cad20n' },
  { id: 'ct_idr50000n', x: 36, y: 7, look: 'none', currency: 'idr50000n' },
  { id: 'ct_thb100n', x: 37, y: 22, look: 'barrel', currency: 'thb100n' },
  // rare
  { id: 'ct_php500n', x: 36, y: 2, look: 'drawer', currency: 'php500n', verb: 'open locker' },
  { id: 'ct_php1000n', x: 10, y: 17, look: 'none', currency: 'php1000n' },
  { id: 'ct_jpy10000n', x: 37, y: 13, look: 'drawer', currency: 'jpy10000n', verb: 'open locker' },
  // bank vault
  { id: 'ct_usd100n', x: 10, y: 3, look: 'chest', currency: 'usd100n' },
  { id: 'ct_eur100n', x: 10, y: 5, look: 'chest', currency: 'eur100n' },
  // Bank Key quest
  { id: 'ct_vault_key', x: 2, y: 17, look: 'none', item: 'vault_key', verb: 'search' },
];

const objects = [
  {
    id: 'ct_sign_bank',
    x: 12,
    y: 8,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Sign', pages: ['CITY BANK. Lobby open to everyone. Vault access: key holders only.'] },
  },
  {
    id: 'ct_sign_station',
    x: 35,
    y: 13,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Sign', pages: ['CENTRAL STATION and BUS TERMINAL.', 'Lockers along the platform are free to check. Please do not sit on the train.'] },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// streets
b.fill(0, 9, 40, 2, 'road');
b.fill(0, 19, 40, 2, 'road');
b.fill(13, 0, 2, 28, 'road');
b.fill(26, 0, 2, 28, 'road');
b.fill(13, 8, 2, 1, 'crosswalk');
b.fill(13, 11, 2, 1, 'crosswalk');
b.fill(26, 8, 2, 1, 'crosswalk');
b.fill(26, 11, 2, 1, 'crosswalk');

// bank compound (north-west)
b.fill(3, 2, 8, 6, 'floorTile');
b.frame(2, 1, 10, 8, 'wall');
b.hline(2, 11, 1, 'facadeBank');
b.fill(6, 8, 2, 1, 'floorTile');
b.clear(6, 8, 2, 1);
b.vline(8, 2, 7, 'wall');
b.hline(4, 6, 4, 'counter');

// shops (north-east and middle)
b.house(16, 2, 5, 6, { roof: 'roofRed', facade: 'facadeShop', door: 2 });
b.house(21, 2, 5, 6, { roof: 'roofBlue', facade: 'facadeShop', door: 2 });
b.house(16, 12, 5, 6, { roof: 'roofGreen', facade: 'facadeShop', door: 2 });
b.house(21, 12, 5, 6, { roof: 'roofOrange', facade: 'facadeShop', door: 2 });
b.house(16, 21, 5, 4, { roof: 'roofGray', facade: 'facadeBlue', door: 2 });
b.house(21, 21, 5, 4, { roof: 'roofBrown', facade: 'facadeBlue', door: 2 });

// bus terminal (north-east corner)
b.fill(29, 1, 10, 8, 'plaza');
for (const [x, y] of [[30, 4], [31, 4], [34, 4], [35, 4]]) b.put(x, y, 'bus');
b.put(30, 6, 'bench');
b.put(35, 6, 'bench');
b.put(32, 7, 'sign');
b.put(33, 2, 'lamp');
b.put(38, 5, 'lamp');

// central station (east)
b.fill(29, 12, 10, 4, 'plaza');
b.fill(29, 16, 10, 2, 'tracks');
for (const x of [30, 31, 32, 33]) b.put(x, 16, 'train');
b.put(31, 13, 'bench');
b.put(34, 14, 'bench');

// park (south-west of the bank)
b.fill(1, 11, 12, 8, 'grass');
b.ellipse(6, 15, 2, 1, 'water');
for (const [x, y] of [[2, 12], [11, 12], [2, 14], [11, 15], [4, 18], [9, 18], [7, 12]]) b.put(x, y, 'tree');
b.put(3, 13, 'bench');
b.put(9, 13, 'bench');
b.put(6, 12, 'statue');
b.put(12, 12, 'lamp');
b.put(12, 15, 'lamp');
b.scatter('flowers', 12, { x: 1, y: 11, w: 12, h: 8, seed: 41 });

// plazas in the south
b.fill(1, 21, 12, 6, 'plaza');
b.put(6, 25, 'fountain');
b.put(3, 22, 'lamp');
b.put(11, 22, 'lamp');
b.fill(29, 21, 10, 6, 'plaza');
b.put(31, 22, 'lamp');
b.put(35, 25, 'bench');

// outer fence with the two exits opened
b.border('fence');
b.clear(0, 9, 1, 2);
b.clear(26, 27, 2, 1);

export default {
  id: 'city',
  area: 'City',
  name: 'Capital City',
  unlockRequirement: 30,
  theme: 'city',
  dark: false,
  description: 'Banks, shops, a bus terminal and a train station. Money from all over the world passes through here.',
  landmarks: ['City Bank & vault', 'Bus terminal', 'Central Station lockers', 'City park'],
  mapPos: { x: 82, y: 36 },
  ...b.build(),
  spawns: {
    default: { x: 2, y: 9, dir: 'right' },
    market: { x: 2, y: 9, dir: 'right' },
    harbor: { x: 26, y: 25, dir: 'up' },
  },
  exits: [
    { x: 0, y: 9, w: 1, h: 2, to: 'market' },
    { x: 26, y: 27, w: 2, h: 1, to: 'harbor' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'vault_door',
      x: 8,
      y: 4,
      floor: 'floorTile',
      look: 'vaultDoor',
      prompt: 'unlock vault',
      requires: { has: 'vault_key' },
      lockedText: 'A huge steel vault door. The keyhole is the size of your thumb. Without the vault key, it is not going anywhere.',
      openText: 'The vault key turns with a heavy clunk. The vault door swings open!',
    },
  ],
  puzzles: [],
};
