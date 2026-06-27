// Game state, persistence, and the money economy.
// The loop will grow this (generators, prestige, upgrades). Keep it the single source of truth.

import { dec } from './format.js';
import { generators, genById, bulkCost, maxAffordable, milestoneMult } from './generators.js';
import { upgradeById, globalMultiplier, genMultiplier, clickMultiplier } from './upgrades.js';

const Decimal = window.Decimal;
const SAVE_KEY = 'trillionaire_save_v1';

/** The whole point: one trillion dollars. */
export const GOAL = new Decimal('1e12');

export const state = {
  money: new Decimal(0),
  earnedTotal: new Decimal(0), // lifetime earnings (drives future prestige math)
  clickValue: new Decimal(1),
  incomePerSec: new Decimal(0), // recomputed from generators
  owned: {}, // generator id -> count owned (integer)
  upgrades: {}, // upgrade id -> true once purchased
  playSeconds: 0, // real seconds spent playing — drives the "honest labor" ($1/sec) counter
  lastSaved: Date.now(),
};

// At $1/second, a trillion dollars is this many years away. (1e12 / 31,556,952 s/yr)
export const HONEST_YEARS_TO_TRILLION = 31688;

// Initialize owned counts to zero for every generator.
generators.forEach((g) => {
  state.owned[g.id] = 0;
});

/** Add money and track lifetime earnings. */
export function addMoney(amount) {
  const a = dec(amount);
  state.money = state.money.add(a);
  state.earnedTotal = state.earnedTotal.add(a);
}

/** Recompute total passive income/sec from owned generators, milestones and upgrades. */
export function recomputeIncome() {
  let total = new Decimal(0);
  for (const g of generators) {
    const owned = state.owned[g.id] || 0;
    if (owned > 0) {
      total = total.add(
        new Decimal(g.baseIncome)
          .mul(owned)
          .mul(milestoneMult(owned))
          .mul(genMultiplier(g.id, state.upgrades)),
      );
    }
  }
  state.incomePerSec = total.mul(globalMultiplier(state.upgrades));
}

/** Recompute the manual click value from purchased click upgrades (base $1). */
export function recomputeClick() {
  state.clickValue = clickMultiplier(state.upgrades);
}

/** Recompute every derived multiplier (income + click). */
export function recomputeAll() {
  recomputeIncome();
  recomputeClick();
}

/** Buy a one-time upgrade if unlocked-and-affordable. Returns true on success. */
export function buyUpgrade(id) {
  const u = upgradeById(id);
  if (!u || state.upgrades[id]) return false;
  const cost = new Decimal(u.cost);
  if (state.money.lt(cost)) return false;
  state.money = state.money.sub(cost);
  state.upgrades[id] = true;
  recomputeAll();
  return true;
}

/**
 * Buy `amount` units of a generator (a number, or 'max' for as many as affordable).
 * Never overspends. Returns the number of units actually bought.
 */
export function buyGenerator(id, amount = 1) {
  const g = genById(id);
  if (!g) return 0;
  const owned = state.owned[id] || 0;
  let count = amount === 'max' ? maxAffordable(g, owned, state.money) : amount;
  if (count <= 0) return 0;
  const cost = bulkCost(g, owned, count);
  if (state.money.lt(cost)) return 0;
  state.money = state.money.sub(cost);
  state.owned[id] = owned + count;
  recomputeIncome();
  return count;
}

/** Fraction of the way to a trillion, clamped 0..1. */
export function goalProgress() {
  const p = state.money.div(GOAL).toNumber();
  return Math.max(0, Math.min(1, p));
}

export function save() {
  state.lastSaved = Date.now();
  const data = {
    money: state.money.toString(),
    earnedTotal: state.earnedTotal.toString(),
    clickValue: state.clickValue.toString(),
    owned: state.owned,
    upgrades: state.upgrades,
    playSeconds: state.playSeconds,
    lastSaved: state.lastSaved,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Save failed:', err);
  }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    state.money = new Decimal(data.money ?? 0);
    state.earnedTotal = new Decimal(data.earnedTotal ?? 0);
    state.clickValue = new Decimal(data.clickValue ?? 1);
    state.playSeconds = data.playSeconds ?? 0;
    state.lastSaved = data.lastSaved ?? Date.now();
    // Merge saved owned counts over the zero-initialized defaults (tolerates new generators).
    if (data.owned) {
      for (const g of generators) {
        state.owned[g.id] = data.owned[g.id] ?? 0;
      }
    }
    state.upgrades = data.upgrades ?? {};
    recomputeAll();
    return true;
  } catch (err) {
    console.warn('Load failed:', err);
    return false;
  }
}
