# TRILLIONAIRE

> A satirical incremental (idle/clicker) game about the absurdity of one person "earning" a trillion dollars.

You start by clicking for pennies. You end with more money than you could spend in a thousand lifetimes — and the game makes sure you feel exactly how little that number meant, and exactly who paid for it. The mechanics *are* the argument: labor earns pennies while passive capital earns billions, your income is your workers' output **minus the wages you suppress**, the reset that makes you stronger is unearned **inheritance**, and the $1,000,000,000,000 you finally "earn" turns out to be impossible to give away. Sharp, but built to actually be fun to play.

**▶ Play:** https://artjumble.github.io/trillionair/ *(goes live once GitHub Pages is enabled — see [Deployment](#deployment))*

## How it plays

- **Click** to earn (the honest way — and it will never be enough).
- **Buy idle generators** — ten tiers from a Lemonade Stand to a *Too-Big-to-Fail Bank* — that earn while you do nothing. Buy in ×1 / ×10 / Max.
- **Stack multipliers:** generator milestones (owning 25/50/100… doubles output), a one-time **upgrade shop** (*Regulatory Capture*, *Effective Tax Rate: 0%*), and **achievements** that each pad your income for being recognized as rich.
- **Cut wages:** *Performance Review (Everyone Fails)*, *Offshore the Department*, *Bust the Union* — your growth comes from shrinking the line marked "wages," and the workers start to plead.
- **Cash out / go public** to bank **Old Money** (prestige) and spend it on permanent, inherited advantages — *Trust Fund*, *Born on Third Base* — so the next "generation" starts ahead.
- **Reach a trillion**, watch the colour drain out of everything, and then try — and fail — to spend it.

Watch the **honest $1/second counter** that never catches up, and the **comparison ticker** quietly tallying the teachers, nurses, and school lunches your pile could have paid for.

## The satire (it's the feature, not the flavor)

| Mechanic | The point |
|---|---|
| Clicking earns pennies; passive/offline income earns billions | Capital out-earns labor, effortlessly |
| Income = worker output − wages; "cut wages" upgrades | Your margin is suppressed pay |
| Prestige = inheritance; permanent unearned multipliers | Structural advantage compounds across generations |
| Honest $1/sec counter ("31,688 years to a trillion") | The gulf between earning and accumulating |
| The unspendable "Spend It" endgame | You can't even give a trillion away |

## Built autonomously

This whole game was built **set-and-forget** by two Claude Code slash commands:

- **`/goal`** (run once) — wrote the vision, the phased roadmap, the scaffold, and the auto-deploy pipeline.
- **`/loop`** (run repeatedly, on a timer) — built the game one roadmap task per iteration, verifying each in a headless browser before committing, until every phase was complete.

See [`GOAL.md`](GOAL.md) for the design and thesis, [`ROADMAP.md`](ROADMAP.md) for the backlog, and [`PROGRESS.md`](PROGRESS.md) for the full build log.

## Tech

Vanilla **HTML / CSS / JavaScript** — no framework, no bundler, no backend. Big numbers use [break_infinity.js](https://github.com/Patashu/break_infinity.js) (vendored in `js/lib/`). Sound is synthesized with the WebAudio API (no asset files). State persists to `localStorage`, with offline progress on return.

## Run locally

No build step. Open `index.html` directly, or serve it (recommended, so ES modules load over HTTP):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which publishes the repo root to GitHub Pages.

**One-time setup:** GitHub Pages requires a **public** repo on the free plan. Make the repo public, then go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. (Neither step can be automated.)

## Design lineage

Cookie Clicker & AdVenture Capitalist (the building/business loop and ~1.15 cost curve), Antimatter Dimensions (nested tier production), and — for the satire — **Universal Paperclips** and **A Dark Room**, which prove the genre's compulsion loop can carry a message. The mechanics here don't illustrate the theme; they *are* the theme.
