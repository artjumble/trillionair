// Achievements: milestones that each grant a small permanent income bonus.
// The bonus is itself the joke — you're rewarded simply for being recognized as rich.
//
// Pure data + pure helpers. Earned state lives in state.js. Each `check(ctx)` reads a
// context snapshot: { money, earnedTotal, owned, upgrades, playSeconds, totalOwned }.

const Decimal = window.Decimal;

// Each earned achievement adds this much to a global income multiplier (+2%).
export const ACHIEVEMENT_BONUS = 0.02;

export const achievements = [
  { id: 'first_dollar', name: 'Bootstrapped', desc: 'Earn your first dollar.',
    check: (c) => c.earnedTotal.gte(1) },
  { id: 'first_gen', name: 'Passive Aggressive', desc: 'Own your first income generator.',
    check: (c) => c.totalOwned >= 1 },
  { id: 'lemonade25', name: 'Lemonade Tycoon', desc: 'Own 25 Lemonade Stands.',
    check: (c) => (c.owned.lemonade || 0) >= 25 },
  { id: 'first_upgrade', name: 'Shortcut Taker', desc: 'Buy your first upgrade. Why work harder?',
    check: (c) => Object.values(c.upgrades).some(Boolean) },
  { id: 'millionaire', name: 'Millionaire', desc: 'Hold $1,000,000. Cute.',
    check: (c) => c.money.gte(1e6) },
  { id: 'billionaire', name: 'Billionaire', desc: 'Hold $1,000,000,000. Now you can afford opinions.',
    check: (c) => c.money.gte(1e9) },
  { id: 'capture', name: 'Rules Are For Other People', desc: 'Purchase Regulatory Capture.',
    check: (c) => !!c.upgrades.glob_capture },
  { id: 'tax0', name: 'Patriot', desc: 'Reach a 0% effective tax rate. You love this country — let others fund it.',
    check: (c) => !!c.upgrades.glob_tax },
  { id: 'empire', name: 'Empire', desc: 'Own 100 generators in total.',
    check: (c) => c.totalOwned >= 100 },
  { id: 'hundredB', name: 'Comfortably Numb', desc: 'Hold $100,000,000,000.',
    check: (c) => c.money.gte(1e11) },
  { id: 'idle_hour', name: 'Money Never Sleeps', desc: 'Play an hour. Almost none of it came from clicking.',
    check: (c) => c.playSeconds >= 3600 },
  { id: 'halfway', name: 'So Close, So Far', desc: 'Reach half a trillion dollars.',
    check: (c) => c.money.gte(5e11) },
  { id: 'trillionaire', name: 'TRILLIONAIRE', desc: '"Earn" one trillion dollars. Look at what it cost.',
    check: (c) => c.money.gte(1e12) },
];

/** Global income multiplier from earned achievements: 1 + 0.02 × earned. */
export function achievementMultiplier(earned) {
  const count = Object.values(earned).filter(Boolean).length;
  return new Decimal(1 + ACHIEVEMENT_BONUS * count);
}

/**
 * Mark any newly-satisfied achievements in `earned` and return the list of new ones.
 * Mutates `earned` (id -> true).
 */
export function checkAchievements(ctx, earned) {
  const newly = [];
  for (const a of achievements) {
    if (!earned[a.id] && a.check(ctx)) {
      earned[a.id] = true;
      newly.push(a);
    }
  }
  return newly;
}
