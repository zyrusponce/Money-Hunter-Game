import { useGameEvent } from './hooks.js';
import Modal from './Modal.jsx';
import { useEffect } from 'react';
import { RewardDetails } from './RewardFeed.jsx';
export default function DiscoveryPopup({game,onOpen}) {
  const p=useGameEvent(game,'popup',null);
  useEffect(()=>{
    if(!p?.receipt?.currencyId)return;
    const timer=setTimeout(()=>game.dismissPopup(),2500);
    return()=>clearTimeout(timer);
  },[game,p]);
  if(!p)return null;
  return <Modal title={p.receipt?.rarity==='Legendary'?'★ Legendary Discovery':p.receipt?.majorCollection?'Collection Complete':'A remarkable discovery'} onClose={()=>game.dismissPopup()}>
    {p.receipt&&<RewardDetails receipt={p.receipt}/>}
    <div className="row"><button className="btn" data-autofocus onClick={()=>game.dismissPopup()}>Continue exploring</button>{p.receipt?.currencyId&&<button className="btn ghost" onClick={()=>{game.dismissPopup();onOpen('encyclopedia',p.receipt.currencyId);}}>View entry</button>}</div>
  </Modal>;
}
