// Turns raw game state into a plain object the React UI can read (menus, map, encyclopedia).
import { TOTAL_CURRENCIES } from '../data/currencies.js';
import { activeQuests, completedQuests, questMarkers } from './quests.js';
import { completionPercent, discoveredCount, totalDuplicates } from './progression.js';

export function snapshotFromState(s) {
  return {
    map: s.map,
    discovered: { ...s.discovered },
    duplicates: { ...s.duplicates },
    items: { ...s.items },
    flags: { ...s.flags },
    visited: { ...s.visited },
    quests: { active: activeQuests(s), done: completedQuests(s) },
    markers: questMarkers(s),
    stats: { ...s.stats },
    percent: completionPercent(s),
    count: discoveredCount(s),
    total: TOTAL_CURRENCIES,
    dupTotal: totalDuplicates(s),
    complete: !!s.complete,
  };
}
