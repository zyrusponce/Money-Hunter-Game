import { SHOP, COSMETICS } from '../data/shop.js';
import { SKILLS } from '../data/skills.js';
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { DUPLICATE_VALUES } from '../data/rewards.js';
const no = reason => ({ok:false,reason});
export function purchase(s,id) {
  const item = SHOP.find(i=>i.id===id), p=s.progression;
  if (!item) return no('This item is unavailable.');
  if (p.purchases[id] || p.cosmetics[id] || (item.item && s.items[item.item])) return no('Already owned.');
  if (p.coins < item.price) return no('Keep exploring to earn more Hunter Coins.');
  p.coins -= item.price; p.purchases[id]=true;
  if (item.slot) p.cosmetics[id]=true;
  if (item.item) s.items[item.item]=true;
  return {ok:true,reason:`Purchased! ${item.name} · −${item.price} Hunter Coins`};
}
export function unlockSkill(s,id) {
  const skill=SKILLS.find(k=>k.id===id),p=s.progression;
  if (!skill||p.skills[id]) return no('Skill already learned or unavailable.');
  if (skill.requires&&!p.skills[skill.requires]) return no('Learn the previous skill first.');
  if (p.upgradePoints<skill.cost) return no('Level up to earn an Upgrade Point.');
  p.upgradePoints-=skill.cost; p.skills[id]=true;
  return {ok:true,reason:`Skill learned: ${skill.name}`};
}
export function equip(s,slot,id) {
  const p=s.progression;
  if (slot==='badge'||slot==='title') {
    if (!p[slot==='badge'?'badges':'titles'][id]) return no('Earn this first.');
  } else if (!['outfit','backpack','detector'].includes(slot) || (id!=='default' && (!p.cosmetics[id]||COSMETICS[id]?.slot!==slot))) return no('You do not own this appearance.');
  p.equipped[slot]=id; return {ok:true,reason:'Equipped'};
}
export function sellDuplicate(s,id,count=1) {
  const cur=CURRENCY_BY_ID[id];
  if (!cur||!Number.isSafeInteger(count)||count<1||(s.duplicates[id]||0)<count) return no('Choose duplicates you own.');
  const coins=DUPLICATE_VALUES[cur.rarity]*count;
  s.duplicates[id]-=count; s.progression.coins+=coins; s.progression.coinsEarned+=coins;
  return {ok:true,reason:`Sold ${count} duplicate${count===1?'':'s'} · +${coins} Hunter Coins`};
}
