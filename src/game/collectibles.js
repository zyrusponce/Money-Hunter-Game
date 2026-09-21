// Collectible spots in the world: visible pickups, hidden search spots, buried money,
// chests and containers, plus refilling vending machines / lost-and-found boxes.
import { CURRENCIES } from '../data/currencies.js';
import { checkCond } from './conditions.js';
import { pickUndiscovered } from './progression.js';
import { audio } from './audio.js';

export const SOLID_LOOKS = new Set(['chest', 'crate', 'barrel', 'vase', 'drawer', 'sack', 'box', 'vending']);

export const NEED_TEXT = {
  shovel: 'Something is buried here! You will need a shovel to dig it up.',
  flashlight: 'It is far too dark to search here. A flashlight would help.',
};

export function defaultVerb(c) {
  if (c.verb) return c.verb;
  switch (c.look) {
    case 'sparkle':
      return 'collect';
    case 'mound':
      return 'dig';
    case 'chest':
      return 'open';
    case 'vending':
      return 'use';
    case 'none':
      return c.requires === 'shovel' ? 'dig' : 'search';
    default:
      return 'search';
  }
}

export const isSolidCollectible = (c) => (c.solid !== undefined ? c.solid : SOLID_LOOKS.has(c.look));

// True when the spot has nothing left to give right now.
export function isSpent(game, c) {
  if (c.random) return (game.s.cooldowns[c.id] || 0) > game.s.stats.playtime;
  return !!game.s.collected[c.id];
}

// Visible sprite? (a buried mound can be hidden until you own the treasure map)
export const isShown = (game, c) => checkCond(game.s, c.visibleWhen);

export function collect(game, c) {
  const { s, rt } = game;
  const cx = c.x * 16 + 8;
  const cy = c.y * 16 + 8;

  if (isSpent(game, c)) {
    game.say(c.random ? 'Nothing new here right now. Check back a little later!' : 'There is nothing left here.');
    return;
  }
  if (c.requires && !s.items[c.requires]) {
    audio.sfx('error');
    game.say(NEED_TEXT[c.requires] || 'You need the right tool for this.');
    return;
  }

  s.stats.searches += 1;

  if (c.random) {
    s.cooldowns[c.id] = s.stats.playtime + c.random.cooldown;
    const area = rt.map.data.area;
    const all = CURRENCIES.filter((x) => x.rarity === c.random.pool && x.location === area);
    if (!all.length) {
      game.say('Empty. Nothing but lint.');
      return;
    }
    const fresh = pickUndiscovered(s, [c.random.pool], game.rnd, area);
    const pick = fresh && game.rnd() < 0.55 ? fresh : all[Math.floor(game.rnd() * all.length)];
    audio.sfx('open');
    game.burst(cx, cy, '#f2c14e', 10);
    game.discover(pick.id, { source: c.id });
    return;
  }

  s.collected[c.id] = true;
  const dig = c.requires === 'shovel' || c.look === 'mound';
  audio.sfx(c.look === 'chest' ? 'open' : dig ? 'dig' : 'pickup');
  game.burst(cx, cy, dig ? '#8a6a3a' : '#f2c14e', dig ? 14 : 8);
  if (c.currency) game.discover(c.currency, { source: c.id });
  else if (c.item) game.giveItem(c.item);
  game.touch();
}
