// Money Encyclopedia data.
//
// Adding a new currency is a two-step job:
//   1. Add an entry below (any id, unique).
//   2. Place it somewhere: a `collectibles` entry in src/data/maps/*.js, a quest reward in
//      quests.js, or a trade. Run `npm run check` to verify every entry can be found.
//
// Every entry is original pixel art generated in code (see src/game/currencyIcons.js), and
// descriptions are original text. Real-world currencies are used only as inspiration.

export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export const RARITY_INFO = {
  Common: { color: '#b9c4d0', glow: 'rgba(185,196,208,0.35)', order: 0 },
  Uncommon: { color: '#62d26f', glow: 'rgba(98,210,111,0.45)', order: 1 },
  Rare: { color: '#4aa8ff', glow: 'rgba(74,168,255,0.5)', order: 2 },
  Epic: { color: '#c77dff', glow: 'rgba(199,125,255,0.55)', order: 3 },
  Legendary: { color: '#ffb02e', glow: 'rgba(255,176,46,0.65)', order: 4 },
};

// id, name, origin, type, category, value, rarity, location, description, icon overrides
const c = (id, name, origin, type, category, value, rarity, location, description, icon = {}) => ({
  id,
  name,
  origin,
  type,
  category,
  value,
  rarity,
  location,
  description,
  icon,
  discovered: false,
});

export const CURRENCIES = [
  // ================= TOWN =================
  c('php1', 'Philippine 1 Peso Coin', 'Philippines', 'Coin', 'Modern', '₱1', 'Common', 'Town', 'A small silver-toned coin that hides in pockets, jars and sofa cushions.'),
  c('php5', 'Philippine 5 Peso Coin', 'Philippines', 'Coin', 'Modern', '₱5', 'Common', 'Town', 'A chunky coin that pays for jeepney fares and sari-sari store candy.'),
  c('php20', 'Philippine 20 Peso Coin', 'Philippines', 'Coin', 'Modern', '₱20', 'Common', 'Town', 'A commonly used Philippine coin with a bright, two-tone shine.'),
  c('php20n', 'Philippine 20 Peso Note', 'Philippines', 'Banknote', 'Modern', '₱20', 'Common', 'Town', 'An orange-toned note, softened by countless hands.', { tone: 'orange' }),
  c('usd1c', 'US 1 Cent Coin', 'United States', 'Coin', 'Foreign', '$0.01', 'Common', 'Town', 'The humble penny. Copper-colored and easy to overlook.', { tone: 'copper' }),
  c('usd1n', 'US 1 Dollar Bill', 'United States', 'Banknote', 'Foreign', '$1', 'Common', 'Town', 'A crisp green bill, the most common note in the United States.', { tone: 'green' }),
  c('jpy1', 'Japanese 1 Yen Coin', 'Japan', 'Coin', 'Foreign', '¥1', 'Common', 'Town', 'A featherlight aluminum coin. It floats on water if you set it down gently.'),
  c('eur1c', 'Euro 1 Cent Coin', 'Eurozone', 'Coin', 'Foreign', '€0.01', 'Common', 'Town', 'The smallest euro coin, a copper-toned speck of change.', { tone: 'copper' }),
  c('gbp1p', 'British 1 Penny Coin', 'United Kingdom', 'Coin', 'Foreign', '£0.01', 'Common', 'Town', 'A small copper coin with a long royal heritage.', { tone: 'copper' }),
  c('inr10', 'Indian 10 Rupee Coin', 'India', 'Coin', 'Foreign', '₹10', 'Common', 'Town', 'A two-tone coin that traveled a long way to reach this town.'),
  c('phpold', 'Old Pilipinas 1 Piso Coin', 'Philippines', 'Coin', 'Old', '₱1', 'Uncommon', 'Town', 'An older-design piso, dulled by decades in a dusty alley.', { tone: 'bronze' }),
  c('usd_bicent', 'US Bicentennial Quarter', 'United States', 'Coin', 'Commemorative', '$0.25', 'Uncommon', 'Town', 'A quarter with a special design made to mark a national anniversary.', { glyph: 'star' }),
  c('gbp_farthing', 'Old British Farthing', 'United Kingdom', 'Coin', 'Old', '¼d', 'Uncommon', 'Town', 'A tiny pre-decimal coin worth a quarter of a penny.', { tone: 'bronze' }),
  c('dem5', 'Old German 5 Mark Coin', 'Germany', 'Coin', 'Old', '5 DM', 'Uncommon', 'Town', 'A retired coin from the days before the euro replaced the mark.', { glyph: 'M' }),

  // ================= MARKET =================
  c('php10', 'Philippine 10 Peso Coin', 'Philippines', 'Coin', 'Modern', '₱10', 'Common', 'Market', 'A bimetallic coin: golden in the middle, silver around the edge.', { tone: 'gold' }),
  c('php50n', 'Philippine 50 Peso Note', 'Philippines', 'Banknote', 'Modern', '₱50', 'Common', 'Market', 'A red-toned note that changes hands all day at market stalls.', { tone: 'red' }),
  c('php100n', 'Philippine 100 Peso Note', 'Philippines', 'Banknote', 'Modern', '₱100', 'Uncommon', 'Market', 'A purple-toned note. Vendors always hold it up to the light.', { tone: 'purple' }),
  c('sgd10c', 'Singapore 10 Cent Coin', 'Singapore', 'Coin', 'Foreign', 'S$0.10', 'Common', 'Market', 'A neat little silver coin from the Lion City.'),
  c('myr50s', 'Malaysian 50 Sen Coin', 'Malaysia', 'Coin', 'Foreign', '50 sen', 'Common', 'Market', 'Half a ringgit, and just right for a snack.'),
  c('thb1', 'Thai 1 Baht Coin', 'Thailand', 'Coin', 'Foreign', '฿1', 'Common', 'Market', 'A light silver coin that a tourist must have dropped.'),
  c('idr1000', 'Indonesian 1000 Rupiah Coin', 'Indonesia', 'Coin', 'Foreign', 'Rp1,000', 'Common', 'Market', 'A round coin with a big number and a small value.', { tone: 'gold' }),
  c('krw10', 'Korean 10 Won Coin', 'South Korea', 'Coin', 'Foreign', '₩10', 'Common', 'Market', 'A copper-colored coin, thin and cheerful.', { tone: 'copper' }),
  c('cad_loonie', 'Canadian Loonie', 'Canada', 'Coin', 'Foreign', 'C$1', 'Uncommon', 'Market', 'A gold-toned dollar coin named after the loon on its back.', { tone: 'gold' }),
  c('aud50c', 'Australian 50 Cent Coin', 'Australia', 'Coin', 'Foreign', 'A$0.50', 'Uncommon', 'Market', 'A large twelve-sided coin. Yes, twelve.'),
  c('red_env', 'Lucky Red Envelope Note', 'China', 'Banknote', 'Special Edition', '¥8', 'Rare', 'Market', 'A festival-edition note printed with lucky red patterns and golden trim.', { tone: 'red', glyph: 'star' }),

  // ================= BEACH =================
  c('usd25c', 'US Quarter', 'United States', 'Coin', 'Foreign', '$0.25', 'Common', 'Beach', 'Twenty-five cents of shoreline treasure.'),
  c('jpy5', 'Japanese 5 Yen Coin', 'Japan', 'Coin', 'Foreign', '¥5', 'Common', 'Beach', 'A brass coin with a hole in the middle, said to bring good luck.', { shape: 'holecoin', tone: 'gold' }),
  c('eur1', 'Euro 1 Euro Coin', 'Eurozone', 'Coin', 'Foreign', '€1', 'Common', 'Beach', 'A two-tone coin that washed in with the tide.', { tone: 'gold' }),
  c('gbp1', 'British 1 Pound Coin', 'United Kingdom', 'Coin', 'Foreign', '£1', 'Common', 'Beach', 'A twelve-sided coin with a sharp, modern edge.', { tone: 'gold' }),
  c('cowrie', 'Cowrie Shell Money', 'Indian Ocean', 'Coin', 'Ancient', '1 shell', 'Uncommon', 'Beach', 'Tiny glossy shells that served as money along ancient trade routes.', { shape: 'shell' }),
  c('phpspanish', 'Spanish Colonial Peso', 'Philippines', 'Coin', 'Historical', '1 peso', 'Rare', 'Beach', 'A heavy silver coin from the Spanish colonial era, worn smooth by the sea.', { glyph: 'crown', wobble: true }),
  c('aud2', 'Australian 2 Dollar Coin', 'Australia', 'Coin', 'Foreign', 'A$2', 'Uncommon', 'Beach', 'A small gold-toned coin that is worth more than it looks.', { tone: 'gold' }),
  c('krw500', 'Korean 500 Won Coin', 'South Korea', 'Coin', 'Foreign', '₩500', 'Uncommon', 'Beach', 'The largest Korean coin in everyday use, with a satisfying weight.'),
  c('usd_silver', 'Old Silver Dollar', 'United States', 'Coin', 'Old', '$1', 'Rare', 'Beach', 'A big silver dollar from long ago, buried deep in the dunes.', { tone: 'silver', glyph: 'star' }),

  // ================= MUSEUM =================
  c('cny_cash', 'Qing-Style Cash Coin', 'China', 'Coin', 'Historical', '1 cash', 'Uncommon', 'Museum', 'A round coin with a square hole, once strung together by the hundreds.', { shape: 'sqholecoin', tone: 'bronze' }),
  c('voc', 'Dutch East India Trade Coin', 'Netherlands', 'Coin', 'Historical', '1 duit', 'Rare', 'Museum', 'A small copper coin from the age of spice ships and far-off ports.', { tone: 'copper', glyph: 'crown', wobble: true }),
  c('phpoccup', 'Occupation-Era Peso Note', 'Philippines', 'Banknote', 'Historical', '₱10', 'Epic', 'Museum', 'A wartime note that tells a difficult chapter of history.', { tone: 'brown', glyph: 'P' }),
  c('roman_denarius', 'Roman Denarius', 'Roman Empire', 'Coin', 'Ancient', '1 denarius', 'Epic', 'Museum', 'A silver coin that paid soldiers across an empire.', { glyph: 'crown', wobble: true }),
  c('krw_sangpyeong', 'Sangpyeong Tongbo', 'Joseon Korea', 'Coin', 'Historical', '1 mun', 'Rare', 'Museum', 'A bronze coin with a square hole, used in old Korea for centuries.', { shape: 'sqholecoin', tone: 'bronze' }),
  c('gbp_guinea', 'British Gold Guinea', 'United Kingdom', 'Coin', 'Historical', '1 guinea', 'Rare', 'Museum', 'A gold coin once worth a little more than a pound.', { tone: 'gold', glyph: 'crown', wobble: true }),
  c('byzantine', 'Byzantine Gold Solidus', 'Byzantine Empire', 'Coin', 'Ancient', '1 solidus', 'Epic', 'Museum', 'A gold coin so trusted it stayed steady for hundreds of years.', { tone: 'gold', glyph: 'crown', wobble: true }),
  c('cny_spade', 'Ancient Spade Money', 'Ancient China', 'Coin', 'Ancient', '1 spade', 'Rare', 'Museum', 'Bronze money shaped like a farm tool, from a time before round coins.', { shape: 'spade', tone: 'bronze' }),

  // ================= FOREST =================
  c('myr5n', 'Malaysian 5 Ringgit Note', 'Malaysia', 'Banknote', 'Foreign', 'RM5', 'Common', 'Forest', 'A green note that fluttered into the trees.', { tone: 'green' }),
  c('thb20n', 'Thai 20 Baht Note', 'Thailand', 'Banknote', 'Foreign', '฿20', 'Common', 'Forest', 'A cheerful green note tucked behind a tree root.', { tone: 'green' }),
  c('idr2000n', 'Indonesian 2000 Rupiah Note', 'Indonesia', 'Banknote', 'Foreign', 'Rp2,000', 'Uncommon', 'Forest', 'A gray-toned note, folded small by a careful traveler.', { tone: 'teal' }),
  c('sgd2n', 'Singapore 2 Dollar Note', 'Singapore', 'Banknote', 'Foreign', 'S$2', 'Uncommon', 'Forest', 'A small purple note that is getting harder to find.', { tone: 'purple' }),
  c('aud5n', 'Australian 5 Dollar Note', 'Australia', 'Banknote', 'Foreign', 'A$5', 'Uncommon', 'Forest', 'A colorful plastic-feeling note, waterproof enough for a forest pond.', { tone: 'pink' }),
  c('cad5n', 'Canadian 5 Dollar Note', 'Canada', 'Banknote', 'Foreign', 'C$5', 'Uncommon', 'Forest', 'A blue note, faded by rain and sun.', { tone: 'blue' }),
  c('cacao', 'Cacao Bean Money', 'Mesoamerica', 'Coin', 'Ancient', '1 bean', 'Uncommon', 'Forest', 'Cacao beans were once traded like coins. Yes, chocolate was money.', { shape: 'bean' }),
  c('piloncito', 'Piloncito Gold Bead', 'Philippines', 'Coin', 'Ancient', '1 bead', 'Epic', 'Forest', 'Tiny pre-colonial gold beads used for trade in the islands long ago.', { shape: 'bead', tone: 'gold' }),
  c('barter_ring', 'Gold Barter Ring', 'Philippines', 'Coin', 'Ancient', '1 ring', 'Epic', 'Forest', 'A gold ring that doubled as jewelry and money in early island trade.', { shape: 'ring', tone: 'gold' }),

  // ================= ABANDONED BUILDING =================
  c('eur20n', 'Euro 20 Note', 'Eurozone', 'Banknote', 'Foreign', '€20', 'Uncommon', 'Abandoned Building', 'A blue note gone soft in the damp air.', { tone: 'blue' }),
  c('usd20n', 'US 20 Dollar Bill', 'United States', 'Banknote', 'Foreign', '$20', 'Uncommon', 'Abandoned Building', 'A green twenty, left behind in a hurry.', { tone: 'green' }),
  c('krw10000n', 'Korean 10,000 Won Note', 'South Korea', 'Banknote', 'Foreign', '₩10,000', 'Uncommon', 'Abandoned Building', 'A big green note with a very small tear.', { tone: 'green' }),
  c('gbp_crown', 'Commemorative Crown Coin', 'United Kingdom', 'Coin', 'Commemorative', '1 crown', 'Rare', 'Abandoned Building', 'A large collector coin made to mark a royal occasion.', { glyph: 'crown', tone: 'silver' }),
  c('error_coin', 'Double-Struck Error Coin', 'United States', 'Coin', 'Special Edition', '$0.10', 'Rare', 'Abandoned Building', 'A minting mistake with a doubled design. Collectors adore it.', { glyph: 'dia' }),
  c('cny_knife', 'Ancient Knife Money', 'Ancient China', 'Coin', 'Ancient', '1 blade', 'Epic', 'Abandoned Building', 'Bronze money shaped like a little knife, older than most cities.', { shape: 'knife', tone: 'bronze' }),
  c('gold_bullion', 'Gold Bullion Coin', 'International', 'Coin', 'Special Edition', '1 oz', 'Epic', 'Abandoned Building', 'A hefty investment coin of nearly pure gold.', { shape: 'ingot', tone: 'gold' }),

  // ================= HARBOR =================
  c('thb10', 'Thai 10 Baht Coin', 'Thailand', 'Coin', 'Foreign', '฿10', 'Common', 'Harbor', 'A two-tone coin dropped by a traveler stepping off a boat.', { tone: 'gold' }),
  c('krw100', 'Korean 100 Won Coin', 'South Korea', 'Coin', 'Foreign', '₩100', 'Common', 'Harbor', 'A shiny silver coin with a ship-worthy weight.'),
  c('jpy100', 'Japanese 100 Yen Coin', 'Japan', 'Coin', 'Foreign', '¥100', 'Common', 'Harbor', 'A silver coin with a flower on one side.'),
  c('sgd1', 'Singapore 1 Dollar Coin', 'Singapore', 'Coin', 'Foreign', 'S$1', 'Common', 'Harbor', 'A bright coin from one of the busiest ports in the world.', { tone: 'gold' }),
  c('myr50n', 'Malaysian 50 Ringgit Note', 'Malaysia', 'Banknote', 'Foreign', 'RM50', 'Uncommon', 'Harbor', 'A large blue-green note, folded neatly inside a sailor\'s wallet.', { tone: 'teal' }),
  c('cny10n', 'Chinese 10 Yuan Note', 'China', 'Banknote', 'Foreign', '¥10', 'Uncommon', 'Harbor', 'A blue-toned note with a very serious face on it.', { tone: 'blue' }),
  c('jpy500', 'Japanese 500 Yen Coin', 'Japan', 'Coin', 'Foreign', '¥500', 'Uncommon', 'Harbor', 'The largest Japanese coin, and it feels like it.', { tone: 'gold' }),
  c('sgd10n', 'Singapore 10 Dollar Note', 'Singapore', 'Banknote', 'Foreign', 'S$10', 'Uncommon', 'Harbor', 'A red note waterlogged from a cargo crate.', { tone: 'red' }),
  c('pieces8', 'Pieces of Eight', 'Spanish Empire', 'Coin', 'Historical', '8 reales', 'Epic', 'Harbor', 'A pirate-era favorite: a silver coin that could be cut into eight pieces.', { glyph: 'crown', wobble: true }),
  c('thb_pot', 'Thai Bullet Coin', 'Thailand', 'Coin', 'Historical', '1 tical', 'Rare', 'Harbor', 'A silver ball folded into a bullet shape and stamped as money.', { shape: 'bead', tone: 'silver' }),

  // ================= CORAL ISLE =================
  c('aud_holey', 'Holey Dollar', 'Australia', 'Coin', 'Historical', '5 shillings', 'Rare', 'Coral Isle', 'A coin with the center punched out, which turned one coin into two.', { shape: 'holecoin', tone: 'silver' }),
  c('cad_commem', 'Commemorative Canadian Silver Coin', 'Canada', 'Coin', 'Commemorative', 'C$1', 'Rare', 'Coral Isle', 'A silver collector coin that never made it into circulation.', { glyph: 'star', tone: 'silver' }),
  c('aud50n', 'Australian 50 Dollar Note', 'Australia', 'Banknote', 'Foreign', 'A$50', 'Uncommon', 'Coral Isle', 'A big yellow note, tucked into a coconut shell.', { tone: 'orange' }),
  c('rai_stone', 'Yap Rai Stone', 'Yap Island', 'Coin', 'Ancient', '1 stone', 'Legendary', 'Coral Isle', 'A giant stone disc used as money, valued by its story rather than its size.', { shape: 'stone' }),
  c('pearl', 'Sunken Pearl Coin', 'The Sunken Kingdom', 'Coin', 'Fictional', '1 pearl', 'Legendary', 'Coral Isle', 'A coin made of moon-white pearl, said to hum when the tide turns.', { shape: 'gem', tone: 'pearl' }),

  // ================= CITY =================
  c('cny1', 'Chinese 1 Yuan Coin', 'China', 'Coin', 'Foreign', '¥1', 'Common', 'City', 'A tidy silver coin from the busy streets.'),
  c('jpy1000n', 'Japanese 1000 Yen Note', 'Japan', 'Banknote', 'Foreign', '¥1,000', 'Common', 'City', 'A blue-toned note that vending machines love.', { tone: 'blue' }),
  c('usd5n', 'US 5 Dollar Bill', 'United States', 'Banknote', 'Foreign', '$5', 'Common', 'City', 'A green five, slightly crumpled.', { tone: 'green' }),
  c('eur5n', 'Euro 5 Note', 'Eurozone', 'Banknote', 'Foreign', '€5', 'Common', 'City', 'A gray-green note that fits neatly in any pocket.', { tone: 'teal' }),
  c('gbp5n', 'British 5 Pound Note', 'United Kingdom', 'Banknote', 'Foreign', '£5', 'Common', 'City', 'A small turquoise note that made it through the wash.', { tone: 'teal' }),
  c('krw1000n', 'Korean 1000 Won Note', 'South Korea', 'Banknote', 'Foreign', '₩1,000', 'Common', 'City', 'A blue-toned note with a calm scholarly look.', { tone: 'blue' }),
  c('gbp20n', 'British 20 Pound Note', 'United Kingdom', 'Banknote', 'Foreign', '£20', 'Uncommon', 'City', 'A purple-toned note, quietly valuable.', { tone: 'purple' }),
  c('cny100n', 'Chinese 100 Yuan Note', 'China', 'Banknote', 'Foreign', '¥100', 'Uncommon', 'City', 'A red note that always turns heads.', { tone: 'red' }),
  c('cad20n', 'Canadian 20 Dollar Note', 'Canada', 'Banknote', 'Foreign', 'C$20', 'Uncommon', 'City', 'A green note with a see-through window.', { tone: 'green' }),
  c('idr50000n', 'Indonesian 50,000 Rupiah Note', 'Indonesia', 'Banknote', 'Foreign', 'Rp50,000', 'Uncommon', 'City', 'A large note with many zeros and a bright blue glow.', { tone: 'blue' }),
  c('thb100n', 'Thai 100 Baht Note', 'Thailand', 'Banknote', 'Foreign', '฿100', 'Uncommon', 'City', 'A red note that a market vendor was very proud of.', { tone: 'red' }),
  c('php500n', 'Philippine 500 Peso Note', 'Philippines', 'Banknote', 'Modern', '₱500', 'Rare', 'City', 'A bright yellow note that feels like a small victory.', { tone: 'orange' }),
  c('php1000n', 'Philippine 1000 Peso Note', 'Philippines', 'Banknote', 'Modern', '₱1,000', 'Rare', 'City', 'A big blue note, one of the highest values in daily use.', { tone: 'blue' }),
  c('usd100n', 'US 100 Dollar Bill', 'United States', 'Banknote', 'Foreign', '$100', 'Rare', 'City', 'A crisp hundred from the bank\'s vault, still smelling of ink.', { tone: 'green' }),
  c('eur100n', 'Euro 100 Note', 'Eurozone', 'Banknote', 'Foreign', '€100', 'Rare', 'City', 'A green note that only shows up in serious wallets.', { tone: 'green' }),
  c('jpy10000n', 'Japanese 10,000 Yen Note', 'Japan', 'Banknote', 'Foreign', '¥10,000', 'Rare', 'City', 'The largest Japanese note, brown-toned and dignified.', { tone: 'brown' }),
  c('sgd50n', 'Singapore 50 Dollar Note', 'Singapore', 'Banknote', 'Foreign', 'S$50', 'Rare', 'City', 'A big blue note, stamped with the city\'s crest.', { tone: 'blue' }),

  // ================= CAVE =================
  c('myr_old', 'Old Malayan Dollar Coin', 'Malaysia', 'Coin', 'Old', '$1', 'Uncommon', 'Cave', 'A coin from a time before the ringgit, green with age.', { tone: 'bronze' }),
  c('idr_old', 'Old Rupiah Coin', 'Indonesia', 'Coin', 'Old', 'Rp5', 'Uncommon', 'Cave', 'A little coin of a bygone series, hidden in a crack.', { tone: 'bronze' }),
  c('sgd_old', 'Old Straits Settlements Cent', 'Singapore', 'Coin', 'Old', '1 cent', 'Uncommon', 'Cave', 'A colonial-era copper cent with a story in every scratch.', { tone: 'copper' }),
  c('cad_old', 'Old Canadian Large Cent', 'Canada', 'Coin', 'Old', 'C$0.01', 'Uncommon', 'Cave', 'A large copper cent, nearly the size of a small cookie.', { tone: 'copper' }),
  c('viking_hack', 'Viking Hacksilver', 'Viking Age Scandinavia', 'Coin', 'Historical', 'By weight', 'Rare', 'Cave', 'Chopped-up silver that was weighed out instead of counted.', { shape: 'chunk', tone: 'silver' }),
  c('tin_animal', 'Tin Animal Money', 'Malay Peninsula', 'Coin', 'Ancient', '1 ingot', 'Rare', 'Cave', 'Small animal-shaped tin ingots that served as money long ago.', { shape: 'fish', tone: 'silver' }),
  c('jpy_koban', 'Edo Koban', 'Japan', 'Coin', 'Historical', '1 ryo', 'Epic', 'Cave', 'An oval gold coin from the Edo period, shining even in the dark.', { shape: 'oval', tone: 'gold' }),
  c('moonstone', 'Moonstone Dukat', 'The Hidden Kingdom', 'Coin', 'Fictional', '1 dukat', 'Epic', 'Cave', 'A coin cut from moonstone. It glows very faintly when you stop looking at it.', { tone: 'purple', glyph: 'dia' }),

  // ================= ANCIENT RUINS =================
  c('aegina', 'Aegina Turtle Stater', 'Ancient Greece', 'Coin', 'Ancient', '1 stater', 'Rare', 'Ancient Ruins', 'One of the earliest Greek coins, stamped with a sea turtle.', { wobble: true, glyph: 'dia' }),
  c('carthage', 'Carthaginian Silver Shekel', 'Carthage', 'Coin', 'Ancient', '1 shekel', 'Rare', 'Ancient Ruins', 'A heavy silver coin from a city that ruled the sea.', { wobble: true, glyph: 'sun' }),
  c('egypt_ring', 'Pharaoh Ring Money', 'Ancient Egypt', 'Coin', 'Ancient', '1 ring', 'Epic', 'Ancient Ruins', 'A gold ring that was weighed out to pay for grain and gifts.', { shape: 'ring', tone: 'gold' }),
  c('jade_disc', 'Jade Bi Disc', 'Ancient China', 'Coin', 'Ancient', '1 disc', 'Epic', 'Ancient Ruins', 'A jade disc with a round hole. Priceless in rituals and trade.', { shape: 'holecoin', tone: 'jade' }),
  c('daric', 'Persian Gold Daric', 'Persian Empire', 'Coin', 'Ancient', '1 daric', 'Epic', 'Ancient Ruins', 'A pure-gold coin from the empire\'s golden age.', { tone: 'gold', wobble: true, glyph: 'crown' }),
  c('sun_coin', 'Sunstone Tribute Coin', 'The Lost Sun Empire', 'Coin', 'Fictional', '1 tribute', 'Epic', 'Ancient Ruins', 'A coin that stays warm no matter the weather.', { tone: 'gold', glyph: 'sun' }),
  c('phoenix_note', 'Phoenix Feather Note', 'The Emberlands', 'Banknote', 'Fictional', '1 feather', 'Epic', 'Ancient Ruins', 'A note that flickers between orange and gold, as if it is breathing.', { tone: 'orange', glyph: 'star' }),
  c('owl', 'Athenian Owl Tetradrachm', 'Ancient Athens', 'Coin', 'Ancient', '4 drachmae', 'Legendary', 'Ancient Ruins', 'A silver coin with an owl that seems to watch you back.', { wobble: true, glyph: 'sun' }),
  c('lydian', 'Lydian Electrum Stater', 'Lydia', 'Coin', 'Ancient', '1 stater', 'Legendary', 'Ancient Ruins', 'Among the first coins ever made. Money starts here.', { tone: 'gold', wobble: true, glyph: 'star' }),

  // ================= SECRET LOCATION =================
  c('dragon_crown', 'Dragon Scale Crown', 'The Secret Vault', 'Coin', 'Fictional', '1 crown', 'Legendary', 'Secret Location', 'A coin of red scales that is warm to the touch.', { tone: 'red', glyph: 'crown' }),
  c('aurora_note', 'Aurora Note', 'The Northern Reach', 'Banknote', 'Fictional', '1 aurora', 'Legendary', 'Secret Location', 'A note whose colors slide like northern lights.', { tone: 'teal', glyph: 'dia' }),
  c('starlight_doubloon', 'Starlight Doubloon', 'The Secret Vault', 'Coin', 'Fictional', '1 doubloon', 'Legendary', 'Secret Location', 'A doubloon that only shines when nobody is watching.', { tone: 'blue', glyph: 'star' }),
  c('founders_emerald', 'Founder\'s Emerald Token', 'The Secret Vault', 'Coin', 'Fictional', '1 token', 'Legendary', 'Secret Location', 'The first token ever minted by the first collector.', { shape: 'gem', tone: 'jade' }),
];

export const CURRENCY_BY_ID = Object.fromEntries(CURRENCIES.map((x) => [x.id, x]));
export const TOTAL_CURRENCIES = CURRENCIES.length;

export const CATEGORIES = ['Modern', 'Foreign', 'Old', 'Historical', 'Commemorative', 'Special Edition', 'Ancient', 'Fictional'];
