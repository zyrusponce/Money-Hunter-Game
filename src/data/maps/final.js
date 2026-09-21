import { MapBuilder } from './builder.js';

const b = new MapBuilder(22, 16, 'goldFloor');

const npcs = [{ id: 'money_collector', x: 10, y: 8, dir: 'down' }];

const objects = [
  {
    id: 'fn_monument',
    x: 10,
    y: 4,
    kind: 'monument',
    look: 'monument',
    solid: true,
    prompt: 'view',
    script: {
      speaker: 'The Monument of Collectors',
      pages: ['A golden monument lists everything you discovered. Your name is at the very top.'],
      effects: [{ type: 'showEnding' }],
    },
  },
  {
    id: 'fn_badge',
    x: 6,
    y: 4,
    kind: 'exhibit',
    look: 'exhibit',
    solid: true,
    prompt: 'examine',
    script: {
      speaker: 'Completion Badge',
      pages: ['A polished badge rests on velvet: "MONEY HUNTER - Encyclopedia Complete."', 'It hums quietly. It knows what you did.'],
    },
  },
  {
    id: 'fn_stats',
    x: 15,
    y: 4,
    kind: 'board',
    look: 'board',
    solid: true,
    prompt: 'read',
    script: { speaker: 'Hall of Records', pages: ['Every currency in the world is recorded here. You can always check your progress in the Money Encyclopedia (B).'] },
  },
];

for (const e of [...npcs, ...objects]) b.reserve(e.x, e.y, 1, 1);

b.fill(0, 0, 22, 16, 'ruinWall');
b.carve(2, 2, 18, 12, 'goldFloor');
b.carve(10, 14, 2, 2, 'goldFloor');
b.fill(8, 6, 6, 5, 'carpet');
for (const [x, y] of [[3, 3], [18, 3], [3, 12], [18, 12], [8, 4], [13, 4]]) b.put(x, y, 'statue');
for (const [x, y] of [[5, 7], [16, 7], [5, 9], [16, 9]]) b.put(x, y, 'brazier');
for (const [x, y] of [[7, 12], [14, 12]]) b.put(x, y, 'pillar');

export default {
  id: 'final',
  area: 'Treasury of Worlds',
  name: 'Treasury of Worlds',
  unlockRequirement: 100,
  theme: 'final',
  dark: false,
  description: 'The final hall, open only to collectors who found every currency.',
  landmarks: ['Monument of Collectors', 'Completion badge'],
  mapPos: { x: 50, y: 25 },
  ...b.build(),
  spawns: {
    default: { x: 10, y: 13, dir: 'up' },
    town: { x: 10, y: 13, dir: 'up' },
  },
  exits: [{ x: 10, y: 15, w: 2, h: 1, to: 'town' }],
  npcs,
  collectibles: [],
  objects,
  barriers: [],
  puzzles: [],
};
