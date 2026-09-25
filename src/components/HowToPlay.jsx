import Modal from './Modal.jsx';
import { RARITIES, RARITY_INFO } from '../data/currencies.js';

export default function HowToPlay({ onClose }) {
  return (
    <Modal title="How to Play" onClose={onClose} wide>
      <div className="howto">
        <h3>The goal</h3>
        <p>
          Travel the world, find every kind of money, and fill the <b>Money Encyclopedia</b> to 100%. There is no combat, only exploring, puzzles, secrets and friendly people.
        </p>

        <h3>Controls</h3>
        <div className="keys">
          <span>
            <kbd className="k">WASD</kbd> <kbd className="k">Arrows</kbd>
          </span>
          <span>Walk (hold Shift to run)</span>
          <span>
            <kbd className="k">E</kbd> <kbd className="k">Space</kbd>
          </span>
          <span>Interact: talk, search, dig, open, read</span>
          <span>
            <kbd className="k">C</kbd> <kbd className="k">M</kbd> <kbd className="k">J</kbd> <kbd className="k">B</kbd>
          </span>
          <span>Encyclopedia, Map, Quests, Inventory</span>
          <kbd className="k">Esc</kbd>
          <span>Pause and save</span>
        </div>
        <p className="muted">On a phone or tablet, use the on-screen joystick and the A button.</p>

        <h3>The Money Detector</h3>
        <p>
          Your detector beeps when hidden money is near: <b>Weak Signal</b>, then <b>Signal Getting Stronger</b>, then <b>Money Nearby!</b> When you see that, press E to search. Rarer money gives a weaker signal, so it is harder to find. The Improved Money Detector reaches farther.
        </p>

        <h3>Rarity</h3>
        <div className="rar-row">
          {RARITIES.map((r) => (
            <span key={r} className="rarity-tag" style={{ '--rc': RARITY_INFO[r].color }}>
              {r}
            </span>
          ))}
        </div>
        <ul>
          <li>Common money lies around towns and buildings.</li>
          <li>Uncommon and Rare money needs exploring and the right tools.</li>
          <li>Epic money hides behind quests, puzzles and secrets.</li>
          <li>Legendary money sleeps in the oldest, deepest, most secret places.</li>
        </ul>

        <h3>Tips</h3>
        <ul>
          <li>Talk to everyone. A yellow ! above someone means they have a quest.</li>
          <li>A dirt mound or a strong signal with nothing in sight means: dig! You will need a shovel.</li>
          <li>Suspicious walls, bushes and crates can hide secret rooms. Press E on them.</li>
          <li>Finding money you already own gives a <b>duplicate</b>. Trade duplicates with The Money Collector in Sunny Town.</li>
          <li>New areas unlock as your Encyclopedia grows. Check the World Map.</li>
          <li>The game saves automatically, and every time something important happens.</li>
        </ul>
      </div>
    </Modal>
  );
}
