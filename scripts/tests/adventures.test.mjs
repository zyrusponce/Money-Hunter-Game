import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewState } from '../../src/game/state.js';
import { giftDuplicate } from '../../src/game/friendship.js';
import { updateWorldEvents } from '../../src/game/worldEvents.js';
import { CURRENCIES } from '../../src/data/currencies.js';
import { QUEST_LIST } from '../../src/data/quests.js';
test('duplicate gifts are consumed once and friendship is capped',()=>{
  const s=createNewState();s.duplicates.php1=9;
  assert.equal(giftDuplicate(s,'money_collector','php1','gift-1').ok,true);
  const before=structuredClone(s);assert.equal(giftDuplicate(s,'money_collector','php1','gift-1').ok,false);assert.deepEqual(s,before);
  for(let n=2;n<9;n++)giftDuplicate(s,'money_collector','php1',`gift-${n}`);
  assert.equal(s.progression.friendship.money_collector,5);
  assert.equal(s.duplicates.php1,4);
});
test('exploration events persist without stressful expiry',()=>{
  const s=createNewState();for(const c of CURRENCIES.slice(0,30))s.discovered[c.id]=true;
  updateWorldEvents(s);assert.equal(s.progression.events.collector.status,'active');
  s.stats.playtime+=100000;updateWorldEvents(s);assert.equal(s.progression.events.collector.status,'active');
});
test('collector mystery has five sequential achievable stages',()=>{
  const chain=QUEST_LIST.filter(q=>q.chain==='collector_mystery');assert.equal(chain.length,5);
  chain.slice(1).forEach((q,i)=>assert.equal(q.available.questDone,chain[i].id));
});
