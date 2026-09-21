import { useState } from 'react';
import Modal from './Modal.jsx';

function QuestCard({ q }) {
  return (
    <div className="quest">
      <h4>{q.name}</h4>
      <p>{q.summary}</p>
      <ul>
        {q.objectives.map((o) => (
          <li key={o.id} className={o.complete ? 'done' : ''}>
            {o.text}
          </li>
        ))}
      </ul>
      {q.rewardText && <div className="reward">Reward: {q.rewardText}</div>}
    </div>
  );
}

export default function QuestMenu({ snapshot, onClose }) {
  const [tab, setTab] = useState('active');
  const list = tab === 'active' ? snapshot.quests.active : snapshot.quests.done;
  return (
    <Modal title="Quests" onClose={onClose}>
      <div className="tabs">
        <button className={`btn small ${tab === 'active' ? '' : 'ghost'}`} onClick={() => setTab('active')}>
          Active ({snapshot.quests.active.length})
        </button>
        <button className={`btn small ${tab === 'done' ? '' : 'ghost'}`} onClick={() => setTab('done')}>
          Completed ({snapshot.quests.done.length})
        </button>
      </div>
      <div className="stack">
        {list.length === 0 && (
          <p className="muted">
            {tab === 'active' ? 'No active quests. Talk to people around the world, and look for the yellow ! above their heads.' : 'Nothing completed yet.'}
          </p>
        )}
        {list.map((q) => (
          <QuestCard key={q.id} q={q} />
        ))}
      </div>
    </Modal>
  );
}
