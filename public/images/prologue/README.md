# Prologue illustrations — expected files

Drop image files here with these exact names and the game will pick them
up automatically — no code changes needed. Until a file exists, that
screen just renders without an image (see `illustration()` in
`index.html` for the graceful-degradation logic).

| Screen | Expected file | Used for |
|---|---|---|
| "Why I Left" (per race) | `chinese_departure.jpg` | Chinese character's departure scene |
| | `indian_departure.jpg` | Indian character's departure scene |
| | `malay_departure.jpg` | Malay character's departure scene |
| | `eurasian_departure.jpg` | Eurasian character's departure/family scene |
| "The Passage" / "Coming to Singapore" | `voyage.jpg` | Shared across all races — a ship bound for Singapore |
| "Arrival" | `arrival.jpg` | Shared across all races — arrival at the Singapore River |

Suggested prompts for each are in the chat history (the "storyboard" pass
that preceded this feature) — woodcut/sepia/period-illustration style,
same style block used for the ending/budget/backdrop illustrations
discussed there.

**Format guidance:** JPG or WebP, ideally under ~150KB each (these load
on every new game, so keep them light), roughly 4:3 or 16:9 — the CSS
already caps them at `max-width:100%` so exact dimensions aren't
critical, just keep the aspect ratio sane for a single-column mobile layout.

This directory (`public/images/`) is served automatically by the
existing Cloudflare Worker's static-asset binding — no `wrangler.toml`
or `src/index.js` changes needed to add files here.
