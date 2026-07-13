import { clamp } from "../core/utils.js";

export function createFrameUpdater({ scenes, sceneElements, root = document }) {
  const efficiencyScene = scenes.find(({ id }) => id === "efficiency");
  const efficiencyElement = sceneElements.get("efficiency");

  return function updateFrame({ time }) {
    if (!efficiencyScene || !efficiencyElement) return;
    const local = clamp((time - efficiencyScene.start) / (efficiencyScene.end - efficiencyScene.start));
    const reveal = clamp((local - 0.04) / 0.34);
    efficiencyElement.style.setProperty("--data-reveal", reveal.toFixed(4));
  };
}
