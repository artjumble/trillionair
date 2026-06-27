// DOM rendering and input wiring. Keep DOM concerns here; keep economy in state.js.

import { state, GOAL, addMoney, goalProgress, buyGenerator } from './state.js';
import { generators, unitCost } from './generators.js';
import { money } from './format.js';

const el = (id) => document.getElementById(id);

// Cached references to each generator row's dynamic elements, built once.
const genEls = {};

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
  buildGenerators();
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
      if (buyGenerator(g.id)) render();
    });
    genEls[g.id] = {
      owned: row.querySelector('.gen__owned'),
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

  for (const g of generators) {
    const refs = genEls[g.id];
    if (!refs) continue;
    const owned = state.owned[g.id] || 0;
    const cost = unitCost(g, owned);
    refs.owned.textContent = `${owned} owned`;
    refs.cost.textContent = money(cost);
    refs.btn.disabled = state.money.lt(cost);
  }
}
