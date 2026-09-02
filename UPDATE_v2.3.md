# Update Guide — v2.3: Five More Endings

## What's new

See the **v2.3** entry at the top of `README.md` for the full list. In short,
this update adds five more distinct endings/coda on top of v2.2's three
wealth-tier endings + Sojourner:

1. **Named Benefactor** — ultra-rare tier above "Pillar of the Community"
   ($800+ wealth, 50+ Social Capital).
2. **Shadow Power** — wealthy through the Secret Society ladder rather
   than respectable channels ($401+ wealth, under 10 Social Capital, deep
   Secret Society involvement).
3. **Community Elder** — poor in coin, rich in trust (under $401 wealth,
   60+ Social Capital).
4. **Institution Builder** — a flavour sentence added to the ordinary top
   wealth tier, keyed to your best-known occupation.
5. **Deported** — a new forced ending: three police crackdowns while
   working Secret Society jobs and you're seized and shipped out under
   guard, no choice involved.

Plus two coda paragraphs that can stack onto any turn-40 ending
(**Hollow Victory** for an addiction that never let go, **Made Peace with
Staying** for remittances sent but passage never bought), and a new
**Stowaway's Gamble** — a free, one-attempt, risk/reward alternative to
paying for passage home from turn 30 onward.

## Files changed

- `public/index.html` — all new ending logic, the Stowaway mechanic, the
  deportation check, and their render screens.
- `src/index.js` — `VALID_STATUSES` now also accepts `deported` and
  `stowaway` so those runs show up correctly on the leaderboard instead
  of being coerced to "alive".

## How to update

1. **Replace `public/index.html`** with the one in this package.
2. **Replace `src/index.js`** with the one in this package (or apply the
   one-line `VALID_STATUSES` change by hand if you've made local edits).
3. **(Optional) Test locally:**
   ```
   npm run dev
   ```
   A few things worth spot-checking:
   - Force a high-Social-Capital, low-wealth run to end at turn 40 and
     confirm you land on **Community Elder** instead of Tier 1/2.
   - Join a Secret Society, work its jobs repeatedly, and confirm three
     crackdowns trigger **Deported** rather than just losing turns.
   - From turn 30, try **Attempt to Stow Away** a few fresh runs and
     confirm all three outcomes are reachable (clean getaway, caught but
     alive, caught badly).
4. **Deploy:**
   ```
   npm run deploy
   ```

## Design notes / tuning knobs

All in `public/index.html`:

- `NAMED_BENEFACTOR_WEALTH` / `NAMED_BENEFACTOR_SC` — $800 / 50.
- `SHADOW_POWER_WEALTH` / `SHADOW_POWER_SC_MAX` / `SHADOW_POWER_SOCIETY_TURNS`
  — $401 / under 10 / 10+ turns in the Secret Society ladder.
- `COMMUNITY_ELDER_SC` — 60.
- `INSTITUTION_BUILDER_TEXT` — per-occupation flavour lines for the
  ordinary top wealth tier.
- `DEPORTATION_CRACKDOWN_THRESHOLD` — 3 crackdowns.
- The Stowaway odds (50% / 35% / 15%) and their costs are inline in
  `localStowaway()` — search for `roll < 50` / `roll < 85`.

`getSpecialEnding()` checks Named Benefactor, then Shadow Power, then
Community Elder, first match wins; none of them block the two codas
(Hollow Victory, Made Peace with Staying), which can stack onto any
ending including the special ones.
