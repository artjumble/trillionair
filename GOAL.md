# TRILLIONAIRE — Project Goal & Design

> The north star. `/loop` re-reads this every iteration. Do not delete or rewrite it wholesale.

## The thesis

TRILLIONAIRE is a satirical incremental (idle/clicker) game. It exists to make one argument **through its mechanics, not just its words**: it is absurd to say a single person "earns" a trillion dollars. A trillion isn't a big salary — it's a number so far outside human experience that the claim of *earning* it collapses under its own weight.

The player's goal is to "earn" **$1,000,000,000,000**. Getting there should feel fun, compulsive, and — by the end — hollow and a little damning. **Tone: sharp but playful.** Genuinely fun to play, witty, landing real gut-punches without becoming a lecture. If it isn't fun, the critique doesn't land.

### Anchor facts (verify before citing any as exact)
- At **$1/second**, reaching $1T takes **~31,688 years** — older than agriculture.
- A typical US household (~$84k/yr) needs **~12 million years** to accumulate $1T.
- Spending it at **$1 million/day** still takes **~2,740 years**.
- $1T in $100 bills stacks **~678 miles high** and wraps Earth **~39 times**.
- A million seconds ≈ 11 days; a billion ≈ 32 years (a career); **a trillion ≈ 31,700 years.**

### The mechanics ARE the argument
- **Clicking (labor) earns pennies. Passive capital + offline income earn billions.** The optimal play is to stop working and let money make money — the player discovers this, and the game quietly implicates them.
- **Income = worker output − wages.** Upgrades that "cut wages / offshore / bust the union" raise margins. Growth comes from suppressing the line labeled *wages*.
- **Prestige = inheritance / taking the company public.** A reset grants a permanent multiplier you did **not** earn — structural advantage that compounds across "generations." The second run starts on third base.
- **The endgame is anticlimax.** At $1T you literally cannot spend it; every purchase barely dents the bar. The number meant nothing — that's the joke and the indictment.

## Design pillars (from incremental-game research)

**Core loop:** act → earn → buy generators that earn more → repeat, faster.

**Cost curve (default):** `cost(n) = baseCost × 1.15^owned`. Vary the multiplier 1.07–1.15 across generators so cheap ones stay relevant while expensive ones spike. Each new generator tier should step **~5–10× income**.

**Big numbers:** Use the vendored `break_infinity.js` (`js/lib/break_infinity.js`, exposes global `Decimal`). Never use raw JS `Number` for currency once prestige exists — values exceed `1.8e308`.

**Number formatting:** 3 significant figures, short suffixes (`K, M, B, T, Qa, Qi, Sx, …`), with a scientific-notation toggle in settings.

**Milestones & upgrades:** owning 25/50/100 of a generator multiplies its output; multiplicative upgrades are the real number-explosion lever; achievements give small permanent bonuses. Discovery (unlocking the next tier/mechanic) is the dopamine, not raw incrementing.

**Prestige (as inheritance):** soft reset for a permanent multiplier. Prestige currency on a **sublinear** curve, e.g. `p = k × cbrt(lifetimeEarnings / SCALE)` so doubling prestige needs ~8× earnings. This forces the reset loop that drives long-term play. Frame each reset as passing wealth to heirs / IPO; the boost is unearned structural advantage.

**Offline progress:** `offline = incomePerSec × secondsAway × ~0.5` (consider an 8h cap), with a "Welcome back — you earned $X while away" modal. Make offline earnings conspicuously large — *money makes money while you sleep* is literally the critique.

**Juice / game feel:** floating `+$` on every click, particle/coin bursts, springy button squash-stretch, pitch-randomized cha-ching, escalating sound as magnitudes climb, restrained screen-shake on milestones. Later, near the endgame, the juice **curdles** (celebration turns to ash) — the dopamine you were fed is revealed as manipulation.

**Satirical systems:**
- A real-time **"honest labor" counter** beside the player's exponential one — at $1/sec it never visibly moves toward $1T.
- The **wage/margin tree** (income = output − wages; "cut wages" upgrades), with a late **worker-begging** beat (A Dark Room technique).
- A **comparison ticker** at magnitude boundaries: "enough to pay N nurses for a year," "enough to end world hunger ~X times" — *verify figures before shipping*.
- The **unspendable endgame**: a "Spend It" screen where no purchase empties the account.

### Design lineage / research credits
Cookie Clicker & AdVenture Capitalist (building/business loops, 1.15 cost curve, prestige), Antimatter Dimensions (nested tier production), and crucially **Universal Paperclips** & **A Dark Room** — proof that the genre's compulsion loop can *carry a message* via progressive revelation and a dark turn. The mechanics don't illustrate the theme; they **are** the theme.

## Definition of MVP done (the Phase 1 gate)
The smallest thing that is genuinely a game and makes the point:
- A clickable money button that earns money with juice (floating `+$`).
- 3–4 idle generators using the `1.15^owned` cost curve, each with buy **x1 / x10 / max**.
- Live **income/sec** display; correctly formatted big numbers (suffixes).
- **Save/load** via `localStorage`.
- The running **$1T goal bar**.
- At least the **time-betrayal "honest labor" counter** + one comparison annotation.

`/loop` must NOT start Phase 2+ until this gate is met.

## Definition of project done
Every `ROADMAP.md` item checked AND the quality bar holds:
- Genuinely playable and fun; core loop, prestige, and satirical systems all work.
- Numbers format correctly at every magnitude; deploys live and loads with no console errors.
- The trillion-dollar critique is unmistakable through both mechanics and copy.
- Saves/loads, offline progress, juice, settings, and the unspendable endgame all function.

## Locked technical decisions (do not relitigate)
- **Vanilla HTML/CSS/JS.** No framework, no bundler, no backend. Plain ES modules.
- **`break_infinity.js` vendored locally** (committed, never CDN at runtime).
- **GitHub Pages, auto-deployed** via Actions on push to `main`. Game at repo **root** (`index.html`).
- **Persistence:** `localStorage` + offline progress on load.
- Remote: `https://github.com/artjumble/trillionair.git` → live at `https://artjumble.github.io/trillionair/`.
