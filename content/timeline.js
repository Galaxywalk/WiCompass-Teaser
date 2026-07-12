const sceneDefinitions = [
  {
    id: "cover",
    duration: 5,
    still: 2.5,
    caption: "",
    voiceover: "",
  },
  {
    id: "actions",
    duration: 9.5,
    still: 10,
    caption: "With all 27 actions included in training, errors remain low. Leaving each action out produces a large generalization penalty; left-hand wave rises from 41.1 to 151.1 millimeters.",
    voiceover: "With all twenty-seven actions included in training, errors remain low. Leaving each action out produces a large generalization penalty. Left-hand wave rises from 41.1 to 151.1 millimeters.",
  },
  {
    id: "efficiency",
    duration: 9,
    still: 19,
    caption: "On mmBody, reducing the retained training subset from one hundred percent to thirty percent keeps MPJPE near sixty-eight millimeters. Much of the dataset is redundant.",
    voiceover: "On mmBody, reducing the retained training subset from one hundred percent to thirty percent keeps error near sixty-eight millimeters. Much of the dataset is redundant.",
  },
  {
    id: "method",
    duration: 11.5,
    still: 29,
    caption: "WiCompass trains a discrete pose tokenizer on AMASS. Its frozen encoder and codebook map both MoCap and mmWave pose labels into one latent space—without aligning raw sensor signals.",
    voiceover: "Wi-Compass trains a discrete pose tokenizer on A-MASS. Its frozen encoder and codebook map both motion-capture and millimeter-wave pose labels into one latent space, without aligning raw sensor signals.",
  },
  {
    id: "coverage",
    duration: 10.5,
    still: 40,
    caption: "Directional k-nearest-neighbor coverage identifies AMASS poses insufficiently covered by the mmWave dataset. Capped PPS favors sparser candidates while limiting the influence of extreme distances.",
    voiceover: "Directional k-nearest-neighbor coverage identifies A-MASS poses insufficiently covered by the millimeter-wave dataset. Capped P P S favors sparser candidates while limiting the influence of extreme distances.",
  },
  {
    id: "acquisition",
    duration: 11.5,
    still: 51,
    caption: "A selected latent pose is decoded and displayed during synchronized radar and motion-capture recording. The framework can re-encode each new batch and recompute coverage for the next round.",
    voiceover: "A selected latent pose is decoded and displayed during synchronized radar and motion-capture recording. The framework can re-encode each new batch and recompute coverage for the next round.",
  },
  {
    id: "simulation",
    duration: 10.5,
    still: 62,
    caption: "Under equal simulated data budgets, WiCompass reduces out-of-distribution MPJPE by twenty-five to thirty millimeters from two thousand to forty thousand training samples.",
    voiceover: "Under equal simulated data budgets, Wi-Compass reduces out-of-distribution error by twenty-five to thirty millimeters from two thousand to forty thousand training samples.",
  },
  {
    id: "realworld",
    duration: 11,
    still: 73,
    caption: "In the real-world experiment, all strategies fit their training sets similarly. WiCompass reaches 105.7 millimeters on the held-out benchmark, compared with 112.9 for conventional action-list collection.",
    voiceover: "In the real-world experiment, all strategies fit their training sets similarly. Wi-Compass reaches 105.7 millimeters on the held-out benchmark, compared with 112.9 for action-list collection.",
  },
  {
    id: "summary",
    duration: 5,
    still: 81,
    caption: "WiCompass treats data scaling as a coverage problem: represent motion in a common pose space, measure what is insufficiently covered, and acquire those poses next.",
    voiceover: "Wi-Compass represents motion in a common pose space, measures what is insufficiently covered, and acquires those poses next.",
  },
  {
    id: "back",
    duration: 6,
    still: 87,
    caption: "",
    voiceover: "",
  },
];

let cursor = 0;
export const SCENES = sceneDefinitions.map((scene) => {
  const start = cursor;
  cursor += scene.duration;
  return Object.freeze({ ...scene, start, end: cursor });
});

export const DURATION = cursor;
