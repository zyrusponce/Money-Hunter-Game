import { grantReward } from './rewards.js';
export const EVENT_DEFS=[
  {id:'collector',name:'Traveling Collector Arrived',area:'town',threshold:10,description:'Bring a spare currency to the Town collector. A useful trade awaits.',reward:{xp:100,coins:100}},
  {id:'rare_signal',name:'Rare Treasure Signal',area:'beach',threshold:20,description:'A signal echoes east of the great rocks at Sunny Beach. Search the open sand.',reward:{xp:150,coins:125}},
  {id:'research',name:'Museum Research Request',area:'museum',threshold:30,description:'The museum needs a spare Rare, Epic or Legendary currency to study.',reward:{xp:200,coins:200}},
];
export function updateWorldEvents(s) {
  const count=Object.keys(s.discovered).length;
  const fresh=[];
  for(const def of EVENT_DEFS)if(count>=def.threshold&&!s.progression.events[def.id]){
    s.progression.events[def.id]={status:'active',area:def.area};fresh.push(def);
  }
  return fresh;
}
export function resolveWorldEvent(game,id,currencyId) {
  const s=game.s,def=EVENT_DEFS.find(e=>e.id===id),event=s.progression.events[id];
  if(!def||event?.status!=='active'||s.map!==def.area)return {ok:false,reason:'Visit the request location first.'};
  if(id==='rare_signal') {
    if(!s.collected.beach_cache_2)return {ok:false,reason:'Follow the clue and search the sand first.'};
  } else {
    const c=game.currencyInfo(currencyId);
    if(!c||!(s.duplicates[currencyId]>0)||(id==='research'&&!['Rare','Epic','Legendary'].includes(c.rarity)))return {ok:false,reason:'Choose a suitable duplicate you own.'};
  }
  game.rewardAction({id:`event:${id}`,cause:def.name},r=>{
    if(id!=='rare_signal')s.duplicates[currencyId]--;
    event.status='done';grantReward(s,`event:${id}`,def.reward,r);
  });
  return {ok:true,reason:'Request completed. Thank you for exploring!'};
}
