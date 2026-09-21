import { MapBuilder } from './builder.js';

const b = new MapBuilder(24, 16, 'water');

const npcs = [{ id: 'castaway_gil', x: 7, y: 10, dir: 'right' }];

const collectibles = [
  { id: 'isl_aud_holey', x: 14, y: 4, look: 'none', currency: 'aud_holey', requires: 'shovel' },
  { id: 'isl_cad_commem', x: 19, y: 10, look: 'chest', currency: 'cad_commem' },
  { id: 'isl_aud50n', x: 8, y: 12, look: 'none', currency: 'aud50n' },
  // hidden palm clearing in the north-east
  { id: 'isl_rai_stone', x: 19, y: 5, look: 'none', currency: 'rai_stone' },
  // the dark grotto on the north shore
  { id: 'isl_pearl', x: 11, y: 1, look: 'none', currency: 'pearl', requires: 'flashlight' },
];

const objects = [
  {
    id: 'isl_sign',
    x: 5,
    y: 9,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: { speaker: 'Driftwood Sign', pages: ['CORAL ISLE. Population: one. (Two, if you count the crab.)'] },
  },
  {
    id: 'isl_boat',
    x: 1,
    y: 9,
    kind: 'boat',
    look: 'boat',
    solid: true,
    prompt: 'sail back',
    script: {
      speaker: 'Captain Delos\'s Boat',
      pages: ['The little boat bobs against the dock. Ready to sail back to the Harbor?'],
      choices: [
        { label: 'Sail back to the Harbor', script: { pages: ['You hop aboard and the boat pushes off...'], effects: [{ type: 'travel', to: 'harbor', spawn: 'island' }] } },
        { label: 'Stay a little longer', script: { pages: ['The boat will wait.'] } },
      ],
    },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);
b.reserve(2, 7, 4, 3);
b.reserve(10, 4, 3, 2); // approach to the grotto boulder
b.reserve(14, 4, 3, 3); // approach to the palm gap

// the island
b.fill(3, 3, 19, 11, 'sand');
for (const [x, y] of [[3, 3], [4, 3], [3, 4], [3, 13], [4, 13], [3, 12], [21, 13], [20, 13], [21, 12]]) b.put(x, y, 'water');
b.fill(6, 5, 13, 7, 'grass');
b.fill(1, 8, 3, 1, 'dock');

// palm clearing in the north-east (hidden path at (16,5))
b.frame(16, 3, 6, 5, 'palm');
b.fill(17, 4, 4, 3, 'sand');
b.clear(17, 4, 4, 3);

// north grotto (needs a boulder moved, and a flashlight)
b.fill(10, 1, 3, 2, 'caveFloor');
b.frame(9, 0, 5, 4, 'caveWall');
b.fill(10, 1, 3, 2, 'caveFloor');
b.clear(10, 1, 3, 2);
b.put(10, 3, 'caveWall');
b.put(12, 3, 'caveWall');

b.put(15, 9, 'rock');
b.put(11, 10, 'rock');
b.scatter('palm', 12, { x: 4, y: 3, w: 17, h: 10, seed: 31, on: ['sand'] });
b.scatter('flowers', 10, { x: 6, y: 5, w: 13, h: 7, seed: 32, on: ['grass'] });

export default {
  id: 'island',
  area: 'Coral Isle',
  name: 'Coral Isle',
  unlockRequirement: 0,
  theme: 'beach',
  dark: false,
  description: 'A tiny island past the harbor, reachable only by boat. Secrets hide in its palm groves.',
  landmarks: ['Boat dock', 'Palm clearing', 'North shore rocks'],
  mapPos: { x: 84, y: 56 },
  ...b.build(),
  spawns: {
    default: { x: 3, y: 8, dir: 'right' },
    harbor: { x: 3, y: 8, dir: 'right' },
  },
  exits: [],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'isl_palm_gap',
      x: 16,
      y: 5,
      floor: 'sand',
      look: 'bushSecret',
      prompt: 'push through',
      hint: 'A ring of palms with one suspiciously bushy gap.',
      openText: 'You push through the fronds and find a hidden clearing!',
    },
    {
      id: 'isl_grotto_rock',
      x: 11,
      y: 3,
      floor: 'caveFloor',
      look: 'boulderSecret',
      prompt: 'push',
      hint: 'A boulder wedged between two dark walls of stone. It has scrape marks on the sand.',
      openText: 'The boulder rolls aside with a low rumble. A dark grotto opens behind it.',
    },
  ],
  puzzles: [],
};
