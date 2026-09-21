import { MapBuilder } from './builder.js';

const b = new MapBuilder(28, 22, 'darkFloor');

const npcs = [{ id: 'mr_whispers', x: 11, y: 16, dir: 'right' }];

const collectibles = [
  { id: 'ab_eur20n', x: 2, y: 19, look: 'drawer', currency: 'eur20n' },
  { id: 'ab_brass_key', x: 2, y: 15, look: 'drawer', item: 'brass_key' },
  { id: 'ab_usd20n', x: 25, y: 19, look: 'crate', currency: 'usd20n' },
  { id: 'ab_krw10000n', x: 6, y: 9, look: 'none', currency: 'krw10000n' },
  { id: 'ab_gbp_crown', x: 17, y: 12, look: 'chest', currency: 'gbp_crown' },
  // east room (locked with the brass key)
  { id: 'ab_error_coin', x: 21, y: 8, look: 'none', currency: 'error_coin' },
  { id: 'ab_gold_bullion', x: 25, y: 11, look: 'chest', currency: 'gold_bullion' },
  // hidden vault (lever puzzle)
  { id: 'ab_cny_knife', x: 14, y: 3, look: 'chest', currency: 'cny_knife' },
];

const lever = (id, x, color, label) => ({
  id,
  x,
  y: 7,
  kind: 'lever',
  look: 'lever',
  color,
  prompt: 'pull lever',
  puzzle: 'abandoned_levers',
  script: { speaker: label, pages: [] },
});

const objects = [
  {
    id: 'ab_note',
    x: 5,
    y: 16,
    kind: 'note',
    look: 'note',
    prompt: 'read',
    script: {
      speaker: 'Caretaker\'s Note',
      pages: ['A yellowed note pinned to a table:', '"The lights only obey the right order. BLUE first, then RED, and last of all GREEN. Never forget."', 'Three levers stand along the north wall of the big hall, just past the middle door.'],
      effects: [{ type: 'setFlag', flag: 'knows_lever_order' }],
    },
  },
  lever('lv_red', 14, '#e2574c', 'Red Lever'),
  lever('lv_blue', 11, '#4aa8ff', 'Blue Lever'),
  lever('lv_green', 17, '#62d26f', 'Green Lever'),
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// shell and partitions
b.frame(0, 0, 28, 22, 'wall');
b.fill(1, 1, 26, 5, 'wall');
b.carve(10, 1, 8, 5, 'darkFloor'); // the hidden vault room
b.hline(1, 26, 6, 'wall');
b.hline(1, 26, 13, 'wall');
b.vline(8, 7, 12, 'wall');
b.vline(8, 14, 20, 'wall');
b.vline(19, 7, 12, 'wall');
b.vline(19, 14, 20, 'wall');
b.clear(8, 17, 1, 1);
b.clear(19, 17, 1, 1);
b.clear(4, 13, 1, 1);
b.clear(13, 13, 2, 1);
b.clear(13, 21, 2, 1);

// clutter
b.put(3, 17, 'table');
b.put(3, 9, 'table');
b.put(22, 15, 'barrel');
b.put(21, 19, 'crate');
b.put(10, 15, 'rubble');
b.put(16, 19, 'rubble');
b.put(2, 7, 'shelf');
b.put(3, 7, 'shelf');
b.put(24, 8, 'barrel');
b.put(12, 9, 'rubble');

export default {
  id: 'abandoned',
  area: 'Abandoned Building',
  name: 'Abandoned Building',
  unlockRequirement: 0,
  theme: 'dark',
  dark: { radius: 46, flash: 104 },
  description: 'A creaky old building with dark rooms, a locked door and a secret upstairs.',
  landmarks: ['Entrance hall', 'The lever room', 'East room', 'Hidden vault'],
  mapPos: { x: 15, y: 11 },
  ...b.build(),
  spawns: {
    default: { x: 13, y: 19, dir: 'up' },
    forest: { x: 13, y: 19, dir: 'up' },
  },
  exits: [{ x: 13, y: 21, w: 2, h: 1, to: 'forest' }],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'east_gate',
      x: 23,
      y: 13,
      floor: 'darkFloor',
      look: 'gateClosed',
      prompt: 'unlock',
      requires: { has: 'brass_key' },
      lockedText: 'The east room is locked. A tag on the lock reads "East Room". You need the matching key.',
      openText: 'The brass key turns with a click. The east room is open!',
    },
    {
      id: 'vault_wall',
      x: 13,
      y: 6,
      tiles: [[14, 6]],
      floor: 'darkFloor',
      look: 'crackedWall',
      interactive: false,
    },
  ],
  puzzles: [
    {
      id: 'abandoned_levers',
      order: ['lv_blue', 'lv_red', 'lv_green'],
      resetText: 'The levers clunk back into place. That was not the right order.',
      solvedText: 'The levers glow, and somewhere to the north stone grinds against stone...',
      onSolve: [{ type: 'openBarrier', map: 'abandoned', id: 'vault_wall' }],
    },
  ],
};
