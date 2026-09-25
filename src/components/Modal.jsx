import { useRef } from 'react';
import useDialogFocus from './useDialogFocus.js';
// Shared journal panel; the world stays visible around it.
export default function Modal({ title, onClose, wide = false, children }) {
  const ref=useRef(null);useDialogFocus(ref);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div ref={ref} tabIndex={-1} className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div><span className="eyebrow">EXPLORER’S FIELD JOURNAL</span><h2>{title}</h2></div>
          {onClose && (
            <button className="close-x" onClick={onClose} aria-label="Close">
              ✕ <span className="key-hint">Esc</span>
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
