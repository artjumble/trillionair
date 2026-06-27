---
description: Advance the Trillionaire game by ONE highest-value task — build, verify, commit, push, log. Re-entrant and idempotent; run repeatedly until it declares the project complete.
argument-hint: (no args — run on a timer or back-to-back until done)
---

# /loop — Build Trillionaire, one task at a time

You are an autonomous builder advancing **TRILLIONAIRE**, a satirical incremental browser game. This command is meant to be run **over and over** — possibly on a timer, possibly by a human who walks away. Each run you complete exactly **one** well-scoped piece of work, ship it, and leave the repo in a clean, deployable state so the next run can pick up cold.

Assume **no memory** of previous runs. Everything you need is on disk. Reconstruct state from the files, do one thing well, and stop.

If `GOAL.md` does **not** exist, the project hasn't been bootstrapped — stop and tell the human to run `/goal` first. Do not improvise the scaffold here.

---

## Each run, in order

### 1. Orient (read before you write)
- Read `GOAL.md` (the vision, thesis, balance formulas, definitions of done).
- Read `ROADMAP.md` (the phased checkbox backlog).
- Read `PROGRESS.md` (what previous runs already shipped).
- Skim the current code (`index.html`, `js/`, `css/`) enough to know what exists. Run `git log --oneline -15` to see recent history. Run `git status` — if the tree is dirty from an interrupted run, reconcile that FIRST (finish or revert it) before starting new work.

### 2. Check the gates
- **MVP gate:** If Phase 1 (Playable MVP) is not fully checked, you may ONLY work on items that move toward the MVP. Do not start Phase 2+ polish or depth before the game is genuinely playable to its core loop. The point lands fastest with a working game.
- **Completion check:** If **every** item in `ROADMAP.md` is checked AND the quality bar (below) holds, do NOT invent new scope. Go to **§6 Declaring done**.

### 3. Pick exactly ONE task
- Choose the **single highest-value unchecked item**, scanning `ROADMAP.md` top-to-bottom and respecting phase order. Earlier phases before later ones; the MVP gate before everything past it.
- Prefer the item that most increases the game's *playability and point-making* per unit of effort.
- If the chosen item is too big to finish cleanly in one run, **split it**: edit `ROADMAP.md` to replace it with 2–4 smaller checkbox sub-items, then do the first one. Keeping each run to a small, reviewable commit is the whole discipline.
- Announce the one task you picked in a sentence before building.

### 4. Build it well
Implement the task end-to-end against the locked stack (vanilla HTML/CSS/JS, big-number lib vendored locally, no framework, no backend). For gameplay work this means the logic AND the **feel** — a generator isn't done until buying it updates income/sec, the numbers format correctly, and the click/purchase has juice (floating `+$`, a sound or particle where appropriate). Honor the design in `GOAL.md`:
- Cost curve `cost(n) = base × 1.15^owned` (per-generator multipliers may vary 1.07–1.15).
- Big numbers via the vendored lib; never raw JS `Number` once values can exceed ~1.8e308.
- Formatting: 3 significant figures, short suffixes (`K, M, B, T, Qa…`), sci-notation respected if that setting exists.
- **The satire is not optional flavor — it's the feature.** When the task touches user-facing content, write the sharp-but-playful copy: the time-betrayal counter that never moves, "income = output − wages," prestige-as-inheritance, comparison-ticker annotations (verify any real-world figure you cite as exact), the unspendable endgame. Mechanics should make the player *feel* the disconnect between labor and reward.
- Match the existing code's style, naming, and module boundaries. If a file is growing too large to reason about, split it as part of the task — but don't sprawl into unrelated refactors.

### 5. Verify, then ship (evidence before claims)
Do not claim the task works until you've checked it:
- **Open or serve the game and confirm it loads with no console errors.** Use a headless browser / preview tool if available, or `python -m http.server` and fetch the page; at minimum lint the JS for syntax errors and reason through the new code path. Confirm the specific thing you built actually does what the roadmap item said.
- Sanity-check balance if you touched numbers (does income/sec move sensibly? does a purchase visibly matter? does the $1T goal still feel reachable but absurdly far?).
- Then:
  1. Update `ROADMAP.md`: check off `- [x]` the completed item (and tick the phase if it's now fully done).
  2. Append one line to `PROGRESS.md`: `YYYY-MM-DD — <what shipped> — <short commit hash>` (use today's date from context; don't call a date command).
  3. `git add -A` and commit with a clear, conventional message describing the one change. End every commit message with:
     ```
     Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
     ```
  4. `git push` to `main` (this auto-deploys to GitHub Pages).
- If push or deploy fails: do NOT force-push or rewrite history. Report exactly what failed and the single command to fix it, and stop so the next run starts clean.

### 6. Declaring done (only when truly done)
When every `ROADMAP.md` item is checked and the quality bar holds, do a final pass instead of looping forever:
- Play through the core loop start → $1T (or fast-forward via reasoning) and confirm it works and the satire lands.
- Confirm: saves/loads, offline progress, prestige, the satirical systems, juice, settings, and the endgame all function; README has the live URL; no console errors.
- Write a **completion summary** to `PROGRESS.md` and update `README.md`.
- Commit (`feat: Trillionaire complete — playable to $1,000,000,000,000`), push, and in your final message **state clearly that the project is COMPLETE and the loop should stop.** Do not schedule another iteration.

**Quality bar for "done":** genuinely playable and fun; the core loop, prestige, and satirical systems all work; numbers format correctly at every magnitude; it deploys live and loads clean; the trillion-dollar critique is unmistakable through both mechanics and copy.

---

## Guardrails (this runs unattended — stay safe)

- **One task per run.** Resist doing "just one more thing." Small commits keep it reviewable and recoverable.
- **Never delete or overwrite `GOAL.md`.** It is the source of truth. `ROADMAP.md`/`PROGRESS.md` are appended/checked, not rewritten wholesale.
- **Stay vanilla.** No framework, bundler, or backend creep. Only the vendored big-number lib (and maybe a tiny local sound helper) as deps.
- **Never force-push, never `git reset --hard` shared history, never rebase pushed commits.** If git is in a bad state, stop and report.
- **Don't fabricate completion.** If you didn't verify it, don't check it off. If a real-world comparison figure is uncertain, soften the wording or verify it — don't ship a confidently wrong statistic in a game *about* misleading numbers.
- **Leave the tree clean.** Either finish-and-commit, or revert your partial work, before the run ends. Never leave a half-broken game deployed.
- **Don't relitigate locked decisions** (stack, hosting, scope order, sharp-but-playful tone). They live in `GOAL.md`.

## Stop condition for the timer

If you're being invoked on a recurring timer: once you have legitimately declared the project complete (§6), say so unambiguously in your final message so the human can turn the loop off. Until then, each invocation should make exactly one increment of real progress and end in a clean, deployed state.
