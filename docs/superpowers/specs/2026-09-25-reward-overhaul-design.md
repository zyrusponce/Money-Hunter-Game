# Money Hunter reward and exploration overhaul

Status: Design approved by the user on 2026-09-25. Implementation planning in progress.

## Outcome and constraints

Make the existing React/canvas adventure feel like a complete exploration game. Preserve its 13 areas, 111 currency entries, puzzles, quest dependencies, and ability to finish. The world remains the primary interface. No purchases with real money, gambling, daily obligations, or stressful timers. User-provided counts and rewards are examples; displayed totals must come from actual content.

## Approach

Extend the existing plain-JavaScript engine and event-driven React interface. Add a shared reward domain with data-driven catalogs, then connect existing interactions to it. Avoid duplicating reward logic in React or replacing the renderer.

Alternatives considered: independent reward additions are initially cheaper but risk double awards and inconsistent feedback; rewriting the game engine introduces unnecessary regression risk. The integrated extension is recommended.

## Reward transactions and persistence

Persist Explorer XP, Hunter Coin balance and lifetime earnings, upgrade points, purchased/equipped items, skills, collection claims, achievements, badges/titles, friendship, exploration cells, chest claims, streak milestones, tracked quest, and tutorial progress. Use stable event/claim identifiers to prevent repeat rewards after reload, duplicate interaction, or cascaded milestones.

One world action produces one reward receipt containing its cause, XP, coins, item unlocks, and secondary progress. Evaluate collection, achievement, area, and encyclopedia milestones in a bounded cascade, then save and publish the combined result. Menus consume snapshots and issue validated engine commands; they never mutate balances directly.

Retain the existing storage key and migrate version-one saves without deleting discovery, quest, item, or puzzle progress. Existing discoveries seed appropriate progression and claim records once; migration grants the new discovery XP/coins for known entries and evaluates new milestone entitlements without replaying celebrations. Existing completed quests receive their new base rewards once. Unknown or invalid data must not overwrite the original save. Distinguish absent, corrupt, unsupported, and storage-unavailable states. Show a friendly retry path for load failure and require confirmation before replacement.

## Economy and skills

New currency XP by rarity: 20/40/80/150/300. Base Hunter Coins: 10/25/60/150/500. Duplicates do not count as fresh discoveries or advance streaks; sell, trade, gift, and quest consumption are explicit actions with rarity-scaled value.

Level-one starts at zero XP; each next level requires 100 + 50 × (current level - 1) additional XP. Each level grants 100 coins and one upgrade point. Handle multiple level crossings in a single transaction. Ordinary level feedback is nonblocking; five-level milestones receive a stronger presentation.

Three sequential skill branches, five nodes each: Explorer (movement, visibility, interaction, digging, hidden paths); Money Hunter (range, rare sensitivity, signal strength, legendary hints, duplicate identification); Treasure Hunter (chest rewards, detection, coins, secrets, map clues). Every purchased node changes an actual engine behavior. Display prerequisites, effect, cost, and locked/available/unlocked states.

Shop categories: tools, upgrades, cosmetics, special items. Show balance, description, price, ownership and equipped status. Purchases occur from a deliberate Buy control in item details, not by clicking a card. Validate affordability and ownership atomically. Cosmetic outfits, backpacks and detectors must affect rendering. Functional upgrades use shared derived modifiers to avoid inconsistent stacking.

## Collections, achievements and profile

Derive country collections from currency metadata; explicitly catalog regional and historical/ancient groups. Completion grants XP, coins and appropriate cosmetic/badge rewards once. Counts reflect actual membership, including overlapping sets.

Achievement categories cover exploration, collection, quests, treasure, secrets and completion. Include the requested discovery, country, rarity, chest, secret, location and encyclopedia achievements. Thresholds must be attainable with the shipped content. Secret entries conceal their exact requirements until earned. Equip one unlocked badge and title; display them in the profile/progress menu rather than adding permanent HUD clutter.

## World content and exploration

Track explored traversable map cells as the player moves, using a visibility radius. World exploration is the weighted total of eligible cells across maps. Area completion combines actual local collectibles, chests, secrets, quests and explored cells; omit empty categories from weighting. Mastery requires every applicable category complete. Define explicit ownership of quest objectives and secrets to avoid counting the same task against arbitrary areas.

Add wooden, silver, golden, ancient and legendary chests with authored rewards, conditions and stable IDs. Treasure maps offer environmental clues, never exact coordinates. Add discoverable secret interactions using existing puzzle and barrier mechanisms. Rewards may include coins, XP, points, keys, maps, cosmetics and currencies.

Add a five-part Collector's Mystery chain using existing locations and NPCs. Show objective, location and all rewards before acceptance. Persist one tracked quest. Friendship is optional, capped at five ranks, and advances through distinct quests or consumed gifts; repeated conversation cannot farm rewards.

Occasional exploration events are seeded by meaningful exploration progress and persist until resolved; they do not expire under stressful deadlines. Include a traveling collector, rare treasure clue and museum request. Returning to previous locations should reveal useful new interactions.

Discovery streaks persist across pauses and saves and have no timer. Award milestones at 3, 5 and 10 fresh discoveries; reset the cycle after ten. Rewards are 50 XP, 100 XP, then 250 XP and 100 coins.

World milestones at 25/50/75/100 percent grant coins, an outfit, a treasure detector improvement and a badge. Encyclopedia milestones follow the requested 5/10/25/40/50/60/75/90/95/100 percent ladder while preserving existing city and item-gated location requirements. The 95-percent hunt must be completable before the last currency, avoiding circular locks.

## Interface and feedback

Use a full-viewport pixel world with compact dark panels, gold accents, readable body typography and consistent CSS tokens. Keep area/exploration top-left, clickable encyclopedia top-right, detector/tool bottom-left, available interaction bottom-center, and map/quests/inventory/encyclopedia shortcuts bottom-right. Show at most one compact tracked objective. Coins and detailed XP live in menus and temporary receipts.

Unify notifications with a queue capped at three visible entries. Common through rare discoveries are nonblocking receipts with rarity-appropriate sound/glow. Epic discoveries use a larger dismissible card; legendary discoveries, major collections and final completion may use modal celebrations. Combine cascaded rewards instead of opening successive dialogs. Use color, symbol and text for rarity.

Main menu uses an animated world background, Continue/New Game/Encyclopedia/Settings, a save summary before resuming, and confirmation before replacing progress. Pause defaults focus to Resume and provides all exploration and progression menus. Optional session summary reports deltas since session start.

Encyclopedia uses a searchable/filterable grid with selected-entry detail on desktop and stacked content on mobile. Missing entries conceal identity. Include type, country, rarity and discovered/missing filters, collection mode, collection rewards and rarity totals. Collapse mobile filters.

World map shows fog, current location, discovered travel points, locks, landmarks and quest markers without revealing secret treasure. Fast travel requires prior physical discovery and all applicable access conditions. Area selection exposes real completion counts.

Inventory groups tools, quest items, maps and special items; currencies remain in the encyclopedia. Tool keys 1–4 select detector/shovel/flashlight/map when owned. Adopt C encyclopedia, J quests, B inventory, M map and E interact; retain Q/I aliases where unambiguous and update all tutorials and labels.

Add shop, skills, achievement gallery, profile selection, progress overview and separate detailed statistics. Quest tabs provide active/completed/story/side filters with meaningful empty states. Every new view must contain functional data and actions, not placeholder cards.

## Accessibility, controls and sound

Settings categories cover gameplay, audio, display, controls and accessibility. Add master/music/sound levels, fullscreen, UI scale, text size, high contrast, shake, animation intensity, reduced motion and key remapping with conflict validation. Respect system reduced-motion preference by default. Apply animation settings to both canvas and CSS effects.

Keep focus visible, trap and restore modal focus, label icon buttons, and provide restrained live announcements. Menus support keyboard navigation and responsive touch targets. Mobile retains joystick, interact, tool and menu controls with safe-area spacing.

Teach movement, approach, collection and encyclopedia gradually from real actions. Use distinct synthesized sounds for UI, rarity discoveries, level, achievement, quest and chest feedback; muting must cover all channels.

## Completion

On the final unique currency, hide normal HUD for a unique celebration. Display actual encyclopedia, world, rarity and collection totals; do not claim 100-percent world exploration unless earned. Grant Master Money Hunter, golden detector, master outfit, encyclopedia badge and final-area/quest access once. Continue playing afterward and retain unfinished exploration goals.

## Delivery and verification

Implement in dependent stages: reward/save foundations; content and engine effects; exploration and quest systems; game shell and menus; feedback/accessibility/completion. Each stage remains playable, but completion of the task requires all stages.

Extend the existing data validation and engine smoke tests with deterministic reward and migration cases. Verify rarity awards, multiple level-ups, duplicate handling, purchases and insufficient funds, skill prerequisites/effects, overlapping collections, single-claim milestones, chest/secret rewards, quest chains, friendship, exploration/mastery, travel locks, reload idempotency, and corrupt-save preservation.

Run the full reachable-content simulation and production build. Browser checks should cover the first discovery loop, menu focus, purchasing/equipping, remapping, save/reload, reduced motion, mobile layouts and endgame. Report any browser tooling limitation explicitly; a successful build alone does not establish visual or interaction quality.
