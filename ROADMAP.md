# TRILLIONAIRE — Roadmap

> `/loop` works ONE unchecked item per run, top-to-bottom, never skipping the Phase 1 (MVP) gate.
> Items are sized for a single loop iteration. If one is too big, split it into 2–4 sub-items, then do the first.

## Phase 0 — Scaffold & Deploy _(done by /goal)_

- [x] Write `GOAL.md`, `ROADMAP.md`, `PROGRESS.md`
- [x] Vendor `break_infinity.js` into `js/lib/`
- [x] Scaffold deployable skeleton (`index.html` at root, `css/`, `js/` modules)
- [x] GitHub Actions workflow deploying repo root to GitHub Pages
- [x] `git init`, remote, first commit, push to `main`

## Phase 1 — Playable MVP ✅ **COMPLETE — MVP gate met**

- [x] State module: money/total/clickValue as `Decimal`, tick loop, `localStorage` save+load with versioned key
- [x] Number formatting: 3 sig figs + short suffixes (`K,M,B,T,Qa,Qi,Sx,Sp,Oc,No,Dc`), graceful fallback to scientific
- [x] Click-to-earn button with a floating `+$` animation (first juice)
- [x] Define 3–4 idle generators with `cost(n)=base×1.15^owned` and per-generator base income; data-driven config
- [x] Generator UI: name, owned count, cost, income; greys out when unaffordable
- [x] Buy controls: **x1 / x10 / max** with correct geometric-sum cost math
- [x] Live **income/sec** total wired into the tick loop (generators pay out passively)
- [x] **$1T goal progress bar** with formatted current/target
- [x] **Time-betrayal "honest labor" counter** (real $1/sec ticker showing it would take ~31,688 yrs) shown beside the player's wealth
- [x] One **comparison annotation** that updates with wealth (e.g. "= N nurses' annual salaries" — verify figure)
- [x] MVP balance pass: reachable-but-absurdly-far feel; each purchase visibly matters
- [x] Remove the "under construction" banner; confirm clean load + working core loop, then **check the Phase 1 gate complete**

## Phase 2 — Depth ✅ **COMPLETE**

- [x] More generator tiers (target ~8–10 total), each ~5–10× the last, satirically themed
- [x] Milestone bonuses (owning 25/50/100 of a generator multiplies its output)
- [x] Multiplicative upgrade shop (global and per-generator multipliers)
- [x] Achievements with small permanent bonuses + an achievements panel
- [x] Offline progress: `income/sec × secondsAway × 0.5` (8h cap) + "Welcome back, you earned $X" modal

## Phase 3 — Prestige as inheritance ✅ **COMPLETE**

- [x] Prestige currency on a cube-root curve `p = k×cbrt(lifetime/SCALE)`; preview of gain
- [x] Soft reset that wipes money/generators, keeps prestige currency + meta-upgrades
- [x] Meta-upgrade tree spending prestige currency (permanent multipliers)
- [x] "New generation starts ahead" framing + copy; resets feel like inheritance/IPO, not punishment

## Phase 4 — Satire systems ✅ **COMPLETE**

- [x] Wages model: income = worker output − wages; show the wages line explicitly
- [x] "Cut wages / offshore / bust the union" upgrade branch that raises margins
- [x] Worker-begging beat surfaced late (a sprite/line asking you to stop)
- [x] Comparison ticker across magnitude boundaries (nurses, teachers, world hunger, etc. — verify figures)
- [x] "You didn't build this" reveals tied to milestones

## Phase 5 — Juice, sound, endgame & polish ✅ **COMPLETE**

- [x] Particle/coin bursts, button squash-stretch, milestone screen-shake
- [x] Sound: pitch-randomized cha-ching, escalating audio by magnitude, mute setting
- [x] The **curdling dark turn** at/after $1T (celebration → ash, distorted audio)
- [x] Unspendable **"Spend It"** endgame screen (no purchase empties the account)
- [x] Settings: scientific-notation toggle, mute, hard reset (with confirm)
- [x] Accessibility pass (keyboard, contrast, reduced-motion, aria)
- [x] Final balance tuning across the whole run to $1T
- [x] README polished with live URL + screenshot; final completion summary in PROGRESS.md

## Phase 6 — Post release improvements

- [x] Put sections (Inheritance, Upgrades, Shortcuts, etc.) into tabs.
- [x] Expand the comparisons list.
- [x] Bug: There isn't a clear indicator if a Shortcut has been used, or is available to use.
- [x] It should take much more time to reach 1T without using the Old Money resets.
- [x] Bug: Buttons don't enable until amount is "over" button value. For example, button says $34 but doesn't enable until player amount shows $35
- [x] Bug: Shortcut buttons appear enabled initially. For example the Firmer Handshake button is enabled until the player gets ~$50 then it switches to disabled. Once the player gets the right amount of money, then button appears enabled with the grow/shrink effect.
- [x] Reframe the "honest labor" counter on a high earner ($1M/year) instead of $1/sec, and point out even they need 1,000,000 years.
- [x] Workers'-share counter (#1): bank an all-time total of wages paid to workers — add `state.workersPaidTotal` (Decimal, persisted) and accumulate `state.wagesPerSec × dt` each tick in main.js alongside the income tick. Show it as a quiet running line near the wage breakdown / honest panel, e.g. "Workers earned, all-time (everyone, combined): $X". It tracks your money early (~43% at the default 30% rate) then visibly stalls as you buy cut-wages upgrades.
- [x] Workers'-share dark-turn reveal (#3): when the dark turn fires at $1T, add a line to the curdled-victory modal that pulls the live `workersPaidTotal` — "You kept $1,000,000,000,000. Everyone who actually made it kept $X between them." Include the ratio/contrast (their share vs your trillion). Use the real accumulated value so it reflects how hard the player cut wages.
- [ ] Workers'-share as a goal-bar overlay (replaces the running text line — no dollar amount; save that for the $1T reveal): **remove** the `#workers-total` text line in index.html + its render in ui.js (keep `state.workersPaidTotal` accumulating for the reveal). Add a red strip layered on the goal bar showing labor's **cumulative** share of all wealth created. Geometry: inside `.goal__bar` (already `position:relative; overflow:hidden`) add a `#goal-fill-workers` div, absolutely positioned `left:0`, layered **above** `#goal-fill` (higher z-index), colored `var(--danger)`. In render: `share = workersPaidTotal / (money + workersPaidTotal)` (guard 0/0 → 0); `redWidthPct = share × goalProgress() × 100`; set its width %. So the leftmost slice of the green fill shows red = labor's cut of everything made; it thins gradually as wages are cut. No number anywhere on the bar. Add an aria-label/sr-only note so the bar still reads sensibly; respect that it's purely decorative.
