// Location data. Each location is defined in its own file under ./maps and re-exported here.
// A location has: id, name, unlockRequirement (Encyclopedia %), collectibles, npcs, exits, plus tile data.
import town from './maps/town.js';
import market from './maps/market.js';
import beach from './maps/beach.js';
import forest from './maps/forest.js';
import abandoned from './maps/abandoned.js';
import museum from './maps/museum.js';
import harbor from './maps/harbor.js';
import island from './maps/island.js';
import city from './maps/city.js';
import cave from './maps/cave.js';
import ruins from './maps/ruins.js';
import secret from './maps/secret.js';
import final from './maps/final.js';
import { addExplorationContent } from './exploration.js';

export const LOCATIONS = { town, market, beach, forest, abandoned, museum, harbor, island, city, cave, ruins, secret, final };
addExplorationContent(LOCATIONS);
export const LOCATION_LIST = Object.values(LOCATIONS);
export const START_LOCATION = 'town';

// Lines drawn on the world map.
export const WORLD_LINKS = [
  ['town', 'forest'],
  ['forest', 'abandoned'],
  ['forest', 'cave'],
  ['cave', 'ruins'],
  ['ruins', 'secret'],
  ['town', 'museum'],
  ['town', 'market'],
  ['market', 'city'],
  ['town', 'beach'],
  ['beach', 'harbor'],
  ['harbor', 'city'],
  ['harbor', 'island'],
  ['town', 'final'],
];

// Encyclopedia completion milestones that unlock things. The area gates come from each
// location's `unlockRequirement`; the museum's restricted wing is a special extra gate.
export const PROGRESSION = [
  ...LOCATION_LIST.filter((l) => l.unlockRequirement > 0).map((l) => ({
    percent: l.unlockRequirement,
    unlock: l.id,
    title: `${l.name} unlocked!`,
    text: l.unlockRequirement === 100 ? 'A golden doorway has appeared on the town plaza.' : `You can now travel to ${l.name}.`,
  })),
  {
    percent: 50,
    unlock: 'museum_restricted',
    title: 'Museum Restricted Area unlocked!',
    text: 'Show your Museum Pass to the guard to enter the restricted wing.',
  },
].sort((a, b) => a.percent - b.percent);

// A short label for a location id (used in messages).
export const locationName = (id) => (LOCATIONS[id] ? LOCATIONS[id].name : id);
