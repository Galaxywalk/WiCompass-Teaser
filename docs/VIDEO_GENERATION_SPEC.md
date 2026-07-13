# WiCompass teaser video generation specification

This document is normative for future teaser revisions. It defines one visual system for the entire video; individual scenes must not invent their own typography, palette, or figure language.

The pixel sizes below assume the current 1280×720 render canvas. If the canvas resolution changes, scale the entire type system proportionally rather than changing individual levels independently.

For 1280×720 production, use four locked tokens: **96 px / 56 px / 36 px / 26 px**. The ranges below define the permitted calibration range for each level, not permission to choose a new size for every element. Recalibrate a level only as a global system change.

## 1. Typography

Use exactly two font roles:

- **Primary font: Inter.** Use it for titles, headlines, explanations, labels, captions, and axes.
- **Math/code font: JetBrains Mono.** Use it only for equations, mathematical symbols that need a monospaced treatment, tensor shapes, code, and structured sample records.

Do not introduce additional display, body, handwritten, or decorative typefaces.

### Level 1 — Hero title

Use for the single opening statement or the strongest closing statement.

Example: `Sparse Radar, Rich Human Motion`

- Size: **80–120 px**
- Locked 720p token: **96 px**
- Role: the dominant idea of the frame
- Use sparingly; most scenes do not need Level 1 text

### Level 2 — Section headline

Use for scene-level headings.

Examples: `The Challenge`, `Our Key Insight`, `Results`

- Size: **48–64 px**
- Locked 720p token: **56 px**
- One section headline per scene

### Level 3 — Normal explanation

Use for the main explanatory sentence.

Example: `Radar observes only sparse reflections.`

- Size: **32–40 px**
- Locked 720p token: **36 px**
- Keep it short enough to read without competing with the figure

### Level 4 — Annotation

Use for arrow labels, figure annotations, legends, axes, and short supporting labels.

- Size: **24–30 px**
- Locked 720p token: **26 px**
- **24 px is the minimum permitted size**

Avoid footnote-sized copy. If a sentence cannot fit legibly at 24 px, shorten it, narrate it, or split the idea into another scene.

## 2. One visual hierarchy

The entire teaser must use one consistent visual hierarchy. Every frame must also have one unmistakable focal point.

Priority order:

1. the main visual claim — usually the figure, 3D pose, or comparison;
2. one scene headline;
3. one short explanation or conclusion;
4. annotations that support the figure.

Do not create competing headlines, parallel caption systems, multiple type scales, or several equally prominent callouts. A viewer should understand where to look within one second.

## 3. Figure language

Use purpose-built **3D or vector figures**. Redraw paper charts and diagrams for the dark video canvas rather than inserting screenshots of PDF figures, slides, websites, or notebooks.

Screenshots are prohibited except when a real-world photograph or real-world capture is itself part of the scientific evidence. In that case:

- crop to the evidence;
- keep the image large enough to inspect;
- add only essential vector annotations;
- do not style the photograph like a generic screenshot card.

Observed data and fitted trends must remain visually distinct. For example, scaling-law plots use experimental markers plus fitted curves/lines, not a polyline connecting noisy observations.

## 4. Color system

Use a fixed palette of **three to four chromatic colors for the entire teaser**, never more. Black/dark background and white/gray neutrals are structural tones and do not count toward this limit.

Each chromatic color must keep one semantic role throughout the video—for example:

- WiCompass/proposed method;
- baseline or comparison;
- warning/generalization gap;
- selection/annotation highlight.

Do not assign a new accent color merely because a new scene was added. Prefer shape, position, line style, or motion before adding color.

## 5. Duration

Target a final running time of **approximately 85 seconds**.

- Preferred working range: **82–87 seconds**
- Hard conference limit: **90 seconds**
- Budget includes cover, transitions, narration pauses, and back cover

When the cut becomes too long, remove secondary explanation before speeding up narration or shrinking text.

## 6. Compliance checklist

Before picture lock, confirm:

- Inter is the only primary font;
- JetBrains Mono is used only for math/code;
- every visible text element maps to Levels 1–4;
- no text is smaller than 24 px;
- the teaser uses one consistent hierarchy and each frame has one focal point;
- all scientific figures are native 3D/vector redraws;
- screenshots appear only as necessary real-world evidence;
- the chromatic palette contains no more than four colors with stable meanings;
- the final duration is near 85 seconds and never exceeds 90 seconds.

## Current migration status

The July 13 working cut predates this specification: it still uses Source Sans 3, includes sub-24 px text, uses five chromatic accents, and runs 89.5 seconds. Its current validator therefore checks the legacy token system, not compliance with this new specification. Treat the next typography/layout pass as a deliberate migration to Inter, JetBrains Mono, the four locked size tokens, a maximum four-color palette, and an approximately 85-second cut. Do not weaken the specification to match the legacy cut.
