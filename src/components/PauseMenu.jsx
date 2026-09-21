import Modal from './Modal.jsx';

export default function PauseMenu({ onResume, onOpen, onSave, onMainMenu, savedNote }) {
  return (
    <Modal title="Paused" onClose={onResume}>
      <div className="list-menu">
        <button className="btn" onClick={onResume}>
          Resume
        </button>
        <button className="btn ghost" onClick={() => onOpen('encyclopedia')}>
          Money Encyclopedia
        </button>
        <button className="btn ghost" onClick={() => onOpen('map')}>
          World Map
        </button>
        <button className="btn ghost" onClick={() => onOpen('quests')}>
          Quests
        </button>
        <button className="btn ghost" onClick={() => onOpen('inventory')}>
          Inventory
        </button>
        <button className="btn ghost" onClick={() => onOpen('settings')}>
          Settings
        </button>
        <button className="btn ghost" onClick={onSave}>
          Save Game {savedNote && <span style={{ fontFamily: 'var(--font-body)', fontSize: 14 }}> - {savedNote}</span>}
        </button>
        <button className="btn danger" onClick={onMainMenu}>
          Main Menu
        </button>
      </div>
    </Modal>
  );
}
