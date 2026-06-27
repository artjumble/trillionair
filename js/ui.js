// DOM rendering and input wiring. Keep DOM concerns here; keep economy in state.js.

import { state, GOAL, addMoney, goalProgress } from './state.js';
import { money } from './format.js';

const el = (id) => document.getElementById(id);

/** Spawn a floating "+$" near the pointer for click feedback (first bit of juice). */
function floatGain(amount, x, y) {
  const node = document.createElement('div');
  node.className = 'float-gain';
  node.textContent = '+' + money(amount);
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  document.body.appendChild(node);
  node.addEventListener('animationend', () => node.remove());
}

export function bindUI() {
  const btn = el('click-btn');
  btn.addEventListener('click', (e) => {
    addMoney(state.clickValue);
    floatGain(state.clickValue, e.clientX, e.clientY);
    render();
  });
}

export function render() {
  el('money').textContent = money(state.money);
  el('income-rate').textContent = money(state.incomePerSec) + ' / sec';

  const pct = goalProgress() * 100;
  el('goal-fill').style.width = pct.toFixed(6) + '%';
  el('goal-label').textContent = `${money(state.money)} of ${money(GOAL)}`;
}
