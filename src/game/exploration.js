import { LOCATIONS, LOCATION_LIST } from '../data/locations.js';
import { TILES } from '../data/tiles.js';
import { QUEST_LIST } from '../data/quests.js';
import { checkCond } from './conditions.js';
import { completionPercent } from './progression.js';
import { hasLineOfSight } from './collisions.js';
const cache=new Map();
export function eligibleCells(id) {
  if(cache.has(id)) return cache.get(id);
  const m=LOCATIONS[id], passable=new Set(), visited=new Set();
  if(!m) return visited;
  const barriers=new Set(m.barriers.flatMap(b=>[[b.x,b.y],...(b.tiles||[])]).map(([x,y])=>y*m.width+x));
  const occupied=new Set([...m.npcs,...m.objects.filter(o=>o.solid!==false&&!['note','plate','portal'].includes(o.look)),...m.collectibles.filter(c=>c.solid!==false&&['chest','crate','barrel','vase','drawer','sack','box','vending'].includes(c.look))].map(o=>o.y*m.width+o.x));
  for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++) {
    const i=y*m.width+x;
    if(!occupied.has(i)&&(barriers.has(i)||(!TILES[m.ground[y][x]]?.solid&&!TILES[m.top[y][x]]?.solid))) passable.add(i);
  }
  const queue=Object.values(m.spawns).map(sp=>sp.y*m.width+sp.x).filter(i=>passable.has(i));
  for(let head=0;head<queue.length;head++) {
    const i=queue[head]; if(visited.has(i))continue; visited.add(i);
    const x=i%m.width,y=Math.floor(i/m.width);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx=x+dx,ny=y+dy,j=ny*m.width+nx;
      if(nx>=0&&ny>=0&&nx<m.width&&ny<m.height&&passable.has(j)&&!visited.has(j)) queue.push(j);
    }
  }
  cache.set(id,visited); return visited;
}
export function revealAround(s,id,x,y,radius,rt=null) {
  const m=LOCATIONS[id],eligible=eligibleCells(id),cells=new Set(s.progression.explored[id]||[]),before=cells.size;
  const tx=Math.floor(x/16),ty=Math.floor((y-3)/16);
  for(let yy=ty-radius;yy<=ty+radius;yy++)for(let xx=tx-radius;xx<=tx+radius;xx++) {
    if(Math.hypot(xx-tx,yy-ty)>radius) continue;
    const i=yy*m.width+xx;
    if(xx>=0&&xx<m.width&&yy>=0&&yy<m.height&&eligible.has(i)&&(!rt||hasLineOfSight(rt,x,y-6,xx*16+8,yy*16+8,xx,yy))) cells.add(i);
  }
  if(cells.size!==before)s.progression.explored[id]=[...cells].sort((a,b)=>a-b);
  return cells.size-before;
}
const tally=(list,fn)=>({count:list.filter(fn).length,total:list.length});
export function areaProgress(s,id) {
  const m=LOCATIONS[id],eligible=eligibleCells(id);
  const quests=QUEST_LIST.filter(q=>(q.area||q.objectives.find(o=>o.where)?.where)===id);
  const categories={
    currencies:tally(m.collectibles.filter(c=>c.currency&&!c.random),c=>!!s.collected[c.id]),
    chests:tally(m.collectibles.filter(c=>c.look==='chest'),c=>!!s.collected[c.id]),
    secrets:tally([...m.collectibles.filter(c=>c.secret).map(c=>({key:c.id,type:'collected'})),...m.barriers.filter(b=>/secret|hidden|bush|crack/i.test(`${b.look} ${b.hint} ${b.openText}`)).map(b=>({key:`b:${id}:${b.id}`,type:'flags'}))],c=>!!s[c.type][c.key]),
    quests:tally(quests,q=>!!s.quests.done[q.id]),
    exploration:{count:new Set((s.progression.explored[id]||[]).filter(i=>eligible.has(i))).size,total:eligible.size},
  };
  const applicable=Object.values(categories).filter(c=>c.total>0),mastered=applicable.every(c=>c.count===c.total);
  return {...categories,percent:mastered?100:Math.min(99,Math.floor(applicable.reduce((sum,c)=>sum+c.count/c.total,0)/applicable.length*100)),mastered};
}
export function worldProgress(s) {
  let count=0,total=0;
  for(const m of LOCATION_LIST) { const eligible=eligibleCells(m.id); total+=eligible.size; count+=new Set((s.progression.explored[m.id]||[]).filter(i=>eligible.has(i))).size; }
  return {count,total,percent:total?Math.floor(count/total*100):0};
}
export function canFastTravel(s,id) {
  const loc=LOCATIONS[id];
  if(!loc||!s.visited[id]) return {ok:false,reason:'Discover this location on foot first.'};
  if(id==='island'&&!s.items.boat_pass)return {ok:false,reason:'You need the Boat Pass to travel to Coral Isle.'};
  if(completionPercent(s)<loc.unlockRequirement) return {ok:false,reason:`Requires ${loc.unlockRequirement}% encyclopedia completion.`};
  const routes=LOCATION_LIST.flatMap(m=>m.exits).filter(ex=>ex.to===id);
  if(routes.length&&!routes.some(ex=>checkCond(s,ex.requires)))return {ok:false,reason:'You still need the key, pass or tool for this journey.'};
  return {ok:true};
}
