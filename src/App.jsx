import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas.jsx';
import HUD from './components/HUD.jsx';
import DialogueBox from './components/DialogueBox.jsx';
import DiscoveryPopup from './components/DiscoveryPopup.jsx';
import TouchControls from './components/TouchControls.jsx';
import MainMenu from './components/MainMenu.jsx';
import PauseMenu from './components/PauseMenu.jsx';
import Encyclopedia from './components/Encyclopedia.jsx';
import WorldMap from './components/WorldMap.jsx';
import QuestMenu from './components/QuestMenu.jsx';
import Inventory from './components/Inventory.jsx';
import Settings from './components/Settings.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import TradeMenu from './components/TradeMenu.jsx';
import EndingScreen from './components/EndingScreen.jsx';
import Modal from './components/Modal.jsx';
import { useTouchMode } from './components/hooks.js';
import { audio } from './game/audio.js';
import { clearSave, loadSave, loadSettings, saveSettings } from './game/saveSystem.js';
import { createNewState } from './game/state.js';
import { snapshotFromState } from './game/snapshot.js';

const HOTKEYS = { KeyB: 'encyclopedia', KeyM: 'map', KeyQ: 'quests', KeyI: 'inventory' };

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing'
  const [session, setSession] = useState(0);
  const [startState, setStartState] = useState(null);
  const [stack, setStack] = useState([]); // open overlays, top is last
  const [settings, setSettings] = useState(loadSettings);
  const [save, setSave] = useState(() => loadSave());
  const [game, setGame] = useState(null);
  const [savedNote, setSavedNote] = useState('');
  const [confirmNew, setConfirmNew] = useState(false);
  const gameRef = useRef(null);
  const touch = useTouchMode(settings.touch);

  // ---- overlays
  const open = useCallback((name) => {
    setStack((s) => (s[s.length - 1] === name ? s : [...s, name]));
    if (gameRef.current) gameRef.current.setPaused(true);
  }, []);
  const close = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  // the engine is paused whenever any overlay is open
  useEffect(() => {
    if (gameRef.current) gameRef.current.setPaused(stack.length > 0);
  }, [stack, game]);

  const onReady = useCallback((g) => {
    gameRef.current = g;
    setGame(g);
    if (g) g.save();
  }, []);

  // the engine asks for the trade screen / ending screen
  useEffect(() => {
    if (!game) return undefined;
    return game.on('menu', (name) => {
      game.setPaused(true);
      setStack((s) => [...s, name]);
    });
  }, [game]);

  // ---- audio: browsers need a user gesture before sound can start
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);
  useEffect(() => {
    audio.setVolumes(settings.music, settings.sfx);
  }, [settings]);
  useEffect(() => {
    if (screen === 'menu') audio.music('menu');
  }, [screen]);

  // ---- keyboard: Escape and hotkeys
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.code === 'Escape') e.target.blur();
        return;
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        if (stack.length) close();
        else if (screen === 'playing') open('pause');
        return;
      }
      if (screen !== 'playing' || e.repeat) return;
      const name = HOTKEYS[e.code];
      if (!name) return;
      if (stack.length) {
        if (stack[stack.length - 1] === name) close();
        return;
      }
      const g = gameRef.current;
      if (g && g.rt.mode === 'explore') open(name);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, stack, open, close]);

  // ---- game flow
  const startNew = () => {
    clearSave();
    setSave(null);
    setStartState(null);
    setStack([]);
    setSession((n) => n + 1);
    setScreen('playing');
    setConfirmNew(false);
  };
  const onNew = () => (save ? setConfirmNew(true) : startNew());
  const onContinue = () => {
    const st = loadSave();
    if (!st) return;
    setStartState(st);
    setStack([]);
    setSession((n) => n + 1);
    setScreen('playing');
  };
  const toMainMenu = () => {
    if (gameRef.current) gameRef.current.save();
    setSave(loadSave());
    setStack([]);
    setScreen('menu');
  };
  const saveNow = () => {
    if (gameRef.current && gameRef.current.save()) {
      setSavedNote('Saved!');
      setTimeout(() => setSavedNote(''), 2200);
    } else {
      setSavedNote('Could not save (storage blocked?)');
    }
  };
  const resetSave = () => {
    clearSave();
    setSave(null);
    if (screen === 'playing') {
      setStack([]);
      setScreen('menu');
    }
  };
  const updateSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  // ---- data for overlays
  const snapshot = useMemo(() => {
    if (!stack.length) return null;
    if (screen === 'playing' && gameRef.current) return gameRef.current.getSnapshot();
    return snapshotFromState(save || createNewState());
  }, [stack, screen, save]);

  const renderOverlay = (name) => {
    switch (name) {
      case 'pause':
        return <PauseMenu onResume={close} onOpen={open} onSave={saveNow} onMainMenu={toMainMenu} savedNote={savedNote} />;
      case 'encyclopedia':
        return <Encyclopedia snapshot={snapshot} onClose={close} />;
      case 'map':
        return <WorldMap snapshot={snapshot} onClose={close} />;
      case 'quests':
        return <QuestMenu snapshot={snapshot} onClose={close} />;
      case 'inventory':
        return <Inventory snapshot={snapshot} onClose={close} />;
      case 'settings':
        return <Settings settings={settings} onChange={updateSettings} onResetSave={resetSave} onClose={close} />;
      case 'howto':
        return <HowToPlay onClose={close} />;
      case 'trade':
        return game ? <TradeMenu game={game} onClose={close} /> : null;
      case 'ending':
        return <EndingScreen snapshot={snapshot} onClose={close} />;
      default:
        return null;
    }
  };

  const top = stack[stack.length - 1];

  return (
    <div className="app">
      {screen === 'menu' && <MainMenu save={save} onNew={onNew} onContinue={onContinue} onOpen={open} />}

      {screen === 'playing' && (
        <GameCanvas key={session} initialState={startState} settings={settings} onReady={onReady}>
          {(g) => (
            <>
              <HUD game={g} touch={touch} onOpen={open} />
              <DialogueBox game={g} />
              <DiscoveryPopup game={g} touch={touch} />
            </>
          )}
        </GameCanvas>
      )}

      {screen === 'playing' && touch && game && stack.length === 0 && <TouchControls game={game} />}

      {top && snapshot && renderOverlay(top)}

      {confirmNew && (
        <Modal title="Start a new game?" onClose={() => setConfirmNew(false)}>
          <p style={{ marginTop: 0 }}>You have saved progress. Starting over will replace it.</p>
          <div className="row">
            <button className="btn danger small" onClick={startNew}>
              Start over
            </button>
            <button className="btn ghost small" onClick={() => setConfirmNew(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
