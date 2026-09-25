import { CURRENCY_BY_ID } from '../data/currencies.js';
export const FRIENDS={money_collector:'Money Collector',dr_reyes:'Museum Curator',sailor_sam:'Sailor Sam'};
export const FRIENDSHIP_BENEFITS=['A local treasure clue','Collector requests','One fewer duplicate per trade','Explorer outfit','A Legendary location hint'];
export function friendshipView(s,id) {return {id,name:FRIENDS[id],rank:s.progression.friendship[id]||0,benefits:FRIENDSHIP_BENEFITS};}
export function giftDuplicate(s,npcId,currencyId,commandId) {
  const p=s.progression,rank=p.friendship[npcId]||0,key=`gift:${npcId}:${commandId}`;
  if(!FRIENDS[npcId]||!CURRENCY_BY_ID[currencyId]||!(s.duplicates[currencyId]>0)||!commandId||p.claims[key]||rank>=5)return {ok:false,reason:'Choose an owned duplicate for a friend below rank 5.'};
  s.duplicates[currencyId]--;p.claims[key]=true;p.friendship[npcId]=rank+1;
  if(rank+1===4)p.cosmetics.explorer_outfit=true;
  return {ok:true,reason:`Friendship increased: ${FRIENDS[npcId]} · ${rank+1}/5`};
}
export function friendshipQuest(s,npcId,questId) {
  if(!FRIENDS[npcId]||s.progression.claims[`friend_quest:${questId}`])return;
  s.progression.claims[`friend_quest:${questId}`]=true;
  s.progression.friendship[npcId]=Math.min(5,(s.progression.friendship[npcId]||0)+1);
  if(s.progression.friendship[npcId]>=4)s.progression.cosmetics.explorer_outfit=true;
}
