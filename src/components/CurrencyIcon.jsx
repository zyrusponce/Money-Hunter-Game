import { useMemo } from 'react';
import { getCurrencyIcon } from '../game/currencyIcons.js';

// A pixel-art currency icon. With `silhouette`, it is drawn as a dark shape (undiscovered money).
export default function CurrencyIcon({ currency, silhouette = false, className = '' }) {
  const src = useMemo(() => getCurrencyIcon(currency), [currency]);
  return <img className={`cicon${silhouette ? ' sil' : ''} ${className}`} src={src} alt="" draggable={false} />;
}
