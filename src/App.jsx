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
import RewardFeed from './components/RewardFeed.jsx';
import ExplorerShop from './components/ExplorerShop.jsx';
import SkillTree from './components/SkillTree.jsx';
import AchievementGallery from './components/AchievementGallery.jsx';
import ProgressMenu from './components/ProgressMenu.jsx';
import ProfilePicker from './components/ProfilePicker.jsx';
import Statistics from './components/Statistics.jsx';
import SocialMenu from './components/SocialMenu.jsx';
import SaveSummary from './components/SaveSummary.jsx';
import { useTouchMode } from './components/hooks.js';
import { audio } from './game/audio.js';
import { clearSave, loadSave, readSave, loadSettings, saveSettings, normalizeSettings } from './game/saveSystem.js';
import { actionForCode } from './game/controls.js';
import { createNewState } from './game/state.js';
import { snapshotFromState } from './game/snapshot.js';

const MENU_ACTIONS = new Set(['encyclopedia','map','quests','inventory']);

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing'
  const [session, setSession] = useState(0);
  const [startState, setStartState] = useState(null);
  const [stack, setStack] = useState([]); // open overlays, top is last
  const [settings, setSettings] = useState(loadSettings);
  const [save, setSave] = useState(() => loadSave());
  const [saveStatus,setSaveStatus]=useState(()=>readSave());
  const [revision,setRevision]=useState(0);
  const [entry,setEntry]=useState(null);
  const [sessionSummary,setSessionSummary]=useState(null);
  const sessionStart=useRef(null);
  const [game, setGame] = useState(null);
  const [savedNote, setSavedNote] = useState('');
  const [confirmNew, setConfirmNew] = useState(false);
  const gameRef = useRef(null);
  const touch = useTouchMode(settings.touch);

  // ---- overlays
  const open = useCallback((name,entryId=null) => {
    if(name==='encyclopedia') {setEntry(entryId);const g=gameRef.current;if(g&&g.s.progression.tutorial==='encyclopedia'){g.s.progression.tutorial='done';g.hud(true);g.save();}}
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
  useEffect(()=>game?.on('change',()=>setRevision(r=>r+1)),[game]);

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
    audio.setVolumes(settings.master*settings.music, settings.master*settings.sfx);
    gameRef.current?.setSettings(settings);
    const root=document.documentElement;
    root.style.setProperty('--ui-scale',settings.uiScale);
    root.style.setProperty('--text-scale',settings.textScale);
    root.dataset.motion=settings.reducedMotion||settings.animationIntensity===0?'reduced':'full';
    root.dataset.contrast=settings.highContrast?'high':'normal';
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
        else if(gameRef.current?.rt.mode==='popup')gameRef.current.dismissPopup();
        else if (screen === 'playing') open('pause');
        return;
      }
      if (screen !== 'playing' || e.repeat) return;
      const action=actionForCode(settings.bindings,e.code);
      const name = MENU_ACTIONS.has(action)?action:null;
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
  }, [screen, stack, open, close,settings.bindings]);

  // ---- game flow
  const startNew = () => {
    if(!clearSave()){setSavedNote('Unable to replace save data. Please try again.');return;}
    setSave(null);
    setStartState(null);
    setStack([]);
    setSession((n) => n + 1);
    setScreen('playing');
    setConfirmNew(false);
    sessionStart.current=snapshotFromState(createNewState());
  };
  const onNew = () => (save || ['corrupt','unsupported','unavailable'].includes(saveStatus.status) ? setConfirmNew(true) : startNew());
  const onContinue = () => {
    const result=readSave();setSaveStatus(result);
    const st = result.state;
    if (!st) {setStack([]);return;}
    sessionStart.current=snapshotFromState(st);
    setStartState(st);
    setStack([]);
    setSession((n) => n + 1);
    setScreen('playing');
  };
  const toMainMenu = () => {
    const latest=gameRef.current?.getSnapshot(),start=sessionStart.current;
    if(latest&&start)setSessionSummary({currencies:latest.count-start.count,quests:latest.quests.done.length-start.quests.done.length,secrets:latest.stats.secretsFound-start.stats.secretsFound,xp:latest.progression.xp-start.progression.xp,coins:latest.progression.coinsEarned-start.progression.coinsEarned,from:start.percent,to:latest.percent});
    if (gameRef.current) gameRef.current.save();
    setSave(loadSave());
    setSaveStatus(readSave());
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
    if(!clearSave()){setSavedNote('Unable to reset save data. Try again.');return;}
    setSave(null);
    setSaveStatus(readSave());
    if (screen === 'playing') {
      setStack([]);
      setScreen('menu');
    }
  };
  const updateSettings = (patch) => {
    const next = normalizeSettings({ ...settings, ...patch });
    setSettings(next);
    saveSettings(next);
  };

  // ---- data for overlays
  const snapshot = useMemo(() => {
    if (!stack.length) return null;
    if (screen === 'playing' && gameRef.current) return gameRef.current.getSnapshot();
    return snapshotFromState(save || createNewState());
  }, [stack, screen, save,revision]);
  const onCommand=(name,...args)=>{const result=gameRef.current?.command(name,...args)||{ok:false,reason:'Start your adventure first.'};setSavedNote(result.reason);setRevision(r=>r+1);return result;};

  const renderOverlay = (name) => {
    switch (name) {
      case 'pause':
        return <PauseMenu onResume={close} onOpen={open} onSave={saveNow} onMainMenu={toMainMenu} savedNote={savedNote} />;
      case 'encyclopedia':
        return <Encyclopedia snapshot={snapshot} initialEntry={entry} onClose={close} />;
      case 'map':
        return <WorldMap snapshot={snapshot} onClose={close} onTravel={id=>{if(game?.fastTravel(id).ok)setStack([]);}} />;
      case 'quests':
        return <QuestMenu snapshot={snapshot} onClose={close} onTrack={id=>game?.trackQuest(id)} />;
      case 'inventory':
        return <Inventory snapshot={snapshot} onClose={close} onCommand={onCommand} onTool={id=>game?.equipTool(id)} />;
      case 'maps':
        return <Inventory snapshot={snapshot} initialTab="maps" onClose={close} onCommand={onCommand} onTool={id=>game?.equipTool(id)} />;
      case 'shop': return <ExplorerShop snapshot={snapshot} onClose={close} onCommand={onCommand}/>;
      case 'skills': return <SkillTree snapshot={snapshot} onClose={close} onCommand={onCommand}/>;
      case 'achievements': return <AchievementGallery snapshot={snapshot} onClose={close}/>;
      case 'progress': return <ProgressMenu snapshot={snapshot} onClose={close} onOpen={open}/>;
      case 'profile': return <ProfilePicker snapshot={snapshot} onClose={close} onCommand={onCommand}/>;
      case 'statistics': return <Statistics snapshot={snapshot} onClose={close}/>;
      case 'social': return <SocialMenu snapshot={snapshot} game={game} onClose={close} onOpen={open} onCommand={onCommand}/>;
      case 'continue': return <SaveSummary snapshot={snapshot} onClose={close} onContinue={onContinue}/>;
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
      {screen === 'menu' && <MainMenu save={save} settings={settings} saveStatus={saveStatus} sessionSummary={sessionSummary} onRetry={()=>{const result=readSave();setSaveStatus(result);setSave(result.state||null);}} onNew={onNew} onContinue={()=>open('continue')} onOpen={open} />}

      {screen === 'playing' && (
        <GameCanvas key={session} initialState={startState} settings={settings} onReady={onReady}>
          {(g) => (
            <>
              <HUD game={g} touch={touch} onOpen={open} />
              <DialogueBox game={g} />
              <RewardFeed game={g} onOpen={open}/>
              <DiscoveryPopup game={g} touch={touch} onOpen={open}/>
            </>
          )}
        </GameCanvas>
      )}

      {screen === 'playing' && touch && game && stack.length === 0 && <TouchControls game={game} onOpen={open}/>}
      {top==='ending'&&<style>{'.adventure-hud,.reward-feed,.discovery-feed,.touch{visibility:hidden}'}</style>}

      {top && snapshot && renderOverlay(top)}

      {confirmNew && (
        <Modal title="Start a new game?" onClose={() => setConfirmNew(false)}>
          <p style={{ marginTop: 0 }}>You have saved progress. Starting over will replace it.</p>
          <div className="row">
            <button className="btn danger small" onClick={startNew}>
              Start over
            </button>
            <button className="btn ghost small" data-autofocus onClick={() => setConfirmNew(false)}>
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
