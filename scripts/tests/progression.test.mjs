import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewState } from '../../src/game/state.js';
import { purchase, unlockSkill, equip, sellDuplicate } from '../../src/game/economy.js';
import { modifiers } from '../../src/game/modifiers.js';
import { collectionViews, evaluateMilestones, achievementViews } from '../../src/game/milestones.js';
import { runRewardTransaction } from '../../src/game/rewards.js';
import { CURRENCIES } from '../../src/data/currencies.js';
test('purchases are atomic and cannot double charge', () => {
  const s = createNewState(); s.progression.coins = 500;
  assert.equal(purchase(s,'rare_scanner').ok,true); assert.equal(s.progression.coins,150);
  assert.equal(purchase(s,'rare_scanner').ok,false); assert.equal(s.progression.coins,150);
  assert.equal(purchase(s,'treasure_radar').ok,false); assert.equal(s.progression.coins,150);
  assert.equal(equip(s,'outfit','forest_outfit').ok,false);
});
test('skill prerequisites and point cost produce real modifiers', () => {
  const s = createNewState(); s.progression.upgradePoints = 3;
  assert.equal(unlockSkill(s,'hunter_rare').ok,false);
  assert.equal(unlockSkill(s,'hunter_range').ok,true);
  assert.equal(modifiers(s).detectorRange,1.2);
  assert.equal(s.progression.upgradePoints,2);
  assert.equal(unlockSkill(s,'hunter_range').ok,false);
});
test('duplicate selling validates amount and keeps encyclopedia entry', () => {
  const s = createNewState(); s.discovered.php1 = true; s.duplicates.php1 = 2;
  for (const n of [-1,0,3,0.5]) assert.equal(sellDuplicate(s,'php1',n).ok,false);
  assert.equal(sellDuplicate(s,'php1',2).ok,true); assert.equal(s.progression.coins,16);
  assert.equal(s.discovered.php1,true); assert.equal(s.duplicates.php1,0);
});
test('collections use real totals and milestones award only once', () => {
  const s = createNewState();
  assert.ok(collectionViews(s).every(c => c.count === 0 && c.total > 0));
  for (const c of CURRENCIES.filter(c => c.origin === 'Philippines')) s.discovered[c.id] = true;
  runRewardTransaction(s,{id:'sets',cause:'Sets'},r=>evaluateMilestones(s,r));
  assert.ok(collectionViews(s).some(c => c.name === 'Philippines Collection' && c.complete));
  const before = structuredClone(s);
  runRewardTransaction(s,{id:'sets2',cause:'Sets'},r=>evaluateMilestones(s,r));
  assert.deepEqual(s,before);
  assert.ok(achievementViews(s).some(a => a.secret && a.name === '???'));
});
