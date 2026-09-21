import { MapBuilder } from './builder.js';

const b = new MapBuilder(32, 24, 'ruinFloor');

const npcs = [{ id: 'explorer_nova', x: 13, y: 20, dir: 'right' }];

const collectibles = [
  { id: 'ru_aegina', x: 6, y: 19, look: 'none', currency: 'aegina' },
  { id: 'ru_carthage', x: 25, y: 21, look: 'none', currency: 'carthage' },
  { id: 'ru_daric', x: 14, y: 21, look: 'none', currency: 'daric', requires: 'shovel' },
  // west wing (hidden wall)
  { id: 'ru_egypt_ring', x: 3, y: 10, look: 'none', currency: 'egypt_ring' },
  { id: 'ru_jade_disc', x: 4, y: 12, look: 'chest', currency: 'jade_disc' },
  // east wing (leads to the secret location)
  { id: 'ru_sun_coin', x: 28, y: 9, look: 'none', currency: 'sun_coin' },
  { id: 'ru_phoenix', x: 27, y: 12, look: 'none', currency: 'phoenix_note' },
  // sanctum (plate puzzle)
  { id: 'ru_owl', x: 13, y: 3, look: 'chest', currency: 'owl' },
  { id: 'ru_lydian', x: 18, y: 3, look: 'chest', currency: 'lydian' },
];

const mural = (id, x, title, text) => ({
  id,
  x,
  y: 8,
  kind: 'mural',
  look: 'mural',
  solid: true,
  prompt: 'study',
  script: { speaker: title, pages: [text], effects: [{ type: 'setFlag', flag: 'saw_' + id }] },
});

const plate = (id, x, symbol, label) => ({
  id,
  x,
  y: 11,
  kind: 'lever',
  look: 'plate',
  symbol,
  prompt: 'step on plate',
  puzzle: 'ruins_plates',
  script: { speaker: label, pages: [] },
});

const objects = [
  {
    id: 'ru_tablet',
    x: 17,
    y: 21,
    kind: 'sign',
    look: 'sign',
    prompt: 'read',
    script: {
      speaker: 'Stone Tablet',
      pages: ['Worn letters read: "Those who know the story of the sky may pass."', 'Four murals line the north wall of the great hall. Four plates wait on the floor.'],
    },
  },
  mural('mu_sun', 9, 'Mural: The Sun', 'A golden sun rises over a green land. Carved words: "FIRST, the sun climbs the sky."'),
  mural('mu_wave', 13, 'Mural: The Wave', 'A blue wave curls over a shore. Carved words: "THEN, the wave crashes upon the sand."'),
  mural('mu_star', 18, 'Mural: The Star', 'A single bright star hangs above dark water. Carved words: "AFTER, the star appears above the sea."'),
  mural('mu_moon', 22, 'Mural: The Moon', 'A pale moon silvers a quiet night. Carved words: "LAST, the moon lights the night."'),
  plate('pl_star', 10, 'star', 'Star Plate'),
  plate('pl_sun', 13, 'sun', 'Sun Plate'),
  plate('pl_moon', 18, 'moon', 'Moon Plate'),
  plate('pl_wave', 21, 'wave', 'Wave Plate'),
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

b.fill(0, 0, 32, 24, 'ruinWall');
b.carve(4, 15, 24, 8, 'ruinFloor'); // courtyard
b.carve(15, 23, 2, 1, 'ruinFloor'); // entrance
b.carve(8, 8, 16, 6, 'ruinFloor'); // great hall
b.carve(15, 14, 2, 1, 'ruinFloor'); // hall to courtyard
b.carve(11, 1, 10, 5, 'ruinFloor'); // sanctum
b.carve(15, 6, 2, 2, 'ruinFloor'); // sealed corridor to the sanctum
b.carve(2, 8, 5, 6, 'ruinFloor'); // west wing
b.carve(24, 8, 6, 6, 'ruinFloor'); // east wing
b.carve(30, 10, 2, 2, 'ruinFloor'); // corridor to the secret location

for (const [x, y] of [[7, 17], [12, 17], [19, 17], [24, 17], [7, 20], [24, 20]]) b.put(x, y, 'pillar');
b.put(14, 16, 'brazier');
b.put(17, 16, 'brazier');
b.put(9, 13, 'brazier');
b.put(22, 13, 'brazier');
b.put(12, 2, 'brazier');
b.put(19, 2, 'brazier');
b.put(9, 21, 'rubble');
b.put(20, 20, 'rubble');
b.put(26, 15, 'rubble');
b.put(5, 16, 'rubble');

export default {
  id: 'ruins',
  area: 'Ancient Ruins',
  name: 'Ancient Ruins',
  unlockRequirement: 75,
  theme: 'ruins',
  dark: { radius: 52, flash: 112 },
  description: 'Crumbling halls of an old civilization. Its mural puzzle guards the oldest coins ever made.',
  landmarks: ['Great hall murals', 'Sealed sanctum', 'West and east wings', 'The far gate'],
  mapPos: { x: 76, y: 12 },
  ...b.build(),
  spawns: {
    default: { x: 15, y: 21, dir: 'up' },
    cave: { x: 15, y: 21, dir: 'up' },
    secret: { x: 29, y: 10, dir: 'left' },
  },
  exits: [
    { x: 15, y: 23, w: 2, h: 1, to: 'cave' },
    { x: 31, y: 10, w: 1, h: 2, to: 'secret' },
  ],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'sanctum_door',
      x: 15,
      y: 7,
      tiles: [[16, 7]],
      floor: 'ruinFloor',
      look: 'sealedGate',
      interactive: false,
    },
    {
      id: 'west_wall',
      x: 7,
      y: 10,
      floor: 'ruinFloor',
      look: 'crackedWall',
      prompt: 'push wall',
      hint: 'The stones here are a slightly different color than their neighbors.',
      openText: 'The stone slides aside with a low groan. A hidden wing lies beyond!',
    },
  ],
  puzzles: [
    {
      id: 'ruins_plates',
      order: ['pl_sun', 'pl_wave', 'pl_star', 'pl_moon'],
      resetText: 'The plates click back up. The order was wrong. Try to remember the story on the walls.',
      solvedText: 'All four plates glow. The great sealed gate to the north swings open!',
      onSolve: [{ type: 'openBarrier', map: 'ruins', id: 'sanctum_door' }],
    },
  ],
};
