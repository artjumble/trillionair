// Game state, persistence, and the money economy.
// The loop will grow this (generators, prestige, upgrades). Keep it the single source of truth.

import { dec } from './format.js';
import { generators, genById, unitCost } from './generators.js';

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
  lastSaved: Date.now(),
};

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

/** Recompute total passive income/sec from owned generators. */
export function recomputeIncome() {
  let total = new Decimal(0);
  for (const g of generators) {
    const owned = state.owned[g.id] || 0;
    if (owned > 0) total = total.add(new Decimal(g.baseIncome).mul(owned));
  }
  state.incomePerSec = total;
}

/** Buy one unit of a generator if affordable. Returns true on success. */
export function buyGenerator(id) {
  const g = genById(id);
  if (!g) return false;
  const owned = state.owned[id] || 0;
  const cost = unitCost(g, owned);
  if (state.money.lt(cost)) return false;
  state.money = state.money.sub(cost);
  state.owned[id] = owned + 1;
  recomputeIncome();
  return true;
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
    state.lastSaved = data.lastSaved ?? Date.now();
    // Merge saved owned counts over the zero-initialized defaults (tolerates new generators).
    if (data.owned) {
      for (const g of generators) {
        state.owned[g.id] = data.owned[g.id] ?? 0;
      }
    }
    recomputeIncome();
    return true;
  } catch (err) {
    console.warn('Load failed:', err);
    return false;
  }
}
