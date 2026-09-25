// Inventory items. Collected money does NOT live here - it goes straight to the Money Encyclopedia.
// Icons are emoji placeholders; swap them for your own pixel art in src/assets/ui when you like.

export const ITEM_CATEGORIES = [
  { id: 'tools', label: 'Tools' },
  { id: 'keys', label: 'Keys & Passes' },
  { id: 'maps', label: 'Maps' },
  { id: 'quest', label: 'Quest Items' },
];

export const ITEMS = {
  // ---- tools
  detector: {
    id: 'detector',
    name: 'Money Detector',
    category: 'tools',
    icon: '📡',
    description: 'Beeps when hidden money is close. Rarer money gives a much weaker signal.',
  },
  detector2: {
    id: 'detector2',
    name: 'Improved Money Detector',
    category: 'tools',
    icon: '🛰️',
    description: 'A tuned-up detector that picks up rarer currencies from farther away.',
  },
  shovel: {
    id: 'shovel',
    name: 'Shovel',
    category: 'tools',
    icon: '⛏️',
    description: 'Lets you dig up buried money. Look for dirt mounds and strong detector signals.',
  },
  flashlight: {
    id: 'flashlight',
    name: 'Flashlight',
    category: 'tools',
    icon: '🔦',
    description: 'Lights up dark places. Required to enter caves, and helps a lot in dark buildings.',
  },

  // ---- keys and passes
  rusty_key: {
    id: 'rusty_key',
    name: 'Rusty Key',
    category: 'keys',
    icon: '🗝️',
    description: 'Opens the front door of the abandoned building in the forest.',
  },
  brass_key: {
    id: 'brass_key',
    name: 'Brass Key',
    category: 'keys',
    icon: '🔑',
    description: 'A small brass key with a moth-eaten tag: "East Room".',
  },
  vault_key: {
    id: 'vault_key',
    name: 'Bank Vault Key',
    category: 'keys',
    icon: '🔐',
    description: 'A heavy steel key that opens the vault inside the City Bank.',
  },
  museum_pass: {
    id: 'museum_pass',
    name: 'Museum Pass',
    category: 'keys',
    icon: '🎫',
    description: 'Grants access to the museum\'s restricted wing (once you have proven yourself as a collector).',
  },
  boat_pass: {
    id: 'boat_pass',
    name: 'Boat Pass',
    category: 'keys',
    icon: '⚓',
    description: 'A ticket for Captain Delos\'s boat. Sails from the Harbor to Coral Isle.',
  },

  // ---- maps
  world_map: {
    id: 'world_map',
    name: 'World Map',
    category: 'maps',
    icon: '🗺️',
    description: 'Shows the areas you have found. Open it with M.',
  },
  treasure_map: {
    id: 'treasure_map',
    name: 'Treasure Map',
    category: 'maps',
    icon: '📜',
    description: 'A hand-drawn map with an X somewhere in the Whispering Forest, south of the trail.',
  },
  sea_chart: {
    id: 'sea_chart',
    name: 'Sea Chart',
    category: 'maps',
    icon: '🧭',
    description: 'Captain Delos\'s chart of Coral Isle. A boulder on the north shore and a ring of palms in the north-east each have a tiny "?".',
  },

  // ---- quest items
  lost_pouch: {
    id: 'lost_pouch',
    name: 'Lost Coin Pouch',
    category: 'quest',
    icon: '👝',
    description: 'A little cloth pouch found near the beach rocks. It jingles.',
  },
  lamp_bulb: {
    id: 'lamp_bulb',
    name: 'Lamp Bulb',
    category: 'quest',
    icon: '💡',
    description: 'One of three parts for Tita Lorna\'s night lamp.',
  },
  lamp_shell: {
    id: 'lamp_shell',
    name: 'Lamp Shell',
    category: 'quest',
    icon: '🏮',
    description: 'One of three parts for Tita Lorna\'s night lamp.',
  },
  lamp_battery: {
    id: 'lamp_battery',
    name: 'Lamp Battery Pack',
    category: 'quest',
    icon: '🔋',
    description: 'One of three parts for Tita Lorna\'s night lamp.',
  },
};

for (const [id,name,description,category] of [
  ['coastal_map','Tideworn Treasure Map','East of the great rocks, search the quiet sand before the fishing boat.','maps'],
  ['rare_treasure_map','Forest Treasure Map','South of the forest pond, search the central clearing.','maps'],
  ['mystery_map',"The Collector’s Map",'The old hall remembers every collector. Read its monument and search the eastern wing.','maps'],
  ['legendary_map','Legendary Treasure Hunt','Where four pedestals guard the gilded hall, search north of the keeper.','maps'],
  ['legendary_detector','Legendary Detector Upgrade','Extends Legendary detection range.','tools'],
  ['treasure_radar','Treasure Detector Upgrade','Sense nearby treasure chests. Earned by exploring 75% of the world.','tools'],
]) ITEMS[id]={id,name,description,category,icon:category==='maps'?'▧':'⌁'};
export const START_ITEMS = ['detector', 'world_map'];
