export const createRewardState = () => ({
  xp: 0, coins: 0, coinsEarned: 0, upgradePoints: 0, claims: {}, skills: {}, purchases: {},
  cosmetics: {}, badges: {}, titles: { rookie: true },
  equipped: { outfit: 'default', backpack: 'default', detector: 'default', badge: null, title: 'rookie' },
  explored: {}, chests: {}, mastered: {}, friendship: {}, events: {},
  streak: 0, streakCycle: 0, trackedQuest: null, tool: 'detector', tutorial: 'move',
});
