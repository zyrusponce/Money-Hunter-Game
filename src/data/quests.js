// Quest definitions.
// Objectives are checked against the game state every time the quest menu opens or an
// NPC is talked to (see src/game/quests.js), so there is no separate progress bookkeeping.
//
// objective.done  - a condition (see src/game/conditions.js)
// objective.turnIn - true on the final "report back" step (completed by talking to the giver)
// objective.where - map id used for the quest marker on the World Map

export const QUESTS = {
  lost_coin: {
    id: 'lost_coin',
    name: 'Lost Coin',
    giver: 'aling_nena',
    summary: 'Aling Nena lost a pouch of old coins near the beach. Try searching around the large rocks.',
    objectives: [
      { id: 'find', text: 'Search near the large rocks at Sunny Beach', done: { has: 'lost_pouch' }, where: 'beach' },
      { id: 'return', text: 'Bring the pouch back to Aling Nena in Sunny Town', turnIn: true, where: 'town' },
    ],
    rewards: { currencies: ['phpspanish'], items: ['shovel'], consume: ['lost_pouch'] },
    rewardText: 'A Spanish Colonial Peso for your Encyclopedia, and a Shovel!',
  },

  caretaker_key: {
    id: 'caretaker_key',
    name: 'The Caretaker\'s Key',
    giver: 'mang_ernie',
    summary: 'Mang Ernie lost his old key ring in the Whispering Forest. It might open the abandoned building.',
    objectives: [
      { id: 'find', text: 'Find the rusty key near the pond in Whispering Forest', done: { has: 'rusty_key' }, where: 'forest' },
      { id: 'return', text: 'Show the key to Mang Ernie in Sunny Town', turnIn: true, where: 'town' },
    ],
    rewards: { currencies: ['gbp_farthing'] },
    rewardText: 'An Old British Farthing. Mang Ernie says you can keep the key.',
  },

  night_market_lamp: {
    id: 'night_market_lamp',
    name: 'Night Market Lamp',
    giver: 'tita_lorna',
    summary: 'Tita Lorna\'s night lamp is missing three parts, and they are scattered around the Market.',
    objectives: [
      { id: 'bulb', text: 'Find the Lamp Bulb (in a crate by the west wall)', done: { has: 'lamp_bulb' }, where: 'market' },
      { id: 'shell', text: 'Find the Lamp Shell (out in the open, east of the middle)', done: { has: 'lamp_shell' }, where: 'market' },
      { id: 'battery', text: 'Find the Battery Pack (in a barrel in the south)', done: { has: 'lamp_battery' }, where: 'market' },
      { id: 'return', text: 'Bring all three parts to Tita Lorna', turnIn: true, where: 'market' },
    ],
    rewards: { items: ['flashlight'], consume: ['lamp_bulb', 'lamp_shell', 'lamp_battery'] },
    rewardText: 'A Flashlight. Dark places are open to you now.',
  },

  buried_treasure: {
    id: 'buried_treasure',
    name: 'Buried Treasure',
    giver: 'kuya_mando',
    available: { has: 'shovel' },
    summary: 'Kuya Mando sold you a treasure map. Use the shovel to dig up what it marks in the Whispering Forest.',
    objectives: [
      { id: 'dig', text: 'Dig up the marked spot in the south-east of Whispering Forest', done: { collected: 'fr_barter_ring' }, where: 'forest' },
      { id: 'return', text: 'Show your find to Kuya Mando at the Market', turnIn: true, where: 'market' },
    ],
    rewards: { items: ['detector2'], consume: ['treasure_map'] },
    rewardText: 'An Improved Money Detector. Rarer money can\'t hide from you as easily.',
  },

  museum_mystery: {
    id: 'museum_mystery',
    name: 'Museum Mystery',
    giver: 'dr_reyes',
    summary: 'A display case in the museum was emptied. Search for three clues about the missing historical note.',
    objectives: [
      { id: 'ledger', text: 'Find the torn ledger page (west side of the hall)', done: { flag: 'clue_ledger' }, where: 'museum' },
      { id: 'case', text: 'Inspect the empty display case (east side)', done: { flag: 'clue_case' }, where: 'museum' },
      { id: 'prints', text: 'Follow the sandy footprints (near the front door)', done: { flag: 'clue_prints' }, where: 'museum' },
      { id: 'return', text: 'Report back to Dr. Reyes', turnIn: true, where: 'museum' },
    ],
    rewards: { currencies: ['phpoccup'], items: ['museum_pass'] },
    rewardText: 'An Occupation-Era Peso Note and a Museum Pass!',
  },

  travelers_currency: {
    id: 'travelers_currency',
    name: 'Traveler\'s Currency',
    giver: 'sailor_sam',
    summary: 'Sailor Sam wants proof you can find foreign money around the harbor.',
    objectives: [
      { id: 'find', text: 'Discover 3 currencies around the Harbor', done: { discoveredIn: { location: 'Harbor', count: 3 } }, where: 'harbor' },
      { id: 'return', text: 'Tell Sailor Sam what you found', turnIn: true, where: 'harbor' },
    ],
    rewards: { currencies: ['pieces8'], items: ['boat_pass'] },
    rewardText: 'Pieces of Eight and a Boat Pass to Coral Isle!',
  },

  collectors_challenge: {
    id: 'collectors_challenge',
    name: 'The Collector\'s Challenge',
    giver: 'money_collector',
    available: { percent: 25 },
    summary: 'The Money Collector wants proof that you can find the good stuff: at least 3 Rare and 1 Epic currency.',
    objectives: [
      { id: 'rare', text: 'Discover 3 Rare currencies', done: { rarity: { rarity: 'Rare', count: 3 } } },
      { id: 'epic', text: 'Discover 1 Epic currency', done: { rarity: { rarity: 'Epic', count: 1 } } },
      { id: 'return', text: 'Show the Money Collector your finds in Sunny Town', turnIn: true, where: 'town' },
    ],
    rewards: { currencies: ['gbp_crown'] },
    rewardText: 'A Commemorative Crown Coin, and the Collector\'s deepest respect.',
  },

  bank_key: {
    id: 'bank_key',
    name: 'The Missing Vault Key',
    giver: 'banker_tan',
    summary: 'The City Bank\'s vault key is missing. The janitor lost it somewhere in the city park.',
    objectives: [
      { id: 'find', text: 'Find the vault key in the City park', done: { has: 'vault_key' }, where: 'city' },
      { id: 'return', text: 'Show the key to Banker Tan', turnIn: true, where: 'city' },
    ],
    rewards: { currencies: ['sgd50n'] },
    rewardText: 'A Singapore 50 Dollar Note. You may keep the key to open the vault yourself.',
  },
};

const chain = [
  ['mystery_1','An Old Beginning','money_collector','town','Find an old Philippine coin and show the collector.',{discovered:'phpold'}],
  ['mystery_2','The Curator Knows','dr_reyes','museum','Speak with the Museum Curator about the old coin.',{flag:'met:dr_reyes'}],
  ['mystery_3','A Hidden Map','money_collector','forest','Search the clearing south of the forest pond for a hidden map.',{collected:'forest_cache_2'}],
  ['mystery_4','Story in Stone','dr_reyes','ruins','Read the sun mural in the Ancient Ruins.',{flag:'saw_mu_sun'}],
  ['mystery_5','A Legendary Conclusion','money_collector','town','Find a Legendary currency and return to the collector.',{rarity:{rarity:'Legendary',count:1}}],
];
chain.forEach(([id,name,giver,area,summary,done],i)=>{
  QUESTS[id]={id,name:`The Collector’s Mystery · ${i+1}: ${name}`,chain:'collector_mystery',kind:'story',giver,area,summary,
    available:i?{questDone:chain[i-1][0]}:{percent:10},
    objectives:[{id:'find',text:summary,done,where:area},{id:'return',text:'Report to your quest giver.',turnIn:true,where:giver==='dr_reyes'?'museum':'town'}],
    rewards:{xp:i===4?750:150,coins:i===4?750:100,...(i===2?{items:['mystery_map']}:{}) ,...(i===4?{cosmetics:['ancient_explorer'],titles:['legendary_collector']}:{})},
    rewardText:i===4?'750 XP · 750 Hunter Coins · Ancient Explorer Outfit · Legendary Collector title':'150 XP · 100 Hunter Coins'+(i===2?' · The Collector’s Map':''),
  };
});
QUESTS.final_journey={id:'final_journey',name:'The Treasury of Worlds',kind:'story',giver:'money_collector',area:'final',available:{complete:true},summary:'Visit the golden monument in the Treasury of Worlds, then return to the collector.',objectives:[{id:'visit',text:'Read the final monument.',done:{flag:'final_monument_read'},where:'final'},{id:'return',text:'Return to the Money Collector.',turnIn:true,where:'town'}],rewards:{xp:1000,coins:1000},rewardText:'1,000 XP · 1,000 Hunter Coins'};
for(const q of Object.values(QUESTS)) { q.kind ||= 'side'; q.rewards.xp ??= 150; q.rewards.coins ??= 100; }
export const QUEST_LIST = Object.values(QUESTS);
