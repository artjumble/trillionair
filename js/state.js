// Game state, persistence, and the money economy.
// The loop will grow this (generators, prestige, upgrades). Keep it the single source of truth.

import { dec } from './format.js';
import { generators, genById, bulkCost, maxAffordable, milestoneMult } from './generators.js';
import { upgradeById, globalMultiplier, genMultiplier, clickMultiplier } from './upgrades.js';
import { achievementMultiplier, checkAchievements } from './achievements.js';
import { potentialPrestige, prestigeMultiplier } from './prestige.js';
import { metaById, metaIncomeMult, metaClickMult, metaStartingCash } from './metaupgrades.js';

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
  achievements: {}, // achievement id -> true once earned
  prestige: 0, // "Old Money" — current spendable balance; each held gives +10% income
  prestigeEarned: 0, // total Old Money ever earned (governs gain; spending doesn't refund it)
  meta: {}, // meta-upgrade id -> true; permanent, survives resets
  playSeconds: 0, // real seconds spent playing — drives the "honest labor" ($1/sec) counter
  lastSaved: Date.now(),
};

// At $1/second, a trillion dollars is this many years away. (1e12 / 31,556,952 s/yr)
export const HONEST_YEARS_TO_TRILLION = 31688;

// Offline earnings: you get half your rate for being away, capped at 8 hours.
export const OFFLINE_RATE = 0.5;
export const OFFLINE_CAP_SECONDS = 8 * 3600;

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
  state.incomePerSec = total
    .mul(globalMultiplier(state.upgrades))
    .mul(achievementMultiplier(state.achievements))
    .mul(prestigeMultiplier(state.prestige))
    .mul(metaIncomeMult(state.meta, state.prestige));
}

/** Old Money you'd bank by cashing out now (based on total ever earned, so spending it can't be re-farmed). */
export function prestigeGain() {
  return Math.max(0, potentialPrestige(state.earnedTotal) - state.prestigeEarned);
}

/**
 * Cash out / "go public": bank the prestige gain and wipe this run's money, generators,
 * and upgrades — but keep Old Money, meta-upgrades, achievements, and play time.
 * Grants any inherited starting cash. Returns Old Money gained.
 */
export function doPrestige() {
  const gain = prestigeGain();
  if (gain <= 0) return 0;
  state.prestige += gain;
  state.prestigeEarned += gain;
  for (const g of generators) state.owned[g.id] = 0;
  state.upgrades = {};
  state.money = metaStartingCash(state.meta); // "Born on Third Base" head start
  recomputeAll();
  return gain;
}

/** Buy a permanent meta-upgrade with Old Money. Returns true on success. */
export function buyMeta(id) {
  const u = metaById(id);
  if (!u || state.meta[id] || state.prestige < u.cost) return false;
  state.prestige -= u.cost; // spend from balance; prestigeEarned is untouched
  state.meta[id] = true;
  recomputeAll();
  return true;
}

/** Snapshot of values the achievement checks read. */
function achievementContext() {
  let totalOwned = 0;
  for (const g of generators) totalOwned += state.owned[g.id] || 0;
  return {
    money: state.money,
    earnedTotal: state.earnedTotal,
    owned: state.owned,
    upgrades: state.upgrades,
    playSeconds: state.playSeconds,
    totalOwned,
  };
}

/**
 * Award any newly-earned achievements and return them (for UI toasts).
 * Recomputes income when something is earned, since each adds to the bonus.
 */
export function evaluateAchievements() {
  const newly = checkAchievements(achievementContext(), state.achievements);
  if (newly.length) recomputeIncome();
  return newly;
}

/** Recompute the manual click value from purchased click upgrades and meta-upgrades (base $1). */
export function recomputeClick() {
  state.clickValue = clickMultiplier(state.upgrades).mul(metaClickMult(state.meta));
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
    achievements: state.achievements,
    prestige: state.prestige,
    prestigeEarned: state.prestigeEarned,
    meta: state.meta,
    playSeconds: state.playSeconds,
    lastSaved: state.lastSaved,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Save failed:', err);
  }
}

/**
 * Credit earnings for time away since the last save: income/sec × secondsAway × rate,
 * capped at 8 hours. Returns { seconds, amount, capped } for the welcome-back modal,
 * or null when there's nothing worth showing. Call once, after load().
 */
export function applyOfflineProgress() {
  const away = Math.max(0, (Date.now() - state.lastSaved) / 1000);
  const seconds = Math.min(away, OFFLINE_CAP_SECONDS);
  if (seconds < 60 || state.incomePerSec.lte(0)) return null;
  const amount = state.incomePerSec.mul(seconds * OFFLINE_RATE);
  state.money = state.money.add(amount);
  state.earnedTotal = state.earnedTotal.add(amount);
  return { seconds, amount, capped: away > OFFLINE_CAP_SECONDS };
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
    state.achievements = data.achievements ?? {};
    state.prestige = data.prestige ?? 0;
    // Migrate old saves: if total-earned wasn't tracked, assume none has been spent yet.
    state.prestigeEarned = data.prestigeEarned ?? state.prestige;
    state.meta = data.meta ?? {};
    recomputeAll();
    return true;
  } catch (err) {
    console.warn('Load failed:', err);
    return false;
  }
}
