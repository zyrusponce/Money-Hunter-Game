// Quest logic. Progress is derived from game state, so this file mostly reads state and
// hands out rewards on completion.
import { QUESTS, QUEST_LIST } from '../data/quests.js';
import { ITEMS } from '../data/items.js';
import { checkCond, questObjectivesDone } from './conditions.js';
import { audio } from './audio.js';
import { grantReward } from './rewards.js';
import { friendshipQuest } from './friendship.js';

export function questStatus(s, id) {
  if (s.quests.done[id]) return 'done';
  if (!s.quests.active[id]) return 'new';
  return questObjectivesDone(s, QUESTS[id]) ? 'ready' : 'active';
}

export function questView(s, q) {
  const status = questStatus(s, q.id);
  return {
    ...q,
    status,
    objectives: q.objectives.map((o) => ({
      ...o,
      complete: status === 'done' ? true : o.turnIn ? false : checkCond(s, o.done),
    })),
  };
}

export const activeQuests = (s) => QUEST_LIST.filter((q) => s.quests.active[q.id]).map((q) => questView(s, q));
export const completedQuests = (s) => QUEST_LIST.filter((q) => s.quests.done[q.id]).map((q) => questView(s, q));

// Map ids with an open objective, for the world map's quest markers.
export function questMarkers(s) {
  const out = {};
  for (const q of activeQuests(s)) {
    const next = q.objectives.find((o) => !o.complete);
    if (next && next.where) (out[next.where] ||= []).push(q.name);
  }
  return out;
}

// '!' when an NPC has a quest to give, '?' when a quest is ready to hand in.
export function npcMarker(s, npcId) {
  let mark = null;
  for (const q of QUEST_LIST) {
    if (q.giver !== npcId) continue;
    const st = questStatus(s, q.id);
    if (st === 'ready') return '?';
    if (st === 'new' && checkCond(s, q.available)) mark = '!';
  }
  return mark;
}

export function startQuest(game, id) {
  const q = QUESTS[id];
  const s = game.s;
  if (!q || s.quests.active[id] || s.quests.done[id] || !checkCond(s,q.available)) return;
  s.quests.active[id] = { startedAt: Math.round(s.stats.playtime) };
  if(!s.progression.trackedQuest)s.progression.trackedQuest=id;
  audio.sfx('quest');
  game.toast(`New quest: ${q.name}`, 'quest');
  game.touch();
  game.save();
}

export function completeQuest(game, id) {
  const q = QUESTS[id];
  const s = game.s;
  if (!q || s.quests.done[id] || !s.quests.active[id] || !questObjectivesDone(s,q)) return;
  game.rewardAction({id:`quest:${id}`,cause:`Quest complete: ${q.name}`},r=>{
  s.quests.done[id] = true;
  delete s.quests.active[id];
  if(s.progression.trackedQuest===id)s.progression.trackedQuest=null;
  grantReward(s,`quest:${id}`,{xp:q.rewards.xp??150,coins:q.rewards.coins??100,cosmetics:q.rewards.cosmetics,titles:q.rewards.titles},r);
  friendshipQuest(s,q.giver,id);
  for (const item of q.rewards.consume || []) delete s.items[item];
  audio.sfx('quest');
  for (const item of q.rewards.items || []) game.giveItem(item);
  for (const cur of q.rewards.currencies || []) game.discover(cur, { source: 'quest' });
  });
  game.touch();
  game.save();
}

export const itemName = (id) => (ITEMS[id] ? ITEMS[id].name : id);
