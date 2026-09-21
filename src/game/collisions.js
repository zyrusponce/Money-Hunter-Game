// Collision and line-of-sight against the current map's precomputed grids.
import { PLAYER } from './player.js';

export function cellBlocked(rt, tx, ty) {
  const m = rt.map;
  if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return true;
  return m.blocked[ty * m.w + tx] === 1;
}

export function rectBlocked(rt, x, y, w, h) {
  const x0 = Math.floor(x / 16);
  const x1 = Math.floor((x + w - 0.001) / 16);
  const y0 = Math.floor(y / 16);
  const y1 = Math.floor((y + h - 0.001) / 16);
  for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (cellBlocked(rt, tx, ty)) return true;
  return false;
}

// Is the player's foot hitbox blocked if the feet were at (px, py)?
export const blockedAt = (rt, px, py) => rectBlocked(rt, px - PLAYER.halfW, py - PLAYER.hitH, PLAYER.halfW * 2, PLAYER.hitH);

// Walk a straight line and report whether a sight-blocking tile is in the way.
export function hasLineOfSight(rt, ax, ay, bx, by, skipTx, skipTy) {
  const m = rt.map;
  const dist = Math.hypot(bx - ax, by - ay);
  const steps = Math.max(1, Math.ceil(dist / 4));
  for (let i = 1; i < steps; i++) {
    const px = ax + ((bx - ax) * i) / steps;
    const py = ay + ((by - ay) * i) / steps;
    const tx = Math.floor(px / 16);
    const ty = Math.floor(py / 16);
    if (tx === skipTx && ty === skipTy) continue;
    if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return false;
    if (m.sight[ty * m.w + tx] === 1) return false;
  }
  return true;
}
