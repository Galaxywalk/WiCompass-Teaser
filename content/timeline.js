const sceneDefinitions = [
  {
    id: "cover",
    duration: 14.5,
    stillOffset: 7,
    caption: "",
    voiceover: "From Peking University, UESTC, Pitt, and MIT: Wi-Compass, Oracle-driven Data Scaling for millimeter-wave Human Pose Estimation. We use data coverage to choose which motions to collect.",
  },
  {
    id: "actions",
    duration: 11.5,
    stillOffset: 5.5,
    caption: "Across actions, current models fail to generalize. Holding out left-hand wave raises error from 41.1 to 151.1 millimeters.",
    voiceover: "Across actions, current models fail to generalize. Holding out left-hand wave raises error from 41.1 to 151.1 millimeters.",
  },
  {
    id: "efficiency",
    duration: 8.5,
    stillOffset: 4.25,
    caption: "On mmBody, thirty percent of the data still yields sixty-eight millimeters. More data alone does not scale performance.",
    voiceover: "On mmBody, thirty percent of the data still yields sixty-eight millimeters. More data alone does not scale performance.",
  },
  {
    id: "method",
    duration: 10.5,
    stillOffset: 5.25,
    caption: "An AMASS-trained pose tokenizer maps MoCap poses and mmWave pose labels into one shared space without aligning raw signals.",
    voiceover: "An A-MASS-trained pose tokenizer maps motion-capture poses and radar pose labels into one shared space, without aligning raw signals.",
  },
  {
    id: "coverage",
    duration: 10,
    stillOffset: 5,
    caption: "Directional coverage finds AMASS poses missing from radar data. Capped sampling favors sparse gaps without letting outliers dominate.",
    voiceover: "Directional coverage finds A-MASS poses missing from radar data. Capped sampling favors sparse gaps without letting outliers dominate.",
  },
  {
    id: "simulation",
    duration: 8.5,
    stillOffset: 4.25,
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
    duration: 9.5,
    stillOffset: 4.75,
    caption: "For robust mmWave pose estimation, use MoCap priors to find missing motions and guide radar collection.",
    voiceover: "For robust millimeter-wave pose estimation, use motion-capture priors to find missing motions and guide radar collection.",
  },
  {
    id: "back",
    duration: 5.5,
    stillOffset: 2.75,
    caption: "",
    voiceover: "Scan to read the paper and explore Wi-Compass.",
  },
];

let cursor = 0;
export const SCENES = sceneDefinitions.map((scene) => {
  const start = cursor;
  cursor += scene.duration;
  return Object.freeze({ ...scene, still: start + scene.stillOffset, start, end: cursor });
});

export const DURATION = cursor;
