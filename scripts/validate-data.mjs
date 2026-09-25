// Run with:  npm run check
//
// Validates the game data without a browser:
//   * every tile / NPC / item / currency / quest id that is referenced actually exists
//   * every spawn, NPC, object and collectible sits on a sensible tile and can be reached
//   * every currency has at least one source
//   * a simulated playthrough can unlock every area and complete the Encyclopedia to 100%
import { LOCATIONS, LOCATION_LIST } from '../src/data/locations.js';
import { CURRENCIES, CURRENCY_BY_ID, TOTAL_CURRENCIES } from '../src/data/currencies.js';
import { ITEMS } from '../src/data/items.js';
import { NPCS } from '../src/data/npcs.js';
import { QUEST_LIST } from '../src/data/quests.js';
import { TILES } from '../src/data/tiles.js';
import { CURRENCY_SOURCES } from '../src/data/sources.js';
import { GROUND } from '../src/game/groundTiles.js';
import { TOP } from '../src/game/topTiles.js';
import { Game } from '../src/game/engine.js';
import { checkCond } from '../src/game/conditions.js';
import { completionPercent, isLocationUnlocked } from '../src/game/progression.js';
import { createNewState } from '../src/game/state.js';
import { makeCanvas } from '../src/game/canvasUtil.js';

let errors = 0;
let warnings = 0;
const err = (m) => {
  errors++;
  console.error('  ERROR ' + m);
};
const warn = (m) => {
  warnings++;
  console.warn('  warn  ' + m);
};

// ---------------------------------------------------------------- 1. ids and tiles
console.log('Checking references...');
for (const id of Object.keys(TILES)) {
  const layer = TILES[id].layer;
  if (layer === 'ground' && !GROUND[id]) err(`no ground painter for tile "${id}"`);
  if (layer === 'top' && !TOP[id]) err(`no overlay painter for tile "${id}"`);
}
const seenIds = new Set();
for (const c of CURRENCIES) {
  if (seenIds.has(c.id)) err(`duplicate currency id ${c.id}`);
  seenIds.add(c.id);
  if (!['Coin', 'Banknote'].includes(c.type)) err(`currency ${c.id} has odd type ${c.type}`);
  if (!['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'].includes(c.rarity)) err(`currency ${c.id} has bad rarity`);
}
const areaNames = new Set(LOCATION_LIST.map((l) => l.area));
for (const c of CURRENCIES) if (!areaNames.has(c.location)) err(`currency ${c.id} location "${c.location}" is not an area`);

for (const loc of LOCATION_LIST) {
  if (loc.ground.length !== loc.height || loc.ground[0].length !== loc.width) err(`${loc.id}: ground grid size mismatch`);
  for (let y = 0; y < loc.height; y++)
    for (let x = 0; x < loc.width; x++) {
      const g = loc.ground[y][x];
      const t = loc.top[y][x];
      if (!TILES[g] || TILES[g].layer !== 'ground') err(`${loc.id}: bad ground "${g}" at ${x},${y}`);
      if (t && (!TILES[t] || TILES[t].layer !== 'top')) err(`${loc.id}: bad top "${t}" at ${x},${y}`);
    }
  for (const n of loc.npcs) if (!NPCS[n.id]) err(`${loc.id}: unknown NPC ${n.id}`);
  for (const c of loc.collectibles) {
    if (c.currency && !CURRENCY_BY_ID[c.currency]) err(`${loc.id}: collectible ${c.id} has unknown currency ${c.currency}`);
    if (c.item && !ITEMS[c.item]) err(`${loc.id}: collectible ${c.id} has unknown item ${c.item}`);
    if (c.requires && !ITEMS[c.requires]) err(`${loc.id}: collectible ${c.id} requires unknown item ${c.requires}`);
    if (!c.currency && !c.item && !c.random && !c.reward) err(`${loc.id}: collectible ${c.id} gives nothing`);
  }
  for (const ex of loc.exits) {
    if (!LOCATIONS[ex.to]) err(`${loc.id}: exit to unknown map ${ex.to}`);
    else if (!LOCATIONS[ex.to].spawns[loc.id] && !ex.hidden) warn(`${loc.id}: ${ex.to} has no spawn named "${loc.id}" (default will be used)`);
    if (ex.x < 0 || ex.y < 0 || ex.x + (ex.w || 1) > loc.width || ex.y + (ex.h || 1) > loc.height) err(`${loc.id}: exit out of bounds`);
  }
  for (const b of loc.barriers) if (b.requires === undefined && b.interactive !== false && !b.prompt) warn(`${loc.id}: barrier ${b.id} has no prompt`);
}
for (const q of QUEST_LIST) {
  if (!NPCS[q.giver]) err(`quest ${q.id}: unknown giver ${q.giver}`);
  for (const id of q.rewards.currencies || []) if (!CURRENCY_BY_ID[id]) err(`quest ${q.id}: unknown currency reward ${id}`);
  for (const id of q.rewards.items || []) if (!ITEMS[id]) err(`quest ${q.id}: unknown item reward ${id}`);
  for (const o of q.objectives) if (o.where && !LOCATIONS[o.where]) err(`quest ${q.id}: unknown map ${o.where}`);
}

// ---------------------------------------------------------------- 2. currency sources
console.log('Checking currency sources...');
for (const c of CURRENCIES) if (!(CURRENCY_SOURCES[c.id] || []).length) err(`currency ${c.id} can never be found`);
const perArea = {};
for (const c of CURRENCIES) perArea[c.location] = (perArea[c.location] || 0) + 1;
console.log('  ' + TOTAL_CURRENCIES + ' currencies. Per area:', JSON.stringify(perArea));
const perRarity = {};
for (const c of CURRENCIES) perRarity[c.rarity] = (perRarity[c.rarity] || 0) + 1;
console.log('  Per rarity:', JSON.stringify(perRarity));

// ---------------------------------------------------------------- 3. placement and reachability
console.log('Checking placement and reachability...');
const game = new Game({ canvas: makeCanvas(400, 225), listen: false, autosave: false });

const neighbors8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
const neighbors4 = [[0, -1], [-1, 0], [1, 0], [0, 1]];

function loadMapInGame(id) {
  game.loadMap(id, null);
  return game.rt.map;
}

function reachable(m, starts) {
  const seen = new Uint8Array(m.w * m.h);
  const queue = [];
  for (const [x, y] of starts) {
    const i = y * m.w + x;
    if (!m.blocked[i] && !seen[i]) {
      seen[i] = 1;
      queue.push([x, y]);
    }
  }
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of neighbors4) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
      const i = ny * m.w + nx;
      if (seen[i] || m.blocked[i]) continue;
      seen[i] = 1;
      queue.push([nx, ny]);
    }
  }
  return seen;
}

const touchesReach = (m, seen, x, y) => {
  if (!m.blocked[y * m.w + x] && seen[y * m.w + x]) return true;
  return neighbors8.some(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    return nx >= 0 && ny >= 0 && nx < m.w && ny < m.h && seen[ny * m.w + nx];
  });
};

// Open every barrier (so secrets are included), then verify every entity can be reached.
for (const loc of LOCATION_LIST) {
  game.s.flags = {};
  for (const b of loc.barriers) game.s.flags[`b:${loc.id}:${b.id}`] = true;
  // make conditional objects/collectibles visible for the check
  game.s.items.treasure_map = true;
  game.s.quests.active.museum_mystery = { startedAt: 0 };
  game.s.complete = true;
  const m = loadMapInGame(loc.id);
  const occupied = new Map();
  const claim = (x, y, what) => {
    const k = `${x},${y}`;
    if (occupied.has(k)) err(`${loc.id}: ${what} and ${occupied.get(k)} share tile ${k}`);
    occupied.set(k, what);
  };

  const starts = Object.values(loc.spawns).map((s) => [s.x, s.y]);
  const spawnCells = new Set();
  for (const [name, sp] of Object.entries(loc.spawns)) {
    if (m.blocked[sp.y * m.w + sp.x]) err(`${loc.id}: spawn "${name}" is on a blocked tile (${sp.x},${sp.y})`);
    if (!spawnCells.has(`${sp.x},${sp.y}`)) claim(sp.x, sp.y, `spawn:${name}`);
    spawnCells.add(`${sp.x},${sp.y}`);
  }
  const seen = reachable(m, [starts[0]]);
  for (const [name, sp] of Object.entries(loc.spawns)) if (!seen[sp.y * m.w + sp.x]) err(`${loc.id}: spawn "${name}" is not connected to the default spawn`);

  const baseBlocked = (x, y) => {
    const g = TILES[loc.ground[y][x]];
    const t = loc.top[y][x] ? TILES[loc.top[y][x]] : null;
    return (g && g.solid) || (t && t.solid);
  };
  const onWalkableBase = (x, y, what) => {
    if (what.startsWith('object') && /boat/.test(what)) return;
    const barrier = loc.barriers.find((b) => [[b.x, b.y], ...(b.tiles || [])].some(([bx, by]) => bx === x && by === y));
    if (!barrier && baseBlocked(x, y)) err(`${loc.id}: ${what} is on a solid tile (${x},${y}: ${loc.top[y][x] || loc.ground[y][x]})`);
  };

  for (const n of loc.npcs) {
    onWalkableBase(n.x, n.y, `npc ${n.id}`);
    claim(n.x, n.y, `npc:${n.id}`);
    if (!touchesReach(m, seen, n.x, n.y)) err(`${loc.id}: npc ${n.id} is unreachable`);
  }
  for (const o of loc.objects) {
    onWalkableBase(o.x, o.y, `object ${o.id}`);
    claim(o.x, o.y, `object:${o.id}`);
    if (!touchesReach(m, seen, o.x, o.y)) err(`${loc.id}: object ${o.id} is unreachable`);
  }
  for (const c of loc.collectibles) {
    onWalkableBase(c.x, c.y, `collectible ${c.id}`);
    claim(c.x, c.y, `collectible:${c.id}`);
    if (!touchesReach(m, seen, c.x, c.y)) err(`${loc.id}: collectible ${c.id} is unreachable`);
  }
  for (const b of loc.barriers) {
    if (!touchesReach(m, seen, b.x, b.y)) err(`${loc.id}: barrier ${b.id} is unreachable`);
  }
  for (const ex of loc.exits) {
    let ok = false;
    for (let j = ex.y; j < ex.y + (ex.h || 1); j++) for (let i = ex.x; i < ex.x + (ex.w || 1); i++) if (seen[j * m.w + i]) ok = true;
    if (!ok) err(`${loc.id}: exit to ${ex.to} is unreachable`);
  }
  // puzzle sanity
  for (const p of loc.puzzles) {
    for (const oid of p.order) if (!loc.objects.find((o) => o.id === oid)) err(`${loc.id}: puzzle ${p.id} references missing object ${oid}`);
  }
}

// ---------------------------------------------------------------- 4. simulated playthrough
console.log('Simulating a full playthrough...');
game.s = createNewState();
const sim = game.s;
const timeline = [];
const areaUnlockedAt = {};

// Walkable region of a map given the current simulated state (barriers with requirements open only when met).
function regionOf(loc) {
  sim.flags = { ...sim.flags };
  for (const b of loc.barriers) {
    const key = `b:${loc.id}:${b.id}`;
    if (!b.requires || checkCond(sim, b.requires)) sim.flags[key] = true;
  }
  const m = loadMapInGame(loc.id);
  const starts = [[loc.spawns.default.x, loc.spawns.default.y]];
  return { m, seen: reachable(m, starts) };
}

function accessibleMaps() {
  // walk the exit graph from the town using current progress
  const open = new Set(['town']);
  let grew = true;
  while (grew) {
    grew = false;
    for (const id of [...open]) {
      const loc = LOCATIONS[id];
      const { m, seen } = regionOf(loc);
      for (const ex of loc.exits) {
        if (open.has(ex.to)) continue;
        let inReach = false;
        for (let j = ex.y; j < ex.y + (ex.h || 1); j++) for (let i = ex.x; i < ex.x + (ex.w || 1); i++) if (seen[j * m.w + i]) inReach = true;
        if (!inReach) continue;
        if (!isLocationUnlocked(sim, ex.to)) continue;
        if (ex.requires && !checkCond(sim, ex.requires)) continue;
        open.add(ex.to);
        grew = true;
      }
    }
    // boat travel to the island (Captain Delos)
    if (open.has('harbor') && sim.items.boat_pass && !open.has('island')) {
      open.add('island');
      grew = true;
    }
  }
  return open;
}

const discover = (id) => {
  if (!sim.discovered[id]) {
    sim.discovered[id] = true;
    if(completionPercent(sim)===100)sim.complete=true;
    return true;
  }
  return false;
};

function collectEffects(script, out) {
  if (!script) return;
  for (const e of script.effects || []) out.push(e);
  for (const c of script.choices || []) collectEffects(c.script, out);
}

let rounds = 0;
let changed = true;
while (changed && rounds++ < 60) {
  changed = false;
  const before = completionPercent(sim);
  const open = accessibleMaps();
  for (const id of open) {
    const loc = LOCATIONS[id];
    if (!areaUnlockedAt[id]) {
      areaUnlockedAt[id] = completionPercent(sim);
      timeline.push(`${completionPercent(sim)}%: ${loc.name} reachable`);
    }
    const { m, seen } = regionOf(loc);
    const at = (x, y) => touchesReach(m, seen, x, y);

    for (const c of loc.collectibles) {
      if (!at(c.x, c.y)) continue;
      if (c.requires && !sim.items[c.requires]) continue;
      if (c.random) continue; // random spots only duplicate; every currency has a fixed spot too
      if (!sim.collected[c.id]) {
        sim.collected[c.id] = true;
        changed = true;
        if (c.currency) discover(c.currency);
        if (c.item) sim.items[c.item] = true;
      }
    }
    for (const o of loc.objects) {
      if (!at(o.x, o.y) || !checkCond(sim, o.visibleWhen)) continue;
      const fx = [];
      collectEffects(o.script, fx);
      for (const e of fx) if (e.type === 'setFlag' && !sim.flags[e.flag]) {
        sim.flags[e.flag] = true;
        changed = true;
      }
    }
    for (const n of loc.npcs) {
      if (!at(n.x, n.y)) continue;
      if(!sim.flags[`met:${n.id}`]) {sim.flags[`met:${n.id}`]=true;changed=true;}
      for (const rule of NPCS[n.id].dialogue) {
        const fx = [];
        collectEffects(rule.script, fx);
        for (const e of fx) {
          if (e.type === 'giveCurrency' && discover(e.id)) changed = true;
        }
      }
    }
  }
  // quests: start when the giver is reachable and the quest is available, finish when objectives are done
  for (const q of QUEST_LIST) {
    if (sim.quests.done[q.id]) continue;
    const giverMap = LOCATION_LIST.find((l) => l.npcs.some((n) => n.id === q.giver));
    if (!giverMap || !open.has(giverMap.id)) continue;
    if (!sim.quests.active[q.id]) {
      if (!checkCond(sim, q.available)) continue;
      sim.quests.active[q.id] = { startedAt: 0 };
      if (q.id === 'buried_treasure') sim.items.treasure_map = true;
      changed = true;
    }
    if (q.objectives.filter((o) => !o.turnIn).every((o) => checkCond(sim, o.done))) {
      sim.quests.done[q.id] = true;
      delete sim.quests.active[q.id];
      for (const id of q.rewards.consume || []) delete sim.items[id];
      for (const id of q.rewards.items || []) sim.items[id] = true;
      for (const id of q.rewards.currencies || []) discover(id);
      timeline.push(`${completionPercent(sim)}%: quest "${q.name}" completed`);
      changed = true;
    }
  }
  if (completionPercent(sim) !== before) changed = true;
}

const found = Object.keys(sim.discovered).length;
console.log(`  Simulation discovered ${found} / ${TOTAL_CURRENCIES} currencies (${completionPercent(sim)}%).`);
const missing = CURRENCIES.filter((c) => !sim.discovered[c.id]);
if (missing.length) err('simulation could not reach: ' + missing.map((c) => c.id).join(', '));
const undone = QUEST_LIST.filter((q) => !sim.quests.done[q.id]);
if (undone.length) err('quests never completed: ' + undone.map((q) => q.id).join(', '));
for (const l of LOCATION_LIST) if (!areaUnlockedAt[l.id] && l.id !== 'final') err(`area ${l.id} never becomes reachable`);
console.log('  Timeline (first 40):\n    ' + timeline.slice(0, 40).join('\n    '));

console.log(`\nDone: ${errors} error(s), ${warnings} warning(s).`);
process.exit(errors ? 1 : 0);
