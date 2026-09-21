import { useEffect, useState } from 'react';
import { useGameEvent } from './hooks.js';

// NPC / sign dialogue. The engine owns the logic; this only draws the current page.
export default function DialogueBox({ game }) {
  const d = useGameEvent(game, 'dialogue', null);
  const [shown, setShown] = useState(0);
  const text = d ? d.text : '';

  useEffect(() => {
    setShown(0);
    if (!text) return undefined;
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setShown(i);
      if (i >= text.length) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [text, d && d.page]);

  if (!d) return null;
  return (
    <div className="hud" style={{ pointerEvents: 'none' }}>
      <div className="dialogue" role="dialog" aria-live="polite" onClick={() => !d.choices && game.advance()}>
        {d.speaker && (
          <div className="who">
            {d.speaker}
            {d.title && <small>{d.title}</small>}
          </div>
        )}
        <div className="text">{text.slice(0, shown)}</div>
        {d.choices && shown >= text.length ? (
          <div className="choices">
            {d.choices.map((label, i) => (
              <button
                key={label}
                className={i === d.choiceIdx ? 'sel' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  game.choose(i);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        ) : (
          !d.choices && <div className="more">{d.page < d.pages - 1 ? 'NEXT' : 'OK'}</div>
        )}
      </div>
    </div>
  );
}
