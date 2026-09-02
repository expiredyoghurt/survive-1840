# Update Guide — v2.5: Unranked Epilogue

## What's new

1. **Verified, not changed**: the "Choose Lodging" panel already returns
   correctly after selling a home (`ownsHome` flips to `false`, next
   render shows the normal food/lodging choices again). No fix was
   needed — confirmed with a direct test (`localSellProperty` → `render()`
   → the lodging `choice-grid` is present).
2. **New**: an unranked epilogue. After the natural 40-turn ending,
   players can click **"Keep Playing (Unranked)"** to continue the same
   run up to turn 99. Score was already recorded at turn 40 and is never
   resubmitted, no matter what happens during the epilogue.

See the **v2.5** entry in `README.md`, plus the new **"Unranked
epilogue"** section, for full detail.

## Files changed

- `public/index.html` only. No backend changes — the epilogue never
  touches the leaderboard.

## How to update

1. **Replace `public/index.html`** with the one in this package.
2. **(Optional) Test locally:**
   ```
   npm run dev
   ```
   Worth spot-checking:
   - Reach turn 41 and confirm the ending screen shows a "Keep Playing
     (Unranked)" button alongside the usual stats.
   - Click it, confirm the header now reads "Turn: 41 / 99" instead of
     "/ 40", and that the budget screen (food/lodging/property/passage)
     works exactly as before.
   - Keep playing a few more turns and confirm nothing gets submitted to
     the leaderboard again (check the Network tab, or just trust the
     `scoreSubmitted` guard — it's the same one used everywhere else).
   - Try dying, getting deported, or triggering Sojourner/Stowaway during
     the epilogue — all should work exactly as in the core game, just
     without any leaderboard effect.
   - If you have the patience, play all the way to turn 99 and confirm
     the closing screen shows a "this is where it ends" note instead of
     another "Keep Playing" button.
3. **Deploy:**
   ```
   npm run deploy
   ```

## Design notes / tuning knobs

- `EPILOGUE_TURN_CAP` (99) and `CORE_TURN_CAP` (40) — the two turn caps.
- `getTurnCap(s)` — the single function every turn-completion check now
  calls instead of a hardcoded `40`. If you ever add another place that
  needs to know "is the game over yet", call this rather than comparing
  `state.turn` to a literal number.
- `getGameYear`/`getGameQuarter` no longer clamp at turn 40 — only at a
  lower bound of turn 1. If you'd rather the calendar freeze at 1849
  during the epilogue instead of continuing to advance, reintroduce an
  upper clamp there, but note the header and ending screens both display
  whatever these functions return, so the change is purely cosmetic.
