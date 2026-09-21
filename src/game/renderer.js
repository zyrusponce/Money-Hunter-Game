// Canvas renderer. Draws tiles, world objects, characters, particles, darkness and fades.
// It only reads game state, so React never has to re-render during play.
import { TILES } from '../data/tiles.js';
import { NPCS } from '../data/npcs.js';
import { CURRENCY_BY_ID, RARITY_INFO } from '../data/currencies.js';
import { makeCanvas } from './canvasUtil.js';
import { getGround, getTop, getPerson, getObject, getPickup } from './sprites.js';
import { pickupKind } from './currencyIcons.js';
import { PLAYER_PALETTE, walkFrame } from './player.js';
import { isShown } from './collectibles.js';
import { leverIsOn } from './interactions.js';
import { checkCond } from './conditions.js';
import { npcMarker } from './quests.js';

export const VIEW_W = 400;
export const VIEW_H = 225;

const CONTAINER_LOOKS = new Set(['crate', 'barrel', 'vase', 'drawer', 'sack', 'box', 'vending']);

function camera(game) {
  const { s, rt } = game;
  const pw = rt.map.w * 16;
  const ph = rt.map.h * 16;
  const px = Math.round(s.x - VIEW_W / 2);
  const py = Math.round(s.y - 8 - VIEW_H / 2);
  const x = pw <= VIEW_W ? -Math.round((VIEW_W - pw) / 2) : Math.max(0, Math.min(pw - VIEW_W, px));
  const y = ph <= VIEW_H ? -Math.round((VIEW_H - ph) / 2) : Math.max(0, Math.min(ph - VIEW_H, py));
  return { x, y };
}

function glint(ctx, x, y, color, size) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y - size, 1, size * 2 + 1);
  ctx.fillRect(x - size, y, size * 2 + 1, 1);
}

export function renderGame(game) {
  const { ctx, s, rt } = game;
  if (!ctx) return;
  const m = rt.map;
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#0b1a2a';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const cam = camera(game);
  rt.cam = cam;
  const waterFrame = Math.floor(rt.time * 2) % 2;
  const flameFrame = Math.floor(rt.time * 5) % 2;

  const tx0 = Math.max(0, Math.floor(cam.x / 16));
  const ty0 = Math.max(0, Math.floor(cam.y / 16));
  const tx1 = Math.min(m.w - 1, Math.floor((cam.x + VIEW_W) / 16));
  const ty1 = Math.min(m.h - 1, Math.floor((cam.y + VIEW_H) / 16));
  const lights = [];

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const idx = ty * m.w + tx;
      const dx = tx * 16 - cam.x;
      const dy = ty * 16 - cam.y;
      const gid = m.ground[idx];
      const gs = getGround(gid, tx, ty, waterFrame);
      if (gs) ctx.drawImage(gs, dx, dy);
      const tid = m.effTop[idx];
      if (tid) {
        const ts = getTop(tid, tx, ty, flameFrame);
        if (ts) ctx.drawImage(ts, dx, dy);
        if (tid === 'brazier') lights.push([dx + 8, dy + 8, 34]);
        if (tid === 'lamp') lights.push([dx + 8, dy + 4, 22]);
      }
    }
  }

  // ---------------------------------------------------- entities, sorted by their feet
  const ents = [];

  for (const n of rt.npcs) {
    const def = NPCS[n.id];
    if (!def) continue;
    ents.push({
      y: n.y * 16 + 14,
      draw() {
        const bob = def.sprite.ghost ? Math.sin(rt.time * 2 + n.x) * 1.2 - 1 : 0;
        const spr = getPerson(def.sprite, n.dir, 0);
        const x = n.x * 16 - cam.x;
        const y = n.y * 16 - 1 - cam.y + bob;
        ctx.drawImage(spr, x, y);
        const mark = npcMarker(s, n.id);
        if (mark) {
          const my = y - 5 - Math.abs(Math.sin(rt.time * 4)) * 2;
          ctx.fillStyle = 'rgba(0,0,0,0.55)';
          ctx.fillRect(x + 5, my - 8, 7, 10);
          ctx.fillStyle = mark === '!' ? '#f2c14e' : '#62d26f';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(mark, x + 8.5, my + 1);
        }
      },
    });
  }

  for (const o of m.data.objects) {
    if (!checkCond(s, o.visibleWhen)) continue;
    const flat = o.look === 'note' || o.look === 'plate' || o.look === 'portal';
    ents.push({
      y: o.y * 16 + (flat ? 2 : 14),
      draw() {
        let spr;
        if (o.look === 'lever') spr = getObject('lever', { color: o.color, on: leverIsOn(game, o) });
        else if (o.look === 'plate') spr = getObject('plate', { symbol: o.symbol, on: leverIsOn(game, o) });
        else if (o.look === 'portal') spr = getObject('portal', { frame: Math.floor(rt.time * 4) % 4 });
        else spr = getObject(o.look);
        if (spr) ctx.drawImage(spr, o.x * 16 - cam.x, o.y * 16 - cam.y);
        if (o.look === 'portal') {
          ctx.globalAlpha = 0.25 + 0.1 * Math.sin(rt.time * 3);
          ctx.fillStyle = '#c9b8ff';
          ctx.fillRect(o.x * 16 - cam.x - 2, o.y * 16 - cam.y - 2, 20, 20);
          ctx.globalAlpha = 1;
        }
      },
    });
  }

  for (const c of m.data.collectibles) {
    if (c.look === 'none') continue;
    const spent = c.random ? false : !!s.collected[c.id];
    if (c.look === 'sparkle' && spent) continue;
    if (!isShown(game, c)) continue;
    const x = c.x * 16 - cam.x;
    const y = c.y * 16 - cam.y;
    ents.push({
      y: c.y * 16 + (c.look === 'sparkle' || c.look === 'mound' ? 4 : 14),
      draw() {
        if (c.look === 'sparkle') {
          const cur = c.currency ? CURRENCY_BY_ID[c.currency] : null;
          const bob = Math.round(Math.sin(rt.time * 3 + c.x) * 1);
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(x + 4, y + 12, 8, 2);
          ctx.drawImage(getPickup(pickupKind(cur)), x + 3, y + 5 + bob);
          const tw = (Math.sin(rt.time * 5 + c.x * 2.3 + c.y) + 1) / 2;
          const col = cur ? RARITY_INFO[cur.rarity].color : '#ffffff';
          if (tw > 0.55) glint(ctx, x + 12, y + 4 + bob, '#ffffff', 2);
          if (tw < 0.4) glint(ctx, x + 3, y + 8 + bob, col, 1);
        } else if (c.look === 'mound') {
          ctx.drawImage(getObject(spent ? 'hole' : 'mound'), x, y);
        } else if (c.look === 'chest') {
          ctx.drawImage(getObject(spent ? 'chestOpen' : 'chest'), x, y);
        } else if (CONTAINER_LOOKS.has(c.look)) {
          const spr = getObject(c.look);
          if (spr) ctx.drawImage(spr, x, y);
        }
      },
    });
  }

  ents.push({
    y: s.y,
    draw() {
      const spr = getPerson(PLAYER_PALETTE, s.dir, walkFrame(rt.walkT, rt.moving));
      ctx.drawImage(spr, Math.round(s.x - 8 - cam.x), Math.round(s.y - 15 - cam.y));
    },
  });

  ents.sort((a, b) => a.y - b.y);
  for (const e of ents) e.draw();

  // ---------------------------------------------------- particles
  for (const p of rt.particles) {
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x - cam.x), Math.round(p.y - cam.y), p.size || 2, p.size || 2);
  }
  ctx.globalAlpha = 1;

  // ---------------------------------------------------- darkness (caves, ruins, abandoned building)
  const dk = m.data.dark;
  if (dk) {
    if (!rt.darkCanvas) rt.darkCanvas = makeCanvas(VIEW_W, VIEW_H);
    const dg = rt.darkCanvas.getContext('2d');
    dg.globalCompositeOperation = 'source-over';
    dg.clearRect(0, 0, VIEW_W, VIEW_H);
    dg.fillStyle = 'rgba(3,2,10,0.93)';
    dg.fillRect(0, 0, VIEW_W, VIEW_H);
    dg.globalCompositeOperation = 'destination-out';
    const carve = (gx, gy, r, strength = 1) => {
      const grad = dg.createRadialGradient(gx, gy, r * 0.2, gx, gy, r);
      grad.addColorStop(0, `rgba(0,0,0,${strength})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      dg.fillStyle = grad;
      dg.beginPath();
      dg.arc(gx, gy, r, 0, Math.PI * 2);
      dg.fill();
    };
    const r = (s.items.flashlight ? dk.flash : dk.radius) * (1 + Math.sin(rt.time * 3) * 0.012);
    carve(s.x - cam.x, s.y - 8 - cam.y, r);
    for (const [lx, ly, lr] of lights) carve(lx, ly, lr, 0.9);
    dg.globalCompositeOperation = 'source-over';
    ctx.drawImage(rt.darkCanvas, 0, 0);
  }

  // ---------------------------------------------------- scene fade
  if (rt.fade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, rt.fade)})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
