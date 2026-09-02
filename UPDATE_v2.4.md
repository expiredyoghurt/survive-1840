# Update Guide — v2.4: Home Ownership

## What's new

See the **v2.4** entry at the top of `README.md`, and the new
**Home Ownership** section further down, for the full design. In short:

- Players who reach 25+ Social Capital, Medium+ social status, and enough
  wealth (asking price + $200 cushion) can buy a home instead of renting
  lodging each turn.
- The price floats on a shared property market (`state.propertyMarketPrice`)
  that drifts up slowly on its own and reacts to Monsoon Flood, Epidemic,
  New Immigrants, and Wealth Crisis events already in the game.
- Owning replaces rent with a small flat maintenance fee and gives the
  best health/risk numbers of any lodging option, plus a small passive
  Social Capital trickle.
- Selling nets 70% of the *current* market price (not what you paid), so
  timing matters. It's automatic (with proceeds) on the Sojourner ending,
  but forfeited entirely (no compensation) on Deported or a successful
  Stowaway — home ownership now carries real downside risk, not just
  upside.

## Files changed

- `public/index.html` only. No backend (`src/index.js`) changes this
  release — property state lives entirely in the local game state and
  doesn't touch the leaderboard schema.

## How to update

1. **Replace `public/index.html`** with the one in this package.
2. **(Optional) Test locally:**
   ```
   npm run dev
   ```
   Worth spot-checking:
   - Reach the gating thresholds (Social Capital, status, cash) and
     confirm the "Buy Home" button in the Home Ownership panel enables
     correctly, and that the "Choose Lodging" section disappears once
     you own one.
   - Buy, then sell — confirm the sale price reflects the *current*
     market price, not the purchase price, and that the profit/loss
     message reads sensibly either way.
   - Buy a home, then trigger a Deportation (join a secret society, work
     its jobs repeatedly until 3 crackdowns) — confirm the ending screen
     says the home was abandoned with no payout.
   - Buy a home, then reach turn 30+ and use "Attempt to Stow Away" until
     you get the successful roll — confirm the same abandonment note
     appears on the Stowaway ending.
   - Buy a home, then reach turn 30+ and "Buy Passage Home" — confirm the
     Sojourner ending mentions the sale proceeds and that they're folded
     into the $500 threshold total.
   - Play (or force via state) to turn 40 while owning a home — confirm
     the survival ending shows "🏠 Owns a home in the district" as a
     status line instead of silently dropping the asset.
3. **Deploy:**
   ```
   npm run deploy
   ```

## Design notes / tuning knobs

All in `public/index.html`, all easy to retune without touching logic:

- `PROPERTY_BASE_PRICE` / `PROPERTY_MIN_PRICE` / `PROPERTY_MAX_PRICE` —
  $450 / $300 / $900.
- `PROPERTY_APPRECIATION` — per-turn baseline drift multiplier (currently
  1.004, i.e. ~0.4%/turn).
- `PROPERTY_SC_REQUIREMENT` / `PROPERTY_MIN_STATUS_RANK` /
  `PROPERTY_CASH_CUSHION` — the three gating conditions (25 / Medium / $200).
- `PROPERTY_SELL_RATE` — resale friction (currently 0.7, i.e. 70% of
  current market price).
- `PROPERTY_MAINTENANCE` / `PROPERTY_OWNER_HEALTH` / `PROPERTY_OWNER_RISK`
  — the per-turn cost and benefits of ownership ($3 / +6 health / -0.15
  risk).
- Event-driven market shocks are inline in `updatePropertyMarket()` —
  search for `eventId === "monsoon"` to find and adjust the multipliers
  for each event type.
