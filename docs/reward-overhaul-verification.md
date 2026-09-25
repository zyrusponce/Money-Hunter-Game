# Money Hunter overhaul verification

Implemented against the approved September 25, 2026 design, retaining the existing 13 areas and 111-currency catalog. All totals derive from actual game content rather than the examples in the request.

## Automated checks

- `npm.cmd run test:rewards`: 27 passing tests covering saved progression, legacy migration, malformed-save preservation, idempotent awards, grouped puzzle/discovery rewards, levels, streaks, collections, purchases, skill prerequisites, duplicate use, exploration/travel restrictions, friendships, quests and control remapping.
- `npm.cmd run check`: zero data errors or warnings; reachability simulation discovers 111/111 currencies and completes all 14 quests; 78 engine smoke assertions pass.
- `npm.cmd run build`: production bundle generated successfully with Vite 8.3.0 and Node 24.
- `git diff --check`: no whitespace errors; repository line-ending conversion warnings only.

## Browser verification

Installed headless Microsoft Edge, isolated `.qa/edge-profile`, development server, desktop 1440×900 and mobile emulation 390×844. `scripts/browser-check.mjs` checks fresh play, nonblocking common discovery, grouped reward UI, encyclopedia/collections, confirmed shop purchase, pause focus, skills and journal navigation, save/Continue, treasure-map shortcut, mobile menu bounds and touch controls, remapping, reduced motion, high contrast, Legendary celebration, final completion, continued play, stable balances after reload, and corrupt-save retry without deleting stored bytes. No browser runtime exceptions.

Screenshots are local QA artifacts in `.qa/` (ignored by Git), including gameplay, discovery, encyclopedia, shop, skills, mobile touch controls, Legendary discovery and completion. The completion test grants catalog discoveries through the debug engine; it deliberately reports the true, incomplete world-exploration percentage.

## Independent review

Four important findings were reproduced and fixed: malformed version-one progression accepted during migration, valid swapped bindings reverting, separate puzzle/secret receipts, and incomplete original quest reward previews. Regression tests cover each fix. Ordinary level-ups remain nonblocking; every fifth level gets stronger receipt emphasis. Small country collections have scaled payouts so a single entry does not award a major set bonus.

## Scope and practical limits

All reward currency is fictional. Authored treasures and persistent world requests have no gambling purchases, real-money shop or stressful expiry. Optional NPC friendships are intentionally simple. Existing maps and art are extended rather than replaced. Current-session lever combinations remain temporary; solved puzzles persist.

Browser coverage uses Chromium emulation, not physical mobile hardware, Safari, or a screen reader. Automated checks prove reachability and reward invariants; they cannot establish long-term economy balance or subjective enjoyment. Save data remains browser-local. No deployment or Git-history changes were performed; the approved workspace fallback leaves the implementation ready for review in place.
