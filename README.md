# WiCompass — MobiCom '26 teaser

An HTML-first motion-graphics prototype for the 90-second teaser of:

> **WiCompass: Oracle-driven Data Scaling for mmWave Human Pose Estimation**

The current cut uses deterministic SVG, CSS, JavaScript animation, exact paper measurements, and selected real-data assets so the full story can be reviewed before the narration is locked.

The visual direction is a blackboard-style science explainer inspired by the picture-first animation principles of 3Blue1Brown: one visual idea per scene, minimal framing, and consistent semantic colors. The locally bundled Nunito variable font supplies every typographic role; its license is in `assets/fonts/OFL.txt`. The current system voice is only a timing placeholder. Final narration will be generated with TTSMaker after the script and edit are locked.

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

```bash
npm run record
```

The recorder plays the HTML timeline in Chromium, captures it, and uses FFmpeg to produce `dist/WiCompass-MobiCom26-Teaser-draft.mp4`. If `assets/audio/voiceover.m4a` exists, it is muxed into the video.

## Replace the prototype assets

Possible next additions are:

1. real participant-mimics-target-pose footage;
2. radar point cloud + ground truth + prediction overlays;
3. additional qualitative cases selected from the experiment outputs;
4. the locked TTSMaker narration replacing the system timing voice.

Scene text and timing live in `app.js`; visual treatment lives in `styles.css`.

## Research asset provenance

- `assets/images/real_world_setup.png` is the annotated collection setup from the WiCompass paper source repository.
- Figures 1b, 1c, and 6 are redrawn as native black-background SVG charts in `app.js`, using exact values from the experiment logs rather than embedded paper screenshots.
- `assets/derived/mmbody_real_radar_case.png` is rendered from mmBody train sequence 11, frame 675 (real radar point cloud plus its 22-joint ground truth).
- `assets/derived/wicompass_target_pose*.png` is rendered from the WiCompass `real_world_target` pose selection output.

Raw `.npy`/`.npz` samples stay under ignored `tmp/data/` and are not published. To rebuild the derived assets:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-assets.txt
.venv/bin/python scripts/build_real_assets.py
```
