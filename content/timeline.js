const sceneDefinitions = [
  {
    id: "cover",
    duration: 9.5,
    stillOffset: 4.75,
    caption: "",
    voiceover: "From Peking University, UESTC, Pitt, and MIT: Wi-Compass, Oracle-driven Data Scaling for millimeter-wave Human Pose Estimation.",
  },
  {
    id: "actions",
    duration: 13.8,
    stillOffset: 6.9,
    caption: "mmWave human pose estimation enables privacy-preserving sensing, but current models fail on unseen actions. Holding out left-hand wave raises error from 41.1 to 151.1 millimeters.",
    voiceover: "Millimeter-wave human pose estimation enables privacy-preserving sensing, but current models fail on unseen actions. Holding out left-hand wave raises error from 41.1 to 151.1 millimeters.",
  },
  {
    id: "efficiency",
    duration: 7,
    stillOffset: 3.5,
    caption: "However, blindly scaling up data does not help. On the mmBody benchmark, thirty percent performs almost the same.",
    voiceover: "However, blindly scaling up data does not help. On the mmBody benchmark, thirty percent performs almost the same.",
  },
  {
    id: "method",
    duration: 10.7,
    stillOffset: 5.35,
    caption: "WiCompass scales data more intelligently: a MoCap prior builds a shared pose space where mmWave pose labels can be compared and their coverage measured.",
    voiceover: "Wi-Compass scales data more intelligently: a motion-capture prior builds a shared pose space where radar pose labels can be compared and their coverage measured.",
  },
  {
    id: "coverage",
    duration: 10.1,
    stillOffset: 5.05,
    caption: "Within this shared space, coverage finds AMASS poses missing from radar data. Capped sampling prioritizes sparse, plausible gaps without letting outliers dominate.",
    voiceover: "Within this shared space, coverage finds A-MASS poses missing from radar data. Capped sampling prioritizes sparse, plausible gaps without letting outliers dominate.",
  },
  {
    id: "simulation",
    duration: 9.78,
    stillOffset: 4.89,
    caption: "In simulation, WiCompass scales while the previous trace saturates, maintaining a twenty-five to thirty millimeter advantage from two thousand to forty thousand samples.",
    voiceover: "In simulation, Wi-Compass scales while the previous trace saturates, maintaining a twenty-five to thirty millimeter advantage from two thousand to forty thousand samples.",
  },
  {
    id: "realworld",
    duration: 13,
    stillOffset: 6.5,
    caption: "In real-world evaluation, WiCompass generalizes better. With similar training error, it reaches 105.7 millimeters on held-out poses, versus 112.9 for action-list collection.",
    voiceover: "In real-world evaluation, Wi-Compass generalizes better. With similar training error, it reaches 105.7 millimeters on held-out poses, versus 112.9 for action-list collection.",
  },
  {
    id: "summary",
    duration: 11.3,
    stillOffset: 5.65,
    caption: "The takeaway is clear: prioritize data quality over scale, treat dataset coverage as measurable, and guide costly RF collection with inexpensive MoCap priors.",
    voiceover: "The takeaway is clear: prioritize data quality over scale, treat dataset coverage as measurable, and guide costly RF collection with inexpensive motion-capture priors.",
  },
  {
    id: "back",
    duration: 3.92,
    stillOffset: 1.96,
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
