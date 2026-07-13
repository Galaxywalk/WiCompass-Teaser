# Architecture

The repository has three intentional layers. A change should normally touch only one.

Visual decisions must follow [VIDEO_GENERATION_SPEC.md](VIDEO_GENERATION_SPEC.md). The architecture describes where a decision belongs; the specification defines which decisions are allowed.

The current timeline has eight scenes and runs 84.1 seconds. Its content order is `cover`, Question (`actions`), Insight (`efficiency`), Mechanism (`method`), Evidence (`simulation`, `realworld`), Vision (`summary`), and `back`.

Narrative typography is centralized in `styles/migrated/typography.css`. Scene styles own geometry and scientific figure presentation, but may not redefine `.scene-kicker`, `.scene-headline`, `.scene-footer`, or `.scene-support`. Cover and back-cover identity typography remains in `styles/migrated/identity.css`.

## Content

- `index.html`: semantic scene structure and ordinary explanatory copy.
- `content/timeline.js`: scene order, duration, review frame, and narration.
- `content/project.js`: title, venue, authors, institutions, and repository URL.
- `content/chart-data.js`: paper measurements and chart semantics.
- `content/facts.js`: human-readable claims derived from chart data; do not duplicate those numbers in HTML.
- `content/procedural-data.js`: deterministic seeds and membership data for generated visuals.

`data-fact`, `data-project-*`, and chart mount IDs connect semantic HTML to content sources. These bindings are resolved by reusable functions in `src/scenes/`.

## Format

- `styles/tokens.css`: font faces, semantic palette, motion variables, and the four locked 96/56/36/26 px specification tokens.
- `styles.css`: shared shell, layout components, chart primitives, and CSS timeline animation.
- `styles/migrated/`: focused presentation overrides for scene families already moved to the new system.

JavaScript chart configs use semantic series names, while CSS owns their color and appearance. All eight scenes are migrated. New scene work must use Inter, reserve JetBrains Mono for math/code, use only the four specification tokens, and keep all visible text at least 24 px.

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
