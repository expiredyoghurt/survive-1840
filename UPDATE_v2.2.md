# Update Guide — v2.2 Content Update

## What's new

See the **v2.2** entry at the top of `README.md` for the full list. In short:

- The old single "Survived" ending is now three endings, split by final
  wealth (below $100 / $101–$400 / $401+), each with its own closing text.
- A brand-new fourth ending: **Sojourner** — buy passage home from turn 30
  onward and the run ends immediately, as a triumphant return or an
  empty-handed one depending on your combined wealth + remittances against
  a $500 threshold.
- A new **Remittances** mechanic — send $10/$25/$50 home each turn via a
  "Family & Passage" panel that now appears on every turn's budget screen.
- A brand-new stat, **Social Capital**, shown in the header next to Wealth,
  Health, and Status. It's earned through charity, Clan Association
  support, working trust-facing jobs, and correct quiz answers, and it now
  gates several higher-tier occupations (Teacher, Nurse, Doctor, Police
  Officer/Constable/Chief, Post Office Manager, University Lecturer,
  Professor, Business Man, Hospital Manager, Fire Chief).
- A new "Support Clan Association" activity alongside the existing
  Donate to Charity.
- The leaderboard now shows an Outcome column (Died / Survived /
  Sojourner Home / Returned Empty-Handed).

## Files changed

- `public/index.html` — all of the above (game data, rules, and UI live
  here, as before).
- `src/index.js` — small change: the leaderboard submission endpoint now
  accepts two new `status` values (`sojourner-win`, `sojourner-loss`) in
  addition to the existing `dead` / `alive`, so Sojourner runs show up
  correctly on the shared leaderboard instead of being coerced to "alive".
  No `wrangler.toml` or KV schema changes — same `leaderboard` key, same
  shape, just two new allowed strings in one field.

## How to update

1. **Locate your project folder** — the one with `wrangler.toml`,
   `package.json`, a `public/` folder, and a `src/` folder.
2. **Replace `public/index.html`** with the `index.html` in this package.
3. **Replace `src/index.js`** with the `index.js` in this package (or
   apply the one-line `VALID_STATUSES` change by hand if you've made
   local edits to the Worker you want to keep).
4. **(Optional) Test locally first:**
   ```
   npm run dev
   ```
   Start a run, use "Send $50 Home" a few times, and from turn 30 onward
   try "Buy Passage Home" to confirm the Sojourner ending renders. Also
   play (or force, see below) to turn 40 and confirm you land on one of
   the three wealth-tiered survival endings instead of the old single
   "You Survived!" screen.
5. **Deploy:**
   ```
   npm run deploy
   ```

### Quick way to sanity-check the backend change

```js
fetch("/api/leaderboard/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test Sojourner", race: "Chinese", turn: 32, wealth: 550, health: 70, status: "sojourner-win" })
}).then(r => r.json()).then(console.log);
```
Reload the in-game leaderboard and confirm "Test Sojourner" appears with
an "⛵ Sojourner (Home)" outcome rather than being folded into "Survived".

## Design notes / tuning knobs

Everything below is a starting point, not a final balance — all of it
lives in a few clearly-named constants in `public/index.html` if you want
to retune:

- `SOCIAL_CAPITAL_REQUIREMENT` — per-job Social Capital gates.
- `JOB_SOCIAL_CAPITAL` — per-turn Social Capital earned by job.
- `PASSAGE_HOME_COST` (currently $150) and `SOJOURNER_WIN_THRESHOLD`
  (currently $500) — the two numbers that define the Sojourner ending.
- `REMIT_AMOUNTS` (currently `[10, 25, 50]`) — the fixed remittance
  denominations offered each turn.
- `SURVIVAL_ENDINGS` — the wealth breakpoints and text for the three
  tiered survival endings ($100 / $400 breakpoints).
