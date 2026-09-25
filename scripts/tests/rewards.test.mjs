import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewState } from '../../src/game/state.js';
import { levelInfo, runRewardTransaction, grantReward, grantDiscovery } from '../../src/game/rewards.js';
import { CURRENCIES } from '../../src/data/currencies.js';

test('large XP grants cross levels exactly once', () => {
  const s = createNewState();
  const award = () => runRewardTransaction(s, {id:'test',cause:'Test'}, r => grantReward(s,'test',{xp:300},r));
  award(); assert.equal(levelInfo(s.progression.xp).level, 3);
  assert.equal(s.progression.coins, 200); assert.equal(s.progression.upgradePoints, 2);
  const before = structuredClone(s); award(); assert.deepEqual(s,before);
});
test('rarity rewards and relaxed discovery streaks only count unique finds', () => {
  const s = createNewState();
  const commons = CURRENCIES.filter(c => c.rarity === 'Common').slice(0,10);
  for (const c of commons) runRewardTransaction(s,{id:c.id,cause:'Discovery'},r => grantDiscovery(s,c,r));
  assert.equal(s.progression.xp, 600); // 200 base + 50 + 100 + 250 streak
  assert.equal(s.progression.streak, 0);
  const before = structuredClone(s);
  runRewardTransaction(s,{id:'again',cause:'Discovery'},r => grantDiscovery(s,commons[0],r));
  assert.deepEqual(s,before);
});
