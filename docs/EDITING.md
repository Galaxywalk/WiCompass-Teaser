# Editing workflow

Read [VIDEO_GENERATION_SPEC.md](VIDEO_GENERATION_SPEC.md) before changing typography, hierarchy, figures, palette, or duration. It is the normative design contract; this file describes the mechanics of making a change.

The current nine-scene order is `cover` → `actions` → `efficiency` → `method` → `coverage` → `simulation` → `realworld` → `summary` → `back`. Its scientific spine is Question → Insight → Mechanism → Evidence → Vision; preserve that order when revising copy or timing.

## Change wording without changing design

Edit the relevant scene in `index.html`. If the wording contains a measured result, add or update a derived value in `content/facts.js` and bind it with `data-fact`; do not copy a number from the chart into HTML.

Edit captions, narration, durations, or review-frame times in `content/timeline.js`. During timing work, the placeholder audio may be rebuilt. After script and picture lock, generate the final English WAV with the local Kokoro command in `VIDEO_GENERATION_SPEC.md`, derive `assets/audio/voiceover.m4a`, and run `npm run check`.

## Change paper data

Edit `content/chart-data.js`. Chart rendering, annotations, and any bound facts then update from that source. Run:

```bash
npm run check
npm run frame -- --scene realworld
```

## Change visual format

Edit `styles/tokens.css` for global design decisions, `styles.css` for shared layouts/animation, and the relevant file under `styles/migrated/` for a migrated scene family. Do not put colors, fonts, or pixel layout values in content or runtime modules. `method` and `coverage` remain the only pending visual migrations; redesign them as one coherent mechanism sequence.

## Add a scene

1. Add one semantic `<article class="scene …" data-scene="new-id">` to `index.html` in display order.
2. Add the matching timeline entry to `content/timeline.js` in exactly the same position.
3. Prefer an existing layout vocabulary: cover, slide/chart, method diagram, two-column evidence, summary, or back cover.
4. Add factual data to a content module; add JavaScript only when the visual needs genuinely new behavior.
5. Run `npm run check`, render the new scene with `npm run frame -- --scene new-id`, then run `npm run stills`.

The validator rejects duplicate IDs, order drift, review frames outside their scene, total duration over 90 seconds, malformed chart data, missing assets, unauthorized font sizes, stale narration text, and audio/timeline duration mismatch.

Adding a scene is exceptional: first check whether its point can replace secondary copy in the existing Question → Insight → Mechanism → Evidence → Vision structure while keeping the cut in the 82–87 second working range.

## Review motion efficiently

- One exact slide: `npm run frame -- --scene coverage`
- One scene at 1×: `npm run record:draft -- --scene coverage`
- Whole film at 6×: `npm run record:preview`
- Whole film at 1×, fast encode: `npm run record:draft`
- Delivery draft: `npm run record`

Use the 1× scene recording for animation timing. The 6× preview is intended for layout, ordering, and transition checks.
