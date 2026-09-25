import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_BINDINGS, validateBinding, actionForCode } from '../../src/game/controls.js';
import { createNotificationQueue } from '../../src/game/notifications.js';
import { normalizeSettings } from '../../src/game/saveSystem.js';
test('swapped movement bindings survive normalization',()=>{
  const bindings={...DEFAULT_BINDINGS,up:'KeyS',down:'KeyW'};
  assert.deepEqual(normalizeSettings({bindings}).bindings,bindings);
});
test('controls reject conflicts and preserve requested defaults',()=>{
  assert.equal(actionForCode(DEFAULT_BINDINGS,'KeyC'),'encyclopedia');
  assert.equal(actionForCode(DEFAULT_BINDINGS,'KeyB'),'inventory');
  assert.equal(validateBinding(DEFAULT_BINDINGS,'inventory','KeyC').ok,false);
  assert.equal(validateBinding(DEFAULT_BINDINGS,'inventory','Escape').ok,false);
  assert.equal(validateBinding(DEFAULT_BINDINGS,'inventory','KeyV').ok,true);
});
test('notification queue is capped at three and retains overflow',()=>{
  const q=createNotificationQueue();for(let i=0;i<10;i++)q.push({id:String(i)});
  assert.equal(q.visible().length,3);assert.equal(q.pending().length,7);
  q.dismiss('0');assert.equal(q.visible()[2].id,'3');
  q.push({id:'3'});assert.equal(q.pending().length,6);
});
