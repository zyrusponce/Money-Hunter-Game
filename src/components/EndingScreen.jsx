import { fmtTime } from './hooks.js';

const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  delay: `${(i % 9) * -0.5}s`,
  dur: `${3.4 + (i % 5) * 0.6}s`,
  color: ['#f2c14e', '#62d26f', '#4aa8ff', '#c77dff', '#ff9a3c'][i % 5],
}));

// Shown when the Encyclopedia reaches 100%.
export default function EndingScreen({ snapshot, onClose }) {
  return (
    <div className="overlay" style={{ zIndex: 60 }}>
      <div className="ending" role="dialog" aria-modal="true" aria-label="Money Encyclopedia complete">
        <div className="confetti" aria-hidden="true">
          {CONFETTI.map((c, i) => (
            <i key={i} style={{ left: c.left, animationDelay: c.delay, animationDuration: c.dur, background: c.color }} />
          ))}
        </div>
        <div className="medal" aria-hidden="true">
          $
        </div>
        <h2>MONEY ENCYCLOPEDIA COMPLETE!</h2>
        <p>You discovered every known currency!</p>
        <p className="muted" style={{ fontSize: 16 }}>
          A golden doorway has opened on the Sunny Town plaza. The Treasury of Worlds awaits, and your Completion Badge rests inside.
        </p>
        <div className="stats">
          <div>
            <b>{fmtTime(snapshot.stats.playtime)}</b>
            <span>Total playtime</span>
          </div>
          <div>
            <b>{snapshot.count}</b>
            <span>Money discovered</span>
          </div>
          <div>
            <b>{snapshot.stats.duplicatesFound}</b>
            <span>Duplicates found</span>
          </div>
        </div>
        <button className="btn" onClick={onClose}>
          Continue exploring
        </button>
      </div>
    </div>
  );
}
