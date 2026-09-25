import Modal from './Modal.jsx';
import { SKILLS } from '../data/skills.js';
export default function SkillTree({snapshot,onClose,onCommand}) {
  const p=snapshot.progression;
  return <Modal title="Exploration Skills" onClose={onClose} wide><div className="menu-intro"><p>Choose how you explore. Every path has something to offer.</p><strong className="coin-balance">✧ {p.upgradePoints} Upgrade Points</strong></div><div className="skill-branches">{['Explorer','Money Hunter','Treasure Hunter'].map((branch,i)=><section key={branch}><h3><span>{['◇','⌁','▣'][i]}</span> {branch}</h3>{SKILLS.filter(s=>s.branch===branch).map(skill=>{
    const unlocked=p.skills[skill.id],available=!unlocked&&(!skill.requires||p.skills[skill.requires]);
    return <article className={`skill-card ${unlocked?'unlocked':available?'available':'locked'}`} key={skill.id}><small>{unlocked?'✓ Unlocked':available?'✧ Available':'⌑ Locked'}</small><h4>{skill.name}</h4><p>{skill.description}</p><button className="btn small ghost" disabled={!available||p.upgradePoints<skill.cost} onClick={()=>onCommand('unlockSkill',skill.id)}>{unlocked?'Learned':`${skill.cost} Upgrade Point`}</button></article>;
  })}</section>)}</div></Modal>;
}
