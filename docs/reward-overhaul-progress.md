# Execution ledger — docs/superpowers/plans/2026-09-25-reward-overhaul.md

Native execution approved 2026-09-25. Baseline: 78 smoke checks, data validation and production build pass.

Ruling: Work in the current workspace after sandbox denied creation of .git/refs/heads/codex/reward-overhaul. Do not change Git history or request another workflow approval.
Ruling: Use npm.cmd on Windows; PowerShell blocks npm.ps1. Use this persistent ledger instead of Unix-only skill bookkeeping scripts.
Pre-flight: Tasks 1–3 share progression defaults and claims; reward module must not import state creation to avoid migration cycles. Tasks 3–6 share catalogs; selectors remain read-only. Tasks 7–12 consume one reward event and snapshot.world/areas. UI commands always revalidate current state. Migration evaluates catalogs without showing historical popups.

Tasks 1–12: implemented and verified. Checkpoint commits superseded by the approved current-workspace fallback above.

Implementation checkpoint:
- Tasks 1–3: version-two saves, validation, legacy reward seeding, idempotent rewards, XP/levels/streaks, collection/achievement/encyclopedia catalogs integrated.
- Tasks 4–6: shop/skills/modifiers/cosmetics, authored chests/secrets, reachable-cell exploration/mastery/travel, five-stage quest chain, friendships, persistent requests integrated.
- Tasks 7–11: grouped queue, compact HUD, world-backed main menu, save summary, responsive menus, encyclopedia, profile/progress/statistics, controls and settings integrated.
- Task 12: final verification and independent review complete. Full-playthrough validator completes all 111 currencies and all 14 quests; 78 smoke checks and 27 domain tests pass. Production build passes. Real-browser coverage includes desktop and mobile menus, confirmed purchase, focus, touch, remapping, accessibility, completion, continued play and corrupt-save recovery. See reward-overhaul-verification.md for exact coverage and practical limits.
Ruling: Existing 13 maps are extended through src/data/exploration.js with 26 authored chests and 12 secret caches, rather than scattering repeated reward data into every map module. All placements pass the existing reachability validator.
Ruling: Keep UI domain selectors in small modules; no added runtime dependencies. Browser tests use the installed Edge browser through Node's built-in WebSocket/CDP.
Ruling: Original NPC quest acceptance remains first choice; optional shop, friendship and story choices append to preserve the existing flows. Main quest guards now reject unaccepted or unfinished turn-ins.
Ruling: Native execution does not mean no review; requesting-code-review skill explicitly requires one independent reviewer, dispatched after feature integration.
Fix evidence: Market cache moved away from original secret-crate interaction after regression failure. Toast and reward receipt discriminators separated after reproduced browser crash. Nested-save malformed types and island Boat Pass travel guard reproduced then fixed with tests. Digging cancellation and speed effect added from a failing integration test.

Final review: all four Important findings fixed and independently rechecked; 15 focused review tests pass. Original quest scripts now show full catalog rewards and require explicit acceptance. Puzzle effects share one receipt. Swapped bindings persist. Legacy progression, completion flags and cooldowns are validated before migration. Small collections use scaled rewards; five-level milestones have stronger receipt emphasis. Tool 4 opens the Maps inventory directly.
