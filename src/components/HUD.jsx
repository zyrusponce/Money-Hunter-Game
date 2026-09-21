import { useEffect, useState } from 'react';
import { useGameEvent } from './hooks.js';

// The in-game heads-up display. It only re-renders when the engine reports a change.
export default function HUD({ game, touch, onOpen }) {
  const hud = useGameEvent(game, 'hud', (g) => g.lastHud);
  const [toasts, setToasts] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(
    () =>
      game.on('toast', (t) => {
        setToasts((list) => [...list.slice(-3), t]);
        setTimeout(() => setToasts((list) => list.filter((x) => x.id !== t.id)), 4200);
      }),
    [game]
  );
  useEffect(() => game.on('area', (a) => setBanner({ name: a.name, key: Math.random() })), [game]);

  if (!hud) return null;
  // blur the button so Space / Enter do not re-trigger it later
  const openFrom = (e, name) => {
    e.currentTarget.blur();
    onOpen(name);
  };
  const sig = hud.signal;
  const key = touch ? 'A' : 'E';

  return (
    <div className="hud" aria-live="polite">
      <div className="plaque hud-loc">
        {hud.location}
        {hud.dark && <small>{hud.flashlight ? 'Flashlight on' : 'It is dark here...'}</small>}
      </div>

      <div className="plaque hud-prog">
        <div className="label">Money Encyclopedia: {hud.percent}%</div>
        <div className="bar">
          <i style={{ width: `${hud.percent}%` }} />
        </div>
        <div className="count">
          {hud.discovered} / {hud.total} discovered
        </div>
      </div>

      <div className="hud-menu">
        <button title="Money Encyclopedia (B)" onClick={(e) => openFrom(e, 'encyclopedia')} aria-label="Money Encyclopedia">
          $
        </button>
        <button title="World Map (M)" onClick={(e) => openFrom(e, 'map')} aria-label="World Map">
          M
        </button>
        <button title="Pause (Esc)" onClick={(e) => openFrom(e, 'pause')} aria-label="Pause">
          II
        </button>
      </div>

      {banner && (
        <div className="hud-banner" key={banner.key}>
          {banner.name}
        </div>
      )}

      <div className="hud-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`plaque toast ${t.kind || ''}`}>
            {t.text}
          </div>
        ))}
      </div>

      {hud.prompt && (
        <div className="plaque hud-prompt">
          {touch ? 'Tap' : 'Press'} <kbd>{key}</kbd> to {hud.prompt.verb}
          {hud.prompt.name ? ` (${hud.prompt.name})` : ''}
        </div>
      )}

      {!hud.busy && (
      <div className={`plaque hud-detector s${sig}${sig === 0 ? ' idle' : ''}${hud.improved ? ' improved' : ''}`}>
        <div className="bars" aria-hidden="true">
          <i className={sig >= 1 ? 'on' : ''} />
          <i className={sig >= 2 ? 'on' : ''} />
          <i className={sig >= 3 ? 'on' : ''} />
        </div>
        <div className="txt">
          <b>Detector</b>
          <em>{sig === 0 ? 'Scanning...' : hud.signalLabel}</em>
        </div>
      </div>
      )}
    </div>
  );
}
