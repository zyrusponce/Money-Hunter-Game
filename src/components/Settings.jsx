import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const isFullscreen = () => typeof document !== 'undefined' && !!document.fullscreenElement;

export default function Settings({ settings, onChange, onResetSave, onClose }) {
  const [fs, setFs] = useState(isFullscreen());
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const on = () => setFs(isFullscreen());
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  const toggleFullscreen = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) document.exitFullscreen();
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="mus">Music volume</label>
          <span>{Math.round(settings.music * 100)}%</span>
          <input id="mus" type="range" min="0" max="1" step="0.05" value={settings.music} onChange={(e) => onChange({ music: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="sfx">Sound volume</label>
          <span>{Math.round(settings.sfx * 100)}%</span>
          <input id="sfx" type="range" min="0" max="1" step="0.05" value={settings.sfx} onChange={(e) => onChange({ sfx: Number(e.target.value) })} />
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>Fullscreen</span>
          <button className="btn small ghost" onClick={toggleFullscreen}>
            {fs ? 'Exit fullscreen' : 'Go fullscreen'}
          </button>
        </div>

        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>Touch controls</span>
          <div className="seg" role="group" aria-label="Touch controls">
            {['auto', 'on', 'off'].map((v) => (
              <button key={v} className={settings.touch === v ? 'on' : ''} onClick={() => onChange({ touch: v })}>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <hr className="hr" />
        <div>
          <b>Controls</b>
          <div className="keys" style={{ marginTop: 10 }}>
            <span>
              <kbd className="k">WASD</kbd> <kbd className="k">Arrows</kbd>
            </span>
            <span>Move</span>
            <kbd className="k">Shift</kbd>
            <span>Hold to run</span>
            <span>
              <kbd className="k">E</kbd> <kbd className="k">Space</kbd>
            </span>
            <span>Interact, search, dig, talk, continue</span>
            <kbd className="k">B</kbd>
            <span>Money Encyclopedia</span>
            <kbd className="k">M</kbd>
            <span>World Map</span>
            <kbd className="k">Q</kbd>
            <span>Quests</span>
            <kbd className="k">I</kbd>
            <span>Inventory</span>
            <kbd className="k">Esc</kbd>
            <span>Pause menu</span>
          </div>
        </div>

        <hr className="hr" />
        {!confirming ? (
          <button className="btn danger small" onClick={() => setConfirming(true)}>
            Reset save
          </button>
        ) : (
          <div className="stack">
            <span>This deletes your saved progress in this browser. It cannot be undone.</span>
            <div className="row">
              <button
                className="btn danger small"
                onClick={() => {
                  setConfirming(false);
                  onResetSave();
                }}
              >
                Yes, delete it
              </button>
              <button className="btn ghost small" onClick={() => setConfirming(false)}>
                Keep it
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
