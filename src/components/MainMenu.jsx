import { useEffect, useRef } from 'react';
import { Game } from '../game/engine.js';
import { levelInfo } from '../game/rewards.js';
export default function MainMenu({save,settings,saveStatus,sessionSummary,onRetry,onNew,onContinue,onOpen}) {
  const canvas=useRef(null);
  useEffect(()=>{
    const g=new Game({canvas:canvas.current,listen:false,autosave:false,settings});
    g.s.x=18*16+8;g.s.y=16*16+14;g.render();
    let frame,last=0;
    const draw=t=>{if(!settings.reducedMotion)g.rt.time+=(t-last)/1000*(settings.animationIntensity??1);last=t;g.render();frame=requestAnimationFrame(draw);};
    frame=requestAnimationFrame(t=>{last=t;draw(t);});
    return()=>{cancelAnimationFrame(frame);g.destroy();};
  },[settings]);
  return <main className="adventure-menu"><canvas ref={canvas} className="menu-world" aria-hidden="true"/><div className="menu-shade"/><div className="menu-brand"><span className="brand-mark">◈</span><span>A LITTLE CURIOSITY. A WORLD OF DISCOVERIES.</span></div><section className="menu-content"><span className="eyebrow">YOUR NEXT ADVENTURE IS OUT THERE</span><h1>MONEY<br/><span>HUNTER</span><i>✦</i></h1><p className="menu-tagline">Explore. Discover. Collect.</p><p className="menu-description">Follow a faint signal. Take the hidden path.<br/>Every corner has a story worth finding.</p><div className="adventure-menu-buttons"><button className="btn" onClick={onContinue} disabled={!save}><span>Continue adventure</span><span>→</span>{save&&<small>Explorer Level {levelInfo(save.progression.xp).level} · {save.completionPercent}% collected</small>}</button><button className="btn ghost" onClick={onNew}>New Game <span>＋</span></button><div className="menu-secondary"><button onClick={()=>onOpen('encyclopedia')}>▤ Encyclopedia</button><button onClick={()=>onOpen('settings')}>⚙ Settings</button></div></div>{saveStatus.message&&<div className="save-error" role="alert"><strong>Unable to load save data</strong><p>{saveStatus.message}</p><button className="text-button" onClick={onRetry}>Try again</button></div>}{sessionSummary&&<details className="session-summary"><summary>Today’s Adventure · +{sessionSummary.currencies} discoveries</summary><p>{sessionSummary.quests} quests · {sessionSummary.secrets} secrets<br/>+{sessionSummary.xp} XP · +{sessionSummary.coins} coins<br/>Encyclopedia {sessionSummary.from}% → {sessionSummary.to}%</p></details>}</section><aside className="menu-world-note"><span className="eyebrow">SUNNY TOWN</span><p>Some treasures are hiding<br/>in plain sight.</p><span className="mini-compass">N<br/>◇</span></aside><footer className="menu-footer"><span>✧ Take your time. There’s no wrong way to explore.</span><span>Autosaves in this browser <i/></span></footer></main>;
}
