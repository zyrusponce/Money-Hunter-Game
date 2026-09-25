import { CURRENCIES } from './currencies.js';
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'_');
const set = (id,name,entries) => ({id,name,ids:entries.map(c=>c.id),reward:{xp:Math.min(500,entries.length*60),coins:Math.min(500,entries.length*60),...(entries.length>=8?{cosmetics:['collection_outfit']} : {}),badges:[`collection_${id}`]}});
export const COLLECTIONS = [
  ...[...new Set(CURRENCIES.map(c=>c.origin))].map(country=>set(slug(country),`${country} Collection`,CURRENCIES.filter(c=>c.origin===country))),
  set('asia','Asian Currency Collection',CURRENCIES.filter(c=>['Philippines','Japan','China','South Korea','Singapore','Thailand','India','Indonesia','Malaysia','Vietnam'].includes(c.origin))),
  set('europe','European Collection',CURRENCIES.filter(c=>['United Kingdom','Europe','Eurozone','France','Germany','Italy','Spain','Greece','Rome'].includes(c.origin))),
  set('historical','Historical Currency',CURRENCIES.filter(c=>/Historical|Old|Ancient/.test(c.category))),
  set('ancient','Ancient Coins',CURRENCIES.filter(c=>c.category==='Ancient')),
].filter(c=>c.ids.length>0);
