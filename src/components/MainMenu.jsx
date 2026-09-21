import { LOCATIONS } from '../data/locations.js';
import { CURRENCY_BY_ID } from '../data/currencies.js';
import { getCurrencyIcon } from '../game/currencyIcons.js';
import { fmtTime } from './hooks.js';

const FLOATERS = [
  ['php20', '6%', '14%', '0s'],
  ['usd100n', '82%', '10%', '-1.2s'],
  ['jpy_koban', '10%', '68%', '-2.4s'],
  ['cowrie', '86%', '62%', '-3.1s'],
  ['owl', '20%', '36%', '-0.6s'],
  ['red_env', '74%', '38%', '-4.2s'],
  ['eur1', '48%', '86%', '-1.9s'],
  ['pieces8', '60%', '90%', '-3.6s'],
];

export default function MainMenu({ save, onNew, onContinue, onOpen }) {
  const summary = save ? `${save.completionPercent || 0}% complete - ${LOCATIONS[save.map]?.name || ''} - ${fmtTime(save.stats.playtime)}` : '';
  return (
    <div className="menu">
      <div className="floaters" aria-hidden="true">
        {FLOATERS.map(([id, left, top, delay]) => {
          const c = CURRENCY_BY_ID[id];
          if (!c) return null;
          return <img key={id} src={getCurrencyIcon(c)} alt="" style={{ left, top, animationDelay: delay }} />;
        })}
      </div>
      <div className="menu-inner">
        <h1 className="logo">
          MONEY
          <br />
          HUNTER
        </h1>
        <p className="tagline">Explore the world. Find every currency. Complete the Money Encyclopedia.</p>
        <div className="menu-buttons">
          <button className="btn" onClick={onNew}>
            New Game
          </button>
          <button className="btn" onClick={onContinue} disabled={!save}>
            Continue
            {save && <span className="save-line">{summary}</span>}
          </button>
          <button className="btn ghost" onClick={() => onOpen('encyclopedia')}>
            Money Encyclopedia
          </button>
          <button className="btn ghost" onClick={() => onOpen('howto')}>
            How to Play
          </button>
          <button className="btn ghost" onClick={() => onOpen('settings')}>
            Settings
          </button>
        </div>
        <div className="credit">Progress is saved in this browser.</div>
      </div>
    </div>
  );
}
