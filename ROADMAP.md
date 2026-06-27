# TRILLIONAIRE — Roadmap

> `/loop` works ONE unchecked item per run, top-to-bottom, never skipping the Phase 1 (MVP) gate.
> Items are sized for a single loop iteration. If one is too big, split it into 2–4 sub-items, then do the first.

## Phase 0 — Scaffold & Deploy  *(done by /goal)*
- [x] Write `GOAL.md`, `ROADMAP.md`, `PROGRESS.md`
- [x] Vendor `break_infinity.js` into `js/lib/`
- [x] Scaffold deployable skeleton (`index.html` at root, `css/`, `js/` modules)
- [x] GitHub Actions workflow deploying repo root to GitHub Pages
- [x] `git init`, remote, first commit, push to `main`

## Phase 1 — Playable MVP  **(THE GATE — do not pass until every box here is checked)**
- [x] State module: money/total/clickValue as `Decimal`, tick loop, `localStorage` save+load with versioned key
- [x] Number formatting: 3 sig figs + short suffixes (`K,M,B,T,Qa,Qi,Sx,Sp,Oc,No,Dc`), graceful fallback to scientific
- [x] Click-to-earn button with a floating `+$` animation (first juice)
- [x] Define 3–4 idle generators with `cost(n)=base×1.15^owned` and per-generator base income; data-driven config
- [x] Generator UI: name, owned count, cost, income; greys out when unaffordable
- [ ] Buy controls: **x1 / x10 / max** with correct geometric-sum cost math *(x1 done; x10/max pending)*
- [x] Live **income/sec** total wired into the tick loop (generators pay out passively)
- [x] **$1T goal progress bar** with formatted current/target
- [x] **Time-betrayal "honest labor" counter** (real $1/sec ticker showing it would take ~31,688 yrs) shown beside the player's wealth
- [ ] One **comparison annotation** that updates with wealth (e.g. "= N nurses' annual salaries" — verify figure)
- [ ] MVP balance pass: reachable-but-absurdly-far feel; each purchase visibly matters
- [ ] Remove the "under construction" banner; confirm clean load + working core loop, then **check the Phase 1 gate complete**

## Phase 2 — Depth
- [ ] More generator tiers (target ~8–10 total), each ~5–10× the last, satirically themed
- [ ] Milestone bonuses (owning 25/50/100 of a generator multiplies its output)
- [ ] Multiplicative upgrade shop (global and per-generator multipliers)
- [ ] Achievements with small permanent bonuses + an achievements panel
- [ ] Offline progress: `income/sec × secondsAway × 0.5` (8h cap) + "Welcome back, you earned $X" modal

## Phase 3 — Prestige as inheritance
- [ ] Prestige currency on a cube-root curve `p = k×cbrt(lifetime/SCALE)`; preview of gain
- [ ] Soft reset that wipes money/generators, keeps prestige currency + meta-upgrades
- [ ] Meta-upgrade tree spending prestige currency (permanent multipliers)
- [ ] "New generation starts ahead" framing + copy; resets feel like inheritance/IPO, not punishment

## Phase 4 — Satire systems
- [ ] Wages model: income = worker output − wages; show the wages line explicitly
- [ ] "Cut wages / offshore / bust the union" upgrade branch that raises margins
- [ ] Worker-begging beat surfaced late (a sprite/line asking you to stop)
- [ ] Comparison ticker across magnitude boundaries (nurses, teachers, world hunger, etc. — verify figures)
- [ ] "You didn't build this" reveals tied to milestones

## Phase 5 — Juice, sound, endgame & polish
- [ ] Particle/coin bursts, button squash-stretch, milestone screen-shake
- [ ] Sound: pitch-randomized cha-ching, escalating audio by magnitude, mute setting
- [ ] The **curdling dark turn** at/after $1T (celebration → ash, distorted audio)
- [ ] Unspendable **"Spend It"** endgame screen (no purchase empties the account)
- [ ] Settings: scientific-notation toggle, mute, hard reset (with confirm)
- [ ] Accessibility pass (keyboard, contrast, reduced-motion, aria)
- [ ] Final balance tuning across the whole run to $1T
- [ ] README polished with live URL + screenshot; final completion summary in PROGRESS.md
