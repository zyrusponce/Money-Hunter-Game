import { useState } from 'react';
import Modal from './Modal.jsx';
import ProgressBar from './ProgressBar.jsx';
export default function AchievementGallery({snapshot,onClose}) {
  const [category,setCategory]=useState('All');
  return <Modal title="Achievement Gallery" onClose={onClose} wide><p className="menu-intro">Little firsts and remarkable adventures. {snapshot.achievements.filter(a=>a.unlocked).length} / {snapshot.achievements.length} earned.</p><div className="tabs">{['All','Exploration','Collection','Quests','Treasure','Secrets','Completion'].map(c=><button className={`chip ${category===c?'on':''}`} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="card-grid">{snapshot.achievements.filter(a=>category==='All'||a.category===category).map(a=><article key={a.id} className={`journal-card ${a.unlocked?'earned':''}`}><span className="item-symbol">{a.unlocked?'✦':'◇'}</span><small>{a.category} · {a.unlocked?'Unlocked':'Locked'}</small><h3>{a.name}</h3><p>{a.description}</p>{(!a.secret||a.unlocked)&&<ProgressBar label="Progress" value={a.progress} total={a.total}/>}<span className="reward-preview">+{a.reward.coins} coins · +{a.reward.xp} XP · Badge & title</span></article>)}</div></Modal>;
}
