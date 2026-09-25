import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Game } from '../game/engine.js';

// Creates the engine, sizes the 16:9 stage to fit the window, and renders overlay children
// (HUD, dialogue, popups) inside the stage so they scale together with the game.
// The game loop itself runs in requestAnimationFrame inside the engine, outside React.
export default function GameCanvas({ initialState, settings, onReady, children }) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const wrapRef = useRef(null);
  const [game, setGame] = useState(null);

  useEffect(() => {
    const g = new Game({ canvas: canvasRef.current, state: initialState, settings });
    // Developer hook: open the game with ?debug in the URL to poke at the engine from the console.
    if (typeof window !== 'undefined' && /[?&]debug\b/.test(window.location.search)) window.__moneyHunter = g;
    setGame(g);
    if (onReady) onReady(g);
    g.start();
    return () => {
      g.destroy();
      if (onReady) onReady(null);
    };
    // The engine is created once per mount (App remounts this component for a new session).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const fit = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      let sw = w;
      let sh = h;
      stage.style.width = `${Math.floor(sw)}px`;
      stage.style.height = `${Math.floor(sh)}px`;
      stage.style.setProperty('--u', `${sw / 100}px`);
      if(canvasRef.current){const logicalWidth=w<600?224:400;canvasRef.current.width=logicalWidth;canvasRef.current.height=Math.max(180,Math.round(logicalWidth*h/w));}
    };
    fit();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(wrap);
    window.addEventListener('resize', fit);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
      <div className="stage" ref={stageRef}>
        <canvas ref={canvasRef} width={400} height={225} aria-label="Money Hunter game world" />
        {game && children(game)}
      </div>
    </div>
  );
}
