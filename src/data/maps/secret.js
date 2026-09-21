import { MapBuilder } from './builder.js';

const b = new MapBuilder(22, 16, 'goldFloor');

const npcs = [{ id: 'coin_keeper', x: 10, y: 7, dir: 'down' }];

const collectibles = [
  { id: 'sl_dragon_crown', x: 6, y: 4, look: 'chest', currency: 'dragon_crown' },
  { id: 'sl_aurora', x: 15, y: 4, look: 'chest', currency: 'aurora_note' },
  { id: 'sl_starlight', x: 6, y: 11, look: 'chest', currency: 'starlight_doubloon' },
  { id: 'sl_emerald', x: 15, y: 11, look: 'chest', currency: 'founders_emerald' },
];

const objects = [
  {
    id: 'sl_tablet',
    x: 3,
    y: 7,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Golden Tablet', pages: ['Here rest the four oldest legends of money. Only a collector who has found nearly everything may enter.'] },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

b.fill(0, 0, 22, 16, 'ruinWall');
b.carve(2, 2, 18, 12, 'goldFloor');
b.carve(0, 7, 2, 2, 'goldFloor');
b.fill(8, 6, 5, 3, 'ruinFloor');
b.put(10, 7, 'ruinFloor');
for (const [x, y] of [[5, 3], [7, 3], [14, 3], [16, 3], [5, 12], [7, 12], [14, 12], [16, 12]]) b.put(x, y, 'statue');
for (const [x, y] of [[4, 7], [17, 7], [10, 3], [11, 3], [10, 12], [11, 12]]) b.put(x, y, 'brazier');

export default {
  id: 'secret',
  area: 'Secret Location',
  name: 'The Gilded Vault',
  unlockRequirement: 90,
  theme: 'secret',
  dark: false,
  description: 'A hidden sanctum that only opens for near-complete collectors. Four legends wait inside.',
  landmarks: ['Four pedestals', 'The Coin Keeper'],
  mapPos: { x: 90, y: 22 },
  ...b.build(),
  spawns: {
    default: { x: 3, y: 8, dir: 'right' },
    ruins: { x: 3, y: 8, dir: 'right' },
  },
  exits: [{ x: 0, y: 7, w: 1, h: 2, to: 'ruins' }],
  npcs,
  collectibles,
  objects,
  barriers: [],
  puzzles: [],
};
