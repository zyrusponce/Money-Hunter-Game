// LocalStorage persistence for the game save and the settings.
import { migrateState } from './state.js';
import { validateSave } from './saveValidation.js';
import { DEFAULT_BINDINGS, validateBinding } from './controls.js';

const SAVE_KEY = 'moneyhunter.save.v1';
const SETTINGS_KEY = 'moneyhunter.settings.v1';

const ls = () => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null; // storage can be blocked in some private modes
  }
};

export function hasSave() {
  try { const store = ls(); return !!store && !!store.getItem(SAVE_KEY); } catch { return false; }
}

export function loadSave() {
  return readSave().state || null;
}

export function readSave() {
  const store = ls();
  if (!store) return { status: 'unavailable', message: 'Saving is unavailable in this browser.' };
  let raw;
  try {
    raw = store.getItem(SAVE_KEY);
  } catch { return { status: 'unavailable', message: 'Unable to read save data. Your existing save has not been deleted.' }; }
  if (!raw) return { status: 'missing' };
  try {
    const data = JSON.parse(raw);
    const result = validateSave(data);
    if (!result.ok) return { status: result.reason, message: 'Unable to load save data. Your existing save has not been deleted.' };
    return { status: 'ok', state: migrateState(data) };
  } catch {
    return { status: 'corrupt', message: 'Unable to load save data. Your existing save has not been deleted.' };
  }
}

export function writeSave(state) {
  const store = ls();
  if (!store) return false;
  try {
    store.setItem(SAVE_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
    return true;
  } catch (err) {
    console.warn('[MoneyHunter] could not write save', err);
    return false;
  }
}

export function clearSave() {
  const store = ls();
  try { if (store) store.removeItem(SAVE_KEY); return true; } catch { return false; }
}

export const DEFAULT_SETTINGS = { master:1,music:0.5,sfx:0.7,touch:'auto',uiScale:1,textScale:1,highContrast:false,screenShake:true,animationIntensity:1,reducedMotion:typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches,bindings:DEFAULT_BINDINGS };
export function normalizeSettings(raw={}) {
  const s={...DEFAULT_SETTINGS};
  for(const [key,min,max] of [['master',0,1],['music',0,1],['sfx',0,1],['uiScale',.8,1.4],['textScale',1,1.5],['animationIntensity',0,1]])if(Number.isFinite(raw[key]))s[key]=Math.max(min,Math.min(max,raw[key]));
  for(const key of ['highContrast','screenShake','reducedMotion'])if(typeof raw[key]==='boolean')s[key]=raw[key];
  if(['auto','on','off'].includes(raw.touch))s.touch=raw.touch;
  s.bindings={...DEFAULT_BINDINGS};
  if(raw.bindings&&typeof raw.bindings==='object') {
    const candidate={...DEFAULT_BINDINGS,...raw.bindings};
    if(Object.entries(candidate).every(([action,code])=>validateBinding(candidate,action,code).ok))s.bindings=candidate;
  }
  return s;
}

export function loadSettings() {
  const store = ls();
  if (!store) return { ...DEFAULT_SETTINGS };
  try {
    return normalizeSettings(JSON.parse(store.getItem(SETTINGS_KEY)) || {});
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const store = ls();
  if (store) {
    try {
      store.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }
}
