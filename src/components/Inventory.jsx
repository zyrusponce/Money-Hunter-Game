import { useState } from 'react';
import Modal from './Modal.jsx';
import { ITEMS } from '../data/items.js';
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { TREASURE_CLUES } from '../data/exploration.js';
import { DUPLICATE_VALUES } from '../data/rewards.js';
export default function Inventory({snapshot:s,onClose,onCommand,onTool,initialTab='tools'}) {
 const [tab,setTab]=useState(initialTab);
 const categories=[['tools','Tools'],['quest','Quest Items'],['maps','Maps'],['keys','Special Items'],['duplicates','Duplicates']];
 const list=Object.values(ITEMS).filter(i=>i.category===tab&&s.items[i.id]);
 return <Modal title="Backpack" onClose={onClose} wide><p className="muted">Everything you need for the next trail. Your currency collection lives in the Encyclopedia.</p><div className="tabs">{categories.map(([id,label])=><button key={id} className={`chip ${tab===id?'on':''}`} onClick={()=>setTab(id)}>{label}</button>)}</div>{tab==='duplicates'?<><p className="muted">Sell extras here, trade with the collector, or give one to a friend.</p><div className="card-grid">{Object.entries(s.duplicates).filter(([,n])=>n>0).map(([id,n])=><article className="journal-card" key={id}><h3>{CURRENCY_BY_ID[id]?.name}</h3><p>★ {CURRENCY_BY_ID[id]?.rarity} · {n} spare</p><button className="btn ghost small" onClick={()=>onCommand('sellDuplicate',id,1)}>Sell one · +{DUPLICATE_VALUES[CURRENCY_BY_ID[id].rarity]} coins</button></article>)}</div>{s.dupTotal===0&&<p className="empty-state">No duplicates yet. Every find has a use.</p>}</>:<><div className="card-grid">{list.map(i=><article className="journal-card" key={i.id}><span className="item-symbol">{i.icon}</span><h3>{i.name}</h3><p>{i.description}</p>{TREASURE_CLUES[i.id]&&<blockquote className="clue">“{TREASURE_CLUES[i.id].clue}”{s.progression.skills.treasure_maps&&<small>{TREASURE_CLUES[i.id].extra}</small>}</blockquote>}{['detector','shovel','flashlight'].includes(i.id)&&<button className="btn ghost small" disabled={s.progression.tool===i.id} onClick={()=>onTool(i.id)}>{s.progression.tool===i.id?'✓ Equipped':'Equip tool'}</button>}</article>)}</div>{!list.length&&<div className="empty-state"><span>▣</span><h3>Room for discoveries</h3><p>Explore and talk to people to find useful items.</p></div>}</>}</Modal>;
}
