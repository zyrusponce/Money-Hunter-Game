// The Money Detector: how strong is the signal from the nearest hidden money?
//   level 0 = nothing, 1 = Weak Signal, 2 = Signal Getting Stronger, 3 = Money Nearby!
// Rarer money has a smaller detection radius. The Improved Money Detector reaches farther.
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { isSpent } from './collectibles.js';

export const BASE_RADIUS = { Common: 9, Uncommon: 7, Rare: 5, Epic: 3, Legendary: 2 };
export const IMPROVED_RADIUS = { Common: 11, Uncommon: 9, Rare: 7.5, Epic: 5.5, Legendary: 4 };
export const NEARBY = 1.7; // tiles

export const SIGNAL_LABELS = ['', 'Weak Signal', 'Signal Getting Stronger', 'Money Nearby!'];

export function computeSignal(game) {
  const { s, rt } = game;
  const table = s.items.detector2 ? IMPROVED_RADIUS : BASE_RADIUS;
  const px = s.x;
  const py = s.y - 6;
  let best = { level: 0, dist: Infinity };

  for (const c of rt.map.data.collectibles) {
    if (c.look === 'sparkle' || c.random || isSpent(game, c)) continue;
    const cur = c.currency ? CURRENCY_BY_ID[c.currency] : null;
    const radius = table[cur ? cur.rarity : 'Common'];
    const dist = Math.hypot(c.x * 16 + 8 - px, c.y * 16 + 8 - py) / 16;
    let level = 0;
    if (dist <= NEARBY) level = 3;
    else if (dist <= radius * 0.55) level = 2;
    else if (dist <= radius) level = 1;
    if (level > best.level || (level === best.level && dist < best.dist)) best = { level, dist };
  }
  return best;
}
