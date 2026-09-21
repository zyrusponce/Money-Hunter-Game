// The game engine: owns the game state, runs the requestAnimationFrame loop, handles input,
// and talks to the React UI through a small event emitter. Nothing in here uses React.
import { LOCATIONS, PROGRESSION } from '../data/locations.js';
import { TILES } from '../data/tiles.js';
import { CURRENCY_BY_ID, RARITIES, TOTAL_CURRENCIES } from '../data/currencies.js';
import { ITEMS } from '../data/items.js';
import { Emitter } from './events.js';
import { createNewState, migrateState, tileToPos } from './state.js';
import { writeSave } from './saveSystem.js';
import { completionPercent, discoveredCount, isLocationUnlocked } from './progression.js';
import { checkCond } from './conditions.js';
import { movePlayer } from './movement.js';
import { computeSignal, SIGNAL_LABELS } from './detector.js';
import { isSolidCollectible, isShown } from './collectibles.js';
import { buildTargets, findTarget, promptFor, interact, advanceDialogue, moveChoice, chooseDialogue, startScript } from './interactions.js';
import { startQuest, completeQuest } from './quests.js';
import { getTradeInfo, doTrade, claimMilestone } from './trade.js';
import { snapshotFromState } from './snapshot.js';
import { renderGame, VIEW_W, VIEW_H } from './renderer.js';
import { audio } from './audio.js';

const KEY_DIR = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};
const ACTION_KEYS = new Set(['KeyE', 'Space', 'Enter']);
const OBJECT_SOLID = { sign: true, board: true, note: false, exhibit: true, lever: true, plate: false, portal: false, mural: true, monument: true, boat: true };
const AUTOSAVE_SECONDS = 20;

export class Game {
  constructor({ canvas, state = null, settings = null, rnd = Math.random, listen = true, autosave = true } = {}) {
    this.canvas = canvas;
    if (canvas) {
      canvas.width = VIEW_W;
      canvas.height = VIEW_H;
    }
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.emitter = new Emitter();
    this.s = state ? migrateState(state) : createNewState();
    this.rnd = rnd;
    this.autosave = autosave;
    this.running = false;
    this.destroyed = false;
    this.lastHud = null;
    this.rt = {
      mode: 'explore', // explore | dialogue | popup | transition
      paused: false,
      time: 0,
      keys: new Set(),
      vdir: { x: 0, y: 0 },
      vSprint: false,
      map: null,
      npcs: [],
      dlg: null,
      popups: [],
      pending: [],
      target: null,
      particles: [],
      puzzleProgress: {},
      walkT: 0,
      moving: false,
      stepDist: 0,
      fade: 0,
      transition: null,
      saveTimer: 0,
      hudKey: '',
      signal: { level: 0, dist: Infinity },
      signalTimer: 0,
      beepTimer: 0,
      cam: { x: 0, y: 0 },
      exitCooldown: 0,
      lastSafe: { x: 0, y: 0 },
      toastId: 0,
      darkCanvas: null,
    };
    if (settings) audio.setVolumes(settings.music, settings.sfx);
    this.loadMap(this.s.map, null, true);

    this._onKeyDown = (e) => this.onKeyDown(e);
    this._onKeyUp = (e) => this.rt.keys.delete(e.code);
    this._onBlur = () => this.rt.keys.clear();
    this._onHide = () => this.save();
    this._tick = (t) => this.tick(t);
    if (listen && typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);
      window.addEventListener('blur', this._onBlur);
      window.addEventListener('pagehide', this._onHide);
    }
  }

  // ------------------------------------------------------------------ events
  on(evt, fn) {
    return this.emitter.on(evt, fn);
  }
  emit(evt, payload) {
    this.emitter.emit(evt, payload);
  }

  // ------------------------------------------------------------------ lifecycle
  start() {
    if (this.running || this.destroyed) return;
    this.running = true;
    this._last = typeof performance !== 'undefined' ? performance.now() : 0;
    if (typeof requestAnimationFrame !== 'undefined') this._raf = requestAnimationFrame(this._tick);
    this.emit('area', { name: this.rt.map.data.name, id: this.s.map });
    this.hud(true);
  }

  stop() {
    this.running = false;
    if (this._raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this._raf);
  }

  destroy() {
    this.stop();
    this.destroyed = true;
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
      window.removeEventListener('blur', this._onBlur);
      window.removeEventListener('pagehide', this._onHide);
    }
    this.emitter.clear();
  }

  tick(t) {
    if (!this.running) return;
    const dt = Math.min(0.05, Math.max(0, (t - this._last) / 1000));
    this._last = t;
    this.update(dt);
    this.render();
    this._raf = requestAnimationFrame(this._tick);
  }

  render() {
    renderGame(this);
  }

  setPaused(p) {
    this.rt.paused = !!p;
    if (p) {
      this.rt.keys.clear();
      this.rt.vdir = { x: 0, y: 0 };
      this.rt.moving = false;
    }
  }

  setMode(m) {
    this.rt.mode = m;
    if (m !== 'explore') {
      this.rt.moving = false;
      this.rt.target = null;
    }
    this.hud();
  }

  // ------------------------------------------------------------------ input
  onKeyDown(e) {
    audio.unlock();
    const rt = this.rt;
    if (rt.paused || this.destroyed) return;
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const code = e.code;
    if (code === 'Space' || code.startsWith('Arrow')) e.preventDefault();
    if (e.repeat) return;
    if (ACTION_KEYS.has(code)) {
      this.onAction();
    } else if (rt.mode === 'dialogue' && rt.dlg && rt.dlg.inChoices) {
      if (code === 'ArrowUp' || code === 'KeyW') moveChoice(this, -1);
      if (code === 'ArrowDown' || code === 'KeyS') moveChoice(this, 1);
    }
    rt.keys.add(code);
  }

  // The action button: E / Space / Enter or the on-screen A button.
  onAction() {
    const rt = this.rt;
    if (rt.paused || rt.transition) return;
    audio.unlock();
    if (rt.mode === 'explore') interact(this);
    else if (rt.mode === 'dialogue') advanceDialogue(this);
    else if (rt.mode === 'popup') this.dismissPopup();
  }

  setVirtualDir(x, y) {
    this.rt.vdir = { x, y };
  }
  setSprint(on) {
    this.rt.vSprint = !!on;
  }
  advance() {
    this.onAction();
  }
  choose(i) {
    chooseDialogue(this, i);
  }

  // ------------------------------------------------------------------ map loading
  loadMap(id, spawnKey, keepPos = false) {
    const data = LOCATIONS[id];
    const s = this.s;
    const rt = this.rt;
    s.map = id;
    s.visited[id] = true;
    if (!keepPos) {
      const sp = data.spawns[spawnKey] || data.spawns.default;
      Object.assign(s, tileToPos(sp.x, sp.y));
      s.dir = sp.dir || 'down';
    }
    const w = data.width;
    const h = data.height;
    const m = {
      data,
      w,
      h,
      ground: data.ground.flat(),
      baseTop: data.top.flat(),
      effTop: new Array(w * h).fill(null),
      blocked: new Uint8Array(w * h),
      sight: new Uint8Array(w * h),
      barrierAt: new Map(),
      targets: [],
    };
    for (const b of data.barriers) {
      for (const [bx, by] of [[b.x, b.y], ...(b.tiles || [])]) {
        m.barrierAt.set(by * w + bx, b);
        if (b.floor) m.ground[by * w + bx] = b.floor;
      }
    }
    rt.map = m;
    rt.npcs = data.npcs.map((n) => ({ ...n }));
    m.targets = buildTargets(data, rt.npcs);
    rt.puzzleProgress = {};
    rt.lastSafe = { x: s.x, y: s.y };
    rt.exitCooldown = 0.8;
    rt.target = null;
    rt.signal = { level: 0, dist: Infinity };
    this.rebuildMap();
    audio.music(data.theme);
    this.hud(true);
  }

  isBarrierOpen(b) {
    return !!this.s.flags[`b:${this.rt.map.data.id}:${b.id}`];
  }

  // Recompute which tiles are visible / solid. Cheap, so it runs whenever state changes.
  rebuildMap() {
    const { s, rt } = this;
    const m = rt.map;
    const { data, w, h } = m;
    for (let i = 0; i < w * h; i++) {
      let top = m.baseTop[i];
      const b = m.barrierAt.get(i);
      if (b) top = this.isBarrierOpen(b) ? null : b.look;
      m.effTop[i] = top;
      const gd = TILES[m.ground[i]];
      const td = top ? TILES[top] : null;
      m.blocked[i] = (gd && gd.solid) || (td && td.solid) ? 1 : 0;
      m.sight[i] = (td && td.solid && !td.low) || (gd && gd.solid && !gd.low) ? 1 : 0;
    }
    for (const n of rt.npcs) m.blocked[n.y * w + n.x] = 1;
    for (const o of data.objects) {
      if (!checkCond(s, o.visibleWhen)) continue;
      const solid = o.solid !== undefined ? o.solid : OBJECT_SOLID[o.look] !== false;
      if (solid) m.blocked[o.y * w + o.x] = 1;
    }
    for (const c of data.collectibles) {
      if (isSolidCollectible(c) && isShown(this, c)) m.blocked[c.y * w + c.x] = 1;
    }
  }

  // Call after any state change that could affect the world or the HUD.
  touch() {
    this.rebuildMap();
    this.hud();
  }

  // ------------------------------------------------------------------ update loop
  update(dt) {
    const rt = this.rt;
    const s = this.s;
    rt.time += dt;
    this.updateParticles(dt);
    if (rt.paused) return;
    s.stats.playtime += dt;

    if (rt.transition) {
      this.updateTransition(dt);
      return;
    }
    if (rt.mode === 'explore') {
      if (rt.popups.length) this.pumpPopups();
      if (rt.mode === 'explore' && rt.pending.length) this.processPending();
    }
    if (rt.mode === 'explore') this.updateExplore(dt);

    if (this.autosave) {
      rt.saveTimer += dt;
      if (rt.saveTimer >= AUTOSAVE_SECONDS) this.save();
    }
  }

  updateExplore(dt) {
    const { rt, s } = this;
    let ix = 0;
    let iy = 0;
    for (const k of rt.keys) {
      const d = KEY_DIR[k];
      if (d) {
        ix += d[0];
        iy += d[1];
      }
    }
    ix = Math.max(-1, Math.min(1, ix + rt.vdir.x));
    iy = Math.max(-1, Math.min(1, iy + rt.vdir.y));
    const sprint = rt.keys.has('ShiftLeft') || rt.keys.has('ShiftRight') || rt.vSprint;
    movePlayer(this, dt, ix, iy, sprint);
    rt.exitCooldown = Math.max(0, rt.exitCooldown - dt);

    rt.target = findTarget(this);

    rt.signalTimer -= dt;
    if (rt.signalTimer <= 0) {
      rt.signalTimer = 0.1;
      rt.signal = computeSignal(this);
    }
    if (rt.signal.level > 0) {
      rt.beepTimer -= dt;
      if (rt.beepTimer <= 0) {
        audio.sfx('beep', rt.signal.level);
        rt.beepTimer = [0, 1.7, 0.9, 0.4][rt.signal.level];
      }
    } else rt.beepTimer = 0;

    this.checkExits();
    this.hud();
  }

  checkExits() {
    const { rt, s } = this;
    const data = rt.map.data;
    const tx = Math.floor(s.x / 16);
    const ty = Math.floor((s.y - 3) / 16);
    let inside = null;
    for (const ex of data.exits) {
      if (tx >= ex.x && tx < ex.x + (ex.w || 1) && ty >= ex.y && ty < ex.y + (ex.h || 1)) {
        inside = ex;
        break;
      }
    }
    if (!inside) {
      rt.lastSafe = { x: s.x, y: s.y };
      return;
    }
    if (rt.exitCooldown > 0) return;
    if (inside.hidden && !checkCond(s, inside.requires)) return; // an inactive doorway (e.g. the final portal)

    const target = LOCATIONS[inside.to];
    const pct = completionPercent(s);
    if (!isLocationUnlocked(s, inside.to)) {
      this.blockExit(`${target.name} is locked. Reach ${target.unlockRequirement}% Money Encyclopedia completion to open it. (You are at ${pct}%.)`);
      return;
    }
    if (inside.requires && !checkCond(s, inside.requires)) {
      this.blockExit(inside.lockedText || 'You cannot go there yet.');
      return;
    }
    this.travel(inside.to, data.id);
  }

  blockExit(text) {
    const { rt, s } = this;
    audio.sfx('error');
    s.x = rt.lastSafe.x;
    s.y = rt.lastSafe.y;
    rt.exitCooldown = 1.5;
    this.say(text);
  }

  travel(mapId, spawnKey) {
    const rt = this.rt;
    if (rt.transition || !LOCATIONS[mapId]) return;
    rt.transition = { phase: 'out', t: 0, to: mapId, spawn: spawnKey };
    this.setMode('transition');
  }

  updateTransition(dt) {
    const rt = this.rt;
    const tr = rt.transition;
    const D = 0.22;
    tr.t += dt;
    if (tr.phase === 'out') {
      rt.fade = Math.min(1, tr.t / D);
      if (tr.t >= D) {
        this.loadMap(tr.to, tr.spawn);
        tr.phase = 'in';
        tr.t = 0;
        this.emit('area', { name: rt.map.data.name, id: tr.to });
      }
    } else {
      rt.fade = Math.max(0, 1 - tr.t / D);
      if (tr.t >= D) {
        rt.fade = 0;
        rt.transition = null;
        this.setMode('explore');
        this.save();
      }
    }
  }

  processPending() {
    const rt = this.rt;
    const p = rt.pending.shift();
    if (!p) return;
    if (p.type === 'trade') this.emit('menu', 'trade');
    else if (p.type === 'ending') this.emit('menu', 'ending');
    else if (p.type === 'travel') this.travel(p.to, p.spawn);
  }

  // ------------------------------------------------------------------ particles
  burst(x, y, color, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = this.rnd() * Math.PI * 2;
      const sp = 20 + this.rnd() * 40;
      this.rt.particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 25, life: 0.5 + this.rnd() * 0.3, color, size: 2 });
    }
  }

  updateParticles(dt) {
    const ps = this.rt.particles;
    for (const p of ps) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 90 * dt;
      p.life -= dt;
    }
    this.rt.particles = ps.filter((p) => p.life > 0);
  }

  // ------------------------------------------------------------------ messages and popups
  toast(text, kind = 'info') {
    this.emit('toast', { id: ++this.rt.toastId, text, kind });
  }

  say(text, speaker = '') {
    if (this.rt.dlg) return this.toast(text, 'info');
    startScript(this, { pages: [text] }, speaker);
    return null;
  }

  queuePopup(p) {
    this.rt.popups.push(p);
  }

  pumpPopups() {
    const rt = this.rt;
    if (rt.mode !== 'explore' || rt.transition || !rt.popups.length) return;
    const p = rt.popups[0];
    if (p.type === 'ending') {
      rt.popups.shift();
      this.emit('menu', 'ending');
      return;
    }
    this.setMode('popup');
    this.emit('popup', p);
  }

  dismissPopup() {
    const rt = this.rt;
    if (rt.mode !== 'popup') return;
    audio.sfx('ui');
    rt.popups.shift();
    this.emit('popup', null);
    this.setMode('explore');
    this.pumpPopups();
  }

  // ------------------------------------------------------------------ gameplay state changes
  setFlag(flag) {
    this.s.flags[flag] = true;
    this.touch();
  }

  giveItem(id) {
    const it = ITEMS[id];
    if (!it) return;
    const had = this.s.items[id];
    this.s.items[id] = true;
    if (had) return;
    audio.sfx('item');
    if (it.category === 'quest') this.toast(`Got: ${it.name}`, 'item');
    else this.queuePopup({ type: 'item', item: it });
    this.touch();
    this.save();
  }

  openBarrier(mapId, id, { text } = {}) {
    this.s.flags[`b:${mapId}:${id}`] = true;
    if (mapId === this.s.map) this.rebuildMap();
    audio.sfx('unlock');
    if (text) this.say(text);
    this.save();
  }

  startQuest(id) {
    startQuest(this, id);
  }
  completeQuest(id) {
    completeQuest(this, id);
  }

  // Record newly found (or duplicate) money.
  discover(id, { source = 'pickup', silent = false } = {}) {
    const c = CURRENCY_BY_ID[id];
    const s = this.s;
    if (!c) return { isNew: false };
    const isNew = !s.discovered[id];
    if (isNew) {
      s.discovered[id] = true;
      s.stats.discoveries += 1;
    } else {
      s.duplicates[id] = (s.duplicates[id] || 0) + 1;
      s.stats.duplicatesFound += 1;
    }
    const pct = completionPercent(s);
    s.completionPercent = pct;
    const rarityIdx = RARITIES.indexOf(c.rarity);
    if (!silent) {
      audio.sfx(isNew ? 'discover' : 'duplicate', rarityIdx);
      this.queuePopup({ type: isNew ? 'discovery' : 'duplicate', currency: c, count: s.duplicates[id] || 0, percent: pct, discovered: discoveredCount(s), total: TOTAL_CURRENCIES });
    }
    if (isNew) {
      for (const p of PROGRESSION) {
        const key = `u:${p.unlock}`;
        if (pct >= p.percent && !s.notified[key]) {
          s.notified[key] = true;
          this.queuePopup({ type: 'unlock', title: p.title, text: p.text, percent: p.percent });
        }
      }
      if (pct >= 100 && !s.complete) {
        s.complete = true;
        this.queuePopup({ type: 'ending' });
      }
    }
    this.touch();
    this.save();
    return { isNew };
  }

  // ------------------------------------------------------------------ HUD + snapshot for React
  hud(force = false) {
    const { s, rt } = this;
    if (!rt.map) return;
    const prompt = rt.mode === 'explore' && rt.target ? promptFor(rt.target) : null;
    const snap = {
      location: rt.map.data.name,
      area: rt.map.data.area || rt.map.data.name,
      percent: completionPercent(s),
      discovered: discoveredCount(s),
      total: TOTAL_CURRENCIES,
      prompt,
      signal: rt.mode === 'explore' ? rt.signal.level : 0,
      signalLabel: SIGNAL_LABELS[rt.signal.level] || '',
      improved: !!s.items.detector2,
      dark: !!rt.map.data.dark,
      flashlight: !!s.items.flashlight,
      busy: rt.mode !== 'explore',
    };
    const key = JSON.stringify(snap);
    if (!force && key === rt.hudKey) return;
    rt.hudKey = key;
    this.lastHud = snap;
    this.emit('hud', snap);
  }

  getSnapshot() {
    return snapshotFromState(this.s);
  }

  getTradeInfo() {
    return getTradeInfo(this);
  }
  trade(id) {
    const r = doTrade(this, id);
    this.hud(true);
    return r;
  }
  claim(id) {
    const r = claimMilestone(this, id);
    this.hud(true);
    return r;
  }

  // ------------------------------------------------------------------ saving
  save() {
    this.rt.saveTimer = 0;
    if (!this.autosave) return false;
    this.s.completionPercent = completionPercent(this.s);
    return writeSave(this.s);
  }

  getState() {
    return this.s;
  }
}
