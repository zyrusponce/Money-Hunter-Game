import CurrencyIcon from './CurrencyIcon.jsx';
import { RARITY_INFO } from '../data/currencies.js';

// One pocket in the coin album. Undiscovered money is a dark silhouette named "???".
export default function EncyclopediaEntry({ currency, found, dupes, selected, onSelect }) {
  const info = RARITY_INFO[currency.rarity];
  return (
    <button
      className={`slot r-${currency.rarity} ${found ? 'found' : 'missing'}${selected ? ' sel' : ''}`}
      style={{ '--rc': info.color, '--rg': info.glow }}
      onClick={() => onSelect(currency.id)}
      aria-label={found ? `${currency.name}, ${currency.rarity}` : `Undiscovered ${currency.rarity} ${currency.type.toLowerCase()}`}
    >
      {found && dupes > 0 && <span className="dup">x{dupes + 1}</span>}
      {found && <span className="pip" />}
      <span className="pocket">
        <CurrencyIcon currency={currency} silhouette={!found} />
      </span>
      <span className="name">{found ? currency.name : '???'}</span>
      <small className="entry-country">{found?currency.origin:'Undiscovered'}</small><small className="entry-rarity">★ {currency.rarity}</small>
    </button>
  );
}

// The specimen label shown on the right-hand page.
export function Specimen({ currency, found, dupes }) {
  if (!currency) {
    return (
      <div className="specimen">
        <div className="placeholder">
          <h3>Money Encyclopedia</h3>
          <p>Pick a pocket in the album to read about it. Dark silhouettes are money you have not found yet.</p>
        </div>
      </div>
    );
  }
  const info = RARITY_INFO[currency.rarity];
  return (
    <div className="specimen" style={{ '--rc': info.color, '--rg': info.glow }}>
      <div className="art">
        <CurrencyIcon currency={currency} silhouette={!found} />
      </div>
      <h3>{found ? currency.name : '???'}</h3>
      <div className="center">
        <span className="rarity-tag" style={{ '--rc': info.color }}>
          ★ {currency.rarity}
        </span>
      </div>
      <dl>
        <dt>Origin</dt>
        <dd>{found ? currency.origin : '???'}</dd>
        <dt>Type</dt>
        <dd>{currency.type}</dd>
        <dt>Value</dt>
        <dd>{found ? currency.value : '???'}</dd>
        <dt>Rarity</dt>
        <dd>{currency.rarity}</dd>
        <dt>Class</dt>
        <dd>{found ? currency.category : '???'}</dd>
        <dt>Found in</dt>
        <dd>{found ? currency.location : 'Unknown'}</dd>
        <dt>Status</dt>
        <dd>
          <span className={`status${found ? '' : ' no'}`}>{found ? 'Discovered' : 'Not collected'}</span>
        </dd>
        {found && dupes > 0 && (
          <>
            <dt>Spares</dt>
            <dd>{dupes} duplicate{dupes > 1 ? 's' : ''}</dd>
          </>
        )}
      </dl>
      <p>{found ? currency.description : 'You have not discovered this money yet. Keep exploring, and check with your Money Detector.'}</p>
    </div>
  );
}
