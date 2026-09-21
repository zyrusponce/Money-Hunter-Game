// Builds a lookup of "where can each currency be found?" straight from the map, quest and
// NPC data. Used for trade hints and for the data validation script (npm run check).
import { LOCATION_LIST } from './locations.js';
import { QUEST_LIST } from './quests.js';
import { NPCS } from './npcs.js';
import { CURRENCIES } from './currencies.js';

const collectEffects = (script, out) => {
  if (!script) return;
  for (const e of script.effects || []) out.push(e);
  for (const c of script.choices || []) collectEffects(c.script, out);
};

export function buildSources() {
  const map = Object.fromEntries(CURRENCIES.map((c) => [c.id, []]));
  const add = (id, src) => {
    if (map[id]) map[id].push(src);
    else console.warn('[sources] unknown currency id:', id);
  };

  for (const loc of LOCATION_LIST) {
    for (const c of loc.collectibles) {
      if (c.currency) add(c.currency, { kind: 'collectible', map: loc.id, area: loc.area, id: c.id, look: c.look, requires: c.requires || null });
      if (c.random) {
        for (const cur of CURRENCIES) {
          if (cur.rarity === c.random.pool && cur.location === loc.area) add(cur.id, { kind: 'random', map: loc.id, area: loc.area, id: c.id });
        }
      }
    }
  }
  for (const q of QUEST_LIST) for (const id of q.rewards.currencies || []) add(id, { kind: 'quest', quest: q.id, map: null });
  for (const npc of Object.values(NPCS)) {
    for (const rule of npc.dialogue) {
      const effects = [];
      collectEffects(rule.script, effects);
      for (const e of effects) if (e.type === 'giveCurrency') add(e.id, { kind: 'npc', npc: npc.id, map: null });
    }
  }
  return map;
}

export const CURRENCY_SOURCES = buildSources();

// Human-friendly hint used by The Money Collector's hint service.
// It only names the area, never an exact spot, and never gives away legendary locations.
export function hintFor(currency) {
  if (currency.rarity === 'Legendary') {
    return 'Legends do not leave hints. But they say the oldest and most secret places keep them.';
  }
  const srcs = CURRENCY_SOURCES[currency.id] || [];
  const s = srcs[0];
  if (!s) return 'Nobody I know has ever seen this one.';
  if (s.kind === 'quest') return 'Somebody will give you this as a thank-you for a favor. Help people out!';
  if (s.kind === 'npc') return 'This one is won by answering a clever question.';
  const where = currency.location;
  if (s.kind === 'random') return `Loose change like this turns up in vending machines and lost-and-found boxes around the ${where}.`;
  if (s.requires === 'shovel') return `Something like this is buried somewhere in the ${where}. Bring a shovel.`;
  if (s.requires === 'flashlight') return `It is somewhere dark in the ${where}. Bring a flashlight.`;
  if (s.look === 'chest') return `A treasure chest in the ${where} holds this. Look carefully!`;
  if (s.look === 'sparkle') return `Keep your eyes open. This one lies in plain sight somewhere in the ${where}.`;
  return `Your detector will find it hiding somewhere in the ${where}.`;
}
