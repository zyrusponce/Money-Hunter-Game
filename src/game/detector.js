// The Money Detector: how strong is the signal from the nearest hidden money?
//   level 0 = nothing, 1 = Weak Signal, 2 = Signal Getting Stronger, 3 = Money Nearby!
// Rarer money has a smaller detection radius. The Improved Money Detector reaches farther.
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { isSpent } from './collectibles.js';
import { modifiers } from './modifiers.js';

export const BASE_RADIUS = { Common: 9, Uncommon: 7, Rare: 5, Epic: 3, Legendary: 2 };
export const IMPROVED_RADIUS = { Common: 11, Uncommon: 9, Rare: 7.5, Epic: 5.5, Legendary: 4 };
export const NEARBY = 1.7; // tiles

export const SIGNAL_LABELS = ['', 'Weak Signal', 'Signal Getting Stronger', 'Money Nearby!'];

export function computeSignal(game) {
  const { s, rt } = game;
  const mod=modifiers(s);
  const table = s.items.detector2 ? IMPROVED_RADIUS : BASE_RADIUS;
  const px = s.x;
  const py = s.y - 6;
  let best = { level: 0, dist: Infinity };

  for (const c of rt.map.data.collectibles) {
    if (c.look === 'sparkle' || c.random || isSpent(game, c)) continue;
    const cur = c.currency ? CURRENCY_BY_ID[c.currency] : null;
    if(c.chestType&&!cur&&!mod.chestDetection) continue;
    if(c.secret&&!mod.secretHints) continue;
    const radius = table[cur ? cur.rarity : 'Common']*mod.detectorRange*(cur&&['Rare','Epic','Legendary'].includes(cur.rarity)?mod.rareRange:1)*(cur?.rarity==='Legendary'&&s.items.legendary_detector?1.6:1);
    const dist = Math.hypot(c.x * 16 + 8 - px, c.y * 16 + 8 - py) / 16;
    let level = 0;
    if (dist <= NEARBY) level = 3;
    else if (dist <= radius * mod.signalStrength) level = 2;
    else if (dist <= radius) level = 1;
    if (level > best.level || (level === best.level && dist < best.dist)) best = { level, dist, hint:cur?.rarity==='Legendary'&&mod.legendaryHints?'A golden whisper nearby':mod.duplicateHints&&cur&&s.discovered[cur.id]?'Familiar currency signal':c.chestType?'Treasure signal':c.secret?'Hidden cache signal':null };
  }
  if(mod.hiddenPaths)for(const b of rt.map.data.barriers){
    if(game.isBarrierOpen(b)||!/secret|hidden|bush|crack/i.test(`${b.look} ${b.hint}`))continue;
    const dist=Math.hypot(b.x*16+8-px,b.y*16+8-py)/16;
    if(dist<4&&best.level<2)best={level:1,dist,hint:'A hidden path may be nearby'};
  }
  return best;
}
