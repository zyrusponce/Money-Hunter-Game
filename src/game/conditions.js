// A tiny condition language used by dialogue rules, quest objectives, gates and object visibility.
//
//   { has: 'shovel' }              player owns an item (or all of an array)
//   { notHas, flag, notFlag }      item / story-flag checks
//   { quest, questDone, questNew, questReady }
//   { percent: 50 }                Encyclopedia completion >= 50
//   { complete: true }             Encyclopedia is 100%
//   { discoveredIn: { location: 'Harbor', count: 3 } }
//   { discovered: 'php1' }  { notDiscovered: 'php1' }
//   { rarity: { rarity: 'Rare', count: 3 } }   discovered at least 3 Rare currencies
//   { collected: 'town_php1' }     a specific world spot has been collected
//   { all: [...] } { any: [...] } { not: {...} }
import { CURRENCIES, CURRENCY_BY_ID } from '../data/currencies.js';
import { QUESTS } from '../data/quests.js';
import { completionPercent } from './progression.js';

const list = (v) => (Array.isArray(v) ? v : [v]);

export function questObjectivesDone(s, quest) {
  return quest.objectives.filter((o) => !o.turnIn).every((o) => checkCond(s, o.done));
}

export function checkCond(s, c) {
  if (!c) return true;
  if (c.all && !c.all.every((x) => checkCond(s, x))) return false;
  if (c.any && !c.any.some((x) => checkCond(s, x))) return false;
  if (c.not && checkCond(s, c.not)) return false;

  if (c.has !== undefined && !list(c.has).every((id) => s.items[id])) return false;
  if (c.notHas !== undefined && list(c.notHas).some((id) => s.items[id])) return false;
  if (c.flag !== undefined && !list(c.flag).every((f) => s.flags[f])) return false;
  if (c.notFlag !== undefined && list(c.notFlag).some((f) => s.flags[f])) return false;

  if (c.quest !== undefined && !s.quests.active[c.quest]) return false;
  if (c.questDone !== undefined && !s.quests.done[c.questDone]) return false;
  if (c.questNew !== undefined && (s.quests.active[c.questNew] || s.quests.done[c.questNew])) return false;
  if (c.questReady !== undefined) {
    const q = QUESTS[c.questReady];
    if (!q || !s.quests.active[c.questReady] || !questObjectivesDone(s, q)) return false;
  }

  if (c.percent !== undefined && completionPercent(s) < c.percent) return false;
  if (c.complete !== undefined && !!s.complete !== c.complete) return false;
  if (c.discovered !== undefined && !list(c.discovered).every((id) => s.discovered[id])) return false;
  if (c.notDiscovered !== undefined && list(c.notDiscovered).some((id) => s.discovered[id])) return false;
  if (c.collected !== undefined && !list(c.collected).every((id) => s.collected[id])) return false;
  if (c.rarity) {
    const n = CURRENCIES.filter((x) => x.rarity === c.rarity.rarity && s.discovered[x.id]).length;
    if (n < c.rarity.count) return false;
  }
  if (c.discoveredIn) {
    const n = CURRENCIES.filter((x) => x.location === c.discoveredIn.location && s.discovered[x.id]).length;
    if (n < c.discoveredIn.count) return false;
  }
  return true;
}

export const currencyName = (id) => (CURRENCY_BY_ID[id] ? CURRENCY_BY_ID[id].name : id);
