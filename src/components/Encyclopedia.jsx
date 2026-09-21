import { useMemo, useState } from 'react';
import { CATEGORIES, CURRENCIES, CURRENCY_BY_ID, RARITIES } from '../data/currencies.js';
import { LOCATION_LIST } from '../data/locations.js';
import EncyclopediaEntry, { Specimen } from './EncyclopediaEntry.jsx';

const TYPE_FILTERS = [['all', 'All'], ['Coin', 'Coins'], ['Banknote', 'Banknotes']];
const STATUS_FILTERS = [['all', 'All'], ['found', 'Discovered'], ['missing', 'Undiscovered']];
const AREAS = LOCATION_LIST.map((l) => l.area);

// The Money Encyclopedia: a felt-lined coin album with progress, filters and search.
export default function Encyclopedia({ snapshot, onClose }) {
  const { discovered, duplicates, count, total, percent } = snapshot;
  const [type, setType] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [area, setArea] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURRENCIES.filter((c) => {
      const found = !!discovered[c.id];
      if (type !== 'all' && c.type !== type) return false;
      if (rarity !== 'all' && c.rarity !== rarity) return false;
      if (status === 'found' && !found) return false;
      if (status === 'missing' && found) return false;
      if (category !== 'all' && (!found || c.category !== category)) return false;
      if (area !== 'all' && (!found || c.location !== area)) return false;
      if (q) {
        if (!found) return false; // undiscovered entries are anonymous
        const hay = `${c.name} ${c.origin} ${c.value} ${c.category} ${c.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [discovered, type, rarity, status, category, area, query]);

  const reset = () => {
    setType('all');
    setRarity('all');
    setStatus('all');
    setCategory('all');
    setArea('all');
    setQuery('');
  };
  const selectedCurrency = selected ? CURRENCY_BY_ID[selected] : null;

  return (
    <div
      className="overlay enc-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="album" role="dialog" aria-modal="true" aria-label="Money Encyclopedia">
        <section className="album-page">
          <header className="album-head">
            <div className="album-title">
              <span className="brass">Money Encyclopedia</span>
              <button className="close-x" onClick={onClose} aria-label="Close">
                X
              </button>
            </div>
            <div className="album-prog">
              <div className="bar" aria-label={`${percent} percent complete`}>
                <i style={{ width: `${percent}%` }} />
              </div>
              <div className="num">
                {count} / {total} Discovered
                <br />
                {percent}% Complete
              </div>
            </div>
          </header>

          <div className="filters">
            <div className="chips">
              <span className="lbl">Type</span>
              {TYPE_FILTERS.map(([v, label]) => (
                <button key={v} className={`chip${type === v ? ' on' : ''}`} onClick={() => setType(v)}>
                  {label}
                </button>
              ))}
              <span className="lbl" style={{ marginLeft: 6 }}>
                Show
              </span>
              {STATUS_FILTERS.map(([v, label]) => (
                <button key={v} className={`chip${status === v ? ' on' : ''}`} onClick={() => setStatus(v)}>
                  {label}
                </button>
              ))}
            </div>
            <div className="chips">
              <span className="lbl">Rarity</span>
              <button className={`chip${rarity === 'all' ? ' on' : ''}`} onClick={() => setRarity('all')}>
                All
              </button>
              {RARITIES.map((r) => (
                <button key={r} className={`chip r-${r}${rarity === r ? ' on' : ''}`} onClick={() => setRarity(r)}>
                  {r}
                </button>
              ))}
            </div>
            <div className="chips">
              <input className="search" type="search" placeholder="Search discovered money..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the encyclopedia" />
              <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by class">
                <option value="all">Any class</option>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <select className="select" value={area} onChange={(e) => setArea(e.target.value)} aria-label="Filter by area">
                <option value="all">Any area</option>
                {AREAS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <button className="chip" onClick={reset}>
                Reset
              </button>
            </div>
          </div>

          <div className="grid-wrap">
            {list.length === 0 ? (
              <div className="empty">Nothing matches those filters.</div>
            ) : (
              <div className="grid">
                {list.map((c) => (
                  <EncyclopediaEntry key={c.id} currency={c} found={!!discovered[c.id]} dupes={duplicates[c.id] || 0} selected={selected === c.id} onSelect={setSelected} />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className={`label-page${selectedCurrency ? ' open' : ''}`}>
          <Specimen currency={selectedCurrency} found={selectedCurrency ? !!discovered[selectedCurrency.id] : false} dupes={selectedCurrency ? duplicates[selectedCurrency.id] || 0 : 0} />
          <button className="btn ghost small album-close album-mobile-close" onClick={() => setSelected(null)}>
            Back to album
          </button>
        </aside>
      </div>
    </div>
  );
}
