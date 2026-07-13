# WiCompass teaser video generation specification

This document is normative for future teaser revisions. It defines one visual system for the entire video; individual scenes must not invent their own typography, palette, or figure language.

The pixel sizes below assume the current 1280×720 render canvas. If the canvas resolution changes, scale the entire type system proportionally rather than changing individual levels independently.

For 1280×720 production, use four locked tokens: **96 px / 56 px / 36 px / 26 px**. The ranges below define the permitted calibration range for each level, not permission to choose a new size for every element. Recalibrate a level only as a global system change.

## Narrative structure

The current cut contains eight scenes and follows one scientific argument:

| Narrative role | Scene IDs | Purpose |
| --- | --- | --- |
| Opening identity | `cover` | Establish the paper, authors, institutions, and venue. |
| **Question** | `actions` | Show that conventional action splits hide a severe held-out-action gap. |
| **Insight** | `efficiency` | Show that retaining fewer repeated frames barely changes error; volume is not coverage. |
| **Mechanism** | `method` | Explain the shared pose representation, directional coverage test, and selection of under-covered regions in one continuous map. |
| **Evidence** | `simulation`, `realworld` | Test the claim in fitted scaling laws and real-world deployment. |
| **Vision** | `summary` | Leave the viewer with the principle: scale motion coverage, not repeated frames. |
| Closing identity | `back` | Provide paper identity and a repository QR code. |

Do not add a scene unless the new information cannot be absorbed into this structure without creating a second focal point. Preserve the Question → Insight → Mechanism → Evidence → Vision order.

## 1. Typography

Use exactly two font roles:

- **Primary font: Inter.** Use it for titles, headlines, explanations, labels, captions, and axes.
- **Math/code font: JetBrains Mono.** Use it only for equations, mathematical symbols that need a monospaced treatment, tensor shapes, code, and structured sample records.

Do not introduce additional display, body, handwritten, or decorative typefaces.

### Capitalization and technical names

Preserve the canonical spelling of project, modality, dataset, and metric names everywhere on screen:

- `WiCompass`, `mmWave`, `MoCap`, `AMASS`, `MMFi`, `mmBody`, `MPJPE`, and `OOD`;
- scene kickers use Title Case, including `Simulation Evaluation` and `Real-World Evaluation`;
- headlines, annotations, legends, axes, and footer sentences use sentence case;
- the paper title keeps its official capitalization: `WiCompass: Oracle-driven Data Scaling for mmWave Human Pose Estimation`.

The narration source may spell `Wi-Compass` and `A-MASS` solely as Kokoro pronunciation hints. Those forms must never appear in visible video text.

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

The chapter label at the upper left of each content scene also uses the locked **36 px** Level 3 token through `.scene-kicker`. Keep its Inter weight, muted color, spacing, and line height identical across Question, Insight, Method, Evaluation, and Vision scenes. Change only the label text; do not create scene-specific kicker typography.

Every narrative scene uses the same semantic classes:

- `.scene-heading` for the upper-left heading block;
- `.scene-kicker` for the 36 px chapter label;
- `.scene-headline` for the single 56 px claim;
- `.scene-footer` for one 26 px contextual sentence when a footer is necessary;
- `.scene-support` for an optional 36 px supporting statement in a thesis/vision scene.

These roles are implemented in `styles/migrated/typography.css`, which is loaded after scene-specific styles and is authoritative for typography. Do not override them inside an individual scene stylesheet. Cover and back-cover identity typography are the only exceptions.

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

### Result-scene template

Evidence scenes must use the figure as the primary carrier of the conclusion:

- place the measured difference or scientific claim directly inside the chart, adjacent to the marks that support it;
- reserve the bottom `.experiment-condition` rail for one short natural-language sentence covering only the essential dataset/environment and evaluation setup;
- style the condition rail as muted Level 4 text so it remains legible but safely skippable;
- do not split the condition sentence with vertical rules, pipes, badges, or metadata chips;
- do not repeat a result, interpretation, or headline in the condition rail;
- do not add a separate readout column when the same values are already labeled in the figure.

This is the default template for quantitative results: **claim in the figure, conditions in the footer**.

## 3. Figure language

Use purpose-built **3D or vector figures**. Redraw paper charts and diagrams for the dark video canvas rather than inserting screenshots of PDF figures, slides, websites, or notebooks.

Screenshots are prohibited except when a real-world photograph or real-world capture is itself part of the scientific evidence. In that case:

- crop to the evidence;
- keep the image large enough to inspect;
- add only essential vector annotations;
- do not style the photograph like a generic screenshot card.

Observed data and fitted trends must remain visually distinct. For example, scaling-law plots use experimental markers plus fitted curves/lines, not a polyline connecting noisy observations.

Figure-internal prose, block headings, legends, axes, formulas, and annotations use Level 4 at 26 px. Do not create an additional 36 px subheading system inside a figure. Large encoder/math glyphs may use Level 3 as visual marks, but not as prose labels.

## 4. Color system

Use a fixed palette of **three to four chromatic colors for the entire teaser**, never more. Black/dark background and white/gray neutrals are structural tones and do not count toward this limit.

The current semantic mapping is fixed:

- **green:** WiCompass, selected acquisition targets, and the favorable comparison;
- **blue:** project identity and existing mmWave observations;
- **yellow:** baseline/reference conditions and neutral comparison series;
- **red:** held-out failure, uncovered regions, and the worse comparison.

AMASS reference poses remain white/gray neutrals in the method scene. They are the coordinate system, not a competing method, so they do not receive a new accent color.

Do not assign a new accent color merely because a new scene was added. Prefer shape, position, line style, or motion before adding color.

## 5. Narration and TTS

Use the user's local **Kokoro TTS** installation as the default and only narration backend unless the user explicitly changes this decision. Do not use browser TTS, macOS `say`, or a cloud service for final narration.

The canonical invocation is:

```bash
cd ~/Github/kokoro
./.venv/bin/python local_tts.py 'Hello from local Kokoro TTS.' \
  --lang a --output outputs/english.wav
```

Production rules:

- replace the example sentence with the locked English narration;
- use `--lang a` for the English teaser;
- preserve the generated WAV as the narration master;
- normalize the master to -16 LUFS integrated loudness with a -1.5 dBTP ceiling;
- derive AAC/M4A from the WAV only when the HTML recorder needs `assets/audio/voiceover.m4a`;
- keep narration text synchronized with `content/timeline.js` and `assets/audio/voiceover.txt`;
- regenerate TTS after script changes rather than time-stretching stale audio;
- use the locked `af_heart` voice unless a new voice is explicitly approved;
- do not synthesize final narration until wording and scene timing are approved.

The repository generates the locked narration at Kokoro `1.25×` speed. Keep the conference script within roughly 160–200 words so it stays natural inside the 85–90-second cut while preserving short scene-boundary pauses. Override `KOKORO_SPEED` only after rechecking every scene boundary.

The macOS placeholder generator writes only to `tmp/placeholder-audio/`; it must never overwrite the canonical Kokoro WAV, M4A, text, or manifest.

## 6. Duration

Target a final running time of **approximately 85 seconds**.

- Preferred working range: **82–87 seconds**
- Hard conference limit: **90 seconds**
- Budget includes cover, transitions, narration pauses, and back cover

When the cut becomes too long, remove secondary explanation before speeding up narration or shrinking text.

## 7. Compliance checklist

Before picture lock, confirm:

- Inter is the only primary font;
- JetBrains Mono is used only for math/code;
- every visible text element maps to Levels 1–4;
- no text is smaller than 24 px;
- every narrative scene uses the shared heading/headline/footer classes rather than local typography overrides;
- the teaser uses one consistent hierarchy and each frame has one focal point;
- quantitative result scenes keep the claim in the figure and only experiment conditions in the footer;
- all scientific figures are native 3D/vector redraws;
- screenshots appear only as necessary real-world evidence;
- the chromatic palette contains no more than four colors with stable meanings;
- final narration was generated locally with Kokoro using `--lang a`;
- the Kokoro WAV master and the muxed M4A match the locked narration script;
- the final duration is near 85 seconds and never exceeds 90 seconds.

## Current migration status

The current eight-scene cut is 84.1 seconds. Every scene now follows the Inter/JetBrains Mono roles, four locked sizes, one-focus hierarchy, and restrained palette defined above. The method is intentionally one scene: it uses a single shared-space figure to connect encoding, directional coverage, and target selection without switching visual grammars.
