# Architecture

The repository has three intentional layers. A change should normally touch only one.

## Content

- `index.html`: semantic scene structure and ordinary explanatory copy.
- `content/timeline.js`: scene order, duration, review frame, caption, and narration.
- `content/project.js`: title, venue, authors, institutions, and repository URL.
- `content/chart-data.js`: paper measurements and chart semantics.
- `content/facts.js`: human-readable claims derived from chart data; do not duplicate those numbers in HTML.
- `content/procedural-data.js`: deterministic seeds and membership data for generated visuals.

`data-fact`, `data-project-*`, and chart mount IDs connect semantic HTML to content sources. These bindings are resolved by reusable functions in `src/scenes/`.

## Format

- `styles/tokens.css`: palette, font face, and the locked five-size type scale.
- `styles.css`: layout components, scene formats, and CSS timeline animation.

JavaScript chart configs use semantic series names, while CSS owns their color and appearance. New content must use one of `--type-utility`, `--type-body`, `--type-deck`, `--type-title`, or `--type-hero`; `npm run check` enforces this.

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
