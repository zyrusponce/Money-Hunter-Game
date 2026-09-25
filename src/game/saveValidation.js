import { LOCATIONS } from '../data/locations.js';
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { ITEMS } from '../data/items.js';
import { QUESTS } from '../data/quests.js';
import { SKILLS } from '../data/skills.js';
import { SHOP, COSMETICS } from '../data/shop.js';
const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const nonnegative = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;
export function validateSave(raw) {
  if (!record(raw)) return { ok: false, reason: 'corrupt' };
  if (Number.isInteger(raw.version) && raw.version > 2) return { ok: false, reason: 'unsupported' };
  if (![1,2].includes(raw.version) || !Object.hasOwn(LOCATIONS,raw.map)) return { ok: false, reason: 'corrupt' };
  for (const k of ['discovered','duplicates','items','flags','collected','cooldowns','visited','notified','claimed','stats','quests']) {
    if (raw[k] !== undefined && !record(raw[k])) return { ok: false, reason: 'corrupt' };
  }
  for (const k of ['x','y']) if (raw[k] !== undefined && !nonnegative(raw[k])) return { ok: false, reason: 'corrupt' };
  if(raw.x>=LOCATIONS[raw.map].width*16||raw.y>=LOCATIONS[raw.map].height*16)return {ok:false,reason:'corrupt'};
  if (Object.entries(raw.discovered || {}).some(([id,v]) => !Object.hasOwn(CURRENCY_BY_ID,id)||v!==true)) return { ok: false, reason: 'corrupt' };
  if(Object.entries(raw.items||{}).some(([id,v])=>!Object.hasOwn(ITEMS,id)||v!==true))return {ok:false,reason:'corrupt'};
  if(Object.entries(raw.visited||{}).some(([id,v])=>!Object.hasOwn(LOCATIONS,id)||v!==true))return {ok:false,reason:'corrupt'};
  for(const key of ['flags','collected','notified','claimed'])if(Object.values(raw[key]||{}).some(v=>typeof v!=='boolean'))return {ok:false,reason:'corrupt'};
  if (Object.entries(raw.duplicates || {}).some(([id,n]) => !CURRENCY_BY_ID[id] || !Number.isSafeInteger(n) || n < 0)) return { ok:false, reason:'corrupt' };
  for (const k of ['active','done']) if (raw.quests?.[k] !== undefined && !record(raw.quests[k])) return { ok:false, reason:'corrupt' };
  for(const [id,v] of Object.entries(raw.quests?.active||{}))if(!Object.hasOwn(QUESTS,id)||!record(v)||!nonnegative(v.startedAt))return {ok:false,reason:'corrupt'};
  for(const [id,v] of Object.entries(raw.quests?.done||{}))if(!Object.hasOwn(QUESTS,id)||v!==true)return {ok:false,reason:'corrupt'};
  if (Object.values(raw.stats || {}).some(n => !nonnegative(n))) return { ok:false, reason:'corrupt' };
  if (raw.complete !== undefined && typeof raw.complete !== 'boolean') return {ok:false,reason:'corrupt'};
  if (Object.values(raw.cooldowns || {}).some(n => !nonnegative(n))) return {ok:false,reason:'corrupt'};
  if (raw.version === 2 || raw.progression !== undefined) {
    const p = raw.progression;
    if (!record(p)) return { ok:false, reason:'corrupt' };
    for (const k of ['xp','coins','coinsEarned','upgradePoints','streak','streakCycle']) if (!Number.isSafeInteger(p[k]) || p[k] < 0 || p[k] > 100000000) return { ok:false, reason:'corrupt' };
    for (const k of ['claims','skills','purchases','cosmetics','badges','titles','equipped','explored','chests','mastered','friendship','events']) if (!record(p[k])) return { ok:false, reason:'corrupt' };
    if(p.streak>9)return {ok:false,reason:'corrupt'};
    for(const key of ['claims','skills','purchases','cosmetics','badges','titles','chests','mastered'])if(Object.values(p[key]).some(v=>v!==true))return {ok:false,reason:'corrupt'};
    if(Object.keys(p.skills).some(id=>!SKILLS.some(k=>k.id===id))||Object.keys(p.purchases).some(id=>!SHOP.some(i=>i.id===id)))return {ok:false,reason:'corrupt'};
    if(Object.entries(p.friendship).some(([id,n])=>!['money_collector','dr_reyes','sailor_sam'].includes(id)||!Number.isInteger(n)||n<0||n>5))return {ok:false,reason:'corrupt'};
    if(Object.entries(p.events).some(([id,e])=>!['collector','rare_signal','research'].includes(id)||!record(e)||!['active','done'].includes(e.status)||!Object.hasOwn(LOCATIONS,e.area)))return {ok:false,reason:'corrupt'};
    for(const slot of ['outfit','backpack','detector']){const id=p.equipped[slot];if(id!=='default'&&(!p.cosmetics[id]||COSMETICS[id]?.slot!==slot))return {ok:false,reason:'corrupt'};}
    if(p.equipped.badge&&!p.badges[p.equipped.badge])return {ok:false,reason:'corrupt'};
    if(!p.titles[p.equipped.title]||!Object.hasOwn(ITEMS,p.tool))return {ok:false,reason:'corrupt'};
    if (Object.entries(p.explored).some(([id,cells]) => !LOCATIONS[id] || !Array.isArray(cells) || cells.some(n => !Number.isInteger(n) || n < 0 || n >= LOCATIONS[id].width * LOCATIONS[id].height))) return { ok:false, reason:'corrupt' };
  }
  return { ok:true };
}
