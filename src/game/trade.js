// The Money Collector's trades: swap duplicates for new currency, buy hints, claim milestone prizes.
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { hintFor } from '../data/sources.js';
import { pickUndiscovered, totalDuplicates, completionPercent } from './progression.js';

export const OFFERS = [
  { id: 'swap_common', title: 'Coin Swap', desc: 'Trade 3 duplicates for a random undiscovered Common or Uncommon currency.', cost: 3, rarities: ['Common', 'Uncommon'] },
  { id: 'swap_rare', title: 'Collector\'s Bundle', desc: 'Trade 8 duplicates for a random undiscovered Rare currency.', cost: 8, rarities: ['Rare'] },
  { id: 'hint', title: 'Insider Hint', desc: 'Trade 1 duplicate for a tip about where an undiscovered currency is hiding.', cost: 1 },
];

export const MILESTONES = [
  { id: 'm10', percent: 10, title: 'Getting Started', desc: 'A pouch of loose change: a random undiscovered Common or Uncommon currency.', rarities: ['Common', 'Uncommon'] },
  { id: 'm25', percent: 25, title: 'Seasoned Hunter', desc: 'A random undiscovered Uncommon currency.', rarities: ['Uncommon'] },
  { id: 'm50', percent: 50, title: 'Halfway There', desc: 'A random undiscovered Rare currency.', rarities: ['Rare'] },
  { id: 'm75', percent: 75, title: 'Master Collector', desc: 'A random undiscovered Rare or Epic currency.', rarities: ['Rare', 'Epic'] },
  { id: 'm90', percent: 90, title: 'Nearly Legendary', desc: 'A rare secret: the Collector shares where the last door is.', special: 'secretHint' },
];

export function getTradeInfo(game) {
  const s = game.s;
  const pct = completionPercent(s);
  const total = totalDuplicates(s);
  const dupes = Object.entries(s.duplicates)
    .filter(([, n]) => n > 0)
    .map(([id, count]) => ({ currency: CURRENCY_BY_ID[id], count }))
    .sort((a, b) => b.count - a.count);
  return {
    total,
    dupes,
    offers: OFFERS.map((o) => ({
      ...o,
      affordable: total >= o.cost,
      remaining: o.rarities ? (pickUndiscovered(s, o.rarities) ? true : false) : pickUndiscovered(s, ['Common', 'Uncommon', 'Rare', 'Epic']) !== null,
    })),
    milestones: MILESTONES.map((m) => ({ ...m, reached: pct >= m.percent, claimed: !!s.claimed[m.id] })),
    percent: pct,
  };
}

// Spend duplicates, taking from the biggest stacks first.
function payDuplicates(s, cost) {
  let left = cost;
  const ids = Object.keys(s.duplicates).sort((a, b) => s.duplicates[b] - s.duplicates[a]);
  for (const id of ids) {
    if (left <= 0) break;
    const take = Math.min(left, s.duplicates[id]);
    s.duplicates[id] -= take;
    left -= take;
    if (s.duplicates[id] <= 0) delete s.duplicates[id];
  }
}

export function doTrade(game, offerId) {
  const s = game.s;
  const offer = OFFERS.find((o) => o.id === offerId);
  if (!offer) return { ok: false, message: 'Unknown trade.' };
  if (totalDuplicates(s) < offer.cost) return { ok: false, message: `You need ${offer.cost} duplicate${offer.cost > 1 ? 's' : ''} for that.` };

  if (offer.id === 'hint') {
    const cur = pickUndiscovered(s, ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'], game.rnd);
    if (!cur) return { ok: false, message: 'There is nothing left to hint about. You have everything!' };
    payDuplicates(s, offer.cost);
    game.touch();
    game.save();
    return { ok: true, message: `Tip for a missing ${cur.rarity} ${cur.type.toLowerCase()}: ${hintFor(cur)}` };
  }

  const cur = pickUndiscovered(s, offer.rarities, game.rnd);
  if (!cur) return { ok: false, message: 'You already own every currency of that kind. Nothing to trade for!' };
  payDuplicates(s, offer.cost);
  game.discover(cur.id, { source: 'trade', silent: true });
  game.save();
  return { ok: true, message: `Received ${cur.name}!`, currency: cur };
}

export function claimMilestone(game, id) {
  const s = game.s;
  const m = MILESTONES.find((x) => x.id === id);
  if (!m) return { ok: false, message: 'Unknown milestone.' };
  if (s.claimed[id]) return { ok: false, message: 'You already claimed that prize.' };
  if (completionPercent(s) < m.percent) return { ok: false, message: `Reach ${m.percent}% first.` };
  s.claimed[id] = true;
  if (m.special === 'secretHint') {
    game.touch();
    game.save();
    return { ok: true, message: 'The Collector whispers: "Beyond the cave lie the ruins. On the far east side of the ruins, a sealed gate opens only for near-complete collectors. Behind it: four legends."' };
  }
  const cur = pickUndiscovered(s, m.rarities, game.rnd);
  if (!cur) {
    game.touch();
    game.save();
    return { ok: true, message: 'You already own every currency of that kind. The Collector tips his hat anyway.' };
  }
  game.discover(cur.id, { source: 'milestone', silent: true });
  game.save();
  return { ok: true, message: `Prize: ${cur.name}!`, currency: cur };
}
