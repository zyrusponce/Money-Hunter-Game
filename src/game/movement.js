// Smooth, collision-aware player movement with a little corner nudging so doorways feel easy.
import { PLAYER } from './player.js';
import { blockedAt } from './collisions.js';
import { audio } from './audio.js';

export function movePlayer(game, dt, ix, iy, sprint) {
  const { s, rt } = game;
  rt.moving = false;
  if (ix === 0 && iy === 0) return false;

  const len = Math.hypot(ix, iy);
  const dx = ix / len;
  const dy = iy / len;
  const step = PLAYER.speed * (sprint ? PLAYER.sprint : 1) * dt;
  let moved = false;

  // horizontal
  if (dx !== 0) {
    const nx = s.x + dx * step;
    if (!blockedAt(rt, nx, s.y)) {
      s.x = nx;
      moved = true;
    } else if (dy === 0) {
      const nudge = findNudge(rt, nx, s.y, 'y');
      if (nudge) {
        s.y += nudge * Math.min(step, 1.5);
        moved = true;
      }
    }
  }
  // vertical
  if (dy !== 0) {
    const ny = s.y + dy * step;
    if (!blockedAt(rt, s.x, ny)) {
      s.y = ny;
      moved = true;
    } else if (dx === 0) {
      const nudge = findNudge(rt, s.x, ny, 'x');
      if (nudge) {
        s.x += nudge * Math.min(step, 1.5);
        moved = true;
      }
    }
  }

  // facing
  if (Math.abs(ix) >= Math.abs(iy) && ix !== 0) s.dir = ix < 0 ? 'left' : 'right';
  else if (iy !== 0) s.dir = iy < 0 ? 'up' : 'down';

  if (moved) {
    rt.moving = true;
    rt.walkT += dt * (sprint ? 1.35 : 1);
    rt.stepDist += step;
    if (rt.stepDist > 15) {
      rt.stepDist = 0;
      s.stats.steps += 1;
      audio.sfx('step');
    }
  }
  return moved;
}

// If we are blocked by a corner, see whether sliding a few pixels along the other axis frees us.
function findNudge(rt, x, y, axis) {
  for (let k = 1; k <= 5; k++) {
    for (const sign of [-1, 1]) {
      const cx = axis === 'x' ? x + sign * k : x;
      const cy = axis === 'y' ? y + sign * k : y;
      if (!blockedAt(rt, cx, cy)) return sign;
    }
  }
  return 0;
}
