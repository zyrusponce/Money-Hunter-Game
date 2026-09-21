import { useMemo } from 'react';
import { useGameEvent } from './hooks.js';
import CurrencyIcon from './CurrencyIcon.jsx';
import { RARITY_INFO } from '../data/currencies.js';

const sparkleSpots = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 11) % 96}%`,
  top: `${(i * 53 + 7) % 92}%`,
  delay: `${(i % 7) * 0.22}s`,
}));

// "NEW MONEY DISCOVERED!", "Duplicate Found!", item and area-unlock cards.
export default function DiscoveryPopup({ game, touch }) {
  const p = useGameEvent(game, 'popup', null);
  const info = useMemo(() => (p && p.currency ? RARITY_INFO[p.currency.rarity] : null), [p]);
  if (!p) return null;
  const style = info ? { '--rc': info.color, '--rg': info.glow } : {};
  const fancy = p.currency && ['Epic', 'Legendary'].includes(p.currency.rarity);
  const cont = touch ? 'Tap to continue' : 'Press E or click to continue';

  let body = null;
  if (p.type === 'discovery') {
    body = (
      <>
        <div className="kicker">NEW MONEY DISCOVERED!</div>
        <div className="art">
          <CurrencyIcon currency={p.currency} />
        </div>
        <h3>{p.currency.name}</h3>
        <div className="meta">
          <span className="rarity-tag">{p.currency.rarity}</span> &nbsp;{p.currency.origin}
        </div>
        <div className="added">Added to the Money Encyclopedia!</div>
        <div className="hint">
          {p.discovered} / {p.total} discovered ({p.percent}%)
        </div>
      </>
    );
  } else if (p.type === 'duplicate') {
    body = (
      <>
        <div className="kicker">Duplicate Found!</div>
        <div className="art">
          <CurrencyIcon currency={p.currency} />
        </div>
        <h3>{p.currency.name}</h3>
        <div className="meta">
          <span className="rarity-tag">{p.currency.rarity}</span> &nbsp;{p.currency.origin}
        </div>
        <div className="hint">Stored as a duplicate (x{p.count}). The Money Collector in Sunny Town trades duplicates for new finds.</div>
      </>
    );
  } else if (p.type === 'item') {
    body = (
      <>
        <div className="kicker">YOU GOT: {p.item.name.toUpperCase()}!</div>
        <div className="art" style={{ fontSize: '3.4em' }}>
          {p.item.icon}
        </div>
        <div className="meta">{p.item.description}</div>
      </>
    );
  } else if (p.type === 'unlock') {
    body = (
      <>
        <div className="kicker">{p.title}</div>
        <div className="art" style={{ fontSize: '3.4em' }}>
          {'\u{1F513}'}
        </div>
        <div className="meta">{p.text}</div>
        <div className="hint">Encyclopedia at {p.percent}%. Open the World Map (M) to see it.</div>
      </>
    );
  }

  return (
    <div className="hud" style={{ pointerEvents: 'none' }}>
      <div className="popup-back" onClick={() => game.dismissPopup()}>
        <div className={`popup ${p.type}`} style={style} role="dialog" aria-live="assertive">
          {fancy && (
            <div className="sparkles" aria-hidden="true">
              {sparkleSpots.map((s, i) => (
                <i key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
              ))}
            </div>
          )}
          {body}
          <div className="hint" style={{ marginTop: '0.9em' }}>
            {cont}
          </div>
        </div>
      </div>
    </div>
  );
}
