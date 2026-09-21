// Encyclopedia progress helpers.
import { CURRENCIES, TOTAL_CURRENCIES } from '../data/currencies.js';
import { LOCATIONS } from '../data/locations.js';

export const discoveredCount = (s) => Object.keys(s.discovered).length;

// Whole-number percentage. Only reaches 100 when every entry is discovered.
export const completionPercent = (s) => {
  const n = discoveredCount(s);
  if (n >= TOTAL_CURRENCIES) return 100;
  return Math.floor((n / TOTAL_CURRENCIES) * 100);
};

export const isLocationUnlocked = (s, id) => {
  const loc = LOCATIONS[id];
  return !!loc && completionPercent(s) >= loc.unlockRequirement;
};

export const totalDuplicates = (s) => Object.values(s.duplicates).reduce((a, b) => a + b, 0);

// Pick a random undiscovered currency of the given rarities (or null if none remain).
export function pickUndiscovered(s, rarities, rnd = Math.random, area = null) {
  const pool = CURRENCIES.filter((c) => !s.discovered[c.id] && rarities.includes(c.rarity) && (!area || c.location === area));
  if (!pool.length) return null;
  return pool[Math.floor(rnd() * pool.length)];
}
