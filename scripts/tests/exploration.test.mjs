import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewState } from '../../src/game/state.js';
import { eligibleCells, revealAround, areaProgress, worldProgress, canFastTravel } from '../../src/game/exploration.js';
import { LOCATION_LIST } from '../../src/data/locations.js';
test('exploration counts actual cells, remains bounded and persists', () => {
  const s=createNewState(), before=worldProgress(s);
  assert.equal(before.percent,0);
  assert.ok(revealAround(s,'town',s.x,s.y,3)>0);
  const once=worldProgress(s); revealAround(s,'town',s.x,s.y,3);
  assert.deepEqual(worldProgress(s),once);
  for(const m of LOCATION_LIST) s.progression.explored[m.id]=[...eligibleCells(m.id)];
  assert.equal(worldProgress(s).percent,100);
  assert.ok(areaProgress(s,'town').percent<100);
});
test('unvisited and item-gated travel cannot bypass exploration', () => {
  const s=createNewState();
  assert.equal(canFastTravel(s,'town').ok,true);
  assert.equal(canFastTravel(s,'cave').ok,false);
  s.visited.cave=true; assert.equal(canFastTravel(s,'cave').ok,false);
  s.visited.island=true;assert.equal(canFastTravel(s,'island').ok,false);
});
test('world contains enough reachable content for treasure and secret achievements', () => {
  assert.ok(LOCATION_LIST.flatMap(m=>m.collectibles).filter(c=>c.look==='chest').length>=20);
  assert.ok(LOCATION_LIST.flatMap(m=>m.collectibles).filter(c=>c.secret).length>=10);
  for(const m of LOCATION_LIST) assert.ok(eligibleCells(m.id).size>0);
});
