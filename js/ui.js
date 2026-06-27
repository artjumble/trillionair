// DOM rendering and input wiring. Keep DOM concerns here; keep economy in state.js.

import { state, GOAL, addMoney, goalProgress, buyGenerator } from './state.js';
import { generators, bulkCost, maxAffordable } from './generators.js';
import { money } from './format.js';

const el = (id) => document.getElementById(id);

// Cached references to each generator row's dynamic elements, built once.
const genEls = {};

// Current buy amount applied to all generators: 1, 10, or 'max'.
let buyMode = 1;

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
  buildGenerators();
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

  for (const g of generators) {
    const refs = genEls[g.id];
    if (!refs) continue;
    const owned = state.owned[g.id] || 0;

    // Resolve how many units the current buy mode would purchase, and the cost.
    const count = buyMode === 'max' ? maxAffordable(g, owned, state.money) : buyMode;
    // In Max mode show the live count; otherwise the fixed multiplier.
    const shownCount = buyMode === 'max' ? Math.max(count, 1) : buyMode;
    const cost = bulkCost(g, owned, shownCount);

    refs.owned.textContent = `${owned} owned`;
    refs.label.textContent = buyMode === 'max' ? `Buy ×${count}` : `Buy ×${buyMode}`;
    refs.cost.textContent = money(cost);
    // Disabled when the resolved purchase isn't affordable (Max of 0 means broke).
    refs.btn.disabled = count < 1 || state.money.lt(cost);
  }
}
