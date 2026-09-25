import Modal from './Modal.jsx';
import ProgressBar from './ProgressBar.jsx';
import { QUEST_LIST } from '../data/quests.js';
import { displayName } from '../data/rewards.js';
export default function ProgressMenu({snapshot:s,onClose,onOpen}) {
  const p=s.progression, secrets=Object.values(s.areas).reduce((a,v)=>({count:a.count+v.secrets.count,total:a.total+v.secrets.total}),{count:0,total:0});
  const rows=[['Money Encyclopedia',s.count,s.total,'encyclopedia'],['World Exploration',s.world.count,s.world.total,'map'],['Quests',s.quests.done.length,QUEST_LIST.length,'quests'],['Collections',s.collections.filter(c=>c.complete).length,s.collections.length,'encyclopedia'],['Achievements',s.achievements.filter(a=>a.unlocked).length,s.achievements.length,'achievements'],['Secrets',secrets.count,secrets.total,'map']];
  return <Modal title="Your Adventure" onClose={onClose} wide><div className="profile-banner"><span className="profile-emblem">{p.equipped.badge?'✦':'◇'}</span><div><span className="eyebrow">{displayName(p.equipped.title)}</span><h3>Explorer Level {s.level.level}</h3><ProgressBar label="Next level" value={s.level.current} total={s.level.required}/></div><strong className="coin-balance">◉ {p.coins.toLocaleString()}<small>Hunter Coins</small></strong></div><div className="progress-grid">{rows.map(([label,value,total,menu])=><button className="journal-card" key={label} onClick={()=>onOpen(menu)}><ProgressBar label={label} value={value} total={total}/><strong>{total?Math.floor(value/total*100):0}% <span>→</span></strong></button>)}</div><div className="row"><button className="btn ghost small" onClick={()=>onOpen('profile')}>Badges & appearance</button><button className="btn ghost small" onClick={()=>onOpen('statistics')}>Detailed statistics</button></div></Modal>;
}
