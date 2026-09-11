/* =========================================================================
   Survive 1840 — Cloudflare Worker backend
   =========================================================================
   Every PLAYER plays as a guest — there are no player accounts,
   passwords, or server-saved games. All gameplay logic runs client-side
   in public/index.html. This Worker hosts:

     1. The static frontend (via the ASSETS binding).
     2. A single shared, cross-platform leaderboard in KV, so every
        player's finished run — from any device, any browser — shows up
        on the same board.
     3. Two lightweight, secret-gated roles layered on top of the guest
        model — NOT real accounts, just a single fixed username each
        (for display only) plus a shared password checked against a
        Worker secret:
          - Admin, username "Palpatine": can view the full leaderboard
            and delete/reset entries, and can set feature flags. Gated
            by the ADMIN_PASSWORD secret, sent as the X-Admin-Password
            header.
          - Beta tester, username "Kirito": unlocks client-side access
            to work-in-progress features (gated behind feature flags
            set to "beta"). Gated by the BETA_PASSWORD secret, verified
            server-side so it never ships in the client bundle — but
            the unlock itself is a soft, client-stored flag
            (localStorage), a visibility gate for early testers, not a
            security boundary.
        The usernames aren't secret and aren't part of the auth check
        (there's only one of each) — they're just fixed display text,
        exposed via GET /api/config so the login screens always match
        whatever's set below without editing the frontend separately.

   REQUIRED SECRETS (set with `npx wrangler secret put <NAME>`, never
   committed to source):
     ADMIN_PASSWORD — Palpatine's password. Until this is set, every
                      /api/admin/* route fails closed (401).
     BETA_PASSWORD  — Kirito's password. Until this is set,
                      /api/beta/verify always returns { valid: false }.

   KV layout (binding: GAME_KV):
     leaderboard   -> JSON array of stored results, each with a unique id
     config:flags  -> JSON object of feature flags, see DEFAULT_FLAGS
   ========================================================================= */

const VALID_RACES = ["Chinese", "Indian", "Malay", "Eurasian"];
const VALID_STATUSES = ["dead", "alive", "sojourner-win", "sojourner-loss", "deported", "stowaway"];

// Fixed, non-secret display names for the two roles. Not part of the
// auth check itself (each role only ever has one password), just what
// the login screens greet the person with.
const ADMIN_USERNAME = "Palpatine";
const BETA_USERNAME = "Kirito";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

/* =========================
   ADMIN AUTH
   A single shared password, not a per-admin login. Fails closed: if
   ADMIN_PASSWORD hasn't been configured as a secret yet, every admin
   route is unreachable rather than accidentally open.
========================= */
function isAdminAuthorized(request, env) {
  const provided = request.headers.get("X-Admin-Password") || "";
  return Boolean(env.ADMIN_PASSWORD) && provided === env.ADMIN_PASSWORD;
}
function requireAdmin(request, env) {
  return isAdminAuthorized(request, env) ? null : json({ error: "Unauthorized." }, 401);
}

/* =========================
   LEADERBOARD
========================= */
const LEADERBOARD_KEY = "leaderboard";
const LEADERBOARD_STORE_CAP = 200;
const LEADERBOARD_RETURN_CAP = 20;

async function readLeaderboard(env) {
  const raw = await env.GAME_KV.get(LEADERBOARD_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeLeaderboard(env, board) {
  await env.GAME_KV.put(LEADERBOARD_KEY, JSON.stringify(board.slice(0, LEADERBOARD_STORE_CAP)));
}

async function appendLeaderboard(env, entry) {
  const board = await readLeaderboard(env);
  // id/submittedAt are always server-assigned — never taken from the
  // submitted entry — so a player can never spoof or collide with them.
  board.push({ ...entry, id: crypto.randomUUID(), submittedAt: Date.now() });
  board.sort((a, b) => b.turn - a.turn || b.wealth - a.wealth || b.health - a.health);
  await writeLeaderboard(env, board);
}

/* =========================
   LEADERBOARD MODE (Global / Classroom)
   Admin-controlled, non-destructive: "classroom" mode filters what
   GET /api/leaderboard returns to entries submitted after a stored
   epoch timestamp, so a teacher can show just their class's results
   without deleting the global history underneath it. Switching back to
   "global" reveals everything ever submitted, unfiltered — nothing is
   ever lost by toggling. Submissions are always recorded in full
   regardless of mode; only reads are affected.
========================= */
const LEADERBOARD_MODE_KEY = "config:leaderboardMode";
const LEADERBOARD_EPOCH_KEY = "config:classroomEpoch";
const DEFAULT_LEADERBOARD_MODE = "global";
const VALID_LEADERBOARD_MODES = ["global", "classroom"];

async function readLeaderboardMode(env) {
  const raw = await env.GAME_KV.get(LEADERBOARD_MODE_KEY);
  return VALID_LEADERBOARD_MODES.includes(raw) ? raw : DEFAULT_LEADERBOARD_MODE;
}

async function readClassroomEpoch(env) {
  const raw = await env.GAME_KV.get(LEADERBOARD_EPOCH_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

async function handleAdminLeaderboardModeSet(request, env) {
  const body = await request.json();
  const mode = body.mode;
  if (!VALID_LEADERBOARD_MODES.includes(mode)) {
    return json({ error: "mode must be \"global\" or \"classroom\"." }, 400);
  }
  await env.GAME_KV.put(LEADERBOARD_MODE_KEY, mode);
  return json({ leaderboardMode: mode });
}

// Non-destructive: only re-stamps the epoch used to filter reads in
// classroom mode. Never touches the underlying stored leaderboard data.
async function handleAdminNewClassroomSession(env) {
  const epoch = Date.now();
  await env.GAME_KV.put(LEADERBOARD_EPOCH_KEY, String(epoch));
  await env.GAME_KV.put(LEADERBOARD_MODE_KEY, "classroom");
  return json({ leaderboardMode: "classroom", classroomEpoch: epoch });
}

// Public read: display fields only. id/submittedAt are internal
// bookkeeping for admin moderation, not something the public API needs
// to expose.
async function handleLeaderboardGet(env) {
  const board = await readLeaderboard(env);
  const mode = await readLeaderboardMode(env);
  let visible = board;
  if (mode === "classroom") {
    const epoch = await readClassroomEpoch(env);
    visible = board.filter(e => (e.submittedAt || 0) >= epoch);
  }
  const trimmed = visible.slice(0, LEADERBOARD_RETURN_CAP).map(e => ({
    name: e.name, race: e.race, turn: e.turn, wealth: e.wealth, health: e.health, status: e.status
  }));
  return json({ leaderboard: trimmed, leaderboardMode: mode });
}

async function handleLeaderboardSubmit(request, env) {
  const body = await request.json();
  const name = String(body.name || "").trim().slice(0, 40);
  const race = body.race;
  const turn = Number(body.turn);
  const wealth = Number(body.wealth);
  const health = Number(body.health);
  const status = VALID_STATUSES.includes(body.status) ? body.status : "alive";

  if (!name) return json({ error: "Name is required." }, 400);
  if (!VALID_RACES.includes(race)) return json({ error: "Invalid race." }, 400);
  if (!Number.isFinite(turn) || turn < 1 || turn > 41) return json({ error: "Invalid turn." }, 400);
  if (!Number.isFinite(wealth) || wealth < 0) return json({ error: "Invalid wealth." }, 400);
  if (!Number.isFinite(health) || health < 0) return json({ error: "Invalid health." }, 400);

  await appendLeaderboard(env, {
    name,
    race,
    turn: Math.min(Math.round(turn), 41),
    wealth: Math.round(wealth),
    health: Math.round(health),
    status
  });
  return json({ success: true });
}

// Admin: full, unpaginated board including id/submittedAt, so entries
// can be individually targeted for deletion.
async function handleAdminLeaderboardGet(env) {
  const board = await readLeaderboard(env);
  return json({ leaderboard: board, leaderboardMode: await readLeaderboardMode(env), classroomEpoch: await readClassroomEpoch(env) });
}

async function handleAdminLeaderboardDelete(request, env) {
  const body = await request.json();
  const id = String(body.id || "");
  if (!id) return json({ error: "id is required." }, 400);
  const board = await readLeaderboard(env);
  const next = board.filter(e => e.id !== id);
  if (next.length === board.length) return json({ error: "No entry with that id." }, 404);
  await writeLeaderboard(env, next);
  return json({ success: true, remaining: next.length });
}

async function handleAdminLeaderboardReset(env) {
  await writeLeaderboard(env, []);
  return json({ success: true });
}

/* =========================
   FEATURE FLAGS
   Each flag's value is one of:
     true   -> enabled for everyone
     false  -> disabled for everyone
     "beta" -> enabled only for verified beta testers
   Add new WIP features here as they're built; the frontend checks them
   with isFeatureEnabled(name) rather than hardcoding behavior.
========================= */
const CONFIG_KEY = "config:flags";
const DEFAULT_FLAGS = {
  epilogue: true, // the turn 41-99 unranked "Keep Playing" epilogue (see README v2.5)
  prologue: "beta", // race-specific prologue + Passage Debt mechanic (see README v2.8) - unproven, beta-gated
  autosave: "beta", // localStorage autosave/resume (see README v2.10) - touches the hottest code path (render()), beta-gated until proven
  loanshark: "beta" // voluntary, compounding-interest loan sharks (see README v2.18) - new predatory-debt mechanic, unproven, beta-gated
};
const VALID_FLAG_VALUES = [true, false, "beta"];

async function readFlags(env) {
  const raw = await env.GAME_KV.get(CONFIG_KEY);
  const stored = raw ? JSON.parse(raw) : {};
  return { ...DEFAULT_FLAGS, ...stored };
}

async function handleConfigGet(env) {
  return json({ flags: await readFlags(env), usernames: { admin: ADMIN_USERNAME, beta: BETA_USERNAME }, manualMode: await readManualMode(env) });
}

async function handleAdminConfigSet(request, env) {
  const body = await request.json();
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return json({ error: "Body must be an object of flagName -> true|false|\"beta\"." }, 400);
  }
  const current = await readFlags(env);
  const updated = { ...current };
  for (const [name, value] of Object.entries(body)) {
    if (VALID_FLAG_VALUES.includes(value)) updated[name] = value;
  }
  await env.GAME_KV.put(CONFIG_KEY, JSON.stringify(updated));
  return json({ flags: updated });
}

/* =========================
   PLAYER MANUAL MODE
   Which in-game "How to Play" screen players see: "detailed" (exact
   costs/thresholds, a full ending reference) or "brief" (vague, no
   numbers, endings only mentioned in passing — see DETAILED_MANUAL_HTML
   / BRIEF_MANUAL_HTML in index.html). Admin-settable, not a feature
   flag — it's a content choice, not an on/off/beta rollout, so it gets
   its own tiny KV key rather than overloading VALID_FLAG_VALUES.
========================= */
const MANUAL_CONFIG_KEY = "config:manual";
const DEFAULT_MANUAL_MODE = "detailed";
const VALID_MANUAL_MODES = ["detailed", "brief"];

async function readManualMode(env) {
  const raw = await env.GAME_KV.get(MANUAL_CONFIG_KEY);
  return VALID_MANUAL_MODES.includes(raw) ? raw : DEFAULT_MANUAL_MODE;
}

async function handleAdminManualSet(request, env) {
  const body = await request.json();
  const mode = body.mode;
  if (!VALID_MANUAL_MODES.includes(mode)) {
    return json({ error: "mode must be \"detailed\" or \"brief\"." }, 400);
  }
  await env.GAME_KV.put(MANUAL_CONFIG_KEY, mode);
  return json({ manualMode: mode });
}

/* =========================
   BETA PASSWORD VERIFICATION
   Server-side check only, so the password never ships in the client
   bundle. The unlock itself is a soft client-side flag afterward — see
   the header comment above. A single shared password for the single
   "Kirito" identity — not a per-tester login.
========================= */
async function handleBetaVerify(request, env) {
  const body = await request.json();
  const password = String(body.password || "").trim();
  const valid = Boolean(env.BETA_PASSWORD) && password.length > 0 && password === env.BETA_PASSWORD;
  return json({ valid });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        const method = request.method;
        const path = url.pathname;

        if (method === "GET" && path === "/api/leaderboard") return await handleLeaderboardGet(env);
        if (method === "POST" && path === "/api/leaderboard/submit") return await handleLeaderboardSubmit(request, env);
        if (method === "GET" && path === "/api/config") return await handleConfigGet(env);
        if (method === "POST" && path === "/api/beta/verify") return await handleBetaVerify(request, env);

        if (path.startsWith("/api/admin/")) {
          const authError = requireAdmin(request, env);
          if (authError) return authError;
          if (method === "GET" && path === "/api/admin/leaderboard") return await handleAdminLeaderboardGet(env);
          if (method === "POST" && path === "/api/admin/leaderboard/delete") return await handleAdminLeaderboardDelete(request, env);
          if (method === "POST" && path === "/api/admin/leaderboard/reset") return await handleAdminLeaderboardReset(env);
          if (method === "POST" && path === "/api/admin/leaderboard/mode") return await handleAdminLeaderboardModeSet(request, env);
          if (method === "POST" && path === "/api/admin/leaderboard/new-session") return await handleAdminNewClassroomSession(env);
          if (method === "POST" && path === "/api/admin/config") return await handleAdminConfigSet(request, env);
          if (method === "POST" && path === "/api/admin/manual") return await handleAdminManualSet(request, env);
        }

        return json({ error: "Not found." }, 404);
      } catch (err) {
        return json({ error: "Server error: " + (err && err.message ? err.message : String(err)) }, 500);
      }
    }

    // Everything else is the static frontend (the whole game).
    return env.ASSETS.fetch(request);
  }
};
