import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import CurrencyIcon from './CurrencyIcon.jsx';

// The Money Collector's shop: swap duplicates, buy hints, claim milestone prizes.
export default function TradeMenu({ game, onClose }) {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState(null);
  const info = useMemo(() => game.getTradeInfo(), [game, tick]);

  const run = (fn) => {
    const r = fn();
    setResult(r);
    setTick((t) => t + 1);
  };

  return (
    <Modal title="The Money Collector" onClose={onClose}>
      <div className="stack">
        <p style={{ margin: 0 }}>
          "Bring me spare copies and I will find you something new. I also hand out prizes for how far you have come." <span className="muted">(You are at {info.percent}%.)</span>
        </p>

        {result && (
          <div className={`result${result.ok ? '' : ' bad'}`}>
            {result.currency && <CurrencyIcon currency={result.currency} />}
            <span>{result.message}</span>
          </div>
        )}

        <div>
          <b>Your duplicates ({info.total})</b>
          {info.dupes.length === 0 ? (
            <p className="muted" style={{ margin: '6px 0 0' }}>
              None yet. Duplicates appear when you find money you already own. Vending machines and lost-and-found boxes are great for that.
            </p>
          ) : (
            <div className="dupes" style={{ marginTop: 8 }}>
              {info.dupes.map(({ currency, count }) => (
                <div className="dupe" key={currency.id} title={`${currency.name} x${count}`}>
                  <CurrencyIcon currency={currency} />
                  <i>x{count}</i>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="trade-grid">
          {info.offers.map((o) => (
            <div className="offer" key={o.id}>
              <div>
                <b>{o.title}</b>
                <br />
                <span>{o.desc}</span>
                {o.preview&&<p className="reward-preview">You receive: {o.preview}</p>}
              </div>
              <button className="btn small" disabled={!o.affordable || !o.remaining} onClick={() => run(() => game.trade(o.id))}>
                {o.remaining ? `Trade ${o.cost}` : 'Complete'}
              </button>
            </div>
          ))}
        </div>

        <div>
          <b>Milestone prizes</b>
          <div className="trade-grid" style={{ marginTop: 8 }}>
            {info.milestones.map((m) => (
              <div className="offer" key={m.id}>
                <div>
                  <b>
                    {m.percent}% - {m.title}
                  </b>
                  <br />
                  <span>{m.desc}</span>
                </div>
                <button className="btn small" disabled={!m.reached || m.claimed} onClick={() => run(() => game.claim(m.id))}>
                  {m.claimed ? 'Claimed' : m.reached ? 'Claim' : 'Locked'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
