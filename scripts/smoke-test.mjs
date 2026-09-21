// Run with:  npm run check
// Drives the real game engine without a browser (canvas calls are stubbed) and checks the main systems.
import { Game } from '../src/game/engine.js';
import { makeCanvas } from '../src/game/canvasUtil.js';
import { CURRENCIES, TOTAL_CURRENCIES } from '../src/data/currencies.js';
import { LOCATIONS } from '../src/data/locations.js';
import { hasSave, loadSave, clearSave, writeSave } from '../src/game/saveSystem.js';
import { completionPercent } from '../src/game/progression.js';
import { BASE_RADIUS, IMPROVED_RADIUS } from '../src/game/detector.js';
import { getCurrencyIcon } from '../src/game/currencyIcons.js';

// a tiny in-memory localStorage
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

let failed = 0;
let passed = 0;
const ok = (cond, msg) => {
  if (cond) passed++;
  else {
    failed++;
    console.error('  FAIL ' + msg);
  }
};

const newGame = (state = null) => new Game({ canvas: makeCanvas(400, 225), state, listen: false, autosave: true, rnd: () => 0.3 });
const put = (g, tx, ty, dir = 'down') => {
  g.s.x = tx * 16 + 8;
  g.s.y = ty * 16 + 14;
  g.s.dir = dir;
};
const frames = (g, n, dt = 1 / 60) => {
  for (let i = 0; i < n; i++) g.update(dt);
};
const events = (g, name) => {
  const list = [];
  g.on(name, (p) => list.push(p));
  return list;
};
const press = (g) => g.onAction();
const closeDialogue = (g) => {
  let guard = 0;
  while (g.rt.mode === 'dialogue' && guard++ < 30) g.advance();
};
const dismissAll = (g) => {
  let guard = 0;
  while (g.rt.mode === 'popup' && guard++ < 30) g.dismissPopup();
};
const settle = (g) => {
  frames(g, 30); // let transitions finish
};

// ------------------------------------------------------------------ basics
console.log('Basics');
clearSave();
let g = newGame();
ok(g.s.map === 'town', 'starts in town');
ok(g.rt.map.w === 36, 'town loaded');
ok(!hasSave(), 'no save at start');
const hud = events(g, 'hud');
g.start();
frames(g, 3);
ok(hud.length >= 1 && hud[0].location === 'Sunny Town', 'HUD event emitted for Sunny Town');

// rendering every map does not throw
for (const id of Object.keys(LOCATIONS)) {
  const gg = newGame();
  gg.s.flags = {};
  gg.loadMap(id, null);
  let threw = false;
  try {
    gg.update(0.016);
    gg.render();
  } catch (e) {
    threw = true;
    console.error(e);
  }
  ok(!threw, `renders map ${id}`);
}

// every currency icon can be generated
let iconOk = true;
try {
  for (const c of CURRENCIES) getCurrencyIcon(c);
} catch (e) {
  iconOk = false;
  console.error(e);
}
ok(iconOk, 'all currency icons generate');

// ------------------------------------------------------------------ movement and collisions
console.log('Movement');
g = newGame();
put(g, 18, 14);
const x0 = g.s.x;
g.rt.keys.add('ArrowRight');
frames(g, 30);
ok(g.s.x > x0 + 15, 'player moves right');
g.rt.keys.clear();
// walk into the fountain (17,12) from below: must be blocked
put(g, 17, 14);
g.rt.keys.add('ArrowUp');
frames(g, 90);
ok(g.s.y > 12 * 16 + 14, 'player cannot walk through the fountain');
g.rt.keys.clear();
// walk into the map border trees
put(g, 5, 1);
g.rt.keys.add('ArrowUp');
frames(g, 90);
ok(g.s.y >= 16, 'player cannot leave through the border trees');
g.rt.keys.clear();

// ------------------------------------------------------------------ collecting and popups
console.log('Collecting');
g = newGame();
const popups = events(g, 'popup');
put(g, 8, 10);
frames(g, 3);
ok(g.rt.target && g.rt.target.kind === 'collectible', 'a visible pickup is targetable');
press(g);
frames(g, 2);
ok(g.rt.mode === 'popup', 'discovery popup opens');
ok(popups.some((p) => p && p.type === 'discovery' && p.currency.id === 'php1'), 'popup is NEW MONEY for php1');
ok(g.s.discovered.php1, 'php1 discovered');
g.dismissPopup();
ok(g.rt.mode === 'explore', 'popup dismissed');
ok(g.s.collected.town_php1, 'spot marked as collected');

g.discover('php1');
frames(g, 2);
ok(g.s.duplicates.php1 === 1, 'duplicate tracked');
ok(popups.some((p) => p && p.type === 'duplicate'), 'duplicate popup shown');
dismissAll(g);

// ------------------------------------------------------------------ detector
console.log('Detector');
g = newGame();
put(g, 3, 13); // 4 tiles from the hidden php20 at (3,9)
g.rt.signalTimer = 0;
g.update(0.016);
ok(g.rt.signal.level >= 1, 'weak or stronger signal 4 tiles from hidden money');
put(g, 3, 10);
g.rt.signalTimer = 0;
g.update(0.016);
ok(g.rt.signal.level === 3, 'Money Nearby right next to hidden money');
press(g);
frames(g, 2);
ok(g.s.discovered.php20, 'hidden money found by searching');
dismissAll(g);
// rarer money is harder to detect, and the improved detector reaches farther
ok(BASE_RADIUS.Legendary < BASE_RADIUS.Epic && BASE_RADIUS.Epic < BASE_RADIUS.Rare && BASE_RADIUS.Rare < BASE_RADIUS.Common, 'rarer money has a smaller detection radius');
ok(Object.keys(BASE_RADIUS).every((k) => IMPROVED_RADIUS[k] > BASE_RADIUS[k]), 'improved detector reaches farther for every rarity');

// shovel gating
put(g, 5, 21);
g.rt.signalTimer = 0;
g.update(0.016);
press(g);
ok(!g.s.discovered.gbp_farthing, 'buried money needs the shovel');
closeDialogue(g);
g.s.items.shovel = true;
g.touch();
put(g, 5, 21);
g.update(0.016);
press(g);
frames(g, 2);
ok(g.s.discovered.gbp_farthing, 'buried money found with the shovel');
dismissAll(g);

// ------------------------------------------------------------------ NPC + quest
console.log('NPCs and quests');
g = newGame();
put(g, 6, 10, 'up');
frames(g, 2);
ok(g.rt.target && g.rt.target.kind === 'npc', 'NPC is targetable');
const dlg = events(g, 'dialogue');
press(g);
ok(g.rt.mode === 'dialogue', 'dialogue opens');
ok(dlg.length && dlg[dlg.length - 1].speaker === 'Aling Nena', 'speaker is Aling Nena');
g.advance();
g.advance();
ok(g.rt.dlg && g.rt.dlg.inChoices, 'quest offer shows choices');
g.choose(0);
closeDialogue(g);
ok(g.s.quests.active.lost_coin, 'Lost Coin quest started');

// pick up the pouch on the beach
g.s.items.detector = true;
g.loadMap('beach', 'town');
put(g, 8, 13);
g.update(0.016);
press(g);
ok(g.s.items.lost_pouch, 'pouch picked up on the beach');
g.loadMap('town', 'beach');
put(g, 6, 10, 'up');
frames(g, 2);
press(g);
closeDialogue(g);
dismissAll(g);
frames(g, 3);
dismissAll(g);
ok(g.s.quests.done.lost_coin, 'Lost Coin completed');
ok(g.s.items.shovel, 'reward: shovel');
ok(g.s.discovered.phpspanish, 'reward: Spanish Colonial Peso');
ok(!g.s.items.lost_pouch, 'quest item consumed');

// the Money Collector offers a quest once you reach 25%
g = newGame();
for (const c of CURRENCIES.slice(0, 30)) g.s.discovered[c.id] = true;
g.s.flags.met_collector = true;
put(g, 21, 11, 'left');
frames(g, 2);
press(g);
g.advance();
g.advance();
ok(g.rt.dlg && g.rt.dlg.inChoices, 'Money Collector offers a challenge');
g.choose(0);
closeDialogue(g);
ok(g.s.quests.active.collectors_challenge, 'Collector\'s Challenge started');
for (const id of ['php500n', 'php1000n', 'usd100n', 'phpoccup']) g.s.discovered[id] = true;
g.touch();
ok(g.getSnapshot().quests.active[0].objectives.filter((o) => o.complete).length === 2, 'quest objectives tick off');

// ------------------------------------------------------------------ exits and progression gates
console.log('Exits and gates');
g = newGame();
put(g, 33, 12, 'right');
g.rt.keys.add('ArrowRight');
frames(g, 60);
g.rt.keys.clear();
ok(g.s.map === 'town', 'Market is locked at 0%');
ok(g.rt.mode === 'dialogue', 'locked message shown');
closeDialogue(g);

// unlock the market by discovering 12 currencies
for (const c of CURRENCIES.slice(0, 12)) g.discover(c.id, { silent: true });
ok(completionPercent(g.s) >= 10, 'percent reaches 10');
dismissAll(g);
frames(g, 5);
dismissAll(g);
g.rt.exitCooldown = 0;
put(g, 33, 12, 'right');
g.rt.keys.add('ArrowRight');
frames(g, 90);
g.rt.keys.clear();
settle(g);
ok(g.s.map === 'market', 'Market opens at 10%');

// forest door needs the rusty key, cave needs the flashlight
g.loadMap('forest', 'town');
g.s.flags = {};
g.rt.exitCooldown = 0;
put(g, 6, 8, 'up');
g.rt.keys.add('ArrowUp');
frames(g, 60);
g.rt.keys.clear();
ok(g.s.map === 'forest', 'abandoned door is locked without the key');
closeDialogue(g);
g.s.items.rusty_key = true;
g.rt.exitCooldown = 0;
put(g, 6, 8, 'up');
g.rt.keys.add('ArrowUp');
frames(g, 60);
g.rt.keys.clear();
settle(g);
ok(g.s.map === 'abandoned', 'abandoned building opens with the rusty key');

// ------------------------------------------------------------------ puzzles and secrets
console.log('Puzzles and secrets');
g.s.flags = {};
g.rt.puzzleProgress = {};
g.touch();
const vaultBlocked = () => g.rt.map.blocked[6 * g.rt.map.w + 13] === 1;
ok(vaultBlocked(), 'vault wall starts closed');
const pull = (id) => {
  const o = g.rt.map.data.objects.find((x) => x.id === id);
  put(g, o.x, o.y + 1, 'up');
  g.update(0.016);
  press(g);
  closeDialogue(g);
};
pull('lv_red');
pull('lv_blue'); // wrong order resets
ok(vaultBlocked(), 'wrong order does not open the vault');
pull('lv_blue');
pull('lv_red');
pull('lv_green');
ok(!vaultBlocked(), 'correct lever order opens the vault wall');
ok(g.s.flags['puzzle:abandoned_levers'], 'puzzle flag saved');

// secret wall in the market
g.loadMap('market', 'town');
put(g, 23, 19, 'right');
g.update(0.016);
ok(g.rt.target && g.rt.target.kind === 'barrier', 'secret crate is targetable');
press(g);
closeDialogue(g);
ok(g.s.flags['b:market:nook_crate'], 'secret crate moved');

// museum gate
g.loadMap('museum', 'town');
put(g, 14, 9, 'up');
g.update(0.016);
press(g);
ok(!g.s.flags['b:museum:restricted_gate'], 'restricted wing stays closed without pass and 50%');
closeDialogue(g);

// ------------------------------------------------------------------ saving and loading
console.log('Save / load');
g = newGame();
g.discover('php1', { silent: true });
g.discover('php1', { silent: true });
put(g, 10, 10);
g.save();
ok(hasSave(), 'save written to localStorage');
const loaded = loadSave();
ok(loaded.discovered.php1 && loaded.duplicates.php1 === 1, 'discoveries and duplicates saved');
ok(Math.round(loaded.x) === 10 * 16 + 8, 'player position saved');
const g2 = newGame(loaded);
ok(g2.s.discovered.php1, 'game continues from save');
clearSave();
ok(!hasSave(), 'save cleared');

// ------------------------------------------------------------------ trading
console.log('Trading');
g = newGame();
g.s.duplicates = { php1: 2, php5: 2 };
let r = g.trade('swap_common');
ok(r.ok && r.currency, 'Coin Swap gives a new currency');
ok(Object.values(g.s.duplicates).reduce((a, b) => a + b, 0) === 1, 'duplicates spent');
r = g.trade('swap_rare');
ok(!r.ok, 'not enough duplicates for a rare swap');
r = g.trade('hint');
ok(r.ok && r.message.includes('Tip'), 'hint costs one duplicate');
const info = g.getTradeInfo();
ok(info.offers.length === 3, 'trade info lists offers');
for (const c of CURRENCIES.slice(0, 12)) g.s.discovered[c.id] = true;
r = g.claim('m10');
ok(r.ok && g.s.claimed.m10, 'milestone claimed once reached');
ok(!g.claim('m10').ok, 'milestone cannot be claimed twice');

// ------------------------------------------------------------------ ending
console.log('Ending');
g = newGame();
for (const c of CURRENCIES.slice(0, TOTAL_CURRENCIES - 1)) g.s.discovered[c.id] = true;
const menus = events(g, 'menu');
g.discover(CURRENCIES[TOTAL_CURRENCIES - 1].id);
frames(g, 2);
dismissAll(g);
let guard = 0;
while (!menus.includes('ending') && guard++ < 20) {
  frames(g, 2);
  dismissAll(g);
}
ok(completionPercent(g.s) === 100, 'reaches 100%');
ok(g.s.complete, 'complete flag set');
ok(menus.includes('ending'), 'ending screen requested');

// the final portal only works at 100%
g.loadMap('town', 'final');
g.rt.exitCooldown = 0;
put(g, 17, 10, 'up');
g.rt.keys.add('ArrowUp');
frames(g, 40);
g.rt.keys.clear();
settle(g);
ok(g.s.map === 'final', 'portal leads to the Treasury of Worlds at 100%');

console.log(`\n${passed} passed, ${failed} failed.`);
process.exit(failed ? 1 : 0);
