import { useState } from 'react';
import Modal from './Modal.jsx';
import { LOCATION_LIST, WORLD_LINKS, LOCATIONS } from '../data/locations.js';
import { CURRENCIES } from '../data/currencies.js';

const ICONS = {
  town: '\u{1F3E0}',
  market: '\u{1F6D2}',
  beach: '\u{1F3D6}\uFE0F',
  forest: '\u{1F332}',
  abandoned: '\u{1F3DA}\uFE0F',
  museum: '\u{1F3DB}\uFE0F',
  harbor: '\u2693',
  island: '\u{1F3DD}\uFE0F',
  city: '\u{1F3D9}\uFE0F',
  cave: '\u26F0\uFE0F',
  ruins: '\u{1F5FF}',
  secret: '\u2728',
  final: '\u{1F451}',
};

const SHORT = { town: 'Town', market: 'Market', beach: 'Beach', forest: 'Forest', abandoned: 'Old Building', museum: 'Museum', harbor: 'Harbor', island: 'Coral Isle', city: 'City', cave: 'Cave', ruins: 'Ruins', secret: 'Secret Vault', final: 'Treasury' };

// Which locations are named on the map. Secret places stay "???" until they are known.
function isKnown(id, snap) {
  if (snap.visited[id]) return true;
  if (id === 'secret') return snap.percent >= LOCATIONS.secret.unlockRequirement;
  if (id === 'final') return snap.complete;
  if (id === 'island') return !!snap.items.boat_pass;
  return true;
}

export default function WorldMap({ snapshot, onClose }) {
  const [selected, setSelected] = useState(snapshot.map);
  const pct = snapshot.percent;
  const sel = LOCATIONS[selected];
  const selKnown = isKnown(selected, snapshot);
  const selUnlocked = pct >= sel.unlockRequirement;
  const foundHere = CURRENCIES.filter((c) => c.location === sel.area && snapshot.discovered[c.id]).length;
  const totalHere = CURRENCIES.filter((c) => c.location === sel.area).length;
  const questsHere = snapshot.markers[selected] || [];

  return (
    <Modal title="World Map" onClose={onClose} wide>
      <div className="map-wrap">
        <div>
          <svg className="map-svg" viewBox="0 0 100 72" role="img" aria-label="Map of the Money Hunter world">
            <defs>
              <pattern id="waves" width="8" height="6" patternUnits="userSpaceOnUse">
                <path d="M0 3 q2 -2 4 0 t4 0" fill="none" stroke="#2a75a8" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="72" fill="#1a5a8a" />
            <rect width="100" height="72" fill="url(#waves)" opacity="0.7" />
            <polygon points="72,54 80,51 92,52 98,58 94,66 82,68 74,63" fill="#e8d391" stroke="#050d18" strokeWidth="0.6" />
            <polygon points="3,5 98,3 99,46 74,49 72,64 26,64 24,49 3,47" fill="#e8d391" stroke="#050d18" strokeWidth="0.8" />
            <polygon points="5,7 96,5 97,44 72,47 70,61 28,61 26,47 5,45" fill="#4c9a5a" />
            <ellipse cx="30" cy="17" rx="22" ry="11" fill="#2f7a48" />
            <polygon points="44,4 66,3 92,5 94,26 84,28 70,20 52,22 44,16" fill="#7b8092" />
            <polygon points="48,6 56,5 60,12 52,15" fill="#9aa0b4" />
            <ellipse cx="82" cy="38" rx="14" ry="9" fill="#8a8a92" />
            <ellipse cx="60" cy="38" rx="9" ry="7" fill="#c9a86a" opacity="0.75" />

            {WORLD_LINKS.map(([a, b]) => {
              const A = LOCATIONS[a].mapPos;
              const B = LOCATIONS[b].mapPos;
              const hidden = !isKnown(a, snapshot) || !isKnown(b, snapshot);
              if (hidden) return null;
              return <line key={a + b} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#f1e2b8" strokeWidth="0.7" strokeDasharray="1.6 1.4" opacity="0.85" />;
            })}

            {LOCATION_LIST.map((l) => {
              const known = isKnown(l.id, snapshot);
              const unlocked = pct >= l.unlockRequirement;
              const here = snapshot.map === l.id;
              const marks = snapshot.markers[l.id];
              return (
                <g key={l.id} className="node" transform={`translate(${l.mapPos.x} ${l.mapPos.y})`} onClick={() => setSelected(l.id)}>
                  {here && <circle className="you" r="5" fill="none" stroke="#62d26f" strokeWidth="0.9" />}
                  <circle className="base" r="3.6" fill={!known ? '#3a4658' : unlocked ? '#f2c14e' : '#6c7a8e'} stroke={selected === l.id ? '#ffffff' : '#050d18'} strokeWidth={selected === l.id ? 1 : 0.7} />
                  <text className="ico" y="1.5" textAnchor="middle" style={{ fontSize: '4px', stroke: 'none' }}>
                    {!known ? '?' : unlocked ? ICONS[l.id] : '\u{1F512}'}
                  </text>
                  <text y="7.4" textAnchor="middle">
                    {known ? SHORT[l.id] || l.area : '???'}
                  </text>
                  {marks && (
                    <g transform="translate(3.6 -4)">
                      <circle r="1.9" fill="#ff9a3c" stroke="#050d18" strokeWidth="0.5" />
                      <text y="0.9" textAnchor="middle" style={{ fontSize: '2.6px', stroke: 'none', fontWeight: 700 }}>
                        !
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="legend">
            <span>Green pulse: you are here. Orange !: a quest objective. Padlock: keep collecting money to unlock it.</span>
            <span>Exact locations of rare money are never shown. Use the Money Detector and ask around.</span>
          </div>
        </div>

        <div className="map-info">
          <h4>{selKnown ? sel.name : '???'}</h4>
          <div>
            {snapshot.map === selected && <span className="badge here">You are here</span>}
            {selKnown && !selUnlocked && <span className="badge lock">Locked: {sel.unlockRequirement}%</span>}
            {selKnown && selUnlocked && <span className="badge">Open</span>}
            {questsHere.length > 0 && <span className="badge quest">Quest</span>}
          </div>
          {selKnown ? (
            <>
              <p>{sel.description}</p>
              {!selUnlocked && (
                <p>
                  Reach {sel.unlockRequirement}% Encyclopedia completion to unlock. You are at {pct}%.
                </p>
              )}
              {snapshot.visited[selected] && (
                <p>
                  Money found here: {foundHere} / {totalHere}
                </p>
              )}
              {sel.landmarks && sel.landmarks.length > 0 && (
                <p>
                  <b>Landmarks:</b> {sel.landmarks.join(', ')}
                </p>
              )}
              {questsHere.map((q) => (
                <p key={q}>
                  <b>Quest:</b> {q}
                </p>
              ))}
            </>
          ) : (
            <p>A place you have not heard about yet. Keep exploring, and keep collecting.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
