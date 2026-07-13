const sceneDefinitions = [
  {
    id: "cover",
    duration: 9,
    stillOffset: 4.5,
    caption: "",
    voiceover: "From Peking University, UESTC, Pitt, and MIT, we present Wi-Compass for MobiCom 2026.",
  },
  {
    id: "actions",
    duration: 10.5,
    stillOffset: 5,
    caption: "Include an action, and error stays low. Hold it out, and left-hand wave jumps from 41.1 to 151.1 millimeters.",
    voiceover: "Include an action, and error stays low. Hold it out, and left-hand wave jumps from 41.1 to 151.1 millimeters.",
  },
  {
    id: "efficiency",
    duration: 9,
    stillOffset: 4.5,
    caption: "On mmBody, thirty percent of the data still yields sixty-eight millimeters. More data alone does not scale performance.",
    voiceover: "On mmBody, thirty percent of the data still yields sixty-eight millimeters. More data alone does not scale performance.",
  },
  {
    id: "method",
    duration: 12,
    stillOffset: 6,
    caption: "WiCompass trains a pose tokenizer on AMASS. The frozen encoder maps motion-capture and mmWave pose labels into one shared latent space.",
    voiceover: "Wi-Compass trains a pose tokenizer on A-MASS. The frozen encoder maps motion-capture and millimeter-wave pose labels into one shared latent space.",
  },
  {
    id: "coverage",
    duration: 12,
    stillOffset: 6,
    caption: "Directional nearest-neighbor coverage finds AMASS poses missing from the radar dataset. Capped sampling prioritizes sparse regions without chasing extreme outliers.",
    voiceover: "Directional nearest-neighbor coverage finds A-MASS poses missing from the radar dataset. Capped sampling prioritizes sparse regions without chasing extreme outliers.",
  },
  {
    id: "simulation",
    duration: 10,
    stillOffset: 5,
    caption: "From two thousand to forty thousand samples, fitted scaling laws remain twenty-five to thirty millimeters apart.",
    voiceover: "From two thousand to forty thousand samples, the fitted scaling laws remain twenty-five to thirty millimeters apart.",
  },
  {
    id: "realworld",
    duration: 10.6,
    stillOffset: 5.5,
    caption: "Training errors are similar. On held-out poses, WiCompass reaches 105.7 millimeters, versus 112.9 for action-list collection.",
    voiceover: "Training errors match. On held-out poses, Wi-Compass reaches 105.7 millimeters, versus 112.9 from an action list.",
  },
  {
    id: "summary",
    duration: 5,
    stillOffset: 2.5,
    caption: "Scale motion coverage, not repeated frames.",
    voiceover: "Scale motion coverage, not repeated frames.",
  },
  {
    id: "back",
    duration: 8,
    stillOffset: 4,
    caption: "",
    voiceover: "Wi-Compass scales motion coverage for millimeter-wave pose estimation. Scan the code to read our paper.",
  },
];

let cursor = 0;
export const SCENES = sceneDefinitions.map((scene) => {
  const start = cursor;
  cursor += scene.duration;
  return Object.freeze({ ...scene, still: start + scene.stillOffset, start, end: cursor });
});

export const DURATION = cursor;
