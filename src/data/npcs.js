// NPC definitions.
//
// Each NPC has `dialogue`: a list of rules. The first rule whose `when` condition passes
// (or that has no `when`) is played. A script is:
//   { pages: [text...], choices?: [{ label, script }], effects?: [effect...] }
// Effects are applied after the last page: startQuest, completeQuest, giveItem, giveCurrency,
// setFlag, toast, openTrade, travel ... (see src/game/interactions.js).
//
// Placement (x, y) lives in the map files under src/data/maps.

const skin = { light: '#f5d3b0', tan: '#e0ac7a', brown: '#b57a50', dark: '#7d4c30' };

const npc = (id, name, title, sprite, dialogue) => ({ id, name, title, sprite, dialogue });

// Generates the four standard rules for a quest-giver NPC.
const questRules = (id, t) => [
  { when: { questDone: id }, script: { pages: t.done } },
  { when: { questReady: id }, script: { pages: t.ready, effects: [{ type: 'completeQuest', id }] } },
  { when: { quest: id }, script: { pages: t.active } },
  {
    script: {
      pages: t.intro,
      choices: [
        { label: t.yes || 'I will help.', script: { pages: t.accepted, effects: [{ type: 'startQuest', id }, ...(t.extra || [])] } },
        { label: t.no || 'Maybe later.', script: { pages: t.declined || ['No rush. Come back any time.'] } },
      ],
    },
  },
];

export const NPCS = {
  // ------------------------------------------------------------ TOWN
  aling_nena: npc(
    'aling_nena',
    'Aling Nena',
    'Neighbor',
    { skin: skin.tan, hair: '#8a8a8a', shirt: '#e2574c', pants: '#3a3f58', scarf: '#f2c14e' },
    questRules('lost_coin', {
      done: ['Thank you again, hijo! That pouch held my late husband\'s lucky piso.', 'If you like old coins, ask around the park. Children used to bury their pocket change near the pond.'],
      ready: ['My pouch! You found it! Oh, bless you.', 'Take this old shovel. It was my husband\'s. And this coin from the Spanish days: he always said it belonged with someone who cares.'],
      active: ['Any luck? I dropped my pouch near the big rocks at the beach. Head south past the fountain plaza.', 'Your Money Detector should help. Listen for the signal near the rocks.'],
      intro: ['Ay, hello dear! I lost a little pouch of old coins at the beach yesterday.', 'I think I dropped it near the large rocks. My knees can\'t handle the sand anymore. Could you take a look?'],
      yes: 'Sure, I will look for it.',
      no: 'Maybe later.',
      accepted: ['Bless you! The beach is south of the plaza. Search around the large rocks.'],
    })
  ),

  money_collector: npc(
    'money_collector',
    'The Money Collector',
    'Collector of Everything',
    { skin: skin.light, hair: '#d7d7e0', shirt: '#5d3a8a', pants: '#2a2140', hat: true, hatColor: '#2a2140', glasses: true, beard: '#d7d7e0' },
    [
      {
        when: { complete: true },
        script: {
          pages: ['You did it. Every currency, every legend. In all my years, nobody has completed the Encyclopedia.', 'The Treasury of Worlds is open to you. Use the golden doorway on the town plaza, whenever you like.'],
          effects: [{ type: 'openTrade' }],
        },
      },
      {
        when: { questReady: 'collectors_challenge' },
        script: {
          pages: ['Three Rare finds and an Epic one! You have earned my respect, hunter.', 'Take this. It is a crown coin from my private collection. And now, shall we trade?'],
          effects: [{ type: 'completeQuest', id: 'collectors_challenge' }, { type: 'openTrade' }],
        },
      },
      {
        when: { notFlag: 'met_collector' },
        script: {
          pages: [
            'Ah! A fellow hunter. I am the Money Collector.',
            'I trade in duplicates, hints and encouragement. When you find money you already own, it is kept as a duplicate.',
            'Bring me spare copies and I will trade them for something new. I also hand out prizes for Encyclopedia milestones.',
          ],
          effects: [{ type: 'setFlag', flag: 'met_collector' }, { type: 'openTrade' }],
        },
      },
      {
        when: { questNew: 'collectors_challenge', percent: 25 },
        script: {
          pages: ['Ah, you are getting somewhere! A quarter of the Encyclopedia already.', 'I have a challenge for you. Bring me proof that you can find the good stuff: three Rare currencies and one Epic one. Rare money hides in special places, and Epic money needs quests, puzzles or secrets.'],
          choices: [
            { label: 'Challenge accepted!', script: { pages: ['Splendid! Come back when you have found them. The Encyclopedia tracks it for you.'], effects: [{ type: 'startQuest', id: 'collectors_challenge' }] } },
            { label: 'Just show me the trades.', script: { pages: ['Very well. Have a look.'], effects: [{ type: 'openTrade' }] } },
          ],
        },
      },
      { when: { quest: 'collectors_challenge' }, script: { pages: ['Still hunting those Rare and Epic finds? Take your time. Meanwhile, my shop is open.'], effects: [{ type: 'openTrade' }] } },
      { script: { pages: ['Welcome back, hunter. Let us see what you have brought me.'], effects: [{ type: 'openTrade' }] } },
    ]
  ),

  kuya_ben: npc(
    'kuya_ben',
    'Ben',
    'Curious Kid',
    { skin: skin.tan, hair: '#1f1a17', shirt: '#f2c14e', pants: '#2f80ed', hat: true, hatColor: '#2f80ed' },
    [
      {
        script: {
          pages: [
            'Psst! Your Money Detector is loudest when you are really close.',
            'It has three levels: Weak Signal, Signal Getting Stronger, and Money Nearby! When you see that one, press E to search.',
            'Also, rarer money gives a weaker signal. Legends barely whisper.',
            'I saw someone sneak into the narrow alley between the two houses on the south-east side. Something might be hidden back there!',
          ],
        },
      },
    ]
  ),

  mang_ernie: npc(
    'mang_ernie',
    'Mang Ernie',
    'Retired Caretaker',
    { skin: skin.brown, hair: '#c9c9c9', shirt: '#6b8e4e', pants: '#4a3f36', hat: true, hatColor: '#8a6a3a', beard: '#c9c9c9' },
    questRules('caretaker_key', {
      done: ['Thanks again for the key ring. That old door in the forest has been locked since I was a boy.', 'Be careful in there. It is dark and drafty, and the floors talk.'],
      ready: ['My key ring! Well, would you look at that. The rusty key is the one for the old building.', 'Keep it. I am too old for haunted hallways. Here, take this coin for your trouble.'],
      active: ['Any luck? I lost it near the pond in the Whispering Forest, the one with the crooked signpost.', 'Remember, the forest trail only opens once your Encyclopedia reaches 25%. The rangers are strict about that.'],
      intro: ['Ah, a young hunter! Perhaps you can help an old caretaker.', 'I dropped my key ring in the Whispering Forest, by the pond. One of those keys opens the old Abandoned Building.', 'The forest trail opens at 25% Encyclopedia completion. Come back when you get there!'],
      yes: 'I will find your key.',
      accepted: ['Thank you! Look near the pond, on the east shore, I think.'],
    })
  ),

  rico: npc(
    'rico',
    'Rico',
    'Lucky Store Clerk',
    { skin: skin.tan, hair: '#2a1d16', shirt: '#62d26f', pants: '#2a2f4a', shoes: '#f2f2f2' },
    [
      {
        script: {
          pages: [
            'Welcome to the Lucky Store! Everything is lucky, except the prices.',
            'Between us: kids stash their allowance in barrels and crates around here. Have a look near the store.',
            'And the Lost & Found box in the south-east yard refills every so often. Free coins, if you do not mind duplicates.',
          ],
        },
      },
    ]
  ),

  lola_pilar: npc(
    'lola_pilar',
    'Lola Pilar',
    'Park Storyteller',
    { skin: skin.tan, hair: '#dcdcdc', shirt: '#c77dff', pants: '#4a3f5f', scarf: '#ffffff' },
    [
      {
        script: {
          pages: [
            'Sit, sit. Do you know about piloncitos? Tiny gold beads, used as money in these islands long before ships from far away arrived.',
            'They say some are still buried in the forest, in a ruined shrine hidden behind a bush that is a little too neat.',
            'And when I was a girl, we buried coins by the pond in this park. Bring a shovel, dear. The ground here holds many secrets.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ MARKET
  tita_lorna: npc(
    'tita_lorna',
    'Tita Lorna',
    'Lamp Stall Owner',
    { skin: skin.tan, hair: '#3a2a20', shirt: '#f2c14e', pants: '#7a3a4a', scarf: '#e2574c' },
    questRules('night_market_lamp', {
      done: ['The lamp shines beautifully! Every night market needs a good light.', 'And that flashlight is yours to keep. Caves are dark, and so are some of the market\'s corners.'],
      ready: ['You found all three parts! Give me a moment...', '*clink* *twist* *click*', 'There! A lamp that fits in your hand. I built you a Flashlight. Dark places are open to you now.'],
      active: ['I need three parts: a bulb, a shell, and a battery pack.', 'The bulb rolled into a crate by the west wall. The shell fell out in the open, in the middle east of the market. The battery pack ended up in a barrel down south.'],
      intro: ['Oh! Just the helper I needed. My night lamp lost three parts when a tourist bumped my stall.', 'A bulb, a shell and a battery pack, all scattered around the market. If you find them, I can build something special for you.'],
      yes: 'I will find them.',
      accepted: ['Wonderful! Watch your Money Detector. The parts are small but they do give off a signal.'],
    })
  ),

  kuya_mando: npc(
    'kuya_mando',
    'Kuya Mando',
    'Old Map Seller',
    { skin: skin.brown, hair: '#4a4a4a', shirt: '#4aa8ff', pants: '#3a3a3a', hat: true, hatColor: '#c98b3a' },
    [
      { when: { questDone: 'buried_treasure' }, script: { pages: ['Ha! Digging up a barter ring on your first try? I have been selling maps for forty years and never found one.'] } },
      {
        when: { questReady: 'buried_treasure' },
        script: {
          pages: ['You dug up the Gold Barter Ring! Look at that shine.', 'A deal is a deal. Take my old detector upgrade. It is the Improved Money Detector. Rarer money will not hide from you as easily.'],
          effects: [{ type: 'completeQuest', id: 'buried_treasure' }],
        },
      },
      { when: { quest: 'buried_treasure' }, script: { pages: ['Follow the map! In the Whispering Forest, south of the trail, near the hermit\'s hut. Bring your shovel.'] } },
      {
        when: { has: 'shovel' },
        script: {
          pages: ['Ah, a shovel! Now you are speaking my language.', 'I have an old treasure map. It marks a spot in the Whispering Forest where someone buried something shiny.', 'Take it. If you dig it up, come back and show me.'],
          effects: [{ type: 'startQuest', id: 'buried_treasure' }, { type: 'giveItem', id: 'treasure_map' }],
        },
      },
      { script: { pages: ['I sell old maps and older rumors. But a map without a shovel is just paper.', 'Come back when you can dig. Try helping folks in town. Some of them own shovels.'] } },
    ]
  ),

  vendor_joy: npc(
    'vendor_joy',
    'Joy',
    'Fruit Vendor',
    { skin: skin.brown, hair: '#1a1210', shirt: '#ff9a3c', pants: '#2a4a3a', scarf: '#ffffff' },
    [
      {
        script: {
          pages: [
            'Mangoes! Bananas! Excellent gossip!',
            'The vending machines by the shops sometimes cough up change. Come back later and they might have refilled.',
            'Oh, and a crate in the far south-east corner looks like it wants to be pushed. Just saying.',
          ],
        },
      },
    ]
  ),

  emma: npc(
    'emma',
    'Emma',
    'Tourist',
    { skin: skin.light, hair: '#d9a441', shirt: '#4aa8ff', pants: '#f2f2f2', hat: true, hatColor: '#ffffff', glasses: true },
    [
      {
        script: {
          pages: [
            'Hi! I am traveling around the world, and my wallet is a mess of coins from everywhere.',
            'The Market is a great place to find money from many countries, but the Harbor is even better. Everyone arrives there.',
            'And the big City to the east has banks, stations and travelers. Money piles up in cities!',
          ],
        },
      },
    ]
  ),

  mang_dodong: npc(
    'mang_dodong',
    'Mang Dodong',
    'Fishball Vendor',
    { skin: skin.brown, hair: '#101010', shirt: '#e2574c', pants: '#f2f2f2', hat: true, hatColor: '#f2f2f2' },
    [
      {
        script: {
          pages: [
            'Fishballs! Two for a peso, five for a bigger peso!',
            'If you hear a beep from your detector near the stalls, do not panic. That is just my customers arguing about change.',
            'Try the middle of the market, and the far corners too. Coins roll, you know.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ BEACH
  kiko: npc(
    'kiko',
    'Kiko',
    'Beach Kid',
    { skin: skin.tan, hair: '#1a1210', shirt: '#ff5d8f', pants: '#2f80ed' },
    [
      {
        when: { quest: 'lost_coin' },
        script: { pages: ['You are looking for a lost pouch? I saw a lady drop something near the big rocks!', 'Look on the sandy side of the rocks, right about where the shadow ends.'] },
      },
      {
        script: {
          pages: ['I like digging! The sand in the far north-east corner is really bumpy near the palm trees.', 'I think somebody buried something there. But I only have a plastic spade.'],
        },
      },
    ]
  ),

  tomas: npc(
    'tomas',
    'Tomas',
    'Fisherman',
    { skin: skin.dark, hair: '#101010', shirt: '#ffffff', pants: '#3a5a7a', hat: true, hatColor: '#f2c14e', beard: '#2a2a2a' },
    [
      {
        script: {
          pages: [
            'Cowrie shells were money once, you know. Tiny shells, traded across whole oceans.',
            'The tide brings them in near the eastern shoreline, past my boat. And coins wash up along the waterline too.',
          ],
        },
      },
    ]
  ),

  lifeguard_ana: npc(
    'lifeguard_ana',
    'Ana',
    'Lifeguard',
    { skin: skin.tan, hair: '#5a2a1a', shirt: '#e2574c', pants: '#ffffff', hat: true, hatColor: '#e2574c' },
    [
      {
        script: {
          pages: [
            'No swimming past the shallow water, please!',
            'A tip from the tower: there is a chest half-sunk in the sand by the palms in the north-west corner.',
            'And if you find a dirt mound or the detector goes wild but nothing shows, dig! A shovel helps a lot.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ FOREST
  hermit_bastian: npc(
    'hermit_bastian',
    'Bastian',
    'Forest Hermit',
    { skin: skin.brown, hair: '#6b4a2a', shirt: '#4a7a3a', pants: '#5a4a3a', beard: '#6b4a2a', hat: true, hatColor: '#3a5a2a' },
    [
      {
        script: {
          pages: [
            'Hm. Visitors. Rare.',
            'There is a bush on the west side, south of the pond, that grows in the shape of a doorway. Behind it, a shrine.',
            'And in the eastern tree wall, right by my hut, another bush pretends to be part of the forest. It hides a glade.',
            'Do not tell the squirrels.',
          ],
        },
      },
    ]
  ),

  ranger_lila: npc(
    'ranger_lila',
    'Ranger Lila',
    'Forest Ranger',
    { skin: skin.tan, hair: '#2a1a10', shirt: '#4a7a3a', pants: '#3a3a2a', hat: true, hatColor: '#4a7a3a' },
    [
      {
        script: {
          pages: [
            'Keep to the trails, and mind the mushrooms.',
            'The old building to the north-west needs a key, and it is dark inside. Flashlights help, but you can manage with the caretaker\'s lantern glow.',
            'The cave to the north-east is pitch black. You need a flashlight to go in. It only opens up once your Encyclopedia reaches 60%.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ ABANDONED BUILDING
  mr_whispers: npc(
    'mr_whispers',
    'Mr. Whispers',
    'Friendly Ghost',
    { skin: '#d8ecff', hair: '#eaf4ff', shirt: '#eaf4ff', pants: '#c9dcf0', shoes: '#c9dcf0', ghost: true },
    [
      { when: { flag: 'knows_lever_order' }, script: { pages: ['Ooooh... you read the note! Blue, then red, then green. The levers are in the big north hall.', 'I am not scary. I just like the drafty ambience.'] } },
      {
        script: {
          pages: [
            'Ooooh... a visitor! Do not worry, I only haunt people who leave lights on.',
            'The caretaker left a note in the west room on the south side. It tells the order of the three levers in the big hall to the north.',
            'A brass key sleeps in a drawer in that same room. It opens the east room.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ MUSEUM
  dr_reyes: npc(
    'dr_reyes',
    'Dr. Reyes',
    'Museum Curator',
    { skin: skin.tan, hair: '#2a2a2a', shirt: '#f2f2f2', pants: '#2a3a5a', glasses: true, scarf: '#4aa8ff' },
    questRules('museum_mystery', {
      done: ['The mystery is solved, thanks to you. A schoolchild borrowed the note for show-and-tell and forgot to give it back!', 'The restricted wing opens once your Encyclopedia reaches 50%, with your Museum Pass. The archivist inside has a riddle for you.'],
      ready: ['Three clues! A torn ledger, an empty case and sandy footprints. That solves it!', 'A schoolchild borrowed the Occupation-Era note for show-and-tell and forgot to return it. The class brought it back this morning.', 'As a reward: the note is yours to catalog, and here is a Museum Pass.'],
      active: ['Any clues yet? Look for a torn ledger page on the west side of the hall, the empty display case on the east side, and sandy footprints near the front door.'],
      intro: ['Welcome to the museum! I am Dr. Reyes, the curator.', 'A historical banknote vanished from its display case last week. It is a wartime note, and very precious.', 'Could you search the hall for clues? There are three things I would check.'],
      yes: 'I will investigate.',
      accepted: ['Splendid! Examine anything that looks out of place. Clues will show up as you go.'],
    })
  ),

  mia_guide: npc(
    'mia_guide',
    'Mia',
    'Museum Guide',
    { skin: skin.light, hair: '#8a3a2a', shirt: '#4a7a9a', pants: '#2a2a3a', scarf: '#f2c14e' },
    [
      {
        script: {
          pages: [
            'Welcome! Try examining the exhibits. Each one tells a different story about money.',
            'Collectors sometimes drop coins in the far corners of this hall. The south-west and south-east corners are popular.',
          ],
        },
      },
    ]
  ),

  prof_hu: npc(
    'prof_hu',
    'Professor Hu',
    'Coin Scholar',
    { skin: skin.light, hair: '#cccccc', shirt: '#7a4a2a', pants: '#3a3a3a', glasses: true, beard: '#cccccc' },
    [
      {
        script: {
          pages: [
            'Ah, another collector! Let me teach you rarity.',
            'Common money lies around in plain sight. Uncommon needs a little searching. Rare hides in special places.',
            'Epic money is guarded by puzzles, quests and secrets. Legendary money... lives in the oldest, deepest and most secret places of all.',
          ],
        },
      },
    ]
  ),

  archivist_lena: npc(
    'archivist_lena',
    'Archivist Lena',
    'Keeper of the Restricted Wing',
    { skin: skin.tan, hair: '#1a1a2a', shirt: '#8a2a4a', pants: '#2a2a3a', glasses: true },
    [
      { when: { flag: 'riddle_solved' }, script: { pages: ['You solved my riddle, and the Roman coin is yours. Enjoy the rest of the wing. Nobody else sees it.'] } },
      {
        script: {
          pages: ['Welcome to the restricted wing. Few get this far.', 'I keep a Roman coin in the case behind me. Answer my riddle and it is yours.', '"I have a head and a tail, but no body. I am small, and I change hands. What am I?"'],
          choices: [
            { label: 'A snake.', script: { pages: ['Snakes have bodies, and they rarely change hands. Think about what is in your pocket.'] } },
            {
              label: 'A coin.',
              script: {
                pages: ['Correct! A coin has a head and a tail, no body, and always changes hands.', 'Take the Roman Denarius. Look after it.'],
                effects: [{ type: 'giveCurrency', id: 'roman_denarius' }, { type: 'setFlag', flag: 'riddle_solved' }],
              },
            },
            { label: 'A comet.', script: { pages: ['A comet has a tail, but a head? Not really. And it certainly does not change hands.'] } },
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ HARBOR
  sailor_sam: npc(
    'sailor_sam',
    'Sailor Sam',
    'Harbor Hand',
    { skin: skin.tan, hair: '#3a2a1a', shirt: '#ffffff', pants: '#2a3a6a', hat: true, hatColor: '#2a3a6a', scarf: '#e2574c' },
    questRules('travelers_currency', {
      done: ['Best hunter I ever met. Captain Delos is at the east pier. Show him your Boat Pass and he will take you to Coral Isle.'],
      ready: ['Three foreign currencies in a day. You have got the nose for it!', 'Here, take these Pieces of Eight. Pirate-era favorite. And a Boat Pass. Captain Delos is at the east pier.'],
      active: ['Travelers lose money everywhere: warehouses, piers, cargo barrels. Find 3 currencies around the harbor and come back to me.'],
      intro: ['Ahoy! Every day a boat unloads travelers, and every day somebody loses a coin.', 'If you can find three kinds of money around the harbor, I will reward you properly.'],
      yes: 'Deal.',
      accepted: ['That is the spirit! Check the warehouses, the piers and the cargo. Use your detector!'],
    })
  ),

  captain_delos: npc(
    'captain_delos',
    'Captain Delos',
    'Boat Captain',
    { skin: skin.dark, hair: '#dcdcdc', shirt: '#2a5a8a', pants: '#3a3a3a', hat: true, hatColor: '#f2f2f2', beard: '#dcdcdc' },
    [
      {
        when: { has: 'boat_pass' },
        script: {
          pages: ['Ahoy, hunter! I see you have got a Boat Pass. Ready to sail to Coral Isle?'],
          choices: [
            {
              label: 'Sail to Coral Isle',
              script: { pages: ['All aboard! Hold on tight.'], effects: [{ type: 'giveItem', id: 'sea_chart' }, { type: 'travel', to: 'island', spawn: 'harbor' }] },
            },
            { label: 'Not yet', script: { pages: ['The tide will wait. The island will not go anywhere.'] } },
          ],
        },
      },
      { script: { pages: ['Coral Isle? Beautiful little place. But I only take passengers with a Boat Pass.', 'Sailor Sam near the warehouses gives them to helpful travelers.'] } },
    ]
  ),

  yuki: npc(
    'yuki',
    'Yuki',
    'Tourist',
    { skin: skin.light, hair: '#101010', shirt: '#ff5d8f', pants: '#2a2a3a', hat: true, hatColor: '#ffffff' },
    [
      {
        script: {
          pages: [
            'In my country, the 5 yen coin has a hole in the middle. It is a lucky coin!',
            'I dropped a few coins on my way here. One at the end of the west pier, inside a chest I was carrying. Silly me.',
            'And something at the end of the middle pier, too. I heard a tiny clink.',
          ],
        },
      },
    ]
  ),

  merchant_haji: npc(
    'merchant_haji',
    'Haji',
    'Spice Merchant',
    { skin: skin.brown, hair: '#1a1a1a', shirt: '#c77dff', pants: '#f2f2f2', hat: true, hatColor: '#ffffff', beard: '#2a2a2a' },
    [
      {
        script: {
          pages: [
            'Spices, silks and stories. I trade all three.',
            'Long ago, some places used silver bullets and tin animals as money. Imagine paying for cloves with a little tin fish!',
            'The sandy patch in the north-east corner is where sailors bury their savings. Bring a shovel.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ CORAL ISLE
  castaway_gil: npc(
    'castaway_gil',
    'Gil',
    'Castaway',
    { skin: skin.tan, hair: '#5a3a1a', shirt: '#c9a06a', pants: '#8a6a3a', beard: '#5a3a1a' },
    [
      {
        script: {
          pages: [
            'Oh! A visitor! I have been here for... what day is it?',
            'I have seen things. Palms growing in a suspiciously tidy ring in the north-east. A boulder on the north shore with scrape marks on the sand.',
            'There is a dark grotto behind that boulder. Bring a flashlight, if you are brave. Something pale and round glows in there.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ CITY
  banker_tan: npc(
    'banker_tan',
    'Banker Tan',
    'City Bank Manager',
    { skin: skin.tan, hair: '#1a1a1a', shirt: '#2a3a5a', pants: '#1a1a2a', glasses: true, scarf: '#f2c14e' },
    questRules('bank_key', {
      done: ['The vault key is yours to keep. The vault is on the east side of the lobby. Whatever is in there, you found the key, so it is yours.'],
      ready: ['The vault key! The janitor will be so relieved.', 'Here, a little thank you from the bank. And you can keep the key. Open the vault yourself. The door is on the east side of the lobby.'],
      active: ['Any luck? The janitor lost the key somewhere in the city park, near the west fence. Please look there.'],
      intro: ['Welcome to the City Bank! I have a small problem.', 'Our vault key vanished. The janitor thinks he lost it in the city park, and I cannot leave the counter.', 'Could you find it? The vault holds some very crisp banknotes.'],
      yes: 'I will find it.',
      accepted: ['Marvelous. The park is south-west of the bank, across the street.'],
    })
  ),

  numismatist_lim: npc(
    'numismatist_lim',
    'Old Man Lim',
    'Numismatist',
    { skin: skin.tan, hair: '#dcdcdc', shirt: '#7a5a3a', pants: '#3a3a3a', glasses: true, beard: '#dcdcdc', hat: true, hatColor: '#3a3a3a' },
    [
      {
        script: {
          pages: [
            'I have studied coins for sixty years. Let me tell you about legends.',
            'The first coins were minted in Lydia. Athens stamped owls on its silver. Legendary money never sits in plain view.',
            'It waits in the oldest places: beyond the cave, in ruins where the wall tells a story. And past that... well. Some doors only open for those who found almost everything.',
          ],
        },
      },
    ]
  ),

  tourist_carlos: npc(
    'tourist_carlos',
    'Carlos',
    'Tourist',
    { skin: skin.tan, hair: '#3a2a1a', shirt: '#ff9a3c', pants: '#f2f2f2', hat: true, hatColor: '#ff9a3c' },
    [
      {
        script: {
          pages: [
            'I lost a whole handful of coins at the bus terminal!',
            'The lockers in the north-east corner, and the ones along the train platform, are free to check. People forget things in them.',
          ],
        },
      },
    ]
  ),

  performer_jo: npc(
    'performer_jo',
    'Jo',
    'Street Performer',
    { skin: skin.brown, hair: '#8a1a4a', shirt: '#c77dff', pants: '#2a2a3a', hat: true, hatColor: '#f2c14e' },
    [
      {
        script: {
          pages: [
            '*plays a cheerful tune*',
            'People throw coins near the south-west plaza all day. Some roll into corners. Try the north-west and south-east too.',
          ],
        },
      },
    ]
  ),

  // ------------------------------------------------------------ CAVE / RUINS / SECRET
  miner_dado: npc(
    'miner_dado',
    'Dado',
    'Old Miner',
    { skin: skin.dark, hair: '#101010', shirt: '#e8a83a', pants: '#3a3a3a', hat: true, hatColor: '#e8a83a', beard: '#2a2a2a' },
    [
      {
        script: {
          pages: [
            'Watch your step, hunter. Echo Cave has more secrets than stones.',
            'The ground in the west tunnel is soft. A shovel will find things down there.',
            'And near the north passage there is a wall with a crack in it. Cool air leaks through. Sounds like a hidden chamber to me.',
          ],
        },
      },
    ]
  ),

  explorer_nova: npc(
    'explorer_nova',
    'Nova',
    'Fellow Explorer',
    { skin: skin.tan, hair: '#c77dff', shirt: '#4aa8ff', pants: '#2a2a3a', hat: true, hatColor: '#c98b3a', scarf: '#f2c14e' },
    [
      {
        script: {
          pages: [
            'Incredible, right? I have been trying to solve these plates for hours.',
            'Four murals line the north wall of the great hall. Four plates wait on the floor. I think the murals tell a story, and the story is the order.',
            'Also: the far west wall looks oddly clean. And the far east leads onward, but only for those who have almost finished the Encyclopedia.',
          ],
        },
      },
    ]
  ),

  coin_keeper: npc(
    'coin_keeper',
    'The Coin Keeper',
    'Guardian of the Vault',
    { skin: '#ffe9a8', hair: '#ffd86b', shirt: '#f2c14e', pants: '#b8862b', hat: true, hatColor: '#ffd86b', ghost: true },
    [
      {
        script: {
          pages: [
            'Welcome to the Gilded Vault, collector. Four legends rest here: a dragon crown, an aurora note, a starlight doubloon and a founder\'s emerald.',
            'When you have found everything else, the Treasury of Worlds will open. Its golden doorway appears in the town plaza.',
          ],
        },
      },
    ]
  ),
};
