// Player constants and helpers.
export const PLAYER = {
  speed: 62, // pixels per second
  sprint: 1.55,
  halfW: 5, // hitbox: 10 wide, 6 tall, centred on the feet
  hitH: 6,
};

export const PLAYER_PALETTE = {
  skin: '#f2c9a0',
  hair: '#3b2a1e',
  shirt: '#2f9e8f',
  pants: '#3a3f58',
  shoes: '#2b2b33',
  hat: true,
  hatColor: '#d9a441',
  scarf: '#e2574c',
};

export const playerTile = (p) => ({ tx: Math.floor(p.x / 16), ty: Math.floor((p.y - 3) / 16) });

// Walking animation frame: 0 idle, 1 and 3 are steps.
export const walkFrame = (walkT, moving) => (moving ? [1, 0, 3, 0][Math.floor(walkT * 8) % 4] : 0);
