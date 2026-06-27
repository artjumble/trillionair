// Game state, persistence, and the money economy.
// The loop will grow this (generators, prestige, upgrades). Keep it the single source of truth.

import { dec } from './format.js';

const Decimal = window.Decimal;
const SAVE_KEY = 'trillionaire_save_v1';

/** The whole point: one trillion dollars. */
export const GOAL = new Decimal('1e12');

export const state = {
  money: new Decimal(0),
  earnedTotal: new Decimal(0), // lifetime earnings (drives future prestige math)
  clickValue: new Decimal(1),
  incomePerSec: new Decimal(0), // recomputed from generators (none yet)
  lastSaved: Date.now(),
};

/** Add money and track lifetime earnings. */
export function addMoney(amount) {
  const a = dec(amount);
  state.money = state.money.add(a);
  state.earnedTotal = state.earnedTotal.add(a);
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
    return true;
  } catch (err) {
    console.warn('Load failed:', err);
    return false;
  }
}
