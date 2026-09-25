# Money Hunter

A relaxing 2D top-down exploration and collection game for the browser, built with **React + Vite + JavaScript**.

Explore 13 areas, find **111 kinds of money** (coins, banknotes, foreign, old, historical, commemorative, special edition, ancient and secret fictional currencies), and fill the **Money Encyclopedia** to 100%.

There is no combat. It is all exploring, searching, digging, puzzles, quests and secrets.

```
Explore -> Search -> Discover Money -> Add to Encyclopedia -> Unlock New Locations -> Find Rarer Money -> Complete the Encyclopedia
```

---

## Quick start

You need Node.js 22.12 or newer (verified with Node 24).

```bash
npm install
npm run dev
```

Open the address Vite prints (usually http://localhost:5173).

### Production build

```bash
npm run build      # creates the deployable ./dist folder
npm run preview    # optional: serve ./dist locally to test it
```

### Self-check (optional)

```bash
npm run check
npm run test:rewards
```

This runs two Node scripts that need no browser:

- `scripts/validate-data.mjs` checks every map, NPC, item and currency reference; verifies that everything is reachable; and simulates a full playthrough to prove the Encyclopedia can reach 100%.
- `scripts/smoke-test.mjs` drives the real game engine (movement, collisions, pickups, quests, puzzles, saving, trading, ending) with a stubbed canvas.

Run it after you edit maps or currency data.

---

## How to play

| Key | Action |
| --- | --- |
| `WASD` / Arrow keys | Move (hold `Shift` to run) |
| `E` / `Space` / `Enter` | Interact: talk, search, dig, open, read, continue |
| `C` | Money Encyclopedia |
| `M` | World Map |
| `J` / `Q` | Quests |
| `B` / `I` | Inventory |
| `1` / `2` / `3` / `4` | Detector / Shovel / Flashlight / Treasure Maps |
| `Esc` | Pause menu |

On phones and tablets an on-screen joystick and **A** button appear automatically (you can force them on or off in Settings).

**The Money Detector** beeps when hidden money is near: *Weak Signal*, then *Signal Getting Stronger*, then *Money Nearby!* Then press `E` to search. Rarer money gives a weaker signal. The Improved Money Detector (a quest reward) reaches farther.

**Rarity:** Common, Uncommon, Rare, Epic and Legendary. Epic money hides behind quests, puzzles and secrets. Legendary money sleeps in the most secret places.

**Progression (Encyclopedia completion):**

| Completion | Unlocks |
| --- | --- |
| 10% | Grand Market |
| 25% | Whispering Forest |
| 30% | Capital City |
| 40% | Sunny Harbor |
| 50% | Museum restricted wing (also needs the Museum Pass) |
| 60% | Echo Cave (also needs a flashlight) |
| 75% | Ancient Ruins |
| 90% | The Gilded Vault (secret location) |
| 100% | Treasury of Worlds, completion badge and the ending |

Abandoned Building needs the Rusty Key (from a quest) and Coral Isle needs the Boat Pass (from a quest).

**Explorer rewards:** discoveries, quests, secrets, chests, collections and exploration earn Explorer XP and fictional Hunter Coins. Levels award Upgrade Points. Spend coins in the Explorer Shop and points across three skill branches. There are no real-money purchases or timed streak penalties. Small collections grant scaled rewards; larger sets grant up to 500 XP and coins, an outfit and a badge.

**Duplicates:** sell extras from the Backpack, trade with **The Money Collector**, or give them to nearby friends. Currency entries remain in the Encyclopedia.

**More to explore:** authored treasure chests and clue maps, a five-part Collector's Mystery, optional friendships, persistent world requests, area mastery, world milestones and a final quest. The Progress journal, Achievement Gallery and Statistics page track your adventure using actual catalog totals.

**Accessibility:** Settings includes remappable letter/number controls, UI and text scale, high contrast, reduced motion, animation intensity, screen shake and separate audio volumes. Menus support keyboard focus and mobile layouts. Tool 4 opens your treasure clues; touch controls include movement, interaction, Tool and Menu.

---

## Deploying

The game is a pure client-side app. There is no backend, and no client-side router (screens are state-driven), so deployment is just static hosting. `vite.config.js` sets `base: './'`, so all asset paths are relative and work in sub-folders too.

### Vercel
Import the repo. Vercel detects Vite automatically (`vercel.json` is included). Build command `npm run build`, output `dist`.

### Netlify
Import the repo (`netlify.toml` is included), or drag the `dist` folder onto netlify.com/drop.

### GitHub Pages
A workflow is included at `.github/workflows/deploy.yml`. Push to `main`, then in the repo go to **Settings > Pages > Source: GitHub Actions**. Because paths are relative, it works under `https://user.github.io/repo-name/` without any extra config.

---

## Project structure

```
src/
  main.jsx  App.jsx  styles.css
  components/          React UI (menus, HUD, encyclopedia, map, dialogue, popups ...)
    GameCanvas.jsx  HUD.jsx  MainMenu.jsx  PauseMenu.jsx
    Encyclopedia.jsx  EncyclopediaEntry.jsx  QuestMenu.jsx  WorldMap.jsx
    DialogueBox.jsx  DiscoveryPopup.jsx  Settings.jsx  HowToPlay.jsx
    Inventory.jsx  TradeMenu.jsx  EndingScreen.jsx  TouchControls.jsx ...
  game/                Game logic. Plain JavaScript, no React.
    engine.js          game loop (requestAnimationFrame), input, state changes, events
    player.js  movement.js  collisions.js  collectibles.js  interactions.js
    quests.js  detector.js  trade.js  progression.js  conditions.js  saveSystem.js
    renderer.js  sprites.js  groundTiles.js  topTiles.js  currencyIcons.js  audio.js
  data/                Game content. Edit these to change the game.
    currencies.js  locations.js  quests.js  npcs.js  items.js  tiles.js  sources.js
    maps/*.js          one file per area
  assets/              Optional: drop your own art here (see below)
public/                favicon
scripts/               validate-data.mjs, smoke-test.mjs
```

### How the React and game layers talk

The game loop runs entirely inside `game/engine.js` with `requestAnimationFrame` and draws to a `<canvas>`, so **React never re-renders while you walk**. The engine emits a few small events (`hud`, `toast`, `dialogue`, `popup`, `menu`, `area`) and React components subscribe to them. Menus and overlays pause the engine while they are open.

### Adding a currency

1. Add an entry to `src/data/currencies.js`:

```js
c('php20', 'Philippine 20 Peso Coin', 'Philippines', 'Coin', 'Modern', '₱20', 'Common', 'Town',
  'A commonly used Philippine coin.', { tone: 'silver' })
```

2. Place it in the world: add a `collectibles` entry in a map file under `src/data/maps/` (look can be `sparkle`, `none`, `mound`, `chest`, `crate`, `barrel`, `vase`, `drawer`, `sack`, `box`; add `requires: 'shovel'` for buried money), or make it a quest reward in `src/data/quests.js`.
3. Run `npm run check` to make sure it can be found.

The icon is generated in code from the currency's `type`, `origin` and optional `icon: { shape, tone, glyph }`. Available shapes: `coin`, `note`, `holecoin`, `sqholecoin`, `shell`, `bean`, `bead`, `ring`, `gem`, `stone`, `ingot`, `spade`, `knife`, `oval`, `fish`, `chunk`.

### Adding or changing an area

Maps are built in code with a small helper (`src/data/maps/builder.js`): `fill`, `hline`, `house`, `carve`, `scatter`, and so on. Copy a file in `src/data/maps/`, then register it in `src/data/locations.js`. Each map lists its `spawns`, `exits`, `npcs`, `collectibles`, `objects`, `barriers` (secret walls and locked doors) and `puzzles` (lever or plate sequences).

### Using your own art or audio

Everything is drawn or synthesised in code, so the game needs **no external assets**, and there are no copyrighted images. The currency icons are original pixel art, not photographs of real banknotes. If you want to replace them, the `src/assets/*` folders are ready for your files, and `sprites.js` / `currencyIcons.js` are the places to load them.

Sound effects and music are generated with the Web Audio API and need a user gesture to start. If audio is blocked or unavailable, the game runs silently.

---

## Saving

Progress is stored in the browser's **LocalStorage** under `moneyhunter.save.v1` (settings under `moneyhunter.settings.v1`). It autosaves every 20 seconds, on every important event (a discovery, a quest, opening a secret, changing area) and from the pause menu. Clearing site data or **Settings > Reset save** deletes it.

Saved: player position and area, discovered money, duplicates, inventory and tools, unlocked areas, active and completed quests, opened secrets, puzzle progress and playtime.

Version-two saves also retain rewards, purchases, skills, cosmetics, friendships, claims and explored cells. Existing version-one adventures migrate once without losing collections. Corrupt or unsupported saves show a retry message and preserve their stored bytes. Settings and progress remain local to this browser.

Verification details and browser coverage: [reward-overhaul verification](docs/reward-overhaul-verification.md). The optional `node scripts/browser-check.mjs` uses a development server on port 5173 and an isolated Chromium debugging profile on port 9222; it resets that test profile's game data.

## Tips for developers

- Open the game with `?debug` in the URL (for example `http://localhost:5173/?debug`) to expose the running engine as `window.__moneyHunter` in the browser console. Handy for testing: `__moneyHunter.discover('owl')`, `__moneyHunter.loadMap('ruins')`.
- The fonts (Press Start 2P and Pixelify Sans) load from Google Fonts. If they are unavailable the game falls back to system fonts and works the same.

Have fun hunting!
