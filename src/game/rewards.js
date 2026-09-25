import { RARITY_REWARDS } from '../data/rewards.js';
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { QUESTS } from '../data/quests.js';

export function levelInfo(xp) {
  let level = 1, current = xp, required = 100;
  while (current >= required) { current -= required; level++; required = 100 + 50 * (level - 1); }
  return { level, current, required };
}
export function createReceipt(s, meta) {
  return { ...meta, xp: 0, coins: 0, points: 0, unlocks: [], milestones: [], levelBefore: levelInfo(s.progression.xp).level, levelAfter: levelInfo(s.progression.xp).level };
}
export function grantReward(s, id, reward, receipt) {
  const p = s.progression;
  if (p.claims[id]) return false;
  for (const k of ['xp', 'coins', 'points']) if (reward[k] !== undefined && (!Number.isSafeInteger(reward[k]) || reward[k] < 0)) throw new Error('Invalid reward');
  p.claims[id] = true;
  p.xp += reward.xp || 0; p.coins += reward.coins || 0; p.coinsEarned += reward.coins || 0;
  p.upgradePoints += reward.points || 0;
  s.stats.xpEarned = (s.stats.xpEarned || 0) + (reward.xp || 0);
  receipt.xp += reward.xp || 0; receipt.coins += reward.coins || 0; receipt.points += reward.points || 0;
  for (const group of ['items', 'cosmetics', 'badges', 'titles']) for (const entry of reward[group] || []) {
    const target = group === 'items' ? s.items : p[group];
    if (!target[entry]) { target[entry] = true; receipt.unlocks.push(entry); }
  }
  return true;
}
export function finishReceipt(s, r) {
  r.levelAfter = levelInfo(s.progression.xp).level;
  r.levelMilestone = Math.floor(r.levelAfter/5)>Math.floor(r.levelBefore/5);
  for (let level = 2; level <= r.levelAfter; level++) grantReward(s, `level:${level}`, { coins: 100, points: 1 }, r);
  return r;
}
export function runRewardTransaction(s, meta, apply) {
  const receipt = createReceipt(s, meta);
  apply(receipt);
  return finishReceipt(s, receipt);
}
export function grantDiscovery(s, currency, receipt, legacy = false) {
  if (!grantReward(s, `discovery:${currency.id}`, RARITY_REWARDS[currency.rarity], receipt)) return;
  if (legacy) return;
  const p = s.progression;
  p.streak++;
  const rewards = { 3: {xp:50}, 5: {xp:100}, 10: {xp:250,coins:100} };
  if (rewards[p.streak]) {
    grantReward(s, `streak:${p.streakCycle}:${p.streak}`, rewards[p.streak], receipt);
    receipt.milestones.push(`Discovery streak ×${p.streak}`);
  }
  if (p.streak === 10) { p.streak = 0; p.streakCycle++; }
}
export function seedLegacyRewards(s) {
  runRewardTransaction(s, { id: 'migration', cause: 'Adventure restored' }, r => {
    for (const id of Object.keys(s.discovered)) if (CURRENCY_BY_ID[id]) grantDiscovery(s, CURRENCY_BY_ID[id], r, true);
    for (const id of Object.keys(s.quests.done)) if (QUESTS[id]) grantReward(s, `quest:${id}`, { xp: QUESTS[id].rewards.xp ?? 150, coins: QUESTS[id].rewards.coins ?? 100 }, r);
  });
  s.progression.tutorial = 'done';
}
