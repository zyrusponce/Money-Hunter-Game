const branch = (name, entries) => entries.map(([id,title,description],i) => ({id,name:title,description,branch:name,cost:1,requires:i ? entries[i-1][0] : null}));
export const SKILLS = [
  ...branch('Explorer', [
    ['explorer_speed','Trail Runner','Move 10% faster.'], ['explorer_sight','Open Horizons','Reveal one extra tile around you.'],
    ['explorer_reach','Helping Hand','Interact from half a tile farther away.'], ['explorer_dig','Quick Dig','Digging takes 0.2 seconds instead of 0.45.'], ['explorer_paths','Hidden Paths','Sense nearby unopened hidden paths.'],
  ]),
  ...branch('Money Hunter', [
    ['hunter_range','Signal Boost','Increase detector range by 20%.'], ['hunter_rare','Rare Frequency','Detect Rare and better money 25% farther away.'],
    ['hunter_signal','Clear Signal','Strong signals start farther from a find.'], ['hunter_legend','Golden Whisper','Receive a vague hint near Legendary money.'], ['hunter_duplicates','Familiar Echo','Identify duplicate signals.'],
  ]),
  ...branch('Treasure Hunter', [
    ['treasure_rewards','Deep Pockets','Gain 20% more chest XP and coins.'], ['treasure_detection','Treasure Sense','Detect nearby unopened chests.'],
    ['treasure_coins','Lucky Find','Gain 10% extra chest coins.'], ['treasure_secrets','Secret Seeker','Sense nearby hidden caches.'], ['treasure_maps','Map Reader','Reveal an extra landmark clue on treasure maps.'],
  ]),
];
