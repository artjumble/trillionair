// DOM rendering and input wiring. Keep DOM concerns here; keep economy in state.js.

import { state, GOAL, addMoney, goalProgress, buyGenerator, buyUpgrade, prestigeGain, doPrestige } from './state.js';
import { generators, bulkCost, maxAffordable, milestoneMult, nextMilestone } from './generators.js';
import { upgrades, isUnlocked } from './upgrades.js';
import { achievements } from './achievements.js';
import { PRESTIGE_BONUS, earningsForPrestige } from './prestige.js';
import { money, format, dec } from './format.js';

const el = (id) => document.getElementById(id);

// Average U.S. public school teacher salary (~$69K, NEA 2023-24). Shown transparently
// so the comparison is an honest translation of the pile, not a hidden claim.
const TEACHER_SALARY = 69000;

// Cached references to each generator row's dynamic elements, built once.
const genEls = {};
// Cached references to each upgrade card, built once.
const upgradeEls = {};
// Cached references to each achievement badge, built once.
const achEls = {};

// Current buy amount applied to all generators: 1, 10, or 'max'.
let buyMode = 1;
// Prestige reset requires a confirming second click (destructive).
let prestigeArmed = false;

/** Spawn a floating "+$" near the pointer for click feedback (first bit of juice). */
function floatGain(amount, x, y) {
  const node = document.createElement('div');
  node.className = 'float-gain';
  node.textContent = '+' + money(amount);
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  document.body.appendChild(node);
  // Remove on animation end, with a timeout fallback: if animations are disabled
  // (reduced-motion, background tab) `animationend` never fires and nodes would leak.
  const remove = () => node.remove();
  node.addEventListener('animationend', remove);
  setTimeout(remove, 1000);
}

export function bindUI() {
  const btn = el('click-btn');
  btn.addEventListener('click', (e) => {
    addMoney(state.clickValue);
    floatGain(state.clickValue, e.clientX, e.clientY);
    render();
  });
  bindBuyModes();
  bindPrestige();
  buildGenerators();
  buildUpgrades();
  buildAchievements();
}

/** Wire the cash-out / go-public button with a two-click confirm (it wipes the run). */
function bindPrestige() {
  el('prestige-btn').addEventListener('click', () => {
    if (prestigeGain() <= 0) return;
    if (!prestigeArmed) {
      prestigeArmed = true;
      render();
      setTimeout(() => { prestigeArmed = false; render(); }, 3500);
      return;
    }
    prestigeArmed = false;
    doPrestige();
    render();
  });
}

/** Build a badge per achievement up front; render() flips earned styling. */
function buildAchievements() {
  const container = el('achievements');
  container.innerHTML = '';
  for (const a of achievements) {
    const badge = document.createElement('div');
    badge.className = 'ach is-locked';
    badge.innerHTML = `
      <div class="ach__name">${a.name}</div>
      <div class="ach__desc">${a.desc}</div>`;
    container.appendChild(badge);
    achEls[a.id] = badge;
  }
}

/** Human-readable duration, e.g. "2h 14m", "5m 3s", "42s". */
function humanDuration(s) {
  s = Math.floor(s);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Welcome-back modal: money made money while you were gone. That's the trick. */
export function showWelcomeBack({ seconds, amount, capped }) {
  const body = el('welcome-body');
  body.innerHTML =
    `You were gone <strong>${humanDuration(seconds)}</strong>. ` +
    `While you did absolutely nothing, your money earned <strong>${money(amount)}</strong>. ` +
    `That's the whole trick, isn't it?` +
    (capped ? ` <span class="modal__note">(Offline earnings capped at 8 hours — even the cap is generous.)</span>` : '');
  const modal = el('welcome-modal');
  modal.hidden = false;
  const close = () => { modal.hidden = true; };
  el('welcome-close').onclick = close;
  modal.onclick = (e) => { if (e.target === modal) close(); };
}

/** Show a transient toast when an achievement is earned. */
export function showAchievement(a) {
  const toasts = el('toasts');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast__tag">Achievement</span> ${a.name}`;
  toasts.appendChild(toast);
  const remove = () => toast.remove();
  toast.addEventListener('animationend', (e) => {
    if (e.animationName === 'toast-out') remove();
  });
  setTimeout(remove, 5000); // fallback if animations are disabled
}

/** Build one card per upgrade up front; render() toggles visibility/affordability. */
function buildUpgrades() {
  const container = el('upgrades');
  container.innerHTML = '';
  for (const u of upgrades) {
    const card = document.createElement('div');
    card.className = 'upgrade';
    card.hidden = true;
    card.innerHTML = `
      <div class="upgrade__name">${u.name}</div>
      <div class="upgrade__flavor">${u.flavor}</div>
      <button class="upgrade__buy" type="button" data-id="${u.id}">${money(u.cost)}</button>`;
    container.appendChild(card);
    const btn = card.querySelector('.upgrade__buy');
    btn.addEventListener('click', () => {
      if (buyUpgrade(u.id)) render();
    });
    upgradeEls[u.id] = { card, btn };
  }
}

/** Wire the ×1 / ×10 / Max selector. */
function bindBuyModes() {
  const group = el('buy-modes');
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-mode');
    if (!btn) return;
    const raw = btn.dataset.amount;
    buyMode = raw === 'max' ? 'max' : Number(raw);
    for (const b of group.querySelectorAll('.buy-mode')) {
      b.classList.toggle('is-active', b === btn);
    }
    render();
  });
}

/** Build the generator rows once; render() updates their dynamic bits. */
function buildGenerators() {
  const container = el('generators');
  container.innerHTML = '';
  for (const g of generators) {
    const row = document.createElement('div');
    row.className = 'gen';
    row.innerHTML = `
      <div class="gen__info">
        <div class="gen__name">${g.name}</div>
        <div class="gen__flavor">${g.flavor}</div>
        <div class="gen__stats">
          <span class="gen__owned">0 owned</span>
          <span class="gen__rate">${money(g.baseIncome)}/sec each</span>
          <span class="gen__mult"></span>
        </div>
      </div>
      <button class="gen__buy" type="button" data-id="${g.id}">
        <span class="gen__buy-label">Buy</span>
        <span class="gen__cost"></span>
      </button>`;
    container.appendChild(row);
    const btn = row.querySelector('.gen__buy');
    btn.addEventListener('click', () => {
      if (buyGenerator(g.id, buyMode)) render();
    });
    genEls[g.id] = {
      owned: row.querySelector('.gen__owned'),
      rate: row.querySelector('.gen__rate'),
      mult: row.querySelector('.gen__mult'),
      label: row.querySelector('.gen__buy-label'),
      cost: row.querySelector('.gen__cost'),
      btn,
    };
  }
}

export function render() {
  el('money').textContent = money(state.money);
  el('income-rate').textContent = money(state.incomePerSec) + ' / sec';

  const pct = goalProgress() * 100;
  el('goal-fill').style.width = pct.toFixed(6) + '%';
  el('goal-label').textContent = `${money(state.money)} of ${money(GOAL)}`;

  // The honest-labor counter: $1 for every second played. It crawls while your wealth booms.
  el('honest-earned').textContent = money(Math.floor(state.playSeconds));

  // Comparison annotation: translate the abstract pile into people you could pay.
  const perTeacher = dec(TEACHER_SALARY);
  if (state.money.lt(perTeacher)) {
    el('comparison').textContent = "…not yet one teacher's annual salary (~$69K).";
  } else {
    const teachers = state.money.div(perTeacher).floor();
    const label = teachers.eq(1) ? '1 teacher' : `${format(teachers)} teachers`;
    el('comparison').textContent = `≈ paying ${label} for a year (~$69K each)`;
  }

  for (const g of generators) {
    const refs = genEls[g.id];
    if (!refs) continue;
    const owned = state.owned[g.id] || 0;

    // Resolve how many units the current buy mode would purchase, and the cost.
    const count = buyMode === 'max' ? maxAffordable(g, owned, state.money) : buyMode;
    // In Max mode show the live count; otherwise the fixed multiplier.
    const shownCount = buyMode === 'max' ? Math.max(count, 1) : buyMode;
    const cost = bulkCost(g, owned, shownCount);

    // Milestone bonus: effective per-unit rate and progress to the next doubling.
    const mult = milestoneMult(owned);
    const effPerUnit = dec(g.baseIncome).mul(mult);
    const next = nextMilestone(owned);
    refs.rate.textContent = `${money(effPerUnit)}/sec each`;
    if (mult.gt(1) && next !== null) {
      refs.mult.textContent = `★×${format(mult)} · next at ${next}`;
    } else if (mult.gt(1)) {
      refs.mult.textContent = `★×${format(mult)} · maxed`;
    } else if (next !== null) {
      refs.mult.textContent = `bonus at ${next}`;
    } else {
      refs.mult.textContent = '';
    }

    refs.owned.textContent = `${owned} owned`;
    refs.label.textContent = buyMode === 'max' ? `Buy ×${count}` : `Buy ×${buyMode}`;
    refs.cost.textContent = money(cost);
    // Disabled when the resolved purchase isn't affordable (Max of 0 means broke).
    refs.btn.disabled = count < 1 || state.money.lt(cost);
  }

  // Upgrades: reveal when unlocked, hide once purchased, grey out when unaffordable.
  for (const u of upgrades) {
    const refs = upgradeEls[u.id];
    if (!refs) continue;
    const purchased = !!state.upgrades[u.id];
    const visible = !purchased && isUnlocked(u, state.owned, state.earnedTotal);
    refs.card.hidden = !visible;
    if (visible) refs.btn.disabled = state.money.lt(u.cost);
  }

  // Achievements: light up earned badges, update the earned/total count.
  let earnedCount = 0;
  for (const a of achievements) {
    const earned = !!state.achievements[a.id];
    if (earned) earnedCount++;
    const badge = achEls[a.id];
    if (badge) badge.classList.toggle('is-locked', !earned);
  }
  el('ach-count').textContent = `${earnedCount}/${achievements.length}`;

  renderPrestige();
}

/** The inheritance panel: held Old Money, its bonus, and the cash-out preview. */
function renderPrestige() {
  const have = state.prestige;
  el('prestige-have').textContent = have > 0
    ? `${have} Old Money · +${Math.round(PRESTIGE_BONUS * 100 * have)}% income`
    : '';

  const gain = prestigeGain();
  const btn = el('prestige-btn');
  if (gain > 0) {
    el('prestige-sub').textContent =
      'Cash out and hand it to your heirs. You lose the money, the businesses, and the shortcuts — ' +
      'but the next generation starts with a permanent head start it did nothing to earn.';
    btn.disabled = false;
    btn.classList.toggle('is-armed', prestigeArmed);
    btn.textContent = prestigeArmed
      ? `Really? This wipes everything. Confirm to bank +${gain} Old Money`
      : `Go Public — bank +${gain} Old Money`;
  } else {
    // Lifetime earnings needed for the next Old Money.
    const target = earningsForPrestige(have + 1);
    el('prestige-sub').textContent =
      `Your dynasty isn't ready. Earn ${money(target)} in your lifetime to inherit your next Old Money.`;
    btn.disabled = true;
    btn.classList.remove('is-armed');
    btn.textContent = have > 0 ? 'Nothing to cash out yet' : 'Build a fortune first';
  }
}
