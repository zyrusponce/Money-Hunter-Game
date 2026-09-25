import { useEffect, useState } from 'react';
import { useGameEvent } from './hooks.js';
import { useRef } from 'react';
import { keyLabel } from '../game/controls.js';
import { ITEMS } from '../data/items.js';
export default function HUD({game,touch,onOpen}) {
  const detectorRef=useRef(null);
  const hudRef=useRef(null);
  useEffect(()=>{
    const setNavigation=enabled=>{if(hudRef.current)hudRef.current.dataset.keyboardNavigation=String(enabled);};
    const keydown=e=>{
      if(e.key==='Tab')setNavigation(true);
      else if(!['Shift','Control','Alt','Meta','Enter',' '].includes(e.key))setNavigation(false);
    };
    const pointerdown=()=>setNavigation(false);
    document.addEventListener('keydown',keydown,true);
    document.addEventListener('pointerdown',pointerdown,true);
    return()=>{document.removeEventListener('keydown',keydown,true);document.removeEventListener('pointerdown',pointerdown,true);};
  },[]);
  useEffect(()=>{
    const follow=()=>{
      const panel=detectorRef.current,canvas=game.canvas;
      if(!panel||!canvas)return;
      const bounds=panel.parentElement.getBoundingClientRect();
      const scaleX=bounds.width/canvas.width,scaleY=bounds.height/canvas.height;
      const x=(game.s.x-game.rt.cam.x)*scaleX;
      const y=(game.s.y-game.rt.cam.y)*scaleY;
      const width=panel.offsetWidth,height=panel.offsetHeight,padding=10;
      const top=y+12+height<bounds.height-padding?y+12:y-18*scaleY-height;
      panel.style.left=`${Math.max(padding,Math.min(bounds.width-width-padding,x-width/2))}px`;
      panel.style.top=`${Math.max(padding,Math.min(bounds.height-height-padding,top))}px`;
      panel.style.visibility='visible';
    };
    const off=game.on('frame',follow);follow();return off;
  },[game]);
  const hud=useGameEvent(game,'hud',g=>g.lastHud),[banner,setBanner]=useState(null),[saved,setSaved]=useState('');
  useEffect(()=>{let timer;const off=game.on('area',a=>{setBanner(a.name);clearTimeout(timer);timer=setTimeout(()=>setBanner(null),2500);});return()=>{off();clearTimeout(timer);};},[game]);
  useEffect(()=>{let timer;const off=game.on('saving',text=>{setSaved(text);clearTimeout(timer);timer=setTimeout(()=>setSaved(''),1800);});return()=>{off();clearTimeout(timer);};},[game]);
  if(!hud)return null;
  const key=action=>keyLabel(game.settings.bindings[action]);
  const tutorial={move:touch?'Use the joystick to move.':`Use ${key('up')}${key('left')}${key('down')}${key('right')} or arrow keys to move.`,approach:'Walk toward a glowing coin.',collect:touch?'Tap Interact to collect.':`Press ${key('interact')} to collect.`,encyclopedia:touch?'Open the Encyclopedia to see your discovery.':`Added to your Encyclopedia. Press ${key('encyclopedia')} to take a look.`};
  return <div ref={hudRef} className="hud adventure-hud">
    <div className="hud-area"><span className="location-dot"/><div><strong>{hud.location}</strong><small>{hud.explored}% explored {hud.dark?'· Flashlight recommended':''}</small></div></div>
    <button className="hud-encyclopedia" onClick={()=>onOpen('encyclopedia')} aria-label="Open Money Encyclopedia"><span>▤</span><div><small>ENCYCLOPEDIA</small><strong>{hud.discovered} <em>/ {hud.total}</em></strong></div><b>{hud.percent}%</b></button>
    {hud.tracked&&<button className="hud-tracked" onClick={()=>onOpen('quests')}><span className="eyebrow">TRACKED QUEST</span><strong>{hud.tracked.name}</strong><small>{hud.tracked.summary}</small></button>}
    {tutorial[hud.tutorial]&&<div className="tutorial-note">✧ {tutorial[hud.tutorial]}</div>}
    {banner&&<div className="area-banner">{banner}<small>There’s always something worth finding.</small></div>}
    <div ref={detectorRef} className="detector-panel detector-follow"><div className="signal-bars" aria-label={`Signal strength ${hud.signal} of 3`}>{[1,2,3].map(n=><i key={n} className={hud.signal>=n?'on':''}/>)}</div><div><strong>{ITEMS[hud.tool]?.name||'Money Detector'}</strong><small>{hud.signal?hud.signalLabel:'Listening for something hidden…'}</small></div></div>
    {hud.prompt&&<div className="interaction-prompt"><kbd>{touch?'A':key('interact')}</kbd><strong>{hud.prompt.verb}</strong>{hud.prompt.name&&<span>{hud.prompt.name}</span>}</div>}
    <nav className="hud-shortcuts" aria-label="Adventure menus">{[['map','Map','◇'],['quests','Quests','!'],['inventory','Backpack','▣'],['encyclopedia','Encyclopedia','▤']].map(([id,label,icon])=><button key={id} onClick={()=>onOpen(id)} title={`${label} (${key(id)})`} aria-label={label}><span>{icon}</span><small className="shortcut-label">{label}</small><kbd>{key(id)}</kbd></button>)}<button onClick={()=>onOpen('pause')} aria-label="Menu"><span>Ⅱ</span><small className="shortcut-label">Menu</small><kbd>Esc</kbd></button></nav>
    {saved&&<span className="save-status" role="status">{saved}</span>}
  </div>;
}
