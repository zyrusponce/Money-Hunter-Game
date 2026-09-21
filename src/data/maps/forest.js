import { MapBuilder } from './builder.js';

const b = new MapBuilder(36, 28, 'grass');

const npcs = [
  { id: 'hermit_bastian', x: 25, y: 20, dir: 'up' },
  { id: 'ranger_lila', x: 20, y: 9, dir: 'down' },
];

const collectibles = [
  { id: 'fr_myr5n', x: 15, y: 20, look: 'sparkle', currency: 'myr5n' },
  { id: 'fr_thb20n', x: 20, y: 6, look: 'none', currency: 'thb20n' },
  { id: 'fr_idr2000n', x: 13, y: 4, look: 'sack', currency: 'idr2000n' },
  { id: 'fr_sgd2n', x: 33, y: 8, look: 'none', currency: 'sgd2n' },
  { id: 'fr_aud5n', x: 2, y: 14, look: 'none', currency: 'aud5n' },
  { id: 'fr_rusty_key', x: 13, y: 14, look: 'none', item: 'rusty_key', verb: 'search' },
  // secret glade (east)
  { id: 'fr_cad5n', x: 31, y: 17, look: 'none', currency: 'cad5n' },
  { id: 'fr_cacao', x: 32, y: 21, look: 'none', currency: 'cacao', requires: 'shovel' },
  // ruined shrine (west), behind a hidden path
  { id: 'fr_piloncito', x: 8, y: 22, look: 'none', currency: 'piloncito', requires: 'shovel' },
  // Buried Treasure quest: the mound only shows up once you own the treasure map
  { id: 'fr_barter_ring', x: 21, y: 23, look: 'mound', currency: 'barter_ring', requires: 'shovel', visibleWhen: { has: 'treasure_map' } },
];

const objects = [
  {
    id: 'fr_sign',
    x: 16,
    y: 25,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Sign', pages: ['WHISPERING FOREST. Please do not feed the squirrels. They already know everything.'] },
  },
  {
    id: 'fr_signpost',
    x: 16,
    y: 12,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Signpost', pages: ['North-west: the old Abandoned Building.', 'North-east: Echo Cave (bring a light, and a very complete Encyclopedia).', 'South: back to Sunny Town.'] },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);
b.reserve(5, 16, 9, 4); // approach to the hidden shrine
b.reserve(22, 18, 7, 6); // around the hermit hut and treasure spot

// trails
b.fill(17, 12, 2, 16, 'path');
b.fill(6, 10, 26, 2, 'path');
b.fill(6, 7, 2, 3, 'path');
b.fill(30, 5, 2, 5, 'path');
b.fill(17, 10, 2, 2, 'path');

// pond (rusty key lies on its east shore)
b.ellipse(9, 14, 3, 2, 'water');

// abandoned building (north-west)
b.house(3, 2, 7, 5, { roof: 'roofGray', facade: 'facadeDark', door: 3, doorTile: 'door' });

// cave mouth (north-east)
b.fill(27, 1, 8, 4, 'caveWall');
b.put(30, 4, 'caveFloor');
b.put(31, 4, 'caveWall');

// hermit hut
b.house(24, 17, 4, 3, { roof: 'roofBrown', door: 1 });

// ruined shrine (west), entered through a hidden path at (8,19)
b.fill(5, 19, 8, 6, 'ruinFloor');
b.frame(5, 19, 8, 6, 'ruinWall');
b.put(6, 20, 'pillar');
b.put(11, 20, 'pillar');
b.put(7, 23, 'rubble');
b.put(10, 22, 'rubble');

// secret glade (east), entered through a hidden path at (28,20)
b.fill(28, 15, 7, 10, 'grass');
b.frame(28, 15, 7, 10, 'tree');
b.put(30, 22, 'flowers'); b.put(33, 19, 'flowers'); b.put(32, 16, 'flowers'); b.put(29, 23, 'flowers');

// world border, with exits
b.border('tree');
b.clear(17, 27, 2, 1);

b.scatter('pine', 34, { x: 1, y: 1, w: 34, h: 26, seed: 8 });
b.scatter('tree', 22, { x: 1, y: 1, w: 34, h: 26, seed: 9 });
b.scatter('bush', 16, { x: 1, y: 1, w: 34, h: 26, seed: 10 });
b.scatter('flowers', 20, { x: 1, y: 1, w: 34, h: 26, seed: 12 });

export default {
  id: 'forest',
  area: 'Forest',
  name: 'Whispering Forest',
  unlockRequirement: 25,
  theme: 'forest',
  dark: false,
  description: 'Trails, ponds and hidden paths. Ruins and buried things wait off the beaten track.',
  landmarks: ['Forest pond', 'Hermit\'s hut', 'Old Abandoned Building', 'Echo Cave entrance'],
  mapPos: { x: 32, y: 18 },
  ...b.build(),
  spawns: {
    default: { x: 17, y: 25, dir: 'up' },
    town: { x: 17, y: 25, dir: 'up' },
    abandoned: { x: 6, y: 8, dir: 'down' },
    cave: { x: 30, y: 6, dir: 'down' },
  },
  exits: [
    { x: 17, y: 27, w: 2, h: 1, to: 'town' },
    {
      x: 6,
      y: 6,
      w: 1,
      h: 1,
      to: 'abandoned',
      requires: { has: 'rusty_key' },
      lockedText: 'The old door is locked tight. The keyhole looks rusty. A matching key might be lying around somewhere.',
    },
    {
      x: 30,
      y: 4,
      w: 1,
      h: 1,
      to: 'cave',
      requires: { has: 'flashlight' },
      lockedText: 'It is pitch black in there. You would need a flashlight to go any farther.',
    },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'shrine_bush',
      x: 8,
      y: 19,
      floor: 'ruinFloor',
      look: 'bushSecret',
      prompt: 'push through',
      hint: 'The leaves here grow in an odd pattern, almost like a doorway.',
      openText: 'You push the bush aside. A hidden path leads into an old ruined shrine!',
    },
    {
      id: 'glade_bush',
      x: 28,
      y: 20,
      floor: 'grass',
      look: 'bushSecret',
      prompt: 'push through',
      hint: 'A tight wall of trees, but this bush looks different.',
      openText: 'Behind the bush is a secret glade full of flowers.',
    },
  ],
  puzzles: [],
};
