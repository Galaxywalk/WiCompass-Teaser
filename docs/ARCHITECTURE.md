# Architecture

The repository has three intentional layers. A change should normally touch only one.

Visual decisions must follow [VIDEO_GENERATION_SPEC.md](VIDEO_GENERATION_SPEC.md). The architecture describes where a decision belongs; the specification defines which decisions are allowed.

## Content

- `index.html`: semantic scene structure and ordinary explanatory copy.
- `content/timeline.js`: scene order, duration, review frame, caption, and narration.
- `content/project.js`: title, venue, authors, institutions, and repository URL.
- `content/chart-data.js`: paper measurements and chart semantics.
- `content/facts.js`: human-readable claims derived from chart data; do not duplicate those numbers in HTML.
- `content/procedural-data.js`: deterministic seeds and membership data for generated visuals.

`data-fact`, `data-project-*`, and chart mount IDs connect semantic HTML to content sources. These bindings are resolved by reusable functions in `src/scenes/`.

## Format

- `styles/tokens.css`: the currently implemented legacy palette, font face, and five-size type scale. The next format migration must replace these with the four locked tokens in `VIDEO_GENERATION_SPEC.md`.
- `styles.css`: layout components, scene formats, and CSS timeline animation.

JavaScript chart configs use semantic series names, while CSS owns their color and appearance. Until the planned typography migration, `npm run check` continues to enforce the legacy token names so ad-hoc sizes cannot spread further. After migration it must enforce the specification's 96/56/36/26 px tokens and 24 px minimum.

## Functionality

- `src/core/`: DOM contracts, player, controls, and utilities.
- `src/charts/`: generic SVG line and grouped-bar renderers.
- `src/scenes/`: small adapters for content bindings and deterministic scene visuals.
- `src/main.js`: composition root only.
- `app.js`: stable browser entry point only.

The player derives timeline position from the play-start wall clock. It does not accumulate frame deltas, so browser frame drops cannot stretch the timeline and cause the recorder to trim the cover.

## Production tools

- `scripts/lib/capture-session.mjs`: dynamic local server, Chromium, fonts/images, diagnostics, cleanup.
- `scripts/lib/frames.mjs`: deterministic timeline frame capture.
- `scripts/lib/media.mjs`: FFprobe and FFmpeg helpers.
- `scripts/frame.mjs`, `stills.mjs`, `record.mjs`: thin commands built on those helpers.
- `scripts/validate-content.mjs`: content, schema, asset, typography, timing, and audio contract checks.

The local server uses an OS-assigned port for automated capture, so `npm run dev`, still rendering, and recording do not conflict.
