# Money Hunter Reward and UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved exploration-first reward system and UI overhaul while preserving existing adventures and the ability to complete all 111 currency entries.

**Architecture:** Keep the canvas engine authoritative and React event-driven. Introduce serializable progression state, catalog-driven rewards, validated engine commands, and immutable menu snapshots. One action produces one grouped reward receipt after an idempotent milestone cascade.

**Tech Stack:** Existing JavaScript ES modules, React 18, Vite, Canvas 2D, Web Audio, localStorage; Node's built-in test runner for new domain tests. No additional runtime dependencies.

**Spec:** [Approved design](../specs/2026-09-25-reward-overhaul-design.md).

## Global Constraints

- Preserve its 13 areas, 111 currency entries, puzzles, quest dependencies, and ability to finish.
- The world remains the primary interface.
- No purchases with real money, gambling, daily obligations, or stressful timers.
- User-provided counts and rewards are examples; displayed totals must come from actual content.
- Retain the existing storage key and migrate version-one saves without deleting discovery, quest, item, or puzzle progress.
- Every purchased node changes an actual engine behavior.
- Every new view must contain functional data and actions, not placeholder cards.
- Apply animation settings to both canvas and CSS effects.
- Do not claim 100-percent world exploration unless earned.

## Execution and checkpoints

Recommend native execution in this session: the tasks share state, event, and content contracts, so keeping implementation in one context reduces integration churn. The alternative is sequential subagent implementation with an independent review per task. Execution begins after the user reviews this plan and chooses the method.

This is one integrated plan with independently testable checkpoints; none of the checkpoints substitutes for completing the whole approved scope. Follow the using-git-worktrees skill at execution time, preserve user changes, and do not deploy or push as part of this plan. Commit checkpoints when repository permissions allow; filesystem permission failures must not be bypassed.

## Review Focus

1. A valid-looking JSON save contains bad types, a future version, or unknown IDs: loading must preserve original bytes and never autosave over the rejected save (Task 1).
2. A quest grants the last currency in a set while crossing several XP/encyclopedia thresholds: award each entitlement once and emit one receipt (Tasks 2 and 3).
3. A touch double-tap, stale shop snapshot, or repeated command arrives: no negative balance, double purchase, duplicate gift, or double quest reward (Tasks 4 and 6).
4. A map contains disconnected walkable pockets or temporary barriers: exploration/mastery must remain attainable without counting inaccessible terrain or bypassing locks (Task 5).
5. Settings change during gameplay or a menu closes while movement is held: apply changes immediately, prevent stuck movement, and restore focus without accidentally activating another control (Tasks 8 and 11).

## File responsibilities and contracts

Keep existing modules in place. New modules have these boundaries:

| Files | Responsibility |
| --- | --- |
| `src/game/rewardState.js`, `src/game/saveValidation.js` | Default progression state, strict validation, migration helpers |
| `src/data/rewards.js`, `collections.js`, `achievements.js`, `shop.js`, `skills.js`, `exploration.js` | Declarative balance and content catalogs |
| `src/game/rewards.js`, `milestones.js` | Base grants, levels, streaks, bounded single-claim cascades |
| `src/game/economy.js`, `modifiers.js` | Purchase/equip/unlock/sell commands and derived gameplay effects |
| `src/game/exploration.js`, `treasure.js`, `friendship.js`, `worldEvents.js` | World progress, chest rewards, NPC relationships, persistent events |
| `src/game/controls.js`, `tutorial.js`, `notifications.js` | Remappable actions, onboarding, notification queue |
| `src/components/RewardFeed.jsx`, `ExplorerShop.jsx`, `SkillTree.jsx`, `AchievementGallery.jsx`, `ProgressMenu.jsx`, `Statistics.jsx`, `ProfilePicker.jsx`, `CollectionView.jsx`, `SaveSummary.jsx` | Focused new React views |
| `src/components/useDialogFocus.js`, `src/styles/tokens.css`, `game-ui.css`, `menus.css` | Shared interaction/accessibility and visual design |
| `scripts/tests/*.test.mjs` | Deterministic domain/integration tests using `node:test` and strict assertions |

State additions are grouped under `s.progression`:

```js
{
  xp: 0, coins: 0, coinsEarned: 0, upgradePoints: 0,
  claims: {}, skills: {}, purchases: {},
  cosmetics: {}, badges: {}, titles: { rookie: true },
  equipped: { outfit: 'default', backpack: 'default', detector: 'default', badge: null, title: 'rookie' },
  explored: {}, chests: {}, mastered: {}, friendship: {}, events: {},
  streak: 0, trackedQuest: null, tool: 'detector', tutorial: 'move'
}
```

Use integers for balances/XP, booleans for ownership, and stable IDs for claims. Explored cells are per-map arrays of sorted unique integer tile indices; runtime sets may accelerate checks but must serialize back to arrays. Add `distance`, `chestsOpened`, `secretsFound`, and `xpEarned` to `s.stats`. Level derives from cumulative XP, never from a separately mutable level field.

```js
// Reward descriptors use catalog IDs for unlocks.
// { xp?: number, coins?: number, points?: number,
//   items?: string[], cosmetics?: string[], badges?: string[], titles?: string[] }
// Receipt: { id, cause, xp, coins, points, unlocks: string[],
//            milestones: string[], levelBefore, levelAfter, rarity?, currencyId? }
// CommandResult: { ok: boolean, reason?: string, receipt?: Receipt }
```

### Task 1: Protect saves and introduce versioned progression state

**Files:** Create `src/game/rewardState.js`, `src/game/saveValidation.js`, `scripts/tests/save.test.mjs`; modify `src/game/state.js`, `saveSystem.js`, `src/App.jsx`, `scripts/smoke-test.mjs`, `package.json`.

**Interfaces:** `createRewardState()` returns the progression object above. `validateSave(raw)` returns `{ok, reason?}`. `readSave()` returns `{status: 'ok'|'missing'|'corrupt'|'unsupported'|'unavailable', state?, message?}`. Retain `loadSave()` as a compatibility wrapper returning state/null; UI uses `readSave()` so null does not mean permission to replace data. `migrateState(raw)` upgrades validated saves to version 2. `writeSave(state)` continues returning boolean.

- [ ] Run `npm run check` and `npm run build` as the unchanged baseline; record existing failures before edits.
- [ ] Write failing save tests with a throwing storage adapter, malformed nested fields, nonfinite coordinates, unknown map/currency IDs, future versions, and original-byte preservation:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readSave } from '../../src/game/saveSystem.js';
test('invalid saves are retained for recovery', () => {
  const bytes = '{"version":1,"discovered":[]}';
  let writes = 0;
  globalThis.localStorage = {
    getItem: () => bytes, setItem: () => { writes++; }, removeItem: () => { writes++; }
  };
  assert.equal(readSave().status, 'corrupt');
  assert.equal(writes, 0);
});
```

- [ ] Run `node --test scripts/tests/save.test.mjs`; confirm tests fail on missing API/validation.
- [ ] Implement state defaults and explicit field validation. Reject arrays where maps are required, unsafe balances, unsupported versions, and invalid IDs. Permit absent fields in genuine v1 saves and normalize only known legacy omissions. Do not swallow failures into a fresh writable adventure.

```js
export const createRewardState = () => ({
  xp: 0, coins: 0, coinsEarned: 0, upgradePoints: 0, claims: {}, skills: {}, purchases: {},
  cosmetics: {}, badges: {}, titles: { rookie: true },
  equipped: { outfit: 'default', backpack: 'default', detector: 'default', badge: null, title: 'rookie' },
  explored: {}, chests: {}, mastered: {}, friendship: {}, events: {},
  streak: 0, trackedQuest: null, tool: 'detector', tutorial: 'move'
});
```

- [ ] Add friendly retry/replacement handling in App. Keep rejected-save status until explicit reset/new-game confirmation; disable Continue for missing data and explain load failures. Catch storage getter/getItem/removeItem failures as well as setItem failures.
- [ ] Add `test:rewards` script as `node --test scripts/tests/*.test.mjs`. Run save tests and existing checks. Commit checkpoint: `feat: protect saves and add versioned progression state`.

### Task 2: Build reward transactions, levels and relaxed streaks

**Files:** Create `src/data/rewards.js`, `src/game/rewards.js`, `scripts/tests/rewards.test.mjs`; modify `src/game/state.js` for legacy reward seeding.

**Interfaces:** `levelInfo(xp)` returns `{level, current, required}`. `grantReward(s, claimId, reward, receipt)` mutates only validated progression and appends totals to the supplied receipt; returns false for an existing claim. `runRewardTransaction(s, {id,cause,rarity,currencyId}, apply)` creates a receipt, calls `apply(receipt)`, runs registered milestone evaluation, and returns the receipt. `seedLegacyRewards(s)` seeds known discoveries/completed quests once without UI events. Export `RARITY_REWARDS` and `DUPLICATE_VALUES`.

- [ ] Write tests for every rarity, repeated claims, crossing multiple levels, milestones 3/5/10, duplicates not incrementing streak, and migration/reload equality:

```js
test('one grant can cross multiple levels exactly once', () => {
  const s = createNewState();
  runRewardTransaction(s, { id: 'test', cause: 'Test reward' }, receipt => {
    grantReward(s, 'test', { xp: 300 }, receipt);
  });
  assert.equal(levelInfo(s.progression.xp).level, 3);
  assert.equal(s.progression.coins, 200);
  assert.equal(s.progression.upgradePoints, 2);
  const before = structuredClone(s);
  runRewardTransaction(s, { id: 'test', cause: 'Test reward' }, receipt => {
    grantReward(s, 'test', { xp: 300 }, receipt);
  });
  assert.deepEqual(s, before);
});
```

- [ ] Run `node --test scripts/tests/rewards.test.mjs` and observe the failures.
- [ ] Implement XP arithmetic, integer validation and base grants. Level rewards must not recursively apply treasure coin modifiers. Only positive awards increase lifetime earnings; spending decreases balance alone.

```js
export function levelInfo(xp) {
  let level = 1, current = xp, required = 100;
  while (current >= required) {
    current -= required;
    level += 1;
    required = 100 + 50 * (level - 1);
  }
  return { level, current, required };
}
export const RARITY_REWARDS = {
  Common: { xp: 20, coins: 10 }, Uncommon: { xp: 40, coins: 25 },
  Rare: { xp: 80, coins: 60 }, Epic: { xp: 150, coins: 150 },
  Legendary: { xp: 300, coins: 500 }
};
```

- [ ] Seed legacy discovery claims as `discovery:<currencyId>` and quest claims as `quest:<questId>`. Preserve old inventory/trades; do not replay streak bonuses for historic unknown discovery ordering. Grant new level/milestone entitlements from known progress and mark them claimed.
- [ ] Run reward/save tests and commit: `feat: add idempotent rewards explorer levels and streaks`.

### Task 3: Catalog collections, achievements and milestones; wire rewards into the engine

**Files:** Create `src/data/collections.js`, `achievements.js`, `src/game/milestones.js`, `scripts/tests/milestones.test.mjs`; modify `src/game/engine.js`, `quests.js`, `interactions.js`, `snapshot.js`, `src/data/quests.js`, `locations.js`.

**Interfaces:** `collectionViews(s)` returns `{id,name,count,total,percent,reward,complete}[]`. `achievementViews(s)` returns `{id,name,category,description,progress,total,unlocked,secret,reward}[]`, masking secret text while locked. `evaluateMilestones(s, receipt)` repeats finite catalog evaluation until no new claim is added. `Game.rewardAction(meta, apply)` joins nested rewards into the current transaction, emits one `reward` event and saves once at the outer boundary. Add progression, collection, achievement, level and reward summaries to `snapshotFromState`.

- [ ] Test overlapping country/regional sets, repeated evaluation, secret masking, nonempty attainable achievement thresholds, and quest-plus-currency cascades:

```js
test('quest rewards and its currency share one receipt', () => {
  const g = new Game({ listen: false, autosave: false });
  const receipts = [];
  g.on('reward', r => receipts.push(r));
  g.rewardAction({ id: 'integration', cause: 'Quest complete' }, receipt => {
    grantReward(g.s, 'quest:integration', { xp: 150, coins: 100 }, receipt);
    g.discover('php1', { source: 'quest' });
  });
  assert.equal(receipts.length, 1);
  assert.ok(receipts[0].xp >= 170);
  assert.equal(g.s.progression.claims['discovery:php1'], true);
});
```

- [ ] Run milestone tests to confirm failure, then implement catalogs using existing `origin`, `category`, `rarity`, and map ownership data. Do not invent collection denominators. Grant 500 XP/500 coins for country/regional sets, with named unlocks; smaller curated historical groups may share that major reward.
- [ ] Define requested achievement families and rewards, including First Discovery (50 coins), ten discoveries, ten countries (200 coins), twenty chests, ten Rare currencies, first Epic/Legendary, ten secrets, all locations and all currencies. Validate achievable counts after Task 5 adds world content.
- [ ] Add explicit numeric quest XP/coins and reward previews. Use 150 XP/100 coins as the ordinary default and explicit larger chain-finale rewards. Preserve existing item/currency rewards and guard completion with accepted/ready status, including turn-in requirements.

```js
// All discovery routes enter the same transaction, including trade and quests.
this.rewardAction({ id: `discovery:${id}`, cause: 'New discovery', currencyId: id, rarity: cur.rarity }, receipt => {
  // Existing unique-discovery mutation remains authoritative here.
  grantReward(this.s, `discovery:${id}`, RARITY_REWARDS[cur.rarity], receipt);
});
```

- [ ] Implement encyclopedia rewards at 5/10/25/40/50/60/75/90/95/100 percent, retaining city at 30 percent and all physical/key gates. The halfway milestone grants 1,000 coins, badge and clue map. Milestone catalogs declare stable unlock IDs consumed by later tasks.
- [ ] Keep existing common popup behavior temporarily until Task 7 replaces it as one coherent change. Run new tests and `npm run check`; commit: `feat: connect collections achievements and milestone rewards`.

### Task 4: Add economy, skills, equipment and real gameplay effects

**Files:** Create `src/data/shop.js`, `skills.js`, `src/game/economy.js`, `modifiers.js`, `scripts/tests/economy.test.mjs`; modify `src/game/detector.js`, `movement.js`, `interactions.js`, `collectibles.js`, `renderer.js`, `sprites.js`, `src/data/items.js`, `src/game/engine.js`.

**Interfaces:** `purchase(s,id)`, `unlockSkill(s,id)`, `equip(s,slot,id)`, `sellDuplicate(s,currencyId,count)` return CommandResult. `modifiers(s)` returns `{speed,visibility,interaction,digSeconds,detectorRange,rareRange,signalStrength,legendaryHints,duplicateHints,chestMultiplier,coinMultiplier,chestDetection,secretHints,mapClues}`. Engine wrappers validate commands, refresh snapshots, emit feedback and save only successful changes.

- [ ] Write tests for insufficient funds, repeated purchases, stale double commands, invalid/negative/fractional sale amounts, skill prerequisites, unowned equipment and modifiers changing detector/movement outcomes.

```js
test('a repeated purchase cannot charge twice', () => {
  const s = createNewState();
  s.progression.coins = 500;
  assert.equal(purchase(s, 'rare_scanner').ok, true);
  assert.equal(s.progression.coins, 150);
  assert.equal(purchase(s, 'rare_scanner').ok, false);
  assert.equal(s.progression.coins, 150);
});
```

- [ ] Run economy tests to see failures. Catalog shop entries for detector range (250), rare scanner (350), treasure radar (400), map detail upgrade (200), outfits (150), backpacks (100), detector skins (100), and clue maps (125). Single ownership per permanent item; no random paid rewards.
- [ ] Catalog five one-point nodes per branch in sequence. Explorer effects: speed ×1.1, sight +1 tile, interaction +0.5 tile, digging 0.45→0.2 seconds, nearby hidden-path clue. Money Hunter: range ×1.2, Rare+ range ×1.25, signal threshold improvement, vague Legendary proximity hint, duplicate label. Treasure Hunter: chest rewards ×1.2, nearby chest signal, chest coins ×1.1, secret proximity clue, extra environmental clue text on owned maps. Keep movement/collision safety unchanged.

```js
// Compose each owned source once; effects are derived, never accumulated on load.
const range = (s.progression.skills.hunter_range ? 1.2 : 1)
  * (s.progression.purchases.detector_range ? 1.2 : 1);
```

- [ ] Apply every modifier at its world consumer and render equipped outfit/backpack/detector palettes. Dig progress accepts cancellation without consuming the spot; accessibility reduces presentation duration but does not alter reward amounts. Selling duplicates preserves the encyclopedia entry and existing trade recipes.
- [ ] Run domain tests plus detector/movement smoke checks; commit: `feat: add explorer purchases skills and equipment effects`.

### Task 5: Add exploration tracking, area mastery, treasure and earned travel

**Files:** Create `src/data/exploration.js`, `src/game/exploration.js`, `treasure.js`, `scripts/tests/exploration.test.mjs`; modify all applicable `src/data/maps/*.js`, `src/game/engine.js`, `collectibles.js`, `interactions.js`, `snapshot.js`, `renderer.js`, `sprites.js`, `scripts/validate-data.mjs`.

**Interfaces:** `revealAround(s,mapId,x,y,radius)` returns number of newly explored eligible cells. `areaProgress(s,id)` returns `{currencies,chests,secrets,quests,exploration,percent,mastered}` with each count as `{count,total}`. `worldProgress(s)` returns `{count,total,percent}`. Snapshots expose this as `snapshot.world` and area summaries as `snapshot.areas[mapId]`. `openChest(game, chestId)` returns CommandResult. `canFastTravel(s,id)` returns `{ok,reason?}`; `Game.fastTravel(id)` validates then uses existing transition/spawn flow.

- [ ] Write reachability/area tests before implementation, including disconnected pockets, barrier-opened cells, empty categories, unknown cells, revisits, replayed chest opens and locked travel:

```js
test('travel cannot bypass discovery or item gates', () => {
  const s = createNewState();
  assert.equal(canFastTravel(s, 'cave').ok, false);
  s.visited.cave = true;
  assert.equal(canFastTravel(s, 'cave').ok, false);
  assert.equal(canFastTravel(s, 'town').ok, true);
});
```

- [ ] Run tests and confirm failures. Build eligible-cell catalogs from reachable terrain with all legitimately removable barriers open, excluding permanently inaccessible pockets. Reveal only eligible cells with sight/occlusion checks during actual movement, using current blockers; do not mark the whole map explored on entry. Validate future gate cells are reachable eventually.
- [ ] Assign explicit local currency-source, secret-flag, quest and chest IDs. Count local source completion separately from global unique ownership where currency can be obtained elsewhere. Average applicable category fractions; round down and permit 100 only when every category is complete. Grant area mastery 500 XP/300 coins plus named badge/outfit once.
- [ ] Author at least twenty reachable chests and ten secret interactions across the existing world so requested achievements are attainable. Reuse existing chest art with distinguishable trim/symbols per tier. Wooden rewards 30 coins/20 XP; silver 75/50; golden 150/100; ancient 300/150 plus point/map; legendary 500/300 plus unique cosmetic. Authored keys and conditions gate higher tiers without making required currencies random.

```js
export const CHEST_REWARDS = {
  wooden: { coins: 30, xp: 20 }, silver: { coins: 75, xp: 50 },
  golden: { coins: 150, xp: 100 }, ancient: { coins: 300, xp: 150, points: 1 },
  legendary: { coins: 500, xp: 300, cosmetics: ['ancient_explorer'] }
};
```

- [ ] Add treasure-map clues tied to recognizable rendered landmarks and matching secret interactions; clue ownership never grants coordinates. Add discovered travel points at Town Bus Stop, Beach Dock, Museum Entrance and Forest Camp plus reachable points in later areas. Travel rechecks key/percentage conditions.
- [ ] Award world milestones using actual cell totals: 25%=250 coins, 50%=outfit, 75%=treasure detector improvement, 100%=Master Explorer badge. Track actual movement displacement in tiles rather than requested movement against walls.
- [ ] Extend reachability validation to new chest/secret/travel positions and all mastery denominators. Run tests and full validation; commit: `feat: add world mastery treasure clues and earned fast travel`.

### Task 6: Add quest chain, friendships and persistent exploration events

**Files:** Create `src/game/friendship.js`, `worldEvents.js`, `scripts/tests/adventures.test.mjs`; modify `src/data/quests.js`, `npcs.js`, `items.js`, selected maps, `src/game/quests.js`, `conditions.js`, `interactions.js`, `engine.js`, `snapshot.js`.

**Interfaces:** `giftDuplicate(s,npcId,currencyId,commandId)` consumes one owned duplicate and advances friendship, returning CommandResult. `friendshipView(s,npcId)` returns rank 0–5 and unlocked benefits. `updateWorldEvents(s)` activates eligible persistent events. `resolveWorldEvent(game,id)` validates objective, consumes any requested duplicate and awards once. Extend conditions with only explicit quest/event predicates needed by authored content.

- [ ] Test all five chain stages, unmet prerequisites, gifts with no duplicate, replayed command IDs, rank cap, conversations granting nothing, event persistence across reload and non-expiration after long playtime:

```js
test('a duplicate gift is consumed only once', () => {
  const s = createNewState();
  s.duplicates.php1 = 1;
  assert.equal(giftDuplicate(s, 'money_collector', 'php1', 'gift-1').ok, true);
  const saved = structuredClone(s);
  assert.equal(giftDuplicate(s, 'money_collector', 'php1', 'gift-1').ok, false);
  assert.deepEqual(s, saved);
});
```

- [ ] Run tests, then author Collector's Mystery: discover a historical coin; speak with curator; find hidden clue map; inspect ruins monument; discover a Legendary entry and report back. Each stage requires the prior completed quest; final rewards 750 XP/750 coins, title and outfit. Existing earlier finds satisfy objectives rather than forcing unavailable repeats.
- [ ] Add story/side metadata and stable area ownership to every quest. Ensure rewards appear in NPC acceptance choices and QuestMenu from the same catalog. Let one active quest be tracked or untracked; completion clears/reassigns tracking deliberately.
- [ ] Use five distinct friendship advances to reach rank 5. Give each rank a concrete optional benefit: clue, side quest, favorable trade, cosmetic, secret hint. Track distinct gifts/quest claims; do not turn repetitive conversations into a farm.
- [ ] Activate traveling collector at 10 discoveries, rare signal after first area revisit with 20 discoveries, museum request after 30 discoveries. Persist arrival and resolution; use deterministic authored requests for owned/obtainable currency types, never timed disappearance.

```js
if (Object.keys(s.discovered).length >= 10 && !s.progression.events.collector) {
  s.progression.events.collector = { status: 'active', area: 'town' };
}
```

- [ ] Run adventure tests and full-playthrough validation; commit: `feat: add collector story friendship and exploration events`.

### Task 7: Unify reward feedback and remove routine gameplay interruptions

**Files:** Create `src/game/notifications.js`, `src/components/RewardFeed.jsx`, `scripts/tests/notifications.test.mjs`; modify `src/components/HUD.jsx`, `DiscoveryPopup.jsx`, `src/game/engine.js`, `audio.js`, `src/App.jsx`, `scripts/smoke-test.mjs`.

**Interfaces:** `createNotificationQueue({limit=3})` returns `{push(notification),dismiss(id),visible(),pending()}`. `reward` events carry transaction receipts; system/area/save events route through the same presentation queue. `DiscoveryPopup` accepts major receipts only, with View Entry and Continue Exploring actions.

- [ ] Write queue tests for ten arrivals, maximum three visible, FIFO promotion, deduplication and disposal. Change the existing first-pickup smoke assertion to expect `rt.mode === 'explore'` and one `reward` event for php1; add a Legendary pause/resume assertion.

```js
test('notification overflow queues without crowding the HUD', () => {
  const q = createNotificationQueue({ limit: 3 });
  for (let i = 0; i < 10; i++) q.push({ id: String(i), text: 'Reward' });
  assert.equal(q.visible().length, 3);
  assert.equal(q.pending().length, 7);
  q.dismiss('0');
  assert.equal(q.visible()[2].id, '3');
});
```

- [ ] Run tests and confirm changed behavior fails. Replace ordinary discovery popups with grouped transient receipts. Common uses a small card, Uncommon a subtle highlight, Rare stronger glow/tone, Epic a larger dismissible card. Legendary/major-set events may pause, but cascaded milestones stay in the same receipt. Avoid duplicate legacy unlock popups.
- [ ] Add named synthesized sounds for selection, discovery, rare, legendary, achievement, level, quest and chest. Choose one primary sound per receipt to prevent overlapping cascades. Keep visible unlock details sufficient even with sound disabled.
- [ ] Clean timeout/subscription disposal on game/session changes. Pause receipt expiry on hover/focus and while major menus obscure it. Screen readers announce a concise combined summary, not frame-by-frame HUD updates.
- [ ] Run queue tests and full smoke suite; commit: `feat: group rewards and keep common discoveries nonblocking`.

### Task 8: Redesign the game shell, menu flow and shared focus behavior

**Files:** Create `src/styles/tokens.css`, `game-ui.css`, `menus.css`, `src/components/useDialogFocus.js`, `SaveSummary.jsx`; modify `src/styles.css`, `src/App.jsx`, `src/components/MainMenu.jsx`, `PauseMenu.jsx`, `Modal.jsx`, `GameCanvas.jsx`, `HUD.jsx`, `TouchControls.jsx`.

**Interfaces:** `useDialogFocus(ref,{initialFocus,returnFocus})` traps focus and restores a valid opener. `SaveSummary` consumes a snapshot and continue/cancel callbacks. App retains one overlay stack; game input is suspended whenever an overlay owns focus.

- [ ] Establish browser checks at 1440×900, 768×1024 and 390×844. Record current HUD footprint and keyboard focus behavior before changes. Use available browser tools; if none exist, prepare executable browser checks and explicitly report they were not run.
- [ ] Implement design tokens and layout with the world filling the viewport; remove superseded style rules instead of stacking contradictory overrides.

```css
:root {
  --bg-dark: #121820; --surface: #1d2733; --surface-light: #283645;
  --text-primary: #f5f7fa; --text-secondary: #aab6c4; --accent: #f5c542;
  --common: #b8c2cc; --uncommon: #55c271; --rare: #4c8dff;
  --epic: #a46cff; --legendary: #ffb52b;
  --space: 8px; --radius: 8px; --motion-fast: 140ms; --motion-normal: 220ms;
  --ui-scale: 1; --text-scale: 1;
}
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
button:disabled { opacity: .45; cursor: not-allowed; }
```

- [ ] Reposition HUD per spec; encyclopedia summary becomes a button, one tracked objective stays compact, detailed balances remain in menus. Respect touch safe areas and keep bottom controls from overlapping prompts.
- [ ] Build animated main-menu environment using existing renderer/sprites without starting an autosaving game. Continue opens level/encyclopedia/location/playtime summary. Pause focuses Resume, offers all menus and quiet Save status. New-game/reset confirmation defaults to Cancel. Return-to-menu may show session deltas.
- [ ] Implement focus trapping/restoration in the shared dialog and encyclopedia, prevent background controls receiving interaction, and clear movement on blur/overlay entry/exit. Avoid closing a menu on its own opening pointer event.
- [ ] Verify focus loop, Escape nesting, held movement on menu open/close, disabled Continue, failed-save retry and mobile overflow. Run build/check; commit: `feat: redesign exploration HUD menus and accessible dialogs`.

### Task 9: Rebuild encyclopedia, collection, quest, inventory and world-map views

**Files:** Create `src/components/CollectionView.jsx`; modify `Encyclopedia.jsx`, `EncyclopediaEntry.jsx`, `QuestMenu.jsx`, `Inventory.jsx`, `WorldMap.jsx`, `src/game/snapshot.js`, `src/styles/menus.css`.

**Interfaces:** Menu props receive fresh `snapshot`, `onClose`, and explicit engine command callbacks (`onTrackQuest`, `onFastTravel`, `onEquipTool`). All counters come from Task 3/5 snapshot selectors; mutations trigger snapshot refresh without reopening the menu.

- [ ] Write selector tests for zero collections, missing entries, overlapping filters, completed quests and area count consistency. Preserve spoiler masking under search/filter combinations.

```js
test('collection counts derive from actual unique entries', () => {
  const s = createNewState();
  const empty = collectionViews(s);
  assert.ok(empty.every(c => c.count === 0 && c.total > 0));
  s.discovered.php1 = { source: 'test' };
  assert.ok(collectionViews(s).some(c => c.count === 1));
});
```

- [ ] Implement two-panel encyclopedia with name/country/rarity cards, selected entry, country filter, All Money/Collections tabs, progress and rarity breakdown. Mobile collapses filters into one control and details into a single-column flow. Keep unknown names, descriptions and icons concealed.
- [ ] Implement active/completed/story/side quest filters, objective progress, location, complete reward preview, track control and friendly empty state. Inventory groups tools/quest/maps/special, exposes clue text and tool selection, and links duplicates to trade/sell actions without treating them as ordinary items.
- [ ] Implement world-map discovery fog, honest lock labels, player/travel/quest markers and area detail counts. Only show fast travel when discovered and eligible; failed commands display their reason. Never render hidden chest pins from raw content catalogs.
- [ ] Browser-check keyboard filtering, empty searches, mobile details, one tracked quest, map travel and snapshot refresh; run tests/build; commit: `feat: polish encyclopedia quests inventory and world map`.

### Task 10: Add shop, skill tree, achievement gallery, profile and progress screens

**Files:** Create `src/components/ExplorerShop.jsx`, `SkillTree.jsx`, `AchievementGallery.jsx`, `ProfilePicker.jsx`, `ProgressMenu.jsx`, `Statistics.jsx`; modify `src/App.jsx`, `src/components/PauseMenu.jsx`, `src/game/snapshot.js`, `src/styles/menus.css`.

**Interfaces:** All menus receive snapshot plus validated command callbacks from Task 4. `ProgressMenu` shows encyclopedia/world/quests/collections/achievements/secrets; `Statistics` shows detailed totals, rarity counts, lifetime coins, movement, level and playtime. Profile can equip only owned badge/title/cosmetics.

- [ ] Use existing economy tests to pin repeated-click behavior and add snapshot tests ensuring balance/ownership updates after commands. No optimistic local balance mutations.
- [ ] Implement compact shop categories, visible coin balance, item detail and explicit purchase control. Distinguish purchased/equipped/insufficient-funds states. Surface exact receipt such as “Purchased Rare Signal Scanner · −350 Hunter Coins.”

```jsx
<button disabled={owned || balance < item.price} onClick={() => onPurchase(item.id)}>
  {owned ? 'Owned' : `Buy · ${item.price} Hunter Coins`}
</button>
```

- [ ] Implement three skill branches with prerequisite links, effect descriptions and point costs. Render locked/available/unlocked with text and icons. Achievement gallery filters six categories and masks secrets; profile shows earned badges/titles with one selected per slot.
- [ ] Implement progress and statistics as separate views, with no invented percentages/counts. Use earned totals rather than current coin balance for lifetime earnings. Keep shop/skills accessible from pause and relevant NPC interactions.
- [ ] Browser-check purchase/equip/skill use, return to world and observe actual effects; test menu updates without close/reopen; run build/tests; commit: `feat: add explorer progression and economy menus`.

### Task 11: Add remapping, accessibility settings, gradual tutorial and tool controls

**Files:** Create `src/game/controls.js`, `tutorial.js`, `scripts/tests/controls.test.mjs`; modify `src/components/Settings.jsx`, `HowToPlay.jsx`, `TouchControls.jsx`, `HUD.jsx`, `src/game/saveSystem.js`, `engine.js`, `renderer.js`, `audio.js`, `src/App.jsx`, styles.

**Interfaces:** `DEFAULT_BINDINGS` maps actions to codes; `validateBinding(bindings,action,code)` returns CommandResult; `actionForCode(bindings,code)` returns action/null. `Game.setSettings(settings)` applies live settings and clears held inputs when bindings change. `advanceTutorial(s,event)` accepts only real movement/discovery/encyclopedia-open events and persists the current step.

- [ ] Write tests for duplicate/reserved bindings, text input isolation, keyup after remap, held movement across pause, reduced-motion defaults and tutorial event ordering:

```js
test('remapping rejects a conflicting shortcut', () => {
  assert.equal(validateBinding(DEFAULT_BINDINGS, 'inventory', 'KeyC').ok, false);
  assert.equal(actionForCode(DEFAULT_BINDINGS, 'KeyC'), 'encyclopedia');
  assert.equal(actionForCode(DEFAULT_BINDINGS, 'KeyB'), 'inventory');
});
```

- [ ] Run tests, then centralize input mappings for engine, App, tutorial and labels. Defaults are WASD/arrows, E, Escape, M/C/J/B, 1–4; retain Q/I aliases only until a user binding occupies them. Keep Escape as reliable menu dismissal. Clear movement when control bindings or focus change.
- [ ] Add categorized settings with master/music/sound, fullscreen, UI scale 80–140%, text size 100–150%, high contrast, shake toggle, animation intensity, reduced motion, touch mode and remapping/reset controls. Clamp saved values and preserve existing music/sfx preferences. All audio volumes multiply by master.

```js
const effectiveMusic = settings.master * settings.music;
const effectiveSfx = settings.master * settings.sfx;
const motion = settings.reducedMotion ? 0 : settings.animationIntensity;
```

- [ ] Apply settings to CSS transitions and canvas particles, cloud/tree motion, flash, shake and camera effects. Reduce motion without hiding important state. Support owned-tool keys and mobile tool cycling; torch/map/detector selection changes equipped display and usable action while avoiding mandatory menu navigation.
- [ ] Teach movement → approach the first glowing coin → interact → discovery acknowledgement → encyclopedia. Never block experienced migrated saves with the fresh-player tutorial. Add touch-specific instructions and advance from actual events rather than arbitrary timers.
- [ ] Browser-check muted audio, larger text/UI at narrow width, high contrast, reduced motion, keyboard-only navigation and remapping during play. Run tests/build; commit: `feat: add accessible controls settings and gradual onboarding`.

### Task 12: Finish the completion event and verify the whole adventure

**Files:** Modify `src/components/EndingScreen.jsx`, `src/game/engine.js`, `milestones.js`, `src/data/quests.js`, `src/data/maps/final.js`, `scripts/validate-data.mjs`, `scripts/smoke-test.mjs`, `README.md`; create `scripts/tests/completion.test.mjs`, `docs/reward-overhaul-verification.md`.

**Interfaces:** Completion remains one stable `encyclopedia:100` claim and one celebration. Final quest/area consume existing complete state and unlock catalog IDs. Dismissing celebration returns to playable exploration; reload never regrants rewards.

- [ ] Write final-discovery and reload tests, with encyclopedia at 100 while world exploration is below 100:

```js
test('encyclopedia completion does not falsify world exploration', () => {
  const g = new Game({ listen: false, autosave: false });
  for (const c of CURRENCIES) g.discover(c.id, { silent: true });
  const view = g.getSnapshot();
  assert.equal(view.percent, 100);
  assert.ok(view.world.percent < 100);
  assert.equal(g.s.progression.titles.master_money_hunter, true);
  const coins = g.s.progression.coins;
  const resumed = new Game({ state: g.s, listen: false, autosave: false });
  assert.equal(resumed.s.progression.coins, coins);
});
```

- [ ] Implement a unique skippable/reduced-motion-aware completion sequence that hides HUD, displays true totals, grants final title/detector/outfit/badge and unlocks final quest/area. Do not make the last required currency depend on the post-completion quest or area. Reconcile existing ending flow to prevent two completion screens.
- [ ] Extend the full-playthrough simulation to exercise all new quest, chest, secret, collection, achievement and area reachability requirements. Test v1 migration, v2 save/reload, unsupported/corrupt data preservation and blocked storage. Update smoke assertions deliberately for nonblocking discovery and new controls.
- [ ] Run `npm run test:rewards`, `npm run check`, and `npm run build`. Fix failures at their owning domain and rerun only affected checks plus the final full suite when changes settle.
- [ ] Execute browser scenarios: fresh start/tutorial, common→rare→legendary feedback, quest reward cascade, shop/skills/equipment, fast-travel locks, keyboard focus/remapping, mobile controls, settings persistence, failed-save recovery, completion and continued play. Record viewport, steps, results and screenshots where tooling supports them. Never claim browser coverage for Node-only checks.
- [ ] Update README controls, progression/economy, save compatibility, accessibility and test commands. Self-review implementation against every spec section and obtain the review required by the selected execution workflow. Record actual test outcomes and any unresolved limitation in the verification document.
- [ ] Commit checkpoint: `feat: finish money hunter adventure overhaul`. Report changed behavior, validation evidence and remaining risks without claiming any unimplemented feature is complete.

## Plan self-review

- Reward/save foundations: Tasks 1–3; shop/skills/effects/duplicates: Task 4.
- Exploration/treasure/secrets/area/world/travel: Task 5; quests/friendship/events: Task 6.
- Rarity, receipts, notification cap and sounds: Task 7; world-first shell/save summary/focus: Task 8.
- Encyclopedia/collections/map/quests/inventory: Task 9; shop/skills/achievements/profile/progress/statistics: Task 10.
- Settings/accessibility/remapping/mobile/tools/onboarding: Task 11; final event and complete verification: Task 12.
- Five review-focus conditions each have explicit owning tests above. All identifiers in interface examples are defined by their task contracts. Actual world placements require map inspection and reachability validation in Task 5; the plan does not prescribe unchecked coordinates.
