import { CURRENCIES } from './currencies.js';
import { LOCATIONS } from './locations.js';
const found=s=>CURRENCIES.filter(c=>s.discovered[c.id]);
const a=(id,name,category,description,total,count,coins=100,secret=false)=>({id,name,category,description,total,count,secret,reward:{coins,xp:50,badges:[id],titles:[id]}});
export const ACHIEVEMENTS = [
  a('first_discovery','First Discovery','Collection','Discover your first currency.',1,s=>found(s).length,50),
  a('beginner_collector','Beginner Collector','Collection','Discover 10 currencies.',10,s=>found(s).length),
  a('world_traveler','World Traveler','Exploration','Discover money from 10 countries.',10,s=>new Set(found(s).map(c=>c.origin)).size,200),
  a('treasure_hunter','Treasure Hunter','Treasure','Open 20 treasure chests.',20,s=>s.stats.chestsOpened,250),
  a('rare_collector','Rare Collector','Collection','Discover 10 Rare currencies.',10,s=>found(s).filter(c=>c.rarity==='Rare').length,200),
  a('epic_discovery','Epic Discovery','Collection','Find an Epic currency.',1,s=>found(s).filter(c=>c.rarity==='Epic').length,150),
  a('legendary_hunter','Legendary Hunter','Collection','Find a Legendary currency.',1,s=>found(s).filter(c=>c.rarity==='Legendary').length,300),
  a('secret_explorer','Explorer','Secrets','Find 10 hidden caches or secret passages.',10,s=>s.stats.secretsFound,250,true),
  a('master_explorer','Master Explorer','Exploration','Visit every location.',Object.keys(LOCATIONS).length,s=>Object.keys(s.visited).filter(id=>LOCATIONS[id]).length,500),
  a('helping_hand','Helping Hand','Quests','Complete 5 quests.',5,s=>Object.keys(s.quests.done).length,200),
  a('area_master','Area Master','Completion','Master an area.',1,s=>Object.keys(s.progression.mastered).length,300),
  a('encyclopedia_master','Encyclopedia Master','Completion','Discover every currency.',CURRENCIES.length,s=>found(s).length,1000),
];
