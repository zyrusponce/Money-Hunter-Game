export function modifiers(s) {
  const p = s.progression, k = p.skills, b = p.purchases;
  return {
    speed:k.explorer_speed ? 1.1:1, visibility:3 + (k.explorer_sight?1:0) + (b.map_upgrade?1:0),
    interaction:k.explorer_reach?8:0, digSeconds:k.explorer_dig?.2:.45,
    detectorRange:(k.hunter_range?1.2:1)*(b.detector_range?1.2:1),
    rareRange:(k.hunter_rare?1.25:1)*(b.rare_scanner?1.25:1), signalStrength:k.hunter_signal?.75:.55,
    legendaryHints:!!k.hunter_legend, duplicateHints:!!k.hunter_duplicates,
    chestMultiplier:k.treasure_rewards?1.2:1, coinMultiplier:k.treasure_coins?1.1:1,
    chestDetection:!!(k.treasure_detection||b.treasure_radar||p.claims['world:75']),
    secretHints:!!k.treasure_secrets, hiddenPaths:!!k.explorer_paths, mapClues:!!k.treasure_maps,
  };
}
