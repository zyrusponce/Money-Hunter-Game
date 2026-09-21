// LocalStorage persistence for the game save and the settings.
import { migrateState } from './state.js';

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
  const store = ls();
  return !!store && !!store.getItem(SAVE_KEY);
}

export function loadSave() {
  const store = ls();
  if (!store) return null;
  try {
    const raw = store.getItem(SAVE_KEY);
    return raw ? migrateState(JSON.parse(raw)) : null;
  } catch (err) {
    console.warn('[MoneyHunter] could not read save', err);
    return null;
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
  if (store) store.removeItem(SAVE_KEY);
}

export const DEFAULT_SETTINGS = { music: 0.5, sfx: 0.7, touch: 'auto' };

export function loadSettings() {
  const store = ls();
  if (!store) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(store.getItem(SETTINGS_KEY)) || {}) };
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
