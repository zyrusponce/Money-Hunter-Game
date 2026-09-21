import { MapBuilder } from './builder.js';

const b = new MapBuilder(30, 22, 'floorTile');

const npcs = [
  { id: 'dr_reyes', x: 14, y: 12, dir: 'down' },
  { id: 'mia_guide', x: 6, y: 15, dir: 'right' },
  { id: 'prof_hu', x: 22, y: 15, dir: 'left' },
  { id: 'archivist_lena', x: 14, y: 4, dir: 'down' },
];

const collectibles = [
  { id: 'mu_cny_cash', x: 2, y: 19, look: 'none', currency: 'cny_cash' },
  { id: 'mu_voc', x: 27, y: 19, look: 'none', currency: 'voc' },
  // restricted wing
  { id: 'mu_sangpyeong', x: 3, y: 3, look: 'vase', currency: 'krw_sangpyeong' },
  { id: 'mu_guinea', x: 13, y: 2, look: 'box', currency: 'gbp_guinea' },
  { id: 'mu_spade', x: 20, y: 6, look: 'none', currency: 'cny_spade' },
  { id: 'mu_byzantine', x: 26, y: 3, look: 'chest', currency: 'byzantine' },
];

const exhibit = (id, x, y, title, pages) => ({
  id,
  x,
  y,
  kind: 'exhibit',
  look: 'exhibit',
  prompt: 'examine',
  script: { speaker: title, pages },
});

const objects = [
  exhibit('ex_cowrie', 3, 10, 'Exhibit: Cowrie Shells', [
    'Cowrie shells were used as money in parts of Africa, Asia and the Pacific for centuries.',
    'They were small, hard to fake and easy to count. Some are still worn as lucky charms today.',
  ]),
  exhibit('ex_rai', 7, 10, 'Exhibit: Rai Stones', [
    'On the island of Yap, huge stone discs called rai were used as money.',
    'Everyone remembered who owned which stone, so a giant stone could change hands without ever moving.',
  ]),
  exhibit('ex_lydia', 11, 10, 'Exhibit: The First Coins', [
    'Some of the world\'s earliest coins came from Lydia, in what is now Turkey, around 2,600 years ago.',
    'They were made of electrum, a natural mix of gold and silver, and stamped so people could trust the weight.',
  ]),
  exhibit('ex_paper', 18, 10, 'Exhibit: Paper Money', [
    'Paper money appeared in China many centuries ago. Carrying a bundle of paper was far easier than carrying strings of heavy coins.',
  ]),
  exhibit('ex_piloncito', 22, 10, 'Exhibit: Piloncitos', [
    'Piloncitos are tiny gold beads found in the Philippines.',
    'Historians think they were used for trade long before ships from Europe arrived.',
  ]),
  exhibit('ex_cacao', 26, 10, 'Exhibit: Cacao Beans', [
    'The Maya and the Aztecs used cacao beans as a kind of money. Yes, chocolate was cash.',
  ]),
  exhibit('ex_pieces8', 5, 17, 'Exhibit: Pieces of Eight', [
    'Spanish "pieces of eight" were silver coins that could be cut into eight wedges for small change.',
    'They were accepted from Europe to Asia, which makes them one of the first truly global currencies.',
  ]),
  exhibit('ex_polymer', 24, 17, 'Exhibit: Polymer Notes', [
    'Many countries now print banknotes on plastic. Polymer notes last longer than paper and have clear windows that are hard to copy.',
  ]),

  // ---- Museum Mystery clues (only visible while the quest is active)
  {
    id: 'clue_ledger',
    x: 3,
    y: 13,
    kind: 'note',
    look: 'note',
    prompt: 'read',
    visibleWhen: { quest: 'museum_mystery' },
    script: {
      speaker: 'Torn Ledger Page',
      pages: ['A page from the museum ledger. The entry for a display case reads: "Removed for cleaning - taken through the back."', 'The ink is smudged with a muddy thumbprint.'],
      effects: [{ type: 'setFlag', flag: 'clue_ledger' }, { type: 'toast', text: 'Clue found: the torn ledger.' }],
    },
  },
  {
    id: 'clue_case',
    x: 25,
    y: 12,
    kind: 'note',
    look: 'exhibit',
    prompt: 'inspect',
    visibleWhen: { quest: 'museum_mystery' },
    script: {
      speaker: 'Empty Display Case',
      pages: ['The glass has been lifted out cleanly, not broken. Whoever did this had a key, or a very steady hand.', 'A faint smell of sea salt lingers here.'],
      effects: [{ type: 'setFlag', flag: 'clue_case' }, { type: 'toast', text: 'Clue found: the empty display case.' }],
    },
  },
  {
    id: 'clue_prints',
    x: 10,
    y: 19,
    kind: 'note',
    look: 'note',
    prompt: 'inspect',
    visibleWhen: { quest: 'museum_mystery' },
    script: {
      speaker: 'Sandy Footprints',
      pages: ['Sandy footprints lead toward the front door. Small ones. Someone brought a kid along.', 'And there is a shiny, folded scrap of paper money caught under the bench.'],
      effects: [{ type: 'setFlag', flag: 'clue_prints' }, { type: 'toast', text: 'Clue found: the sandy footprints.' }],
    },
  },
];

for (const e of [...npcs, ...collectibles, ...objects]) b.reserve(e.x, e.y, 1, 1);

// walls and layout
b.frame(0, 0, 30, 22, 'wall');
b.hline(1, 28, 8, 'wall');
b.clear(14, 8, 2, 1);
b.clear(14, 21, 2, 1);
b.fill(13, 9, 4, 12, 'carpet');
b.fill(13, 1, 4, 7, 'carpet');

// hall dressing
for (const [x, y] of [[9, 19], [19, 19], [1, 9], [28, 9]]) b.put(x, y, 'lamp');
b.put(12, 15, 'bench');
b.put(17, 15, 'bench');

// restricted wing dressing
for (const x of [6, 8, 20, 22]) b.put(x, 1, 'shelf');
b.put(7, 5, 'statue');
b.put(22, 5, 'statue');
b.put(10, 3, 'display');
b.put(18, 3, 'display');

export default {
  id: 'museum',
  area: 'Museum',
  name: 'Sunny Town Museum',
  unlockRequirement: 0,
  theme: 'museum',
  dark: false,
  description: 'A quiet museum about the history of money, with a restricted wing for serious collectors.',
  landmarks: ['Currency exhibits', 'The Curator', 'Restricted wing'],
  mapPos: { x: 16, y: 36 },
  ...b.build(),
  spawns: {
    default: { x: 14, y: 19, dir: 'up' },
    town: { x: 14, y: 19, dir: 'up' },
  },
  exits: [{ x: 14, y: 21, w: 2, h: 1, to: 'town' }],
  npcs,
  collectibles,
  objects,
  barriers: [
    {
      id: 'restricted_gate',
      x: 14,
      y: 8,
      tiles: [[15, 8]],
      look: 'velvetGate',
      prompt: 'show pass',
      requires: { percent: 50, has: 'museum_pass' },
      lockedText: 'A velvet rope blocks the restricted wing. A guard says: "Museum Pass and a Money Encyclopedia at 50% or higher, please."',
      openText: 'The guard checks your pass and unhooks the rope. The restricted wing is open!',
    },
  ],
  puzzles: [],
};
