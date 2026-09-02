/* =========================================================================
   Survive 1840 — Cloudflare Worker backend
   =========================================================================
   Every player plays as a guest — there are no accounts, passwords, or
   server-saved games. All gameplay logic runs client-side in
   public/index.html. This Worker has exactly two jobs:

     1. Serve the static frontend (via the ASSETS binding).
     2. Host a single shared, cross-platform leaderboard in KV, so every
        player's finished run — from any device, any browser — shows up
        on the same board.

   KV layout (binding: GAME_KV):
     leaderboard -> JSON array of stored results
   ========================================================================= */

const VALID_RACES = ["Chinese", "Indian", "Malay", "Eurasian"];
const VALID_STATUSES = ["dead", "alive", "sojourner-win", "sojourner-loss", "deported", "stowaway"];

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

const LEADERBOARD_KEY = "leaderboard";
const LEADERBOARD_STORE_CAP = 200;
const LEADERBOARD_RETURN_CAP = 20;

async function readLeaderboard(env) {
  const raw = await env.GAME_KV.get(LEADERBOARD_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function appendLeaderboard(env, entry) {
  const board = await readLeaderboard(env);
  board.push(entry);
  board.sort((a, b) => b.turn - a.turn || b.wealth - a.wealth || b.health - a.health);
  await env.GAME_KV.put(LEADERBOARD_KEY, JSON.stringify(board.slice(0, LEADERBOARD_STORE_CAP)));
}

async function handleLeaderboardGet(env) {
  const board = await readLeaderboard(env);
  return json({ leaderboard: board.slice(0, LEADERBOARD_RETURN_CAP) });
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        if (request.method === "GET" && url.pathname === "/api/leaderboard") return await handleLeaderboardGet(env);
        if (request.method === "POST" && url.pathname === "/api/leaderboard/submit") return await handleLeaderboardSubmit(request, env);
        return json({ error: "Not found." }, 404);
      } catch (err) {
        return json({ error: "Server error: " + (err && err.message ? err.message : String(err)) }, 500);
      }
    }

    // Everything else is the static frontend (the whole game).
    return env.ASSETS.fetch(request);
  }
};
