# Redeploy Guide — Leaderboard Fix

## What was wrong

Players who **survived** all 40 turns never appeared on the leaderboard.
Players who **died** always did.

**Root cause:** the global `render()` dispatcher checked
`if (state.turn > 40) return renderEnd();` *before* checking anything else.
The only place the game submitted a score for a successful run was inside
`nextTurn()`, which only runs when the player clicks "Continue" on the
turn-result screen. But the moment a player finished their 40th turn,
`state.turn` became 41 and `render()` jumped straight to the "You
Survived!" screen — skipping the result screen (and its Continue button)
entirely. `nextTurn()` was never called, so `submitScore()` was never
called, so the run was silently dropped.

Deaths worked correctly because `submitScore()` was already called
directly inside the death-handling code, at the moment `health <= 0` or
`wealth <= 0` was detected — not dependent on any later button click.

## The fix

- `submitScore()` is now called the instant a player's turn count crosses
  40 in both places that can happen (finishing a turn with no work found,
  and finishing a turn after working a job) — the same pattern already
  used for deaths, so survivors and deaths now behave consistently.
- Added a `state.scoreSubmitted` flag and a `submitScoreOnce()` wrapper
  that every submission call site now goes through, so a run can never be
  submitted to the leaderboard twice, no matter how many times any
  screen re-renders.
- No backend (`index.js`) or `wrangler.toml` changes were needed — this
  was purely a frontend bug in `public/index.html`.

This was verified with ~90 simulated playthroughs (every race × every
trait, including deaths, survivals via each of the two completion paths,
and repeated re-renders) with zero errors and exactly one leaderboard
submission per run.

## How to redeploy

1. **Locate your project folder** — the one with `wrangler.toml`,
   `package.json`, a `public/` folder, and a `src/` folder. This is the
   project tied to your live Cloudflare Worker.

2. **Replace `public/index.html`** with the `index.html` in this package.
   `src/index.js` is unchanged — leave it as-is.

3. **(Optional) Test locally first:**
   ```
   npm run dev
   ```
   Play a full run to completion (or force it — see "Quick way to
   verify" below) and confirm it shows up via the in-app leaderboard view.

4. **Deploy:**
   ```
   npm run deploy
   ```
   (or `npx wrangler deploy` if you don't have an npm script for it).

5. **Verify on the live site** — hard refresh (Ctrl+Shift+R /
   Cmd+Shift+R) to bypass any cached copy, then check the leaderboard.

6. **If you use git**, commit the change:
   ```
   git add public/index.html
   git commit -m "Fix: survivors were never submitted to the leaderboard"
   git push
   ```

### Quick way to verify without playing 40 turns

Open your browser's dev console on the live game and run:
```js
fetch("/api/leaderboard/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Test Survivor", race: "Chinese", turn: 41, wealth: 100, health: 80, status: "alive" })
}).then(r => r.json()).then(console.log);
```
Then reload the leaderboard view and confirm "Test Survivor" appears.
This only tests the backend endpoint directly — it doesn't prove the
frontend bug is fixed, but it's a fast sanity check that the API and KV
store are working before/after deploying.

## Notes

- Existing leaderboard entries in KV are untouched — this fix only
  affects future runs.
- No `wrangler.toml`, KV binding, or `package.json` changes are required.
