// Entry point. Boots state, wires UI, runs the tick loop.

import { state, load, save } from './state.js';
import { bindUI, render } from './ui.js';

const TICK_MS = 100; // 10 ticks/sec for smooth passive income later

function tick() {
  // Passive income (none until generators land in Phase 1).
  if (state.incomePerSec.gt(0)) {
    const perTick = state.incomePerSec.mul(TICK_MS / 1000);
    state.money = state.money.add(perTick);
    state.earnedTotal = state.earnedTotal.add(perTick);
  }
  render();
}

function boot() {
  load();
  bindUI();
  render();
  setInterval(tick, TICK_MS);
  setInterval(save, 5000); // autosave every 5s
  window.addEventListener('beforeunload', save);
}

boot();
