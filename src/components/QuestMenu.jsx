import { useState } from 'react';
import Modal from './Modal.jsx';
import { LOCATIONS } from '../data/locations.js';
export default function QuestMenu({snapshot:s,onClose,onTrack}) {
 const [tab,setTab]=useState('active');
 const all=[...s.quests.active,...s.quests.done];
 const list=tab==='active'?s.quests.active:tab==='completed'?s.quests.done:all.filter(q=>q.kind===tab);
 return <Modal title="Quest Journal" onClose={onClose} wide><div className="tabs">{[['active','Active'],['completed','Completed'],['story','Story'],['side','Side Quests']].map(([id,label])=><button key={id} className={`chip ${tab===id?'on':''}`} onClick={()=>setTab(id)}>{label}</button>)}</div>{!list.length&&<div className="empty-state"><span>◇</span><h3>{tab==='active'?'No Active Quests':'Stories are waiting'}</h3><p>Explore the world and talk to people to discover new adventures.</p></div>}<div className="quest-grid">{list.map(q=><article className="journal-card quest-card" key={q.id}><span className="eyebrow">{q.kind==='story'?'STORY':'SIDE QUEST'} · {q.status==='done'?'✓ Completed':q.status==='ready'?'Ready to turn in':'In progress'}</span><h3>{q.name}</h3><p>{q.summary}</p><ul className="objective-list">{q.objectives.map(o=><li key={o.id} className={o.complete?'done':''}><span>{o.complete?'✓':'○'}</span><div>{o.text}{o.where&&<small>{LOCATIONS[o.where]?.name}</small>}</div></li>)}</ul><span className="reward-preview">Rewards: +{q.rewards.xp} XP · +{q.rewards.coins} Hunter Coins<br/>{q.rewardText}</span>{q.status!=='done'&&<button className="btn ghost small" onClick={()=>onTrack(s.progression.trackedQuest===q.id?null:q.id)}>{s.progression.trackedQuest===q.id?'✓ Tracked · Untrack':'Track quest'}</button>}</article>)}</div></Modal>;
}
