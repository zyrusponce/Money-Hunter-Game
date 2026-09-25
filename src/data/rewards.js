export const RARITY_REWARDS = {
  Common: { xp: 20, coins: 10 }, Uncommon: { xp: 40, coins: 25 },
  Rare: { xp: 80, coins: 60 }, Epic: { xp: 150, coins: 150 }, Legendary: { xp: 300, coins: 500 },
};
export const DUPLICATE_VALUES = { Common: 8, Uncommon: 20, Rare: 50, Epic: 100, Legendary: 250 };
export const displayName = id => id.replaceAll('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
