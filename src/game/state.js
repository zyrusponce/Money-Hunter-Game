// The saved game state. Everything in here must be JSON-serialisable.
import { START_ITEMS } from '../data/items.js';
import { LOCATIONS, START_LOCATION } from '../data/locations.js';
import { createRewardState } from './rewardState.js';
import { seedLegacyRewards } from './rewards.js';

export const SAVE_VERSION = 2;

// Feet position of the centre of a tile, in pixels.
export const tileToPos = (tx, ty) => ({ x: tx * 16 + 8, y: ty * 16 + 14 });

export function createNewState() {
  const spawn = LOCATIONS[START_LOCATION].spawns.default;
  const items = {};
  for (const id of START_ITEMS) items[id] = true;
  return {
    version: SAVE_VERSION,
    map: START_LOCATION,
    ...tileToPos(spawn.x, spawn.y),
    dir: spawn.dir || 'down',
    discovered: {},
    duplicates: {},
    items,
    flags: {},
    collected: {},
    cooldowns: {},
    quests: { active: {}, done: {} },
    visited: { [START_LOCATION]: true },
    notified: {},
    claimed: {},
    stats: { playtime: 0, steps: 0, discoveries: 0, duplicatesFound: 0, searches: 0, distance: 0, chestsOpened: 0, secretsFound: 0, xpEarned: 0 },
    progression: createRewardState(),
    complete: false,
    endingSeen: false,
    completionPercent: 0,
    savedAt: 0,
  };
}

// Merge a loaded save onto a fresh state so older saves never miss a key.
export function migrateState(raw) {
  const base = createNewState();
  if (!raw || typeof raw !== 'object') return base;
  const out = { ...base, ...raw };
  for (const k of ['discovered', 'duplicates', 'items', 'flags', 'collected', 'cooldowns', 'visited', 'notified', 'claimed']) {
    out[k] = { ...base[k], ...(raw[k] || {}) };
  }
  out.quests = { active: { ...(raw.quests?.active || {}) }, done: { ...(raw.quests?.done || {}) } };
  out.stats = { ...base.stats, ...(raw.stats || {}) };
  out.progression = { ...base.progression, ...(raw.progression || {}) };
  for (const k of ['claims','skills','purchases','cosmetics','badges','titles','equipped','explored','chests','mastered','friendship','events']) {
    out.progression[k] = { ...base.progression[k], ...(raw.progression?.[k] || {}) };
  }
  if (!raw.progression) seedLegacyRewards(out);
  if (!LOCATIONS[out.map]) {
    out.map = base.map;
    out.x = base.x;
    out.y = base.y;
  }
  out.version = SAVE_VERSION;
  return out;
}
