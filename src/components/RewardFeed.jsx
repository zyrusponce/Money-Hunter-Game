import { useEffect, useRef, useState } from 'react';
import { createNotificationQueue } from '../game/notifications.js';
import { CURRENCY_BY_ID, RARITY_INFO } from '../data/currencies.js';
import { displayName } from '../data/rewards.js';
import CurrencyIcon from './CurrencyIcon.jsx';
export function RewardDetails({receipt:r}) {
  const currency=CURRENCY_BY_ID[r.currencyId];
  return <>
    <div className="reward-heading">{currency&&<CurrencyIcon currency={currency}/>}<div><span className="eyebrow">{r.cause}</span><strong>{currency?.name||r.milestones[0]||'A little further along'}</strong>{currency&&<small>{currency.type} · ★ {currency.rarity} · {currency.origin}</small>}</div></div>
    <div className="reward-values">{r.xp>0&&<span>+{r.xp} Explorer XP</span>}{r.coins>0&&<span>+{r.coins} Hunter Coins</span>}{r.points>0&&<span>+{r.points} Upgrade Point{r.points===1?'':'s'}</span>}</div>
    {r.progress&&<p className="reward-progress">{r.progress.join(' · ')}</p>}
    {r.levelAfter>r.levelBefore&&<p className={`level-up ${r.levelMilestone?'level-milestone':''}`}>{r.levelMilestone?'★ EXPLORER MILESTONE!':'LEVEL UP!'} Explorer Level {r.levelBefore} → {r.levelAfter} · New skill available</p>}
    {r.milestones.length>0&&<details><summary>{r.milestones.length} milestone{r.milestones.length===1?'':'s'} reached</summary>{r.milestones.map((text,i)=><p key={i}>{text}</p>)}</details>}
    {r.unlocks.length>0&&<p className="unlock-line">Unlocked: {[...new Set(r.unlocks)].map(displayName).join(' · ')}</p>}
  </>;
}
export default function RewardFeed({game,onOpen}) {
  const queue=useRef(createNotificationQueue()),ages=useRef(new Map()),[visible,setVisible]=useState([]),[hover,setHover]=useState(false);
  const refresh=()=>setVisible([...queue.current.visible()]);
  useEffect(()=>{
    queue.current=createNotificationQueue();ages.current.clear();refresh();
    const offReward=game.on('reward',r=>{queue.current.push({...r,kind:'receipt'});refresh();});
    const offToast=game.on('toast',t=>{queue.current.push({...t,id:`toast:${t.id}`});refresh();});
    return ()=>{offReward();offToast();};
  },[game]);
  useEffect(()=>{
    if(!visible.length||hover)return;
    const timer=setInterval(()=>{
      let changed=false;
      for(const n of queue.current.visible()) {
        const age=(ages.current.get(n.id)||0)+100;ages.current.set(n.id,age);
        if(age>=2500){queue.current.dismiss(n.id);ages.current.delete(n.id);changed=true;}
      }
      if(changed)refresh();
    },100);
    return ()=>clearInterval(timer);
  },[visible,hover,game]);
  const dismiss=id=>{queue.current.dismiss(id);ages.current.delete(id);refresh();};
  const interactions={onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),onFocus:()=>setHover(true),onBlur:e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false);}};
  const card=n=><article key={n.id} className={`reward-card ${n.rarity||''}`} style={{'--reward-color':RARITY_INFO[n.rarity]?.color||'var(--accent)'}}>
      <button className="dismiss-note" aria-label="Dismiss notification" onClick={()=>dismiss(n.id)}>×</button>
      {n.kind==='receipt'?<><RewardDetails receipt={n}/>{n.currencyId&&<button className="text-button" onClick={()=>onOpen('encyclopedia',n.currencyId)}>View entry →</button>}</>:<p>{n.text}</p>}
    </article>;
  return <><div className="sr-only" role="status">{visible[0]?.currencyId?`${visible[0].cause||'Discovery'}: ${CURRENCY_BY_ID[visible[0].currencyId]?.name}`:visible[0]?.cause||visible[0]?.text}</div>
    <div className="reward-feed" {...interactions}>{visible.filter(n=>!n.currencyId).map(card)}</div>
    <div className="discovery-feed" {...interactions}>{visible.filter(n=>n.currencyId).map(card)}</div>
  </>;
}
