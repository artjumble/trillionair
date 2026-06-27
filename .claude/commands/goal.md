---
description: Bootstrap the Trillionaire game project — write the vision, roadmap, repo scaffold, and auto-deploy pipeline. Run ONCE, then run /loop repeatedly.
argument-hint: (no args — run once at project start)
---

# /goal — Establish the Trillionaire Project

You are bootstrapping an **autonomous, set-and-forget** build of a satirical incremental (idle/clicker) browser game called **TRILLIONAIRE**. This command runs **once** to lay down the rails. After it finishes, the human will run `/loop` over and over (often on a timer) and that command will actually build the game, one task per iteration, until it is complete.

Your job in `/goal` is therefore NOT to build game features. Your job is to make it impossible for `/loop` to get lost: write the vision, the design, the phased backlog, scaffold a deployable skeleton, and ship it live. Then stop and tell the human to start the loop.

If `GOAL.md` already exists in the project root, this project is already bootstrapped — **do not overwrite it.** Report that the project is already set up and tell the human to run `/loop` instead. (You may offer to refresh the roadmap if they explicitly ask.)

---

## The thesis (this is the whole point — internalize it)

The game exists to make one argument **through its mechanics, not just its words**: it is absurd to say a single person "earns" a trillion dollars. A trillion is not a big salary — it is a number so far outside human experience that the claim of having *earned* it collapses under its own weight.

Anchor facts to weaponize (verify before shipping any you cite as exact):
- At **$1 per second**, reaching $1,000,000,000,000 takes **~31,688 years** — older than agriculture, older than written language.
- A **typical US household (~$84k/yr)** would need **~12 million years** to accumulate $1T.
- Spending it at **$1 million per day** still takes **~2,740 years** to empty.
- $1T in $100 bills is a stack **~678 miles tall** and wraps Earth **~39 times**.
- A million seconds ≈ 11 days; a billion seconds ≈ 32 years (a whole career); **a trillion seconds ≈ 31,700 years.**

The mechanics must *embody* the critique:
- **Clicking (labor) earns pennies. Passive capital (and offline income) earns billions.** The optimal play is to stop working and let money make money — the player discovers this, and the game quietly implicates them.
- **Income = worker output − wages.** Upgrades that "cut wages / offshore / bust unions" raise margins. Growth comes from suppressing the line labeled *wages*.
- **Prestige = inheritance / taking the company public.** Resetting grants a permanent multiplier you did not earn — structural advantage that compounds across "generations." The second run starts on third base.
- **The endgame is anticlimax.** At $1T the player literally cannot spend it; every purchase barely dents the bar. The number meant nothing, and that is the joke and the indictment.

**Tone: sharp but playful.** Witty and genuinely fun to play, landing real gut-punches without becoming a lecture. The satire rides *on top of* a compulsion loop that actually works as a game. If it isn't fun, the critique doesn't land.

---

## Locked technical decisions (do not relitigate)

- **Stack:** Vanilla **HTML / CSS / JavaScript**. No framework. No bundler required. Plain ES modules (`<script type="module">`) are fine. Keep it buildless if you can.
- **Big numbers:** Vendor **break_infinity.js** (or decimal.js) locally into the repo — values WILL exceed `Number.MAX_VALUE` once prestige exists. Do not rely on a CDN at runtime; commit the lib so the game works offline and on Pages forever.
- **Hosting:** **GitHub Pages, auto-deployed** via GitHub Actions on every push to the default branch. The playable game lives at the **repo root** (`index.html` at root) for clean Pages hosting.
- **Persistence:** Save to `localStorage`; support offline progress on load.
- **No backend.** Everything runs client-side and static.
- **Remote:** `https://github.com/artjumble/trillionair.git`.

---

## What you must produce (in order)

Work through these as a TodoWrite checklist. Verify each before moving on. **Commit as you go.**

### 1. `GOAL.md` (project root) — the north star
A single document `/loop` will re-read every iteration. Include:
- **The thesis** (above), in your own tight words — the satirical argument and tone (sharp but playful).
- **Design pillars** distilled from incremental-game research:
  - Core loop: act → earn → buy generators that earn more → repeat faster.
  - **Cost curve:** `cost(n) = baseCost × 1.15^owned` as the default per generator (vary 1.07–1.15 across generators so cheap ones stay relevant).
  - **Generator tiers** stepping ~5–10× income each (Lemonade-stand → … → hedge fund / lobbying firm flavor, themed to the satire).
  - **Milestone bonuses** (owning 25/50/100 of a generator multiplies it).
  - **Multiplicative upgrades** (the real number-explosion lever) and **achievements**.
  - **Prestige** (reframed as inheritance/IPO): soft reset for a permanent multiplier; prestige currency on a **sublinear curve**, e.g. `p = k × cbrt(lifetimeEarnings / SCALE)` so doubling prestige needs ~8× earnings — this forces the reset loop that drives long-term play.
  - **Offline progress:** `offline = incomePerSec × secondsAway × ~0.5`, with a "Welcome back — you earned $X while away" modal. Make offline earnings conspicuously large — *money makes money while you sleep* is literally the critique.
  - **Number formatting:** 3 significant figures with short suffixes (`K, M, B, T, Qa, Qi, …`), scientific-notation toggle in settings.
  - **Juice:** floating `+$` on every click, particle bursts, springy button squash-stretch, pitch-randomized cha-ching, escalating sound as magnitudes climb, restrained screen-shake on milestones. (Later: the juice *curdles* near the endgame.)
  - **Satirical systems:** the time-betrayal "honest labor" counter that never moves, the wage/margin tree, the comparison ticker at magnitude boundaries ("enough to pay N nurses for a year" — verify figures), and the unspendable endgame.
- **Definition of MVP done** (the gate Phase 1 must hit — see ROADMAP).
- **Definition of project done** (every roadmap item checked + quality bar).
- A short **research credits** note linking the design lineage: Cookie Clicker, AdVenture Capitalist, Antimatter Dimensions (nested production), **Universal Paperclips** and **A Dark Room** (mechanics-as-message, the dark turn).

### 2. `ROADMAP.md` (project root) — the phased, checkbox backlog
This is what `/loop` consumes to pick work. Use `- [ ]` / `- [x]` checkboxes, grouped by phase, ordered by dependency. Each item must be **small enough to finish in one loop iteration** and phrased as a verifiable outcome. Structure:

- **Phase 0 — Scaffold & Deploy** (you complete most of this now in `/goal`).
- **Phase 1 — Playable MVP (THE GATE).** The smallest thing that is genuinely a game and makes the point: a clickable money button, 3–4 idle generators with the 1.15 cost curve, buy x1/x10/max, live income/sec, formatted big numbers, save/load, the running **$1T goal bar**, and at least the **time-betrayal counter** + one comparison annotation. `/loop` must not start Phase 2+ until this gate is met.
- **Phase 2 — Depth:** more generator tiers, milestone bonuses, multiplicative upgrades, achievements, offline progress + welcome-back modal.
- **Phase 3 — Prestige as inheritance:** soft reset, prestige currency (cube-root curve), meta-upgrades, "new generation starts ahead" framing.
- **Phase 4 — Satire systems:** wage/margin tree (income = output − wages; cut-wages upgrades), comparison ticker across magnitude boundaries, the "you didn't build this" beats, a worker-begging moment.
- **Phase 5 — Juice, sound, endgame & polish:** full game feel, the curdling dark turn at/after $1T, the unspendable "Spend It" screen, settings (sci-notation toggle, mute, hard reset), accessibility pass, balance tuning, README with the live Pages URL.

Add a line at the top of ROADMAP.md: *"`/loop` works ONE unchecked item per run, top-to-bottom, never skipping the Phase 1 gate."*

### 3. `PROGRESS.md` (project root) — the running log
Create it with a header and one entry noting the bootstrap. `/loop` appends one line per iteration here (date — what shipped — commit hash). This is how a fresh, memory-less loop run reconstructs what already happened.

### 4. Repo scaffold (deployable skeleton, NOT game features)
- `index.html` at root — minimal page: title, a placeholder money display, a click button, and a "🚧 under construction" note. It must **load without errors** in a browser.
- `css/style.css`, `js/main.js` (ES module entry), and a `js/lib/` holding the vendored big-number library (committed, not CDN).
- A clear module layout `/loop` can extend (e.g. `js/state.js`, `js/format.js`, `js/generators.js`, `js/ui.js`) — stub the ones you reference.
- `README.md` — what the game is, the satirical thesis in two sentences, how to run locally (just open `index.html` or `python -m http.server`), and a placeholder for the live URL.
- `.gitignore` (node_modules just in case, OS cruft, editor files).

### 5. Auto-deploy pipeline
- `.github/workflows/deploy.yml` — a GitHub Actions workflow that deploys the static site (repo root) to **GitHub Pages** on every push to the default branch, using the official Pages actions (`actions/configure-pages`, `actions/upload-pages-artifact` with `path: .`, `actions/deploy-pages`) with the right `permissions` (`pages: write`, `id-token: write`) and `concurrency`. No build step needed for vanilla — upload the root as the artifact (exclude `.git`, `.github`, `.claude`).
- Note in the README that the human may need to enable Pages → "GitHub Actions" as the source once, in the repo settings (you cannot click that for them).

### 6. Git & first ship
- `git init` if not already a repo; set the default branch to `main`.
- Add the remote `origin` → `https://github.com/artjumble/trillionair.git` if not present.
- Stage everything, commit (`chore: bootstrap Trillionaire — vision, roadmap, scaffold, Pages deploy`), and **push to `main`**.
- If push fails (auth, non-empty remote, protected branch), do NOT force-push or destroy history. Stop, report exactly what failed, and give the human the one command to resolve it (e.g. `git pull --rebase`, or `gh auth login`).

Always end commit messages with:
```
Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
```

---

## Guardrails

- **Do not build gameplay features here.** If you're tempted to add generators or prestige, that's `/loop`'s job — put it in ROADMAP.md instead.
- **Vanilla only.** No React/Vue/Svelte, no bundler config, no npm framework. A big-number lib and maybe a tiny sound helper are the only allowed deps, vendored locally.
- **Never relitigate the locked decisions** above.
- **Verify the skeleton actually loads** (open it / serve it and confirm no console errors) before claiming Phase 0 done — evidence before assertions.

---

## When you finish

Print a short summary:
1. Confirm `GOAL.md`, `ROADMAP.md`, `PROGRESS.md`, scaffold, and deploy workflow exist and are committed + pushed.
2. The live URL it will deploy to (`https://artjumble.github.io/trillionair/`) and the one manual step (enable Pages → GitHub Actions).
3. **Tell the human to now run `/loop`** — repeatedly, or via the loop-on-a-timer skill — and that they can walk away; the loop will build the game to completion and stop itself when done.
