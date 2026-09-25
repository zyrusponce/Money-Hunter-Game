import { useRef, useState } from 'react';

// On-screen joystick and action button for phones and tablets.
export default function TouchControls({ game,onOpen }) {
  const padRef = useRef(null);
  const [nub, setNub] = useState({ x: 0, y: 0 });

  const update = (e) => {
    const r = padRef.current.getBoundingClientRect();
    let dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    let dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    setNub({ x: dx * 36, y: dy * 36 });
    const dead = 0.28;
    game.setVirtualDir(Math.abs(dx) > dead ? Math.sign(dx) : 0, Math.abs(dy) > dead ? Math.sign(dy) : 0);
  };
  const release = () => {
    setNub({ x: 0, y: 0 });
    game.setVirtualDir(0, 0);
  };

  return (
    <div className="touch">
      <div className="touch-extras"><button aria-label="Switch tool" onClick={()=>{const owned=['detector','shovel','flashlight'].filter(id=>game.s.items[id]);game.equipTool(owned[(owned.indexOf(game.s.progression.tool)+1)%owned.length]);}}>Tool</button><button aria-label="Open menu" onClick={()=>onOpen('pause')}>Menu</button></div>
      <div
        className="pad"
        ref={padRef}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e);
        }}
        onPointerMove={(e) => e.buttons && update(e)}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <div className="nub" style={{ transform: `translate(${nub.x}px, ${nub.y}px)` }} />
      </div>
      <button
        className="abtn"
        aria-label="Interact"
        onPointerDown={(e) => {
          e.preventDefault();
          game.onAction();
        }}
      >
        A
      </button>
    </div>
  );
}
