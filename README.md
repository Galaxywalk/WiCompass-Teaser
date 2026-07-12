# WiCompass — MobiCom '26 teaser

An HTML-first motion-graphics prototype for the 90-second teaser of:

> **WiCompass: Oracle-driven Data Scaling for mmWave Human Pose Estimation**

The current cut uses deterministic SVG, CSS, JavaScript animation, exact paper measurements, selected real-data assets, and a reproducible 89.5-second timeline so the full story can be reviewed before the narration is locked.

The visual direction is a blackboard-style scientific presentation inspired by the picture-first animation principles of 3Blue1Brown: one visual claim per scene, graph-first composition, and consistent semantic colors. The locally bundled Source Sans 3 variable font supplies every typographic role; its license is in `assets/fonts/OFL-SourceSans3.txt`. The current system voice is only a timing placeholder. Final narration will use MiniMax Audio's `Gentle Teacher — Warm, Airy, Velvety` voice after the script and edit are locked.

The current ten-scene sequence includes a formal paper cover, an action-generalization split-gap animation, an mmBody-only progressive subset experiment, a technical VQ-VAE/tokenizer and directional-k-NN method scene, coverage-aware target selection, the instrumented real-world acquisition protocol, separate simulation and Figure 9(b) real-world result scenes, a closing statement, and a QR-code back cover.

HTML contains the semantic story structure, `content/timeline.js` is the single source for scene timing, captions, review frames, and narration, `app.js` contains chart data and animation behavior, and `styles.css` owns the visual system. The presentation type scale is intentionally limited to five tokens: 12, 16, 24, 40, and 56 px.

## Preview

```bash
npm install
npx playwright install chromium
npm run dev
```

Open <http://127.0.0.1:4173>. Use Space to play/pause, Left/Right to seek five seconds, and `F` to toggle fullscreen.

## Produce review stills

```bash
npm run stills
```

This writes scene snapshots to `dist/stills/`.

## Record an MP4

For a quick motion review, render the full timeline at 6× speed in about 15 seconds:

```bash
npm run record:preview
```

This writes `dist/WiCompass-MobiCom26-Teaser-preview.mp4` without audio. For the full-duration draft:

```bash
npm run record
```

The recorder plays the HTML timeline in Chromium, captures it, and uses FFmpeg to produce `dist/WiCompass-MobiCom26-Teaser-draft.mp4`. If `assets/audio/voiceover.m4a` exists, it is muxed into the video.

## Rebuild the timing voice

On macOS, the temporary system narration can be regenerated scene by scene:

```bash
npm run audio:placeholder
```

This produces a synchronized 89.5-second placeholder with silent cover and back-cover segments. It is not the final voice; use the selected MiniMax `Gentle Teacher` voice after picture lock.

Regenerate the GitHub QR code with `npm run qr:github`.

## Replace the prototype assets

Possible next additions are:

1. real participant-mimics-target-pose footage;
2. radar point cloud + ground truth + prediction overlays;
3. additional qualitative cases selected from the experiment outputs;
4. the locked MiniMax `Gentle Teacher` narration replacing the system timing voice.

Scene text and timing live in `app.js`; visual treatment lives in `styles.css`.

## Research asset provenance

- `assets/images/real_world_setup.png` is the annotated collection setup from the WiCompass paper source repository.
- The action split, mmBody subset, simulation scaling, and Figure 9(b) real-world results are redrawn as native black-background SVG charts in `app.js`, using the paper values and experiment logs rather than embedded screenshots.
- `assets/derived/mmbody_real_radar_case.png` is rendered from mmBody train sequence 11, frame 675 (real radar point cloud plus its 22-joint ground truth).
- `assets/derived/smplx_pose_*.svg` and `assets/derived/wicompass_target_pose*.png` are rendered from the WiCompass `real_world_target` 22-joint SMPL-X pose output without changing body proportions.
- The cover uses official marks downloaded from the Peking University Visual Identity office, the UESTC website, the University of Pittsburgh brand resources, and MIT. The PKU mark is the official reverse version specified for dark backgrounds.
- `assets/github-qr.png` encodes `https://github.com/Galaxywalk/WiCompass` with high error correction.

Raw `.npy`/`.npz` samples stay under ignored `tmp/data/` and are not published. To rebuild the derived assets:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-assets.txt
.venv/bin/python scripts/build_real_assets.py
```
