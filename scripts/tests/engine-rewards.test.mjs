import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../../src/game/engine.js';
import { collect } from '../../src/game/collectibles.js';
import { grantReward } from '../../src/game/rewards.js';
import { CURRENCIES } from '../../src/data/currencies.js';
import { pullLever, previewQuestOffers } from '../../src/game/interactions.js';
import { NPCS } from '../../src/data/npcs.js';
test('puzzle and secret rewards share one receipt',()=>{
  const g=new Game({listen:false,autosave:false}),receipts=[];g.loadMap('abandoned');g.on('reward',r=>receipts.push(r));
  const data=g.rt.map.data;
  for(const id of data.puzzles[0].order)pullLever(g,data.objects.find(o=>o.id===id));
  assert.equal(receipts.length,1);assert.equal(g.s.flags['puzzle:abandoned_levers'],true);
});
test('automatic quest offers preview all rewards and require acceptance',()=>{
  const source=NPCS.kuya_mando.dialogue.find(r=>r.script.effects?.some(e=>e.type==='startQuest')).script;
  const offer=previewQuestOffers(source);
  assert.equal(offer.effects,undefined);assert.match(offer.pages.join(' '),/Improved Money Detector/);
  assert.equal(offer.choices[0].script.effects[0].type,'startQuest');
});
test('common discovery stays playable and produces one combined receipt', () => {
  const g=new Game({listen:false,autosave:false}),receipts=[]; g.on('reward',r=>receipts.push(r));
  g.discover('php1'); g.update(.016);
  assert.equal(g.rt.mode,'explore'); assert.equal(receipts.length,1);
  assert.ok(receipts[0].coins>=60); assert.ok(g.s.progression.xp>=20);
});
test('nested quest and discovery grants share one receipt', () => {
  const g=new Game({listen:false,autosave:false}),receipts=[];g.on('reward',r=>receipts.push(r));
  g.rewardAction({id:'q',cause:'Quest'},r=>{ grantReward(g.s,'quest:q',{xp:150,coins:100},r); g.discover('php1'); });
  assert.equal(receipts.length,1); assert.ok(receipts[0].xp>=170);
});
test('a chest grants rewards and count once', () => {
  const g=new Game({listen:false,autosave:false});
  const c=g.rt.map.data.collectibles.find(c=>c.chestType);
  collect(g,c); const coins=g.s.progression.coins;
  assert.equal(g.s.stats.chestsOpened,1); assert.ok(coins>0);
  collect(g,c); assert.equal(g.s.stats.chestsOpened,1); assert.equal(g.s.progression.coins,coins);
});
test('completion grants final unlocks once without claiming all world explored', () => {
  const g=new Game({listen:false,autosave:false});
  for(const c of CURRENCIES)g.discover(c.id,{silent:true});
  assert.equal(g.getSnapshot().percent,100); assert.ok(g.getSnapshot().world.percent<100);
  assert.equal(g.s.progression.titles.master_money_hunter,true);
  const restored=new Game({state:g.s,listen:false,autosave:false});
  assert.equal(restored.s.progression.coins,g.s.progression.coins);
});
test('digging takes time, can be cancelled, and the skill shortens it',()=>{
  const g=new Game({listen:false,autosave:false});g.s.items.shovel=true;
  const c=g.rt.map.data.collectibles.find(c=>c.requires==='shovel');
  g.s.x=c.x*16+8;g.s.y=c.y*16+14;g.update(.016);g.onAction();
  assert.ok(g.rt.dig);assert.equal(!!g.s.collected[c.id],false);
  g.setVirtualDir(1,0);g.update(.1);assert.equal(g.rt.dig,null);g.setVirtualDir(0,0);
  g.s.x=c.x*16+8;g.s.y=c.y*16+14;g.s.progression.skills.explorer_dig=true;g.update(.016);g.onAction();
  for(let i=0;i<5;i++)g.update(.05);
  assert.equal(g.s.collected[c.id],true);
});
