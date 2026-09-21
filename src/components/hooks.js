import { useEffect, useState } from 'react';

// Subscribe a component to one engine event. `initial` may be a function of the game.
export function useGameEvent(game, evt, initial = null) {
  const [value, setValue] = useState(() => (typeof initial === 'function' ? initial(game) : initial));
  useEffect(() => {
    if (!game) return undefined;
    return game.on(evt, setValue);
  }, [game, evt]);
  return value;
}

// True on touch-first devices, unless overridden in settings.
export function useTouchMode(setting) {
  const query = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const [coarse, setCoarse] = useState(query);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(pointer: coarse)');
    const on = () => setCoarse(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on));
  }, []);
  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return coarse;
}

export const fmtTime = (seconds) => {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
};
