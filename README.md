# Survive 1840 — Cloudflare Worker + KV

A survival game set in 1840s Singapore. Everyone plays as a guest — there
are no accounts, no passwords, and no server-saved games. Deployed as a
single Cloudflare Worker: it serves the game itself (a static HTML/JS
frontend) and hosts a single shared, cross-platform leaderboard in
Workers KV.

## Changelog

**v2.5**
- Fixed nothing (verified, not a bug): the "Choose Lodging" panel already
  returns correctly the moment a home is sold — `ownsHome` flips to
  `false` and the next render shows the normal food/lodging choices again.
- Added an **unranked epilogue**: after reaching the natural 40-turn
  ending, players can choose "Keep Playing (Unranked)" to continue the
  same run up to **turn 99**. Their score was already recorded on the
  leaderboard the moment they first crossed turn 40 — nothing from the
  epilogue is ever submitted or resubmitted. The in-game calendar keeps
  advancing accordingly (turn 99 lands around 1864), and the ending
  screen (wealth tier, special endings, Legacy Score, etc.) is simply
  recalculated fresh against whatever the player's stats are when the
  epilogue truly ends. Death, Deportation, Sojourner, and Stowaway all
  remain reachable during the epilogue exactly as before — nothing about
  those systems is disabled, they just no longer affect the leaderboard
  either.

**v2.4**
- Added **Home Ownership** — a reward for players who reach real success,
  not a starter option. Buying a home requires 25+ Social Capital, Medium
  social status or higher, and enough wealth to cover the price plus a
  $200 cushion. Once bought, it replaces per-turn rent with a small flat
  maintenance fee (~$3), gives better health and risk protection than any
  rental tier including Proper Room, and adds a small passive Social
  Capital trickle (+1/turn) from being a known homeowner.
- The purchase/resale price floats on a shared **property market** that
  drifts slowly upward over the game (the colony is growing) with light
  random noise, and reacts to the same events already driving the rest of
  the simulation: floods and epidemics push prices down, a fresh wave of
  immigrants pushes them up, a wealth crisis cools the market generally.
- **Selling** is the player's choice, any time, at 70% of the *current*
  market price — not the original purchase price — so timing a sale is a
  real decision (sell during a boom and even the resale friction can
  still net a profit; sell during a slump and you can take a loss beyond
  the friction alone).
- Property is only auto-liquidated (sold) on a **voluntary** departure —
  the Sojourner ending. A **Deported** or successful **Stowaway** ending
  forces the home to be abandoned with no compensation instead, since
  there's no time for an orderly sale — giving ownership a real downside
  risk to weigh against its benefits. Players who reach turn 40 and stay
  in Singapore simply keep the home; it shows up as a status line on
  their ending screen rather than being cashed out.

**v2.3**
- Added five special/rare endings on top of the three wealth tiers:
  - **Named Benefactor** (wealth $800+, Social Capital 50+) — an ultra-rare
    tier above "Pillar of the Community" for players who combine great
    wealth with deep community trust.
  - **Shadow Power** (wealth $401+, Social Capital under 10, deep Secret
    Society involvement) — wealthy and influential, but through the
    underworld rather than respectable channels.
  - **Community Elder** (wealth under $401, Social Capital 60+) —
    recognition for players who end up trusted but not rich, so wealth
    isn't the only path to a meaningful ending.
  - **Institution Builder** — a flavour line added to the ordinary "Pillar
    of the Community" tier, keyed to your single best-known occupation
    (Doctor, Professor, Hospital Manager, Farm Magnate, Business Man,
    Police Chief, or Fire Chief each get their own closing sentence).
  - **Deported** — a new forced, distinct ending: three police crackdowns
    while working Secret Society jobs now gets you seized and put on a
    ship under guard, separate from voluntarily buying passage home.
- Added two coda paragraphs that can stack onto any turn-40 survival
  ending: **Hollow Victory** (an active addiction at the end darkens an
  otherwise successful run) and **Made Peace with Staying** (remittances
  sent home but passage never bought).
- Added **Stowaway's Gamble**: from turn 30, a free but risky alternative
  to buying passage — roughly 50% chance of a clean, ticket-free getaway
  (its own "Stowaway" ending), 35% chance of getting caught and roughed up
  (costly but survivable, run continues), 15% chance of a serious beating
  (can be fatal). One attempt per run.
- Leaderboard Outcome column now also distinguishes Deported and Stowaway
  runs.

**v2.2**
- **Split the survival ending into three wealth-based tiers** (below $100,
  $101–$400, $401+), each with its own closing narrative — from a lifetime
  leaning on Clan Association and Secret Society support, to a comfortable
  middle-class family, to becoming one of the entrepreneurs and donors whose
  giving helped build institutions like Tan Tock Seng Hospital. See
  "Ending screens" below.
- **Added a fourth ending: Sojourner.** From turn 30 onward, players can buy
  passage home ($150) at any time, ending the run immediately instead of
  waiting for turn 40. Whether it's a triumphant return or a quiet,
  empty-handed one depends on combined wealth-in-hand + remittances sent
  home against a $500 threshold. See "Passage home & remittances" below.
- **Added Remittances**: a "Family & Passage" panel (shown every turn) lets
  players send $10/$25/$50 home. Money sent home can't be spent again in
  Singapore, but it counts toward the Sojourner ending total — modelling
  how migrants supported family back home over the course of a working
  life abroad.
- **Added a new stat: Social Capital**, representing community trust and
  standing (distinct from wealth or social status). See "Social Capital"
  below for how it's earned and which jobs it gates.
- Added a new "Support Clan Association" activity ($15, capped at 10 uses)
  as a second way to build Social Capital, alongside Donate to Charity
  (which now also grants +5 Social Capital per donation, uncapped, even
  after its misfortune-reduction effect maxes out).
- Leaderboard now shows an Outcome column distinguishing Died / Survived /
  Sojourner (Home) / Returned Empty-Handed.

**v2.1**
- Fixed a bug where players who survived all 40 turns never appeared on
  the leaderboard (deaths always did). See `REDEPLOY.md` for details.
- Rebalanced early-game difficulty (higher starting wealth for two races,
  a short "grace period" in turns 1-3) and late-game difficulty (wage
  debuff now touches high-status jobs too, rare wealth-crisis events,
  recurring status upkeep costs).
- Added the Volunteer Firefighter career as an entry point into the
  Fire Fighter career ladder.
- Added a Career Progress panel showing what's needed to unlock
  reachable-but-locked jobs.
- Tied the "Did you know?" quiz question to the event or job that just
  happened, added milestone flavor text, and added an end-of-run quiz
  review.
- Named the in-game currency (the Spanish dollar — also the likely
  origin of the "$" sign) with a new fact card introduced on turn 1.
- Added a seasonal Northeast Monsoon (roughly Nov-Mar in-game): flood
  risk is now concentrated in that season rather than flat all year,
  and exposed lodging (street, coolie shed) takes ongoing wear during it.

## What's included

```
survive-1840/
├── public/
│   └── index.html      # The entire game — data, rules, and UI
├── src/
│   └── index.js          # Minimal Worker: leaderboard API + static hosting
├── wrangler.toml
├── package.json
├── .gitignore
└── README.md
```

## How it works

- **Everyone plays as a guest.** Click "Play Now," pick a race, portrait,
  and trait, and you're straight into the game. All game rules run
  entirely in the browser — no network round-trip per action.
- **No saved games.** Progress lives only in memory for the current tab.
  Closing the tab or reloading starts fresh. This is a deliberate
  simplification — there's no account system to log back into.
- **One shared leaderboard.** When a run ends (death, or surviving all 40
  turns), the browser submits the result to the Worker, which appends it
  to a single KV-backed list. Every player, on every device, reads and
  writes the same board via `GET /api/leaderboard` and
  `POST /api/leaderboard/submit`.

The backend (`src/index.js`) is intentionally tiny — under 100 lines. It
doesn't know any game rules; it just validates and stores leaderboard
submissions, and serves the static frontend for everything else.

## Character creation

- **Name**, **Race** (Chinese / Indian / Malay / Eurasian), a **Portrait**
  (5 silhouette-style avatars per race — no facial features, just a
  headwear silhouette and accent colour, so nothing caricatures any
  group), and a **Special Trait**:
  - *Hard-working* — earns a $4-10 bonus on Low and Medium-low tier jobs
  - *Silver-spoon* — +$30 starting wealth, -15 starting health; earns an
    extra $10 on Medium-high or High tier jobs
  - *Lucky charm* — 50% chance to dodge a negative event
  - *Strong-body* — +25 starting health; required for certain physically
    demanding roles
  - *Quick Learner* — education costs 25% less
  - *Frugal* — food and lodging cost 20% less
  - *Charismatic* — will almost always find work (~2% no-work chance,
    ~7% if unwell)
  - *Iron Will* — half as likely to develop an opium or gambling addiction

## Random events

Every negative event carries a clear health and/or wealth impact:

| Event | Impact |
|---|---|
| Illness | -10 health, -10 wealth (or extra -5 health if you can't afford medicine) |
| Robbed | -15 to -30 wealth, -3 health |
| Food poisoning | -5 health |
| Monsoon flood | -5 health, -10 wealth |
| Epidemic | -10 health |
| Lost wages (dishonest agent) | zeroes out that day's job income entirely — can only happen on a turn you actually worked |
| Opium offer | -$5 whether or not you get addicted |
| Extra work | +$20-30, -2 health |
| Kind stranger | +3 health, +$5 |

**"New Immigrants Arrive"** no longer happens randomly — it's scheduled to
occur without fail on **turns 10, 18, and 26**, flooding the market with
cheap labour: Low/Medium-low/Medium tier jobs pay 50% less for 2 turns,
then 25% less for 2 more turns. Medium-high/High jobs are unaffected.
Every turn where no work is found (whether or not this event fires) logs:
*"You tried hard, but there was simply no work available. You return to
your quarters despondent."*

## Other Activities

Available on the job-seeking screen alongside Education:

- **Gamble ($5)** — 1% win $50, 4% win $10, 5% win $5, 50% lose the bet,
  40% lose an extra $5. Gambling more than 3 times in one turn causes a
  gambling addiction.
- **Gambling addiction** now forces one guaranteed automatic gamble every
  turn (not a random 1-5) until cured.
- **Attend Gambling Therapy ($50)** — cures a gambling addiction.
- **Cure Opium Addiction ($50)** — cures an opium addiction, which
  otherwise costs escalating health and wealth every turn (doubling every
  2 turns).
- **Donate to Charity ($20)** — reduces the chance of negative random
  events by 10 percentage points, stacking up to a maximum of 50% (5
  donations). Also grants **+5 Social Capital** per donation, with no cap —
  so donating keeps building your standing even after the misfortune
  reduction maxes out.
- **Support Clan Association ($15, up to 10 times)** — grants **+8 Social
  Capital**. Doesn't reduce misfortune the way charity does; represents
  investing in the clan network that (per the game's ending narratives)
  props up struggling members and is, in turn, propped up by the
  successful ones.
- **Leave Secret Society ($100, -50 health)** — removes secret society
  membership (which otherwise blocks police jobs and carries gang-fight
  and police-crackdown risks). Worth noting: **three police crackdowns**
  while working Secret Society jobs now ends the run entirely — see the
  new **Deported** ending below — so leaving early is also a way to
  avoid it.

## Social Capital

A new stat representing community trust and standing — separate from
wealth and from Social Status (which tracks how "respectable" your
station is; Social Capital tracks how much your community trusts you).

**Gained from:**
- Donating to Charity: +5 per donation (uncapped)
- Supporting your Clan Association: +8 per contribution (capped at 10
  lifetime uses, so +80 max from this source)
- Working a turn in a trust-facing / community-serving job: +1 to +3 per
  turn, depending on the role (see `JOB_SOCIAL_CAPITAL` in `index.html`) —
  Nanny, Postman, Post Office Worker/Manager, Teacher, University
  Lecturer, Professor, Nurse, Doctor's Assistant, Doctor, Hospital
  Worker/Manager, and Pharmacist all count
- Answering a "Did you know?" history question correctly: +1
- The Kind Stranger random event: +1

**Lost from:**
- Each turn an opium or gambling addiction is active: -1 Social Capital
  per addiction (in addition to the addiction's usual health/wealth cost)
- Secret Society membership halves Social Capital earned from otherwise
  community-facing jobs — respectable society trusts triad members less,
  no matter how community-minded the day job

**Gates these occupations** (in addition to their existing requirements —
see `SOCIAL_CAPITAL_REQUIREMENT` in `index.html`):

| Job | Social Capital required |
|---|---|
| Police Officer | 10 |
| Nurse | 10 |
| Teacher | 15 |
| Post Office Manager | 15 |
| Police Constable | 20 |
| University Lecturer | 20 |
| Business Man | 20 |
| Doctor | 25 |
| Hospital Manager | 25 |
| Fire Chief | 25 |
| Police Chief | 25 |
| Professor | 35 |

The idea: these are all roles where a community places unusual trust in
you — to teach its children, treat its sick, carry its mail, enforce its
laws, or lead its institutions — so reaching them takes more than money
or health; it takes a track record of visible, positive standing.
Thresholds are tunable — see `SOCIAL_CAPITAL_REQUIREMENT`.

## Unranked epilogue

Reaching turn 41 (the natural end of the 40-turn story) submits the run's
score to the leaderboard exactly as before, then offers a choice:
**"Keep Playing (Unranked)"** on the ending screen extends the same run
up to **turn 99** (`EPILOGUE_TURN_CAP`). A few things to know:

- Score submission (`submitScoreOnce`) is guarded by a `scoreSubmitted`
  flag that's already `true` by the time this option appears, so nothing
  from the epilogue is ever sent to the leaderboard — including if the
  player dies, gets deported, or reaches a Sojourner/Stowaway ending
  during it.
- The turn cap used everywhere in the engine (`getTurnCap(s)`) reads
  `state.continuedPastEnd` — 40 normally, 99 once the player opts in. All
  the turn-completion checks, the header's "Turn: X / Y" display, and
  the "Turns spent in Singapore" lines on the Sojourner/Deported/Stowaway
  endings use this dynamically, so nothing is hardcoded to 40 anymore.
- The in-game calendar (`getGameYear`/`getGameQuarter`) no longer clamps
  at turn 40 — it keeps advancing at the same 4-turns-per-year pace, so
  turn 99 lands around **1864**.
- All other systems (jobs, events, addictions, Social Capital, Home
  Ownership, remittances, Deportation, Stowaway, Sojourner) keep working
  exactly as before during the epilogue — it's the same simulation,
  just past its original endpoint and no longer scored.
- If the player reaches turn 99 during the epilogue, the ending screen
  recalculates fresh from whatever their stats are at that point (wealth
  tier or special ending, Legacy Score, etc.) and shows a closing note
  instead of the "Keep Playing" button, since there's nowhere further to go.

## Home Ownership

A reward for players who've clearly made it, not a starter option:

- **To buy**: 25+ Social Capital, Medium social status or higher, and
  enough wealth to cover today's asking price plus a $200 cushion (so
  buying never leaves you destitute). See `PROPERTY_SC_REQUIREMENT`,
  `PROPERTY_MIN_STATUS_RANK`, `PROPERTY_CASH_CUSHION`.
- **The price fluctuates** — starts at $450 (`PROPERTY_BASE_PRICE`),
  drifts up ~0.4%/turn on its own (the colony is growing), plus light
  random noise, plus event-driven shocks: Monsoon Flood and Epidemic
  events push it down, a scheduled New Immigrants wave pushes it up, and
  a Wealth Crisis (already an existing late-game event) cools the market
  generally. Clamped between $300 and $900.
- **Once owned**: replaces per-turn rent entirely with a small flat
  maintenance fee (~$3/turn, further discounted by the Frugal trait),
  gives better health (+6/turn) and lodging risk (-0.15) than even a
  Proper Room, and adds +1 Social Capital/turn from being a known
  homeowner. The "Choose Lodging" panel is skipped entirely while you own
  a home.
- **Selling** is the player's choice, any time, at 70% of the *current*
  market price (`PROPERTY_SELL_RATE`) — not the original purchase price.
  Since the market moves independently of what you paid, timing the sale
  is a real decision: sell during a boom and even the 30% resale friction
  can still net a profit; sell during a slump and you can lose money
  beyond the friction alone.
- **What happens to it at game-end** depends on how the run ends:
  - **Survive to turn 40** (any of the three tiers, or a special ending) —
    the home is simply kept; it shows up as a status line on the ending
    screen rather than being cashed out.
  - **Sojourner** (voluntary passage) — auto-liquidated (sold at the
    current market rate) before departure, since buying a ticket is a
    planned decision. The proceeds count toward the $500 Sojourner
    threshold.
  - **Deported** or a successful **Stowaway** — the home is simply
    abandoned with no compensation, since both are sudden, forced, or
    clandestine departures with no time for a proper sale. This is the
    real downside risk of ownership: the more you've invested in a home,
    the more you stand to lose if one of these endings catches you.

## Passage home & remittances

- **Remittances**: from turn 1, players can send $10/$25/$50 home each
  turn via the "Family & Passage" panel. That money leaves the player's
  wealth for good (can't be spent again in Singapore) but accumulates in
  `state.remittance` as a running total.
- **Passage home**: from turn 30 onward, players can buy passage home for
  **$150**, ending the run immediately regardless of the turn count.
- **Stowaway's Gamble**: also from turn 30, a free alternative — one
  attempt per run. Rolls: **50%** a clean getaway (ends the run as its
  own Stowaway ending, no $500 threshold involved), **35%** caught and
  roughed up (-$25, -15 health, lose 2 turns, run continues), **15%**
  caught badly (-45 health, can be fatal via the normal death check).
- **Sojourner ending**: on departure, `remaining wealth + total
  remittance` is compared against a **$500** threshold.
  - **$500 or more** → *Sojourner — A Triumphant Return*: the player made
    the voyage twice, came home with something to show for the years
    abroad, and is a rare success story among migrants who intended to
    return all along.
  - **Below $500** → *Sojourner — Returned Empty-Handed*: the more common
    story — years of labour in a foreign port followed by a return that
    feels smaller than the leaving. Still alive, still home, but the
    fortune stayed out of reach.

  Both are separate from Death and from the turn-40 Survived endings —
  buying passage home ends the run the moment it's purchased.

## Ending screens

**Survived (40 turns) — three baseline tiers by final wealth, plus special
overrides:**
1. **Below $100** — *A Life of Struggle*: survived, married, had a family,
   but continues to lean on Clan Association and Secret Society support.
2. **$101–$400** — *A Middle-Class Life*: settled into a comfortable
   middle-class family life and gives back to Clan associations.
3. **$401+** — *Pillar of the Community*: rose above a hard decade; the
   kind of donor whose giving helped build institutions like Tan Tock
   Seng Hospital. Gets an extra sentence if your best-known occupation is
   Doctor, Professor, Hospital Manager, Farm Magnate, Business Man,
   Police Chief, or Fire Chief (see `INSTITUTION_BUILDER_TEXT`).

Reaching this screen also offers **"Keep Playing (Unranked)"** — see
"Unranked epilogue" below. The screen itself doesn't change based on
whether it's turn 41 or turn 100; it's always a fresh read of the
player's current stats (so the tier, or which special ending applies,
can change between the initial ending and however the epilogue turns out).

Three rarer endings can override tiers 1–3 entirely (checked in this
order — see `getSpecialEnding`):
- **Named Benefactor** ($800+ wealth, 50+ Social Capital) — an
  ultra-rare tier above "Pillar of the Community."
- **Shadow Power** ($401+ wealth, under 10 Social Capital, 10+ turns in
  the Secret Society ladder or reaching Secret Society Head) — rich and
  influential, but never trusted by respectable society.
- **Community Elder** (under $401 wealth, 60+ Social Capital) — poor in
  coin, but the most trusted person in the district.

Two coda paragraphs can stack onto *any* of the above:
- **Hollow Victory** — appears if an opium or gambling addiction is still
  active at turn 40, regardless of wealth.
- **Made Peace with Staying** — appears if remittances were sent home
  but passage was never bought.

Every survival ending shows Final Wealth, Health, Status, Social Capital,
whether you own a home in the district, money sent home (if any), a
computed Legacy Score, your highest-ranked occupation ever held, and the
occupation you worked the most turns in.

**Sojourner (from turn 30, any time):** buying passage home ends the run
immediately. Shows turns spent in Singapore, wealth at departure, total
remittances, the combined total against the $500 threshold, and whether
it's a Triumphant Return or a Returned Empty-Handed ending — see
"Passage home & remittances" below.

**Stowaway (from turn 30, one attempt):** a free, ticket-less getaway —
see "Passage home & remittances" below. Not evaluated against the $500
threshold; the point of this ending is that it doesn't need one.

**Deported:** a forced, disgraced ending distinct from choosing to leave
— three police crackdowns while working Secret Society jobs gets you
seized and marched to the harbour under guard. Shows turns survived,
wealth, remittances sent (if any), health, status, and Social Capital.

**Died:** turns survived, a short specific cause of death, Final Wealth,
Health, Status, and the same two occupation fields (unchanged). A failed
Stowaway attempt can also end in death if the beating is severe enough.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier is fine)
- [Node.js](https://nodejs.org/) 18+
- The [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (installed via `npm install` below)

## Deploy

```bash
cd survive-1840
npm install
npx wrangler login
npx wrangler kv namespace create GAME_KV
```

Paste the returned `id` into `wrangler.toml`, replacing
`REPLACE_WITH_YOUR_KV_NAMESPACE_ID`. For local dev, also run
`npx wrangler kv namespace create GAME_KV --preview` and paste that id
into the commented-out `preview_id` line.

```bash
npm run dev      # optional local preview
npm run deploy    # publish
```

Wrangler prints your live URL, e.g. `https://survive-1840.<your-subdomain>.workers.dev`.
Open it and the game loads directly — no separate hosting needed.

## Updating the game later

All game data and rules live in `public/index.html` (the `<script>`
block near the top has the data: `RACES`, `TRAITS`, `JOBS`, `EVENTS`,
`FACTS`, etc.). Edit it directly and run `npm run deploy` again.
`src/index.js` only needs changes if you want to adjust leaderboard
validation or storage limits.
