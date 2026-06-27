// Prestige, reframed as inheritance: cash out, pass the fortune to your heirs, and the
// next "generation" starts with a permanent income head start it did nothing to earn.
//
// Prestige currency is "Old Money", on a cube-root curve of lifetime earnings so that
// doubling it requires ~8x more earnings — the standard reset-loop pacing.

const Decimal = window.Decimal;

export const PRESTIGE_SCALE = 1e6; // $1M lifetime earned -> your first Old Money
export const PRESTIGE_BONUS = 0.1; // each Old Money: +10% to all income, forever

/** Total Old Money a given lifetime-earnings figure is worth: floor(cbrt(earned / $1M)). */
export function potentialPrestige(earnedTotal) {
  const ratio = earnedTotal.div(PRESTIGE_SCALE);
  if (ratio.lt(1)) return 0;
  // Cube root via fractional pow; nudge by a tiny epsilon to absorb float error at exact cubes.
  return Math.floor(ratio.pow(1 / 3).toNumber() + 1e-9);
}

/** Permanent income multiplier from banked Old Money. */
export function prestigeMultiplier(prestige) {
  return new Decimal(1 + PRESTIGE_BONUS * prestige);
}

/** Lifetime earnings required to reach a target amount of Old Money: SCALE × target³. */
export function earningsForPrestige(target) {
  return new Decimal(PRESTIGE_SCALE).mul(target ** 3);
}
