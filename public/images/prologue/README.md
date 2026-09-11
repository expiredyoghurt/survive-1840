# Prologue illustrations

Drop image files here with these exact names and the game will pick them
up automatically — no code changes needed. Until a file exists, that
screen just renders without an image (see `illustration()` in
`index.html` for the graceful-degradation logic). All rows below are
filled as of this writing.

| Screen | File | Used for |
|---|---|---|
| "Why I Left" (per race) | `chinese_departure.jpg` | Chinese character's departure scene |
| | `indian_departure.jpg` | Indian character's departure scene |
| | `malay_departure.jpg` | Malay character's departure scene |
| | `eurasian_departure.jpg` | Eurasian character's departure/family scene |
| "The Passage" (per race) | `chinese_voyage.jpg` | Chinese character's voyage scene |
| | `indian_voyage.jpg` | Indian character's voyage scene |
| | `malay_voyage.jpg` | Malay character's voyage scene |
| | `eurasian_voyage.jpg` | Eurasian character's voyage scene |
| "Arrival" | `arrival.jpg` | Shared across all races — arrival at the Singapore River |

Note: the voyage screen used to share a single `voyage.jpg` across every
race before per-race journey art existed. It's now looked up as
`{race}_voyage.jpg`, matching the departure screen's pattern exactly —
see `renderPrologue2()` in `index.html`.

**Format guidance:** JPG or WebP, ideally under ~150KB each (these load
on every new game, so keep them light), roughly 4:3 or 16:9 — the CSS
already caps them at `max-width:100%` so exact dimensions aren't
critical, just keep the aspect ratio sane for a single-column mobile layout.

This directory (`public/images/`) is served automatically by the
existing Cloudflare Worker's static-asset binding — no `wrangler.toml`
or `src/index.js` changes needed to add files here.
