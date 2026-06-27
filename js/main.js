// Entry point. Boots state, wires UI, runs the tick loop.

import { state, load, save, evaluateAchievements, applyOfflineProgress } from './state.js';
import { bindUI, render, showAchievement, showWelcomeBack } from './ui.js';

const TICK_MS = 100; // 10 ticks/sec for smooth passive income later

function tick() {
  // Real time spent playing — drives the "honest labor" $1/sec counter.
  state.playSeconds += TICK_MS / 1000;

  // Passive income from owned generators.
  if (state.incomePerSec.gt(0)) {
    const perTick = state.incomePerSec.mul(TICK_MS / 1000);
    state.money = state.money.add(perTick);
    state.earnedTotal = state.earnedTotal.add(perTick);
  }

  // Award and announce any newly-earned achievements.
  for (const a of evaluateAchievements()) showAchievement(a);

  render();
}

function boot() {
  load();
  const offline = applyOfflineProgress();
  bindUI();
  render();
  if (offline) showWelcomeBack(offline);
  setInterval(tick, TICK_MS);
  setInterval(save, 5000); // autosave every 5s
  window.addEventListener('beforeunload', save);
}

boot();
