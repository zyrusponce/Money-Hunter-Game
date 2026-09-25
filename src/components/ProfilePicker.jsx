import Modal from './Modal.jsx';
import { displayName } from '../data/rewards.js';
import { COSMETICS } from '../data/shop.js';
export default function ProfilePicker({snapshot:s,onClose,onCommand}) {
  const p=s.progression;
  return <Modal title="Badges & Appearance" onClose={onClose}>{['title','badge','outfit','backpack','detector'].map(slot=>{
    const ids=slot==='title'?Object.keys(p.titles):slot==='badge'?Object.keys(p.badges):['default',...Object.keys(p.cosmetics).filter(id=>COSMETICS[id]?.slot===slot)];
    return <section className="profile-section" key={slot}><h3>{displayName(slot)}</h3>{!ids.length&&<p className="muted">Explore and complete achievements to earn your first badge.</p>}<div className="profile-options">{ids.map(id=><button key={id} className={`chip ${p.equipped[slot]===id?'on':''}`} onClick={()=>onCommand('equip',slot,id)}>{p.equipped[slot]===id?'✓ ':''}{displayName(id)}</button>)}</div></section>;
  })}</Modal>;
}
