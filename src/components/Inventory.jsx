import Modal from './Modal.jsx';
import { ITEM_CATEGORIES, ITEMS } from '../data/items.js';

// Tools that show up as silhouettes until you find them, as a nudge toward what exists.
const TEASERS = ['shovel', 'flashlight', 'detector2'];

export default function Inventory({ snapshot, onClose }) {
  return (
    <Modal title="Inventory" onClose={onClose}>
      <p className="muted" style={{ marginTop: 0 }}>
        Money goes straight into the Money Encyclopedia, so it never takes up space here.
      </p>
      {ITEM_CATEGORIES.map((cat) => {
        const owned = Object.values(ITEMS).filter((i) => i.category === cat.id && snapshot.items[i.id]);
        const teasers = Object.values(ITEMS).filter((i) => i.category === cat.id && !snapshot.items[i.id] && TEASERS.includes(i.id));
        return (
          <section key={cat.id}>
            <h3 className="inv-h">{cat.label}</h3>
            {owned.length === 0 && teasers.length === 0 && <p className="muted">Nothing yet.</p>}
            <div className="inv-grid">
              {owned.map((i) => (
                <div className="item" key={i.id}>
                  <div className="ico">{i.icon}</div>
                  <b>{i.name}</b>
                  <span>{i.description}</span>
                </div>
              ))}
              {teasers.map((i) => (
                <div className="item locked" key={i.id}>
                  <div className="ico">{i.icon}</div>
                  <b>???</b>
                  <span>Not found yet.</span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </Modal>
  );
}
