// Interactions: finding what is in reach, running dialogue scripts, applying effects,
// pulling levers and opening secret / locked barriers.
import { NPCS } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';
import { checkCond } from './conditions.js';
import { hasLineOfSight } from './collisions.js';
import { collect, defaultVerb } from './collectibles.js';
import { audio } from './audio.js';
import { modifiers } from './modifiers.js';
import { QUEST_LIST, QUESTS } from '../data/quests.js';
import { questStatus } from './quests.js';

const FACE = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const RANGE = { npc: 26, object: 26, collectible: 27, barrier: 26 };

// ------------------------------------------------------------------ targets
export function buildTargets(data, npcs) {
  return [
    ...npcs.map((n) => ({ kind: 'npc', ref: n, cells: [[n.x, n.y]] })),
    ...data.objects.map((o) => ({ kind: 'object', ref: o, cells: [[o.x, o.y]] })),
    ...data.collectibles.map((c) => ({ kind: 'collectible', ref: c, cells: [[c.x, c.y]] })),
    ...data.barriers.map((b) => ({ kind: 'barrier', ref: b, cells: [[b.x, b.y], ...(b.tiles || [])] })),
  ];
}

function isActive(game, t) {
  const { s } = game;
  switch (t.kind) {
    case 'npc':
      return true;
    case 'object':
      return checkCond(s, t.ref.visibleWhen);
    case 'collectible':
      return t.ref.random ? true : !s.collected[t.ref.id];
    case 'barrier':
      return !game.isBarrierOpen(t.ref) && t.ref.interactive !== false;
    default:
      return false;
  }
}

export function findTarget(game) {
  const { s, rt } = game;
  const px = s.x;
  const py = s.y - 6;
  const face = FACE[s.dir] || FACE.down;
  let best = null;
  for (const t of rt.map.targets) {
    if (!isActive(game, t)) continue;
    let bd = Infinity;
    let bx = 0;
    let by = 0;
    let bc = null;
    for (const c of t.cells) {
      const x = c[0] * 16 + 8;
      const y = c[1] * 16 + 8;
      const d = Math.hypot(x - px, y - py);
      if (d < bd) {
        bd = d;
        bx = x;
        by = y;
        bc = c;
      }
    }
    if (bd > RANGE[t.kind]+modifiers(s).interaction) continue;
    const dot = ((bx - px) * face[0] + (by - py) * face[1]) / (bd || 1);
    const score = bd - (dot > 0.35 ? 5 : 0);
    if (best && score >= best.score) continue;
    if (bd > 12 && !hasLineOfSight(rt, px, py, bx, by, bc[0], bc[1])) continue;
    best = { kind: t.kind, ref: t.ref, cells: t.cells, score, dist: bd };
  }
  return best;
}

export function promptFor(t) {
  if (!t) return null;
  switch (t.kind) {
    case 'npc':
      return { verb: 'talk', name: NPCS[t.ref.id]?.name || '' };
    case 'object':
      return { verb: t.ref.prompt || 'examine', name: '' };
    case 'collectible':
      return { verb: defaultVerb(t.ref), name: '' };
    case 'barrier':
      return { verb: t.ref.prompt || 'examine', name: '' };
    default:
      return null;
  }
}

// ------------------------------------------------------------------ interact (E)
export function interact(game) {
  const t = game.rt.target;
  const { s } = game;
  if (!t) {
    game.toast('Nothing to interact with here.', 'info');
    return;
  }
  audio.sfx('ui');
  switch (t.kind) {
    case 'npc': {
      const def = NPCS[t.ref.id];
      if (!def) return;
      s.flags[`met:${t.ref.id}`]=true;
      game.rt.npcId=t.ref.id;
      t.ref.dir = OPPOSITE[s.dir] || 'down';
      const rule = def.dialogue.find((r) => checkCond(s, r.when));
      if (rule) {
        const script=previewQuestOffers(rule.script);
        for(const q of QUEST_LIST.filter(q=>q.giver===t.ref.id&&(q.chain||q.id==='final_journey'))) {
          const status=questStatus(s,q.id);
          if(status==='ready') script.choices.push({label:`Complete: ${q.name}`,script:{pages:[`Thank you! ${q.rewardText}`],effects:[{type:'completeQuest',id:q.id}]}});
          else if(status==='new'&&checkCond(s,q.available))script.choices.push({label:q.name,script:{pages:[q.summary,`Rewards: ${q.rewardText}`],choices:[{label:'Accept quest',script:{pages:['Good luck out there.'],effects:[{type:'startQuest',id:q.id}]}},{label:'Maybe later',script:{pages:['Take your time.']}}]}});
        }
        script.choices.push({label:'Explorer shop & requests',script:{pages:[],effects:[{type:'openExplorer'}]}});
        script.choices.push({label:'Continue exploring',script:{pages:[]}});
        startScript(game,script,def.name,def.title);
      }
      break;
    }
    case 'object':
      if (t.ref.kind === 'lever') pullLever(game, t.ref);
      else startScript(game, t.ref.script, t.ref.script?.speaker || '');
      break;
    case 'collectible':
      if((t.ref.requires==='shovel'||t.ref.look==='mound')&&s.items.shovel&&!s.collected[t.ref.id]) {
        if(!game.rt.dig)game.rt.dig={collectible:t.ref,elapsed:0,duration:modifiers(s).digSeconds,x:s.x,y:s.y};
      } else collect(game, t.ref);
      break;
    case 'barrier':
      tryBarrier(game, t.ref);
      break;
    default:
      break;
  }
}

// ------------------------------------------------------------------ barriers (secret walls, locked doors)
export function tryBarrier(game, b) {
  const { s } = game;
  if (game.isBarrierOpen(b)) return;
  if (b.requires && !checkCond(s, b.requires)) {
    audio.sfx('error');
    game.say(b.lockedText || 'It will not budge.');
    return;
  }
  game.openBarrier(game.rt.map.data.id, b.id, { text: b.openText });
}

// ------------------------------------------------------------------ levers and plates (sequence puzzles)
export function pullLever(game, obj) {
  const { s, rt } = game;
  const data = rt.map.data;
  const puzzle = data.puzzles.find((p) => p.id === obj.puzzle);
  if (!puzzle) return;
  const solvedKey = `puzzle:${puzzle.id}`;
  if (s.flags[solvedKey]) {
    game.say('The mechanism has already been solved.');
    return;
  }
  const prog = (rt.puzzleProgress[puzzle.id] ||= []);
  if (prog.includes(obj.id)) return;
  prog.push(obj.id);
  const idx = prog.length - 1;
  const ok = puzzle.order[idx] === obj.id;
  audio.sfx('lever', idx);
  if (!ok) {
    audio.sfx('error');
    rt.puzzleProgress[puzzle.id] = [];
    game.toast(puzzle.resetText || 'Nothing happens. Wrong order.', 'warn');
    return;
  }
  if (prog.length === puzzle.order.length) {
    game.rewardAction({id:solvedKey,cause:'Puzzle solved'},()=>{
    game.setFlag(solvedKey);
    audio.sfx('unlock');
    game.say(puzzle.solvedText || 'You hear a click. Something opened.');
    applyEffects(game, puzzle.onSolve || []);
    game.touch();
    });
  }
}

export const leverIsOn = (game, obj) => {
  const puzzle = game.rt.map.data.puzzles.find((p) => p.id === obj.puzzle);
  if (!puzzle) return false;
  if (game.s.flags[`puzzle:${puzzle.id}`]) return true;
  return (game.rt.puzzleProgress[puzzle.id] || []).includes(obj.id);
};

// ------------------------------------------------------------------ dialogue engine
export function previewQuestOffers(source) {
  const node={...source,pages:[...(source.pages||[])],choices:(source.choices||[]).map(c=>({...c,script:previewQuestOffers(c.script||{})}))};
  const offers=(source.effects||[]).filter(e=>e.type==='startQuest'&&QUESTS[e.id]);
  if(offers.length) {
    for(const e of offers) {const q=QUESTS[e.id];node.pages.push(`${q.name} — Rewards: ${q.rewards.xp} XP · ${q.rewards.coins} Hunter Coins. ${q.rewardText}`);}
    delete node.effects;
    node.choices=[{label:'Accept quest',script:{pages:['Your journal has been updated.'],effects:source.effects}},{label:'Maybe later',script:{pages:[]}}];
  }
  return node;
}

const pageOf = (d) => {
  const p = d.script.pages[Math.min(d.page, d.script.pages.length - 1)];
  if (p === undefined) return { text: '', speaker: d.speaker };
  return typeof p === 'string' ? { text: p, speaker: d.speaker } : { text: p.text, speaker: p.speaker || d.speaker };
};

export function emitDialogue(game) {
  const d = game.rt.dlg;
  if (!d) {
    game.emit('dialogue', null);
    return;
  }
  const { text, speaker } = pageOf(d);
  game.emit('dialogue', {
    speaker,
    title: d.title || '',
    text,
    choices: d.inChoices ? d.script.choices.map((c) => c.label) : null,
    choiceIdx: d.choiceIdx,
    page: d.page,
    pages: d.script.pages.length,
  });
}

export function startScript(game, script, speaker = '', title = '') {
  if (!script) return;
  game.rt.dlg = { script, speaker: script.speaker || speaker, title, page: 0, choiceIdx: 0, inChoices: false };
  game.setMode('dialogue');
  if (!script.pages || !script.pages.length) {
    finishPages(game);
    return;
  }
  emitDialogue(game);
}

function finishPages(game) {
  const d = game.rt.dlg;
  if (!d) return;
  const effects = d.script.effects || [];
  if (effects.length) applyEffects(game, effects);
  if (d.script.choices && d.script.choices.length) {
    d.inChoices = true;
    d.choiceIdx = 0;
    emitDialogue(game);
  } else {
    closeDialogue(game);
  }
}

export function advanceDialogue(game) {
  const d = game.rt.dlg;
  if (!d) return;
  if (d.inChoices) {
    const choice = d.script.choices[d.choiceIdx];
    audio.sfx('confirm');
    d.script = choice.script || { pages: [] };
    d.speaker = d.script.speaker || d.speaker;
    d.page = 0;
    d.inChoices = false;
    if (!d.script.pages || !d.script.pages.length) finishPages(game);
    else emitDialogue(game);
    return;
  }
  audio.sfx('ui');
  if (d.page < d.script.pages.length - 1) {
    d.page += 1;
    emitDialogue(game);
  } else {
    finishPages(game);
  }
}

export function moveChoice(game, delta) {
  const d = game.rt.dlg;
  if (!d || !d.inChoices) return;
  const n = d.script.choices.length;
  d.choiceIdx = (d.choiceIdx + delta + n) % n;
  audio.sfx('ui');
  emitDialogue(game);
}

export function chooseDialogue(game, idx) {
  const d = game.rt.dlg;
  if (!d || !d.inChoices) return;
  d.choiceIdx = idx;
  advanceDialogue(game);
}

export function closeDialogue(game) {
  game.rt.dlg = null;
  game.emit('dialogue', null);
  game.setMode('explore');
}

// ------------------------------------------------------------------ effects
export function applyEffects(game, effects) {
  for (const e of effects) applyEffect(game, e);
}

export function applyEffect(game, e) {
  switch (e.type) {
    case 'startQuest':
      game.startQuest(e.id);
      break;
    case 'completeQuest':
      game.completeQuest(e.id);
      break;
    case 'giveItem':
      if (!game.s.items[e.id]) game.giveItem(e.id);
      break;
    case 'takeItem':
      delete game.s.items[e.id];
      game.touch();
      break;
    case 'giveCurrency':
      game.discover(e.id, { source: 'gift' });
      break;
    case 'setFlag':
      game.setFlag(e.flag);
      break;
    case 'toast':
      game.toast(e.text, e.kind || 'info');
      break;
    case 'openBarrier':
      game.openBarrier(e.map || game.rt.map.data.id, e.id, { text: e.text });
      break;
    case 'openTrade':
      game.rt.pending.push({ type: 'trade' });
      break;
    case 'openExplorer':
      game.rt.pending.push({type:'explorer'});
      break;
    case 'showEnding':
      game.rt.pending.push({ type: 'ending' });
      break;
    case 'travel':
      game.rt.pending.push({ type: 'travel', to: e.to, spawn: e.spawn });
      break;
    default:
      console.warn('[MoneyHunter] unknown effect', e);
  }
}

export const itemLabel = (id) => (ITEMS[id] ? ITEMS[id].name : id);
