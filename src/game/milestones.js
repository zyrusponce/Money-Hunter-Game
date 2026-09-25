import { COLLECTIONS } from '../data/collections.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { grantReward } from './rewards.js';
import { completionPercent } from './progression.js';
import { areaProgress, worldProgress } from './exploration.js';
import { LOCATION_LIST } from '../data/locations.js';
export const collectionViews=s=>COLLECTIONS.map(c=>{
  const count=c.ids.filter(id=>s.discovered[id]).length,total=c.ids.length;
  return {...c,count,total,percent:Math.floor(count/total*100),complete:count===total};
});
export const achievementViews=s=>ACHIEVEMENTS.map(a=>{
  const progress=Math.min(a.total,a.count(s)||0),unlocked=!!s.progression.claims[`achievement:${a.id}`];
  return {...a,count:undefined,progress,unlocked,name:a.secret&&!unlocked?'???':a.name,description:a.secret&&!unlocked?'Look beyond the obvious paths.':a.description};
});
const MILESTONES = [
  [5,'A promising start',{coins:100}], [10,'Grand Market unlocked',{titles:['currency_collector']}],
  [25,'Whispering Forest unlocked',{cosmetics:['explorer_outfit']}], [40,'Sunny Harbor unlocked',{items:['detector2']}],
  [50,'HALFWAY THERE',{coins:1000,badges:['halfway_there'],items:['rare_treasure_map']}],
  [60,'Echo Cave unlocked',{points:1}], [75,'Ancient Ruins unlocked',{items:['legendary_detector']}],
  [90,'The Gilded Vault unlocked',{titles:['rare_money_specialist']}], [95,'Legendary Treasure Hunt unlocked',{items:['legendary_map']}],
  [100,'MONEY ENCYCLOPEDIA COMPLETE',{titles:['master_money_hunter'],cosmetics:['golden_detector','master_outfit'],badges:['encyclopedia_master']}],
];
export function evaluateMilestones(s,r) {
  for(const m of LOCATION_LIST) if(s.visited[m.id]&&!s.progression.mastered[m.id]&&areaProgress(s,m.id).mastered) {
    s.progression.mastered[m.id]=true;
    if(grantReward(s,`area_master:${m.id}`,{xp:500,coins:300,badges:[`${m.id}_master`],cosmetics:['explorer_outfit']},r)) r.milestones.push(`Area mastered: ${m.name}`);
  }
  const world=worldProgress(s).percent;
  for(const [percent,reward] of [[25,{coins:250}],[50,{cosmetics:['explorer_outfit']}],[75,{items:['treasure_radar']}],[100,{badges:['master_explorer']}]]) {
    if(world>=percent&&grantReward(s,`world:${percent}`,reward,r))r.milestones.push(`${percent}% world explored`);
  }
  for (const c of collectionViews(s)) if(c.complete&&grantReward(s,`collection:${c.id}`,c.reward,r)) {r.milestones.push(`${c.name} complete`);if(c.total>=8)r.majorCollection=c.name;}
  for (const a of ACHIEVEMENTS) if(a.count(s)>=a.total&&grantReward(s,`achievement:${a.id}`,a.reward,r)) r.milestones.push(`Achievement unlocked: ${a.name}`);
  const pct=completionPercent(s);
  for (const [percent,name,reward] of MILESTONES) if(pct>=percent&&grantReward(s,`encyclopedia:${percent}`,reward,r)) r.milestones.push(name);
}
