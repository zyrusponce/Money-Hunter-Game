import { useMemo, useState, useRef, useEffect } from 'react';
import useDialogFocus from './useDialogFocus.js';
import CollectionView from './CollectionView.jsx';
import ProgressBar from './ProgressBar.jsx';
import { CATEGORIES, CURRENCIES, CURRENCY_BY_ID, RARITIES } from '../data/currencies.js';
import { LOCATION_LIST } from '../data/locations.js';
import EncyclopediaEntry, { Specimen } from './EncyclopediaEntry.jsx';

const TYPE_FILTERS = [['all', 'All'], ['Coin', 'Coins'], ['Banknote', 'Banknotes']];
const STATUS_FILTERS = [['all', 'All'], ['found', 'Discovered'], ['missing', 'Undiscovered']];
const AREAS = LOCATION_LIST.map((l) => l.area);

// The Money Encyclopedia: a felt-lined coin album with progress, filters and search.
export default function Encyclopedia({ snapshot, onClose, initialEntry=null }) {
  const ref=useRef(null);useDialogFocus(ref);
  const [view,setView]=useState('all'),[country,setCountry]=useState('all');
  const [filtersOpen,setFiltersOpen]=useState(()=>window.innerWidth>800);
  useEffect(()=>{const media=window.matchMedia('(min-width:801px)'),change=()=>setFiltersOpen(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
  const { discovered, duplicates, count, total, percent } = snapshot;
  const [type, setType] = useState('all');
  const [rarity, setRarity] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [area, setArea] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(initialEntry);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CURRENCIES.filter((c) => {
      const found = !!discovered[c.id];
      if(country!=='all'&&(!found||c.origin!==country))return false;
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
  }, [discovered, type, rarity, status, category, area, query,country]);

  const reset = () => {
    setType('all');
    setRarity('all');
    setStatus('all');
    setCategory('all');
    setArea('all');
    setQuery('');
    setCountry('all');
  };
  const selectedCurrency = selected ? CURRENCY_BY_ID[selected] : null;

  return (
    <div
      className="overlay enc-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={ref} tabIndex={-1} className={`album ${view==='collections'?'collection-album':''}`} role="dialog" aria-modal="true" aria-label="Money Encyclopedia">
        <section className="album-page">
          <header className="album-head">
            <div className="album-title">
              <div><span className="eyebrow">A WORLD OF SMALL WONDERS</span><h2>Money Encyclopedia</h2></div>
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
          <div className="tabs album-tabs"><button className={`chip ${view==='all'?'on':''}`} onClick={()=>setView('all')}>All Money</button><button className={`chip ${view==='collections'?'on':''}`} onClick={()=>setView('collections')}>Collections <small>{snapshot.collections.filter(c=>c.complete).length}/{snapshot.collections.length}</small></button></div>

          {view==='all'&&<details className="filter-disclosure" open={filtersOpen} onToggle={e=>setFiltersOpen(e.currentTarget.open)}><summary>Search & filters</summary><div className="filters">
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
              <select className="select" value={country} aria-label="Filter by country" onChange={e=>setCountry(e.target.value)}><option value="all">All countries</option>{[...new Set(CURRENCIES.map(c=>c.origin))].sort().map(c=><option key={c}>{c}</option>)}</select>
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
          </div></details>}

          <div className="grid-wrap">
            {view==='collections'?<CollectionView collections={snapshot.collections}/>:list.length === 0 ? (
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

        {view==='all'&&<aside className={`label-page${selectedCurrency ? ' open' : ''}`}>
          <Specimen currency={selectedCurrency} found={selectedCurrency ? !!discovered[selectedCurrency.id] : false} dupes={selectedCurrency ? duplicates[selectedCurrency.id] || 0 : 0} />
          {selectedCurrency&&discovered[selectedCurrency.id]&&snapshot.collections.filter(c=>c.ids.includes(selectedCurrency.id)&&c.name===`${selectedCurrency.origin} Collection`).map(c=><ProgressBar key={c.id} label={c.name} value={c.count} total={c.total}/>)}
          {!selectedCurrency&&<div className="rarity-breakdown">{RARITIES.map(r=><ProgressBar key={r} label={`★ ${r}`} value={CURRENCIES.filter(c=>c.rarity===r&&discovered[c.id]).length} total={CURRENCIES.filter(c=>c.rarity===r).length}/>)}</div>}
          <button className="btn ghost small album-close album-mobile-close" onClick={() => setSelected(null)}>
            Back to album
          </button>
        </aside>}
      </div>
    </div>
  );
}
