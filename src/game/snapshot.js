// Turns raw game state into a plain object the React UI can read (menus, map, encyclopedia).
import { TOTAL_CURRENCIES } from '../data/currencies.js';
import { activeQuests, completedQuests, questMarkers } from './quests.js';
import { completionPercent, discoveredCount, totalDuplicates } from './progression.js';
import { levelInfo } from './rewards.js';
import { collectionViews, achievementViews } from './milestones.js';
import { worldProgress, areaProgress, canFastTravel } from './exploration.js';
import { LOCATION_LIST } from '../data/locations.js';

export function snapshotFromState(s) {
  return {
    progression:JSON.parse(JSON.stringify(s.progression)),
    level:levelInfo(s.progression.xp),
    collections:collectionViews(s),achievements:achievementViews(s),world:worldProgress(s),
    areas:Object.fromEntries(LOCATION_LIST.map(m=>[m.id,areaProgress(s,m.id)])),
    travel:Object.fromEntries(LOCATION_LIST.map(m=>[m.id,canFastTravel(s,m.id)])),
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
