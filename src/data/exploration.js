// Authored additions use empty cells in the existing maps, never random currency drops.
export const WORLD_ADDITIONS = {
  town:[[27,3,'wooden'],[8,5,'wooden'],[33,16,'secret']],
  market:[[8,5,'silver'],[26,7,'wooden'],[6,13,'secret']],
  beach:[[18,2,'wooden'],[27,3,'silver'],[16,10,'secret']],
  forest:[[18,2,'silver'],[26,7,'golden'],[15,14,'secret']],
  abandoned:[[16,10,'golden'],[15,14,'silver'],[23,19,'secret']],
  museum:[[8,5,'silver'],[26,7,'golden'],[24,15,'secret']],
  harbor:[[17,6,'silver'],[26,7,'golden'],[25,11,'secret']],
  island:[[8,5,'golden'],[17,6,'ancient'],[6,13,'secret']],
  city:[[27,3,'silver'],[36,4,'golden'],[25,11,'secret']],
  cave:[[27,3,'ancient'],[26,7,'golden'],[5,17,'secret']],
  ruins:[[16,10,'ancient'],[25,11,'golden'],[23,19,'secret']],
  secret:[[18,2,'legendary'],[8,5,'ancient'],[6,13,'secret']],
  final:[[18,2,'legendary'],[8,5,'ancient']],
};
export const CHEST_REWARDS = {
  wooden:{coins:30,xp:20}, silver:{coins:75,xp:50}, golden:{coins:150,xp:100},
  ancient:{coins:300,xp:150,points:1}, legendary:{coins:500,xp:300,cosmetics:['ancient_explorer']},
};
export const TREASURE_CLUES = {
  coastal_map:{name:'Tideworn Treasure Map',area:'beach',clue:'East of the great rocks, where dry sand meets the long walk to the fishing boat, a quiet patch holds a secret.',extra:'Search the open sand between the rocks and the lifeguard stand.'},
  rare_treasure_map:{name:'Forest Treasure Map',area:'forest',clue:'South of the forest pond, a traveler rested before the paths divide. Search the clearing for what they left.',extra:'Look in the central clearing, below the pond.'},
  mystery_map:{name:"The Collector’s Map",area:'ruins',clue:'The old hall remembers every collector. Read its monument, then search the eastern wing.',extra:'Explore the south-east wing of the ruins.'},
  legendary_map:{name:'Legendary Treasure Hunt',area:'secret',clue:'Where four pedestals guard the gilded hall, look north of the keeper for a chest that catches the light.',extra:'The golden chest waits along the north side of the vault.'},
};
export function addExplorationContent(locations) {
  for(const [id,entries] of Object.entries(WORLD_ADDITIONS)) {
    const map=locations[id];
    entries.forEach(([x,y,tier],index)=>map.collectibles.push({
      id:`${id}_cache_${index}`,x,y,look:tier==='secret'?'none':'chest',solid:false,
      chestType:tier==='secret'?null:tier,secret:tier==='secret',
      reward:tier==='secret'?{xp:80,coins:60}:CHEST_REWARDS[tier],
      verb:tier==='secret'?'search':'open',
    }));
    // Existing chests also earn chest rewards, independently of their collectible.
    for(const c of map.collectibles) if(c.look==='chest'&&!c.chestType) c.chestType='wooden';
  }
}
