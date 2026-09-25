import { useState } from 'react';
import Modal from './Modal.jsx';
import { SHOP } from '../data/shop.js';
export default function ExplorerShop({snapshot,onClose,onCommand}) {
  const [category,setCategory]=useState('Tools'),[selected,setSelected]=useState(null),p=snapshot.progression;
  return <Modal title="Explorer Shop" onClose={onClose} wide><div className="menu-intro"><p>Better tools. New trails. A style of your own.</p><strong className="coin-balance">◉ {p.coins.toLocaleString()} Hunter Coins</strong></div><div className="tabs">{['Tools','Upgrades','Cosmetics','Special Items'].map(c=><button key={c} className={`chip ${category===c?'on':''}`} onClick={()=>{setCategory(c);setSelected(null);}}>{c}</button>)}</div><div className="card-grid">{SHOP.filter(i=>i.category===category).map(item=>{
    const owned=p.purchases[item.id]||p.cosmetics[item.id]||(item.item&&snapshot.items[item.item]);
    return <article className={`journal-card ${selected===item.id?'selected':''}`} key={item.id}><span className="item-symbol">{item.icon}</span><h3>{item.name}</h3><p>{item.description}</p><strong>{owned?'✓ Owned':`${item.price} Hunter Coins`}</strong>{selected===item.id?<button className="btn small" disabled={owned||p.coins<item.price} onClick={()=>onCommand('purchase',item.id)}>{owned?'Owned':p.coins<item.price?'Not enough coins':`Buy · ${item.price}`}</button>:<button className="btn ghost small" disabled={!!owned} onClick={()=>setSelected(item.id)}>{owned?'Owned':'View purchase'}</button>}{owned&&item.slot&&<button className="text-button" disabled={p.equipped[item.slot]===item.id} onClick={()=>onCommand('equip',item.slot,item.id)}>{p.equipped[item.slot]===item.id?'Equipped':'Equip'}</button>}</article>;
  })}</div><p className="menu-footnote">Earned through exploration. No real-money purchases.</p></Modal>;
}
