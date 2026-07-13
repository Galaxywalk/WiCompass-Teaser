const sceneDefinitions = [
  {
    id: "cover",
    duration: 9.5,
    stillOffset: 4.75,
    voiceover: "From Peking University, UESTC, Pitt, and MIT: Wi-Compass, Oracle-driven Data Scaling for millimeter-wave Human Pose Estimation.",
  },
  {
    id: "actions",
    duration: 13.8,
    stillOffset: 6.9,
    voiceover: "Millimeter-wave human pose estimation enables privacy-preserving sensing, but current models fail on unseen actions. Holding out left-hand wave raises error from 41.1 to 151.1 millimeters.",
  },
  {
    id: "efficiency",
    duration: 7,
    stillOffset: 3.5,
    voiceover: "Yet adding more of the same data barely helps. On mmBody, a thirty-percent subset performs similarly.",
  },
  {
    id: "method",
    duration: 15.8,
    stillOffset: 13.4,
    voiceover: "Wi-Compass learns a pose tokenizer from A-MASS and embeds existing millimeter-wave pose labels. An A-MASS pose becomes a gap when its nearest label falls outside the A-MASS-defined local radius. Wi-Compass samples diverse gaps for the next collection round.",
  },
  {
    id: "simulation",
    duration: 9.78,
    stillOffset: 4.89,
    voiceover: "In simulation, Wi-Compass scales while the mmBody trace saturates, staying twenty-five to thirty millimeters lower from two thousand to forty thousand samples.",
  },
  {
    id: "realworld",
    duration: 13,
    stillOffset: 6.5,
    voiceover: "In real-world evaluation, Wi-Compass beats action-list collection: 105.7 millimeters on held-out poses versus 112.9, at similar training error.",
  },
  {
    id: "summary",
    duration: 11.3,
    stillOffset: 5.65,
    voiceover: "For millimeter-wave human pose estimation, data quality matters more than scale: measure pose coverage and guide costly RF collection with inexpensive motion-capture priors.",
  },
  {
    id: "back",
    duration: 3.92,
    stillOffset: 1.96,
    voiceover: "Scan to explore the Wi-Compass repository.",
  },
];

let cursor = 0;
export const SCENES = sceneDefinitions.map((scene) => {
  const start = cursor;
  cursor += scene.duration;
  return Object.freeze({ ...scene, still: start + scene.stillOffset, start, end: cursor });
});

export const DURATION = cursor;
