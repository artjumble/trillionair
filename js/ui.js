// DOM rendering and input wiring. Keep DOM concerns here; keep economy in state.js.

import { state, GOAL, addMoney, goalProgress, buyGenerator, buyUpgrade, prestigeGain, doPrestige, buyMeta, headStartSummary, buyLuxury, emptiedFraction, hardReset, HIGH_EARNER_PER_SEC } from './state.js';
import { generators, bulkCost, maxAffordable, milestoneMult, nextMilestone, INCOME_SCALE } from './generators.js';
import { upgrades, isUnlocked } from './upgrades.js';
import { achievements } from './achievements.js';
import { PRESTIGE_BONUS, earningsForPrestige } from './prestige.js';
import { metaUpgrades } from './metaupgrades.js';
import { COMPARISONS } from './comparisons.js';
import { luxuries } from './luxuries.js';
import { setMuted, setCurdled, playClick, playBuy } from './sound.js';
import { money, format, dec, setSciNotation } from './format.js';

const el = (id) => document.getElementById(id);

// Rotating comparison ticker: which affordable equivalent is currently shown.
let comparisonIndex = -1;

/** Advance to the next comparison you can currently afford (cycles only through affordable ones). */
function advanceComparison() {
  const affordable = COMPARISONS.map((_, i) => i).filter((i) => state.money.gte(COMPARISONS[i].perUnit));
  if (affordable.length === 0) { comparisonIndex = -1; return; }
  const pos = affordable.indexOf(comparisonIndex);
  comparisonIndex = affordable[(pos + 1) % affordable.length];
}

// Worker pleas: surface once you start cutting wages, escalating as the rate drops.
// Ordered mild -> severe; the most severe whose threshold the rate is under is shown.
// Thresholds sit at the MIDPOINTS between the 0.30/0.25/0.20/… wage steps so the
// float error in repeated subtraction (0.30-0.05-0.05 = 0.19999…) can't shift a beat.
const WORKER_PLEAS = [
  { below: 0.299, text: 'A worker asks if the new schedule is a mistake. You say you’ll look into it.' },
  { below: 0.225, text: 'Someone from the floor left a note on your desk. You haven’t read it.' },
  { below: 0.175, text: 'A worker waited outside your office for three hours. You took the back exit.' },
  { below: 0.125, text: '“Please,” one of them says. “I have kids.” You nod, thoughtfully, and do nothing.' },
  { below: 0.075, text: 'They’ve stopped asking for raises. Now they ask if their jobs are safe.' },
  { below: 0.035, text: 'The line says “wages.” It used to have names attached.' },
];

function workerPlea(rate) {
  let chosen = '';
  for (const p of WORKER_PLEAS) if (rate < p.below) chosen = p.text;
  return chosen;
}

// Cached references to each generator row's dynamic elements, built once.
const genEls = {};
// Cached references to each upgrade card, built once.
const upgradeEls = {};
// Cached references to each achievement badge, built once.
const achEls = {};
// Cached references to each meta-upgrade card, built once.
const metaEls = {};
// Cached references to each luxury card, built once.
const luxuryEls = {};

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

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Burst a few coin particles outward from a point (skipped under reduced-motion). */
function coinBurst(x, y) {
  if (reduceMotion()) return;
  const N = 6;
  for (let i = 0; i < N; i++) {
    const p = document.createElement('div');
    p.className = 'coin-particle';
    p.textContent = '$';
    const angle = (Math.PI * 2 * i) / N + Math.random() * 0.6;
    const dist = 32 + Math.random() * 34;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist - 18}px`);
    document.body.appendChild(p);
    const remove = () => p.remove();
    p.addEventListener('animationend', remove);
    setTimeout(remove, 900);
  }
}

/** Briefly shake the app for a milestone moment (skipped under reduced-motion). */
export function shakeScreen() {
  if (reduceMotion()) return;
  const app = el('app');
  app.classList.remove('shake');
  void app.offsetWidth; // force reflow so the animation can restart
  app.classList.add('shake');
}

export function bindUI() {
  const btn = el('click-btn');
  btn.addEventListener('click', (e) => {
    addMoney(state.clickValue);
    floatGain(state.clickValue, e.clientX, e.clientY);
    coinBurst(e.clientX, e.clientY);
    playClick(state.money.gt(0) ? Math.floor(state.money.log10()) : 0);
    // Springy squash-stretch on the button.
    btn.classList.remove('pop');
    void btn.offsetWidth;
    btn.classList.add('pop');
    render();
  });
  setMuted(state.muted);
  bindMute();
  bindSettings();
  bindTabs();
  // Escape closes any open modal.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    for (const id of ['darkturn-modal', 'generation-modal', 'welcome-modal']) {
      const m = el(id);
      if (m && !m.hidden) m.hidden = true;
    }
  });
  bindBuyModes();
  bindPrestige();
  advanceComparison();
  setInterval(advanceComparison, 4500); // rotate the comparison ticker
  buildMeta();
  buildLuxuries();
  buildGenerators();
  buildUpgrades();
  buildAchievements();
}

/** Build the luxury cards once; render() updates owned/affordable state. */
function buildLuxuries() {
  const container = el('luxuries');
  container.innerHTML = '';
  for (const l of luxuries) {
    const card = document.createElement('div');
    card.className = 'luxury';
    card.innerHTML = `
      <div class="luxury__info">
        <div class="luxury__name">${l.name} <span class="luxury__owned" data-id="${l.id}"></span></div>
        <div class="luxury__flavor">${l.flavor}</div>
      </div>
      <button class="luxury__buy" type="button" data-id="${l.id}">${money(l.price)}</button>`;
    container.appendChild(card);
    const btn = card.querySelector('.luxury__buy');
    btn.addEventListener('click', () => {
      if (buyLuxury(l.id)) { playBuy(); render(); }
    });
    luxuryEls[l.id] = { btn, owned: card.querySelector('.luxury__owned') };
  }
}

/** Wire the settings panel: scientific-notation toggle and a two-click hard reset. */
function bindSettings() {
  const sci = el('sci-toggle');
  sci.checked = state.sciNotation;
  setSciNotation(state.sciNotation);
  sci.addEventListener('change', () => {
    state.sciNotation = sci.checked;
    setSciNotation(sci.checked);
    render();
  });

  const hr = el('hardreset-btn');
  let armed = false;
  hr.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      hr.textContent = 'Click again to wipe EVERYTHING';
      hr.classList.add('is-armed');
      setTimeout(() => { armed = false; hr.textContent = 'Hard reset'; hr.classList.remove('is-armed'); }, 3000);
      return;
    }
    hardReset();
    location.reload();
  });
}

/** Switch the visible tab panel and update the tab buttons. */
function activateTab(name) {
  for (const p of document.querySelectorAll('.tab-panel')) {
    p.hidden = p.dataset.tab !== name;
  }
  for (const t of document.querySelectorAll('#tabs .tab')) {
    const active = t.dataset.tab === name;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  }
}

/** Wire the tab bar. */
function bindTabs() {
  el('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn || btn.hidden) return;
    activateTab(btn.dataset.tab);
  });
  activateTab('businesses');
}

/** Wire the mute toggle; reflect state in the icon. */
function bindMute() {
  const btn = el('mute-btn');
  const sync = () => {
    btn.textContent = state.muted ? '🔇' : '🔊';
    btn.setAttribute('aria-pressed', String(state.muted));
  };
  sync();
  btn.addEventListener('click', () => {
    state.muted = !state.muted;
    setMuted(state.muted);
    sync();
  });
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
    const gain = doPrestige();
    render();
    if (gain > 0) showGeneration(gain);
  });
}

/** Celebrate the reset as inheritance: the new generation's unearned head start. */
function showGeneration(gain) {
  const { generation, prestige, incomeMult, startCash } = headStartSummary();
  const bonuses = [];
  bonuses.push(`<strong>${prestige} Old Money</strong> (×${format(incomeMult)} income before you lift a finger)`);
  if (startCash.gt(0)) bonuses.push(`<strong>${money(startCash)}</strong> in seed money, already in the account`);
  el('generation-body').innerHTML =
    `You take the company public, pocket <strong>+${gain} Old Money</strong>, and hand the empire to your heirs. ` +
    `<strong>Generation ${generation}</strong> begins already holding ${bonuses.join(' and ')}. ` +
    `They did nothing to earn it. Honestly? Neither did you.`;
  const modal = el('generation-modal');
  modal.hidden = false;
  const close = () => { modal.hidden = true; };
  el('generation-close').onclick = close;
  el('generation-close').focus();
  modal.onclick = (e) => { if (e.target === modal) close(); };
}

/** Build the meta-upgrade cards once; render() updates owned/affordable state. */
function buildMeta() {
  const container = el('meta-upgrades');
  container.innerHTML = '';
  for (const u of metaUpgrades) {
    const card = document.createElement('div');
    card.className = 'meta';
    card.innerHTML = `
      <div class="meta__info">
        <div class="meta__name">${u.name}</div>
        <div class="meta__flavor">${u.flavor}</div>
      </div>
      <button class="meta__buy" type="button" data-id="${u.id}">${u.cost} OM</button>`;
    container.appendChild(card);
    const btn = card.querySelector('.meta__buy');
    btn.addEventListener('click', () => {
      if (buyMeta(u.id)) { playBuy(); render(); }
    });
    metaEls[u.id] = { card, btn };
  }
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
  el('welcome-close').focus();
  modal.onclick = (e) => { if (e.target === modal) close(); };
}

/** Put the page into the curdled post-trillion mode (palette drains, sound sours). No modal. */
export function applyDarkTurnMode() {
  document.body.classList.add('dark-turn');
  setCurdled(true);
}

/** The dark turn: you "earned" a trillion and the game refuses to celebrate. */
export function triggerDarkTurn() {
  applyDarkTurnMode();
  shakeScreen();
  // The receipt: what you kept vs what everyone who actually made it took home, combined.
  let receipt = '';
  if (state.workersPaidTotal.gt(0)) {
    const ratio = state.money.div(state.workersPaidTotal);
    receipt =
      ` <span class="darkturn-receipt">Here's the receipt: you kept <strong>${money(state.money)}</strong>. ` +
      `Everyone who actually built it — all of them, together — took home <strong>${money(state.workersPaidTotal)}</strong>. ` +
      `You kept <strong>${format(ratio)}×</strong> what your whole workforce earned, combined. They made every cent. You kept the trillion.</span>`;
  }
  el('darkturn-body').innerHTML =
    'You earned it. <em>(You didn’t.)</em> The confetti isn’t coming. ' +
    'Look around — nothing is different except the number, and the number was never the point. ' +
    'You couldn’t spend this in a hundred lifetimes. But the meter is still running, ' +
    'and the people whose wages you cut are still on the floor.' + receipt;
  const modal = el('darkturn-modal');
  modal.hidden = false;
  const close = () => { modal.hidden = true; };
  el('darkturn-close').onclick = close;
  el('darkturn-close').focus();
  modal.onclick = (e) => { if (e.target === modal) close(); };
}

/** Show a prominent, lingering "you didn't build this" reveal when a wealth milestone is crossed. */
export function showReveal(text) {
  const toasts = el('toasts');
  const toast = document.createElement('div');
  toast.className = 'toast toast--reveal';
  toast.innerHTML = `<span class="toast__tag">You didn't build this</span><div class="toast__reveal-body">${text}</div>`;
  toasts.appendChild(toast);
  shakeScreen();
  const remove = () => toast.remove();
  toast.addEventListener('animationend', (e) => {
    if (e.animationName === 'toast-out') remove();
  });
  setTimeout(remove, 10000); // fallback; reveals linger longer than achievement toasts
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
      if (buyUpgrade(u.id)) { playBuy(); render(); }
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
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
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
      if (buyGenerator(g.id, buyMode)) { playBuy(); render(); }
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

  // Wage breakdown: workers produce the gross, you pay them, you keep the difference.
  if (state.grossPerSec.gt(0)) {
    const pctKept = Math.round((1 - state.wageRate) * 100);
    el('wage-breakdown').innerHTML =
      `workers produce <span class="wage-gross">${money(state.grossPerSec)}/s</span> · ` +
      `you pay <span class="wage-wages">−${money(state.wagesPerSec)}/s</span> in wages · ` +
      `<span class="wage-keep">you keep ${pctKept}%</span>`;
  } else {
    el('wage-breakdown').textContent = '';
  }

  // Worker plea: an uncomfortable presence that grows as you cut wages.
  el('worker-plea').textContent = state.grossPerSec.gt(0) ? workerPlea(state.wageRate) : '';

  const pct = goalProgress() * 100;
  el('goal-fill').style.width = pct.toFixed(6) + '%';
  el('goal-bar').setAttribute('aria-valuenow', pct.toFixed(2));
  el('goal-label').textContent = `${money(state.money)} of ${money(GOAL)}`;

  // Red overlay on the goal bar: labor's cumulative share of all wealth created.
  // It's the left slice of your green fill, and thins gradually as you cut wages.
  const totalMade = state.money.add(state.workersPaidTotal);
  const laborShare = totalMade.gt(0) ? state.workersPaidTotal.div(totalMade).toNumber() : 0;
  el('goal-fill-workers').style.width = (laborShare * pct).toFixed(6) + '%';

  // The honest counter: what a $1M/year earner makes while you play. It crawls while you boom.
  el('honest-earned').textContent = money(state.playSeconds * HIGH_EARNER_PER_SEC);

  // Comparison ticker: translate the abstract pile into a rotating real-world equivalent.
  if (comparisonIndex < 0) {
    el('comparison').textContent = '…not yet enough to register on any human scale.';
  } else {
    const c = COMPARISONS[comparisonIndex];
    const count = format(state.money.div(c.perUnit).floor());
    el('comparison').textContent = c.render(count);
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
    const effPerUnit = dec(g.baseIncome).mul(mult).mul(INCOME_SCALE);
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

  // Upgrades: keep owned ones visible (marked Active), highlight what you can afford,
  // mute what's unlocked-but-unaffordable, and hide only what's still locked.
  for (const u of upgrades) {
    const refs = upgradeEls[u.id];
    if (!refs) continue;
    const purchased = !!state.upgrades[u.id];
    const unlocked = isUnlocked(u, state.owned, state.earnedTotal);
    refs.card.hidden = !purchased && !unlocked;
    if (refs.card.hidden) continue;
    const affordable = !purchased && state.money.gte(u.cost);
    refs.card.classList.toggle('is-owned', purchased);
    refs.card.classList.toggle('is-available', affordable);
    refs.btn.disabled = purchased || !affordable;
    refs.btn.textContent = purchased ? '✓ Active' : money(u.cost);
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
  renderSpend();
}

/** The unspendable endgame: its tab appears after the dark turn; you can never empty the account. */
function renderSpend() {
  // Reveal the Spend It tab once you've crossed $1T (the tab system owns panel visibility).
  el('tab-spend-btn').hidden = !state.reachedTrillion;
  if (!state.reachedTrillion) return;

  const frac = emptiedFraction();
  el('spend-stat').innerHTML =
    `Flung away: <strong>${money(state.spent)}</strong> · Still have: <strong>${money(state.money)}</strong>`;
  // The bar shows how little of the fortune you've actually managed to spend.
  el('spend-fill').style.width = `${Math.min(100, frac * 100).toFixed(4)}%`;
  const pctStr = (frac * 100).toPrecision(2);
  el('spend-note').textContent =
    `You've gotten rid of ${pctStr}% of it. At $1 million a day it would take 2,740 years — ` +
    `and the account refills faster than you can spend.`;

  for (const l of luxuries) {
    const refs = luxuryEls[l.id];
    if (!refs) continue;
    const owned = state.luxuries[l.id] || 0;
    refs.owned.textContent = owned > 0 ? `×${owned}` : '';
    refs.btn.disabled = state.money.lt(l.price);
  }
}

/** The inheritance panel: held Old Money, its bonus, and the cash-out preview. */
function renderPrestige() {
  const have = state.prestige;
  const genTag = state.generation > 1 ? `Gen ${state.generation}` : '';
  const moneyTag = have > 0 ? `${have} Old Money · +${Math.round(PRESTIGE_BONUS * 100 * have)}% income` : '';
  el('prestige-have').textContent = [genTag, moneyTag].filter(Boolean).join(' · ');

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

  // Meta-upgrades: mark owned, grey out when unaffordable in Old Money.
  for (const u of metaUpgrades) {
    const refs = metaEls[u.id];
    if (!refs) continue;
    const owned = !!state.meta[u.id];
    refs.card.classList.toggle('is-owned', owned);
    refs.btn.disabled = owned || state.prestige < u.cost;
    refs.btn.textContent = owned ? 'Inherited' : `${u.cost} OM`;
  }
}
