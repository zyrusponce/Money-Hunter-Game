import { fmtTime } from './hooks.js';
import { useRef } from 'react';
import useDialogFocus from './useDialogFocus.js';
import { CURRENCIES } from '../data/currencies.js';

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 9) * -0.5}s`,
  dur: `${3.4 + (i % 5) * 0.6}s`,
  color: ['#f2c14e', '#62d26f', '#4aa8ff', '#c77dff', '#ff9a3c'][i % 5],
}));

// Shown when the Encyclopedia reaches 100%.
export default function EndingScreen({ snapshot, onClose }) {
  const ref=useRef(null);useDialogFocus(ref);
  return (
    <div className="overlay" style={{ zIndex: 60 }}>
      <div ref={ref} tabIndex={-1} className="ending" role="dialog" aria-modal="true" aria-label="Money Encyclopedia complete">
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <i key={i} style={{ left: c.left, animationDelay: c.delay, animationDuration: c.dur, background: c.color }} />
          ))}
        </div>
        <div className="completion-number">100%</div>
        <h2>MONEY ENCYCLOPEDIA COMPLETE!</h2>
        <p>Every currency has been discovered.</p>
        <p className="muted" style={{ fontSize: 16 }}>
          A golden doorway has opened on the Sunny Town plaza. The Treasury of Worlds awaits, and your Completion Badge rests inside.
        </p>
        <div className="stats">
          <div>
            <b>{snapshot.world.percent}%</b>
            <span>World explored</span>
          </div>
          <div>
            <b>{snapshot.count} / {snapshot.total}</b>
            <span>Money discovered</span>
          </div>
          <div>
            <b>{CURRENCIES.filter(c=>c.rarity==='Legendary'&&snapshot.discovered[c.id]).length} / {CURRENCIES.filter(c=>c.rarity==='Legendary').length}</b>
            <span>Legendary discoveries</span>
          </div>
        </div>
        <p className="muted">Collections: {snapshot.collections.filter(c=>c.complete).length} / {snapshot.collections.length} · Playtime: {fmtTime(snapshot.stats.playtime)}</p>
        <div className="completion-unlocks">✦ Master Money Hunter Title<br/>Golden Money Detector · Master Explorer Outfit<br/>Encyclopedia Master Badge<br/>Treasury of Worlds · Final Quest</div>
        <button className="btn" data-autofocus onClick={onClose}>
          Continue exploring
        </button>
      </div>
    </div>
  );
}
