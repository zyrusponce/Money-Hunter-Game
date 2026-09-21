import { MapBuilder } from './builder.js';

const b = new MapBuilder(32, 24, 'caveFloor');

const npcs = [{ id: 'miner_dado', x: 17, y: 19, dir: 'left' }];

const collectibles = [
  { id: 'cv_myr_old', x: 14, y: 20, look: 'none', currency: 'myr_old' },
  { id: 'cv_idr_old', x: 10, y: 9, look: 'none', currency: 'idr_old' },
  { id: 'cv_sgd_old', x: 3, y: 15, look: 'none', currency: 'sgd_old' },
  { id: 'cv_cad_old', x: 20, y: 13, look: 'none', currency: 'cad_old' },
  { id: 'cv_viking_hack', x: 5, y: 12, look: 'none', currency: 'viking_hack', requires: 'shovel' },
  { id: 'cv_tin_animal', x: 29, y: 4, look: 'chest', currency: 'tin_animal' },
  // hidden chamber behind the cracked wall
  { id: 'cv_koban', x: 10, y: 3, look: 'chest', currency: 'jpy_koban' },
  { id: 'cv_moonstone', x: 12, y: 5, look: 'none', currency: 'moonstone' },
];

const objects = [
  {
    id: 'cv_sign',
    x: 13,
    y: 21,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Wooden Sign', pages: ['ECHO CAVE. Mind the stalagmites. Bring a shovel. If you hear your own voice answering back, that is normal.'] },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// solid rock everywhere, then carve tunnels
b.fill(0, 0, 32, 24, 'caveWall');
b.carve(12, 18, 8, 5, 'caveFloor'); // entrance chamber
b.carve(15, 23, 2, 1, 'caveFloor'); // exit to the forest
b.carve(15, 12, 2, 6, 'caveFloor'); // corridor north
b.carve(8, 8, 16, 4, 'caveFloor'); // middle chamber
b.carve(4, 9, 4, 2, 'caveFloor'); // west corridor
b.carve(2, 11, 6, 7, 'caveFloor'); // west chamber
b.carve(24, 9, 4, 2, 'caveFloor'); // east corridor
b.carve(25, 3, 6, 6, 'caveFloor'); // east chamber
b.carve(15, 0, 2, 8, 'caveFloor'); // north passage to the ruins
b.carve(9, 2, 5, 4, 'caveFloor'); // hidden chamber
b.carve(19, 12, 3, 3, 'caveFloor'); // side niche

// stalagmites
for (const [x, y] of [[13, 19], [18, 21], [11, 9], [22, 10], [3, 13], [27, 5], [7, 16], [20, 8], [13, 10]]) b.put(x, y, 'rock');

export default {
  id: 'cave',
  area: 'Cave',
  name: 'Echo Cave',
  unlockRequirement: 60,
  theme: 'dark',
  dark: { radius: 44, flash: 100 },
  description: 'A deep cave full of old coins, side tunnels and one very suspicious cracked wall.',
  landmarks: ['Entrance chamber', 'West and east tunnels', 'Cracked wall', 'Passage to the deep'],
  mapPos: { x: 54, y: 12 },
  ...b.build(),
  spawns: {
    default: { x: 15, y: 21, dir: 'up' },
    forest: { x: 15, y: 21, dir: 'up' },
    ruins: { x: 15, y: 2, dir: 'down' },
  },
  exits: [
    { x: 15, y: 23, w: 2, h: 1, to: 'forest' },
    { x: 15, y: 0, w: 2, h: 1, to: 'ruins' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'cave_crack',
      x: 14,
      y: 4,
      floor: 'caveFloor',
      look: 'crackedWall',
      prompt: 'push wall',
      hint: 'A crack runs through this wall, and cool air leaks out of it.',
      openText: 'The cracked wall crumbles inward. A hidden chamber glitters beyond!',
    },
  ],
  puzzles: [],
};
