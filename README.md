# WiCompass — MobiCom '26 teaser

An HTML-first motion-graphics prototype for the 90-second teaser of:

> **WiCompass: Oracle-driven Data Scaling for mmWave Human Pose Estimation**

The current cut is intentionally asset-light. It uses deterministic SVG, CSS, and JavaScript animation so that the full story can be reviewed before original radar footage and paper-quality plots are added.

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

The most valuable next additions are:

1. real participant-mimics-target-pose footage;
2. radar point cloud + ground truth + prediction overlays;
3. simplified vector exports of paper Figures 1, 2, 5, 6, and 9;
4. a human-recorded narration replacing the system voice.

Scene text and timing live in `app.js`; visual treatment lives in `styles.css`.

