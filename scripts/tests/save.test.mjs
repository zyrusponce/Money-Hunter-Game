import test from 'node:test';
import assert from 'node:assert/strict';
import { createNewState, migrateState } from '../../src/game/state.js';
import * as saves from '../../src/game/saveSystem.js';

const key = 'moneyhunter.save.v1';
function storage(value) {
  const store = new Map(value === undefined ? [] : [[key, value]]);
  globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k,v) => store.set(k,v), removeItem: k => store.delete(k) };
  return store;
}
test('new state contains serializable progression', () => {
  assert.equal(createNewState().progression.coins, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(createNewState())).progression, createNewState().progression);
});
test('save reader distinguishes absent, corrupt and unsupported without destroying bytes', () => {
  storage(); assert.equal(saves.readSave().status, 'missing');
  for (const bytes of ['{broken', '{"version":1,"discovered":[]}', '{"version":2,"map":"invalid"}']) {
    const store = storage(bytes);
    assert.equal(saves.readSave().status, 'corrupt');
    assert.equal(store.get(key), bytes);
  }
  storage('{"version":999}'); assert.equal(saves.readSave().status, 'unsupported');
});
test('blocked storage is reported safely', () => {
  globalThis.localStorage = { getItem() { throw new Error('denied'); } };
  assert.equal(saves.readSave().status, 'unavailable');
  assert.equal(saves.hasSave(), false);
});
test('migration retains adventure and is stable after reload', () => {
  const old = createNewState(); delete old.progression; old.version = 1;
  old.discovered.php1 = true; old.duplicates.php1 = 2; old.flags.example = true;
  const next = migrateState(old);
  assert.equal(next.version, 2);
  assert.equal(next.duplicates.php1, 2);
  assert.equal(next.flags.example, true);
  assert.ok(next.progression.xp >= 20);
  assert.deepEqual(migrateState(JSON.parse(JSON.stringify(next))), next);
});
test('malformed nested saves are rejected before any overwrite',()=>{
  for(const mutate of [
    s=>s.x=999999,s=>s.map='constructor',s=>s.items.unknown_tool=true,
    s=>s.progression.friendship.money_collector='5',s=>s.progression.events.collector=true,
    s=>s.quests.done.unknown=true,s=>s.progression.skills.not_a_skill=true,
    s=>s.progression.equipped.outfit='not_owned',s=>s.progression.streak=100,
    s=>s.discovered.php1='yes',s=>s.complete='false',s=>s.cooldowns.test='bad',
    s=>{s.version=1;s.progression.xp=-500;},
  ]) {
    const s=createNewState();mutate(s);const bytes=JSON.stringify(s),store=storage(bytes);
    assert.equal(saves.readSave().status,'corrupt');assert.equal(store.get(key),bytes);
  }
});
