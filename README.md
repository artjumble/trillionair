# TRILLIONAIRE

A satirical incremental (idle/clicker) game about the absurdity of "earning" a trillion dollars. The mechanics make the argument: clicking (labor) earns pennies while passive capital earns billions, your income is your workers' output minus the wages you suppress, and the $1,000,000,000,000 you finally "earn" turns out to be impossible to spend. Sharp, but built to actually be fun to play.

**▶ Play:** https://artjumble.github.io/trillionair/ *(live once GitHub Pages is enabled — see below)*

## How it's built

Vanilla **HTML / CSS / JavaScript** — no framework, no bundler, no backend. Big numbers use [break_infinity.js](https://github.com/Patashu/break_infinity.js) (vendored in `js/lib/`). State persists to `localStorage`.

This project is built **autonomously and incrementally** by two Claude Code slash commands:
- **`/goal`** (run once) — laid down the vision, roadmap, scaffold, and deploy pipeline.
- **`/loop`** (run repeatedly) — builds the game one roadmap task per iteration until complete.

See [`GOAL.md`](GOAL.md) for the full design and thesis, [`ROADMAP.md`](ROADMAP.md) for the backlog, and [`PROGRESS.md`](PROGRESS.md) for the build log.

## Run locally

No build step. Either open `index.html` directly, or serve it (recommended, so ES modules load over HTTP):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which publishes the repo root to GitHub Pages.

**One-time setup:** in the GitHub repo, go to **Settings → Pages → Build and deployment → Source** and select **GitHub Actions**. (This can't be automated — it's a manual toggle.)

## Design lineage

Cookie Clicker & AdVenture Capitalist (the building/business loop and ~1.15 cost curve), Antimatter Dimensions (nested tier production), and — for the satire — **Universal Paperclips** and **A Dark Room**, which prove the genre's compulsion loop can carry a message.
