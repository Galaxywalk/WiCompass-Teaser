const sceneDefinitions = [
  {
    id: "cover",
    duration: 12.2,
    stillOffset: 6.1,
    voiceover: "Wi-Compass: Oracle-driven Data Scaling for millimeter-wave Human Pose Estimation. This MobiCom twenty twenty-six paper is by Peking University, UESTC, Pitt, and MIT.",
  },
  {
    id: "actions",
    duration: 15.8,
    stillOffset: 12.6,
    voiceover: "Millimeter-wave sensing recovers human poses from radio reflections without cameras, preserving privacy. But models fail on unseen actions: holding out left-hand wave increases error from 41.1 to 151.1 millimeters.",
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
    voiceover: "To solve this, Wi-Compass learns a pose tokenizer from A-MASS and embeds radar pose labels. An A-MASS pose is missing when its nearest radar label falls outside the A-MASS-defined radius. Wi-Compass collects those motions selectively, then repeats the loop.",
  },
  {
    id: "simulation",
    duration: 9.78,
    stillOffset: 4.89,
    voiceover: "In simulation, Wi-Compass scales while the mmBody trace saturates, staying twenty-five to thirty millimeters lower from two thousand to forty thousand samples.",
  },
  {
    id: "realworld",
    duration: 11.2,
    stillOffset: 5.6,
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
