// Tile catalogue. `layer: 'ground'` tiles fill the cell; `layer: 'top'` tiles are drawn on
// top of whatever ground is underneath (so a tree on sand still shows sand).
// solid: blocks walking.   low: does NOT block line-of-sight for interactions.
export const TILE = 16;

const G = (extra = {}) => ({ layer: 'ground', solid: false, ...extra });
const T = (solid = true, extra = {}) => ({ layer: 'top', solid, ...extra });

export const TILES = {
  // ---- ground
  grass: G(),
  path: G(),
  road: G(),
  crosswalk: G(),
  sidewalk: G(),
  plaza: G(),
  sand: G(),
  sandWet: G(),
  shallow: G({ water: true }),
  water: G({ solid: true, water: true, low: true }),
  dock: G(),
  floorWood: G(),
  floorTile: G(),
  carpet: G(),
  caveFloor: G(),
  darkFloor: G(),
  ruinFloor: G(),
  goldFloor: G(),
  tracks: G(),

  // ---- nature and outdoor decoration
  flowers: T(false),
  rubble: T(false),
  tree: T(),
  pine: T(),
  palm: T(),
  bush: T(true, { low: true }),
  rock: T(true, { low: true }),
  boulder: T(),
  fence: T(true, { low: true }),

  // ---- buildings
  roofRed: T(),
  roofBlue: T(),
  roofGreen: T(),
  roofGray: T(),
  roofOrange: T(),
  roofBrown: T(),
  facade: T(),
  facadeBlue: T(),
  facadeBrick: T(),
  facadeShop: T(),
  facadeBank: T(),
  facadeDark: T(),
  door: T(false),
  doorClosed: T(),

  // ---- interior walls
  wall: T(),
  caveWall: T(),
  ruinWall: T(),
  pillar: T(),

  // ---- furniture and street props
  statue: T(),
  stall: T(true, { low: true }),
  stallBlue: T(true, { low: true }),
  stallGreen: T(true, { low: true }),
  crate: T(true, { low: true }),
  barrel: T(true, { low: true }),
  shelf: T(),
  counter: T(true, { low: true }),
  display: T(true, { low: true }),
  vending: T(),
  bench: T(true, { low: true }),
  lamp: T(true, { low: true }),
  sign: T(true, { low: true }),
  fountain: T(true, { low: true }),
  boat: T(true, { low: true }),
  table: T(true, { low: true }),
  bus: T(),
  train: T(),
  brazier: T(true, { low: true }),

  // ---- looks used by secret / locked barriers
  crackedWall: T(),
  bushSecret: T(true, { low: true }),
  boulderSecret: T(),
  crateSecret: T(true, { low: true }),
  gateClosed: T(),
  vaultDoor: T(),
  velvetGate: T(true, { low: true }),
  sealedGate: T(),
};

export const isGround = (id) => TILES[id] && TILES[id].layer === 'ground';
