// Sprite cache and public sprite API. Every sprite is drawn in code, so there are no image files.
import { S, px, disc, line, shadow, make } from './paint.js';
import { GROUND } from './groundTiles.js';
import { TOP, ANIMATED_TOP } from './topTiles.js';

const cache = new Map();
const cached = (key, build) => {
  let v = cache.get(key);
  if (!v) {
    v = build();
    cache.set(key, v);
  }
  return v;
};

const variantOf = (x, y) => (((x * 7 + y * 13) % 3) + 3) % 3;

// ------------------------------------------------------------------ tiles
export function getGround(id, x, y, frame) {
  const painter = GROUND[id];
  if (!painter) return null;
  const anim = id === 'water' || id === 'shallow' ? frame : 0;
  const v = variantOf(x, y);
  return cached(`g:${id}:${v}:${anim}`, () => make((g) => painter(g, v, anim)));
}

export function getTop(id, x, y, frame) {
  const painter = TOP[id];
  if (!painter) return null;
  const anim = ANIMATED_TOP.has(id) ? frame : 0;
  const v = variantOf(x, y);
  return cached(`t:${id}:${v}:${anim}`, () => make((g) => painter(g, v, anim)));
}

// ------------------------------------------------------------------ people
function paintPerson(g, dir, frame, pal) {
  const { skin, hair, shirt, pants, shoes = '#2b2b33', hat = false, hatColor = '#c98b3a', scarf = null, beard = null, glasses = false } = pal;
  const ink = '#2a2a33';

  if (pal.ghost) {
    g.globalAlpha = 0.88;
    disc(g, shirt, 8, 6, 5);
    px(g, shirt, 3, 6, 10, 7);
    for (let x = 3; x < 13; x++) px(g, shirt, x, 13, 1, x % 2 ? 2 : 1);
    px(g, '#ffffff', 5, 3, 2, 1);
    px(g, ink, 6, 5, 1, 2);
    px(g, ink, 9, 5, 1, 2);
    px(g, ink, 7, 9, 2, 1);
    if (hat) {
      px(g, hatColor, 5, 0, 6, 2);
      px(g, hatColor, 4, 2, 8, 1);
    }
    g.globalAlpha = 1;
    return;
  }

  const L1 = frame === 1 ? 2 : 3;
  const L2 = frame === 3 ? 2 : 3;
  const armA = frame === 1 ? 1 : 0;
  const armB = frame === 3 ? 1 : 0;
  shadow(g, 3, 14, 10, 2);

  if (dir === 'down' || dir === 'up') {
    px(g, pants, 5, 12, 3, L1);
    px(g, pants, 8, 12, 3, L2);
    px(g, shoes, 5, 12 + L1, 3, 1);
    px(g, shoes, 8, 12 + L2, 3, 1);
    px(g, shirt, 5, 8, 6, 4);
    px(g, shirt, 4, 8 + armA, 1, 3);
    px(g, shirt, 11, 8 + armB, 1, 3);
    px(g, skin, 4, 11 + armA, 1, 1);
    px(g, skin, 11, 11 + armB, 1, 1);
    if (scarf) px(g, scarf, 5, 8, 6, 1);
    if (dir === 'up') {
      px(g, hair, 5, hat ? 3 : 1, 6, hat ? 5 : 7);
      px(g, skin, 5, 7, 6, 1);
    } else {
      px(g, skin, 5, 4, 6, 4);
      px(g, hair, 5, hat ? 3 : 1, 6, hat ? 1 : 3);
      if (!hat) {
        px(g, hair, 5, 4, 1, 2);
        px(g, hair, 10, 4, 1, 2);
      }
      px(g, ink, 6, 5, 1, 1);
      px(g, ink, 9, 5, 1, 1);
      if (glasses) {
        px(g, ink, 5, 5, 6, 1);
        px(g, '#cfe8ff', 7, 5, 2, 1);
      }
      if (beard) {
        px(g, beard, 6, 7, 4, 1);
        px(g, beard, 5, 6, 1, 1);
        px(g, beard, 10, 6, 1, 1);
      }
    }
  } else {
    const right = dir === 'right';
    px(g, pants, 6, 12, 2, L1);
    px(g, pants, 8, 12, 2, L2);
    px(g, shoes, right ? 6 : 5, 12 + L1, 3, 1);
    px(g, shoes, right ? 8 : 7, 12 + L2, 3, 1);
    px(g, shirt, 5, 8, 6, 4);
    px(g, '#00000022', 5, 8, 6, 1);
    px(g, shirt, 7, 8 + armA, 2, 3);
    px(g, skin, 7, 11 + armA, 2, 1);
    if (scarf) px(g, scarf, 5, 8, 6, 1);
    px(g, skin, right ? 7 : 5, 4, 4, 4);
    px(g, hair, 5, hat ? 3 : 1, 6, hat ? 1 : 3);
    px(g, hair, right ? 5 : 8, 3, 3, 4);
    px(g, ink, right ? 9 : 6, 5, 1, 1);
    if (glasses) px(g, ink, right ? 8 : 5, 5, 3, 1);
    if (beard) px(g, beard, right ? 8 : 5, 7, 3, 1);
  }

  // Accessories share the sprite's position, facing and animation frame.
  if (pal.backpack) {
    const color=pal.backpack;
    if (dir === 'up') {
      px(g, ink, 4, 7, 8, 6);
      px(g, color, 5, 7, 6, 5);
      px(g, '#ffffff44', 6, 8, 4, 1);
      px(g, '#00000033', 6, 10, 4, 2);
    } else if (dir === 'down') {
      // The pack is behind the torso; only its shoulder straps face the camera.
      px(g, color, 5, 8, 1, 4);
      px(g, color, 10, 8, 1, 4);
    } else {
      const x=dir === 'right'?3:10;
      px(g, ink, x, 7, 3, 6);
      px(g, color, x, 8, 3, 4);
      px(g, '#ffffff44', x, 8, 2, 1);
    }
  }

  if (hat) {
    px(g, hatColor, 5, 0, 6, 2);
    px(g, hatColor, dir === 'right' ? 5 : 4, 2, dir === 'down' || dir === 'up' ? 8 : 7, 1);
    px(g, 'rgba(255,255,255,0.25)', 5, 0, 6, 1);
  }
}

export function getPerson(pal, dir, frame) {
  return cached(`p:${JSON.stringify(pal)}:${dir}:${frame}`, () => make((g) => paintPerson(g, dir, frame, pal)));
}

// ------------------------------------------------------------------ world objects
function symbol(g, name, color, cx, cy) {
  switch (name) {
    case 'sun':
      disc(g, color, cx, cy, 2);
      for (const [dx, dy] of [[0, -4], [0, 4], [-4, 0], [4, 0], [-3, -3], [3, -3], [-3, 3], [3, 3]]) px(g, color, cx + dx, cy + dy);
      break;
    case 'moon':
      disc(g, color, cx, cy, 3);
      disc(g, '#8f8672', cx + 2, cy - 1, 3);
      break;
    case 'star':
      px(g, color, cx, cy - 3, 1, 7);
      px(g, color, cx - 3, cy, 7, 1);
      px(g, color, cx - 1, cy - 1, 3, 3);
      px(g, color, cx - 2, cy - 2);
      px(g, color, cx + 2, cy - 2);
      px(g, color, cx - 2, cy + 2);
      px(g, color, cx + 2, cy + 2);
      break;
    case 'wave':
      for (let i = -3; i <= 3; i++) px(g, color, cx + i, cy + (Math.abs(i) % 2 === 0 ? -1 : 1));
      for (let i = -3; i <= 3; i++) px(g, color, cx + i, cy + (Math.abs(i) % 2 === 0 ? 1 : 3));
      break;
    default:
      break;
  }
}

const OBJECTS = {
  chest(g) {
    shadow(g, 1, 14, 14, 2);
    px(g, '#5a3a1a', 2, 4, 12, 11);
    px(g, '#8a5a2a', 3, 8, 10, 6);
    px(g, '#b98b4f', 3, 5, 10, 3);
    px(g, '#d4a868', 3, 5, 10, 1);
    px(g, '#5a5f6a', 5, 5, 1, 9);
    px(g, '#5a5f6a', 10, 5, 1, 9);
    px(g, '#f2c14e', 7, 8, 2, 3);
    px(g, '#b8862b', 7, 10, 2, 1);
  },
  chestOpen(g) {
    shadow(g, 1, 14, 14, 2);
    px(g, '#8a5a2a', 2, 2, 12, 3);
    px(g, '#b98b4f', 3, 2, 10, 1);
    px(g, '#5a3a1a', 2, 6, 12, 9);
    px(g, '#2a1a0a', 3, 6, 10, 3);
    px(g, '#f2c14e', 5, 7, 2, 1);
    px(g, '#f2c14e', 9, 7, 3, 1);
    px(g, '#8a5a2a', 3, 9, 10, 5);
    px(g, '#5a5f6a', 5, 9, 1, 5);
    px(g, '#5a5f6a', 10, 9, 1, 5);
  },
  mound(g) {
    px(g, 'rgba(0,0,0,0.2)', 2, 13, 12, 2);
    disc(g, '#7a5a2e', 8, 11, 5);
    px(g, '#7a5a2e', 3, 11, 10, 3);
    disc(g, '#98773f', 7, 10, 3);
    px(g, '#b8975a', 5, 8, 3, 1);
    line(g, '#4a2f12', 6, 9, 10, 13);
    line(g, '#4a2f12', 10, 9, 6, 13);
  },
  hole(g) {
    px(g, 'rgba(0,0,0,0.15)', 2, 13, 12, 2);
    px(g, '#7a5a2e', 3, 9, 10, 5);
    px(g, '#2a1a0a', 4, 10, 8, 3);
    px(g, '#98773f', 3, 9, 10, 1);
  },
  vase(g) {
    shadow(g, 3, 14, 10, 2);
    disc(g, '#3f8fe8', 8, 10, 4);
    px(g, '#3f8fe8', 7, 3, 2, 4);
    px(g, '#8fc4ff', 6, 3, 4, 1);
    px(g, '#ffffff', 5, 9, 6, 1);
    px(g, '#1f5fb8', 5, 12, 6, 1);
    px(g, '#8fc4ff', 6, 8, 1, 2);
  },
  drawer(g) {
    shadow(g, 1, 14, 14, 2);
    px(g, '#5a3a1a', 2, 3, 12, 12);
    px(g, '#a9743b', 2, 3, 12, 3);
    px(g, '#c99a5c', 2, 3, 12, 1);
    px(g, '#8a5a2a', 3, 7, 10, 3);
    px(g, '#8a5a2a', 3, 11, 10, 3);
    px(g, '#f2c14e', 7, 8, 2, 1);
    px(g, '#f2c14e', 7, 12, 2, 1);
  },
  sack(g) {
    shadow(g, 3, 14, 10, 2);
    disc(g, '#c9a86a', 8, 10, 5);
    px(g, '#c9a86a', 6, 4, 4, 4);
    px(g, '#8a6a3a', 5, 5, 6, 1);
    px(g, '#a88a4a', 9, 9, 1, 4);
    px(g, '#e0c88a', 5, 8, 2, 1);
  },
  box(g) {
    shadow(g, 2, 14, 12, 2);
    px(g, '#8a6634', 2, 5, 12, 10);
    px(g, '#b98b4f', 3, 7, 10, 7);
    px(g, '#d4a868', 2, 5, 12, 3);
    px(g, '#e8d29a', 7, 5, 2, 9);
  },
  board(g) {
    shadow(g, 2, 14, 12, 1);
    px(g, '#7a4a25', 2, 8, 2, 7);
    px(g, '#7a4a25', 12, 8, 2, 7);
    px(g, '#5a3a1a', 1, 1, 14, 9);
    px(g, '#c99a5c', 2, 2, 12, 7);
    px(g, '#ffffff', 3, 3, 4, 4);
    px(g, '#f2e08a', 9, 3, 4, 3);
    px(g, '#f5c0c0', 7, 6, 5, 2);
    px(g, '#c2453b', 4, 2, 1, 1);
  },
  note(g) {
    px(g, 'rgba(0,0,0,0.18)', 4, 13, 9, 1);
    px(g, '#b89a5a', 3, 5, 10, 8);
    px(g, '#f3e3b6', 4, 6, 8, 6);
    px(g, '#8a6a3a', 5, 7, 6, 1);
    px(g, '#8a6a3a', 5, 9, 4, 1);
    px(g, '#ffffff', 12, 4, 1, 1);
  },
  exhibit(g) {
    shadow(g, 2, 14, 12, 2);
    px(g, '#b9b2a0', 3, 9, 10, 6);
    px(g, '#d6cfb8', 3, 9, 10, 1);
    px(g, '#bfe6f5', 4, 2, 8, 8);
    px(g, '#e8f8ff', 5, 3, 1, 5);
    px(g, '#5a5a62', 4, 2, 8, 1);
    disc(g, '#f2c14e', 8, 6, 2);
    px(g, '#fff3b8', 7, 5, 1, 1);
  },
  mural(g) {
    px(g, '#8b7d78', 0, 0, 16, 16);
    px(g, '#c9a24a', 2, 2, 12, 12);
    px(g, '#7fbfe8', 3, 3, 10, 6);
    px(g, '#5cbf5f', 3, 9, 10, 4);
    disc(g, '#ffd86b', 6, 6, 2);
    px(g, '#ffffff', 9, 4, 3, 1);
    px(g, '#3f6fbf', 3, 11, 10, 1);
  },
  monument(g) {
    shadow(g, 2, 14, 12, 2);
    px(g, '#b8862b', 3, 12, 10, 3);
    px(g, '#f2c14e', 6, 3, 4, 9);
    px(g, '#fff3b8', 6, 3, 1, 9);
    px(g, '#b8862b', 9, 3, 1, 9);
    px(g, '#f2c14e', 7, 1, 2, 2);
    px(g, '#fff3b8', 7, 0, 1, 1);
  },
  boat(g) {
    px(g, 'rgba(0,0,0,0.2)', 1, 11, 14, 3);
    px(g, '#8a5a2a', 1, 4, 14, 8);
    px(g, '#b98b4f', 2, 5, 12, 6);
    px(g, '#3f6fbf', 2, 8, 12, 1);
    px(g, '#8a5a2a', 7, 5, 2, 6);
    px(g, '#f5f0e6', 13, 6, 1, 1);
  },
};

export function getObject(name, opt = {}) {
  if (name === 'lever') {
    const { color = '#e2574c', on = false } = opt;
    return cached(`o:lever:${color}:${on}`, () =>
      make((g) => {
        shadow(g, 2, 14, 12, 1);
        px(g, '#4a4f5a', 3, 10, 10, 5);
        px(g, '#7a808c', 3, 10, 10, 1);
        px(g, '#1a1a22', 6, 9, 4, 2);
        if (on) {
          line(g, '#cfd4de', 8, 10, 11, 3);
          disc(g, color, 11, 3, 2);
          px(g, '#ffffff', 10, 2);
        } else {
          line(g, '#8a90a0', 8, 10, 5, 3);
          disc(g, color, 5, 3, 2);
        }
      })
    );
  }
  if (name === 'plate') {
    const { symbol: sym = 'sun', on = false } = opt;
    return cached(`o:plate:${sym}:${on}`, () =>
      make((g) => {
        px(g, '#5f5236', 2, 3, 12, 12);
        px(g, on ? '#a89f88' : '#8f8672', 3, 4, 10, 10);
        px(g, on ? '#c4b98c' : '#a89f88', 3, 4, 10, 1);
        if (on) px(g, 'rgba(255,216,107,0.35)', 3, 4, 10, 10);
        symbol(g, sym, on ? '#ffd86b' : '#4a4030', 8, 9);
      })
    );
  }
  if (name === 'portal') {
    const f = opt.frame || 0;
    return cached(`o:portal:${f}`, () =>
      make((g) => {
        disc(g, '#b8862b', 8, 8, 8);
        disc(g, '#f2c14e', 8, 8, 7);
        disc(g, '#2a1a5a', 8, 8, 5);
        disc(g, '#5a3ac8', 8, 8, 4);
        disc(g, '#8f7af0', 8 + (f % 2), 8 - (f > 1 ? 1 : 0), 2);
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + f * 0.8;
          px(g, '#ffffff', Math.round(8 + Math.cos(a) * 3.4), Math.round(8 + Math.sin(a) * 3.4));
        }
      })
    );
  }
  const painter = OBJECTS[name] || TOP[name];
  if (!painter) return null;
  return cached(`o:${name}`, () => make((g) => painter(g, 0, 0)));
}

// Pickups lying on the ground (drawn small, with glints added by the renderer).
export function getPickup(kind) {
  return cached(`pk:${kind}`, () =>
    make(
      (g) => {
        if (kind === 'note') {
          px(g, '#2f7a4a', 0, 1, 10, 6);
          px(g, '#62d26f', 1, 2, 8, 4);
          disc(g, '#2f7a4a', 5, 4, 1);
          px(g, '#b8f0c0', 2, 2, 2, 1);
        } else if (kind === 'item') {
          px(g, '#c9a86a', 1, 2, 6, 5);
          px(g, '#8a6a3a', 2, 1, 4, 1);
          px(g, '#e0c88a', 2, 3, 2, 1);
        } else {
          disc(g, '#b8862b', 4, 4, 3);
          disc(g, '#f2c14e', 4, 4, 2);
          px(g, '#fff3b8', 3, 3, 1, 1);
        }
      },
      10,
      8
    )
  );
}

export const TILE_SIZE = S;
