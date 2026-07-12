import { EFFICIENCY_READOUT_PERCENTAGES } from "../../content/chart-data.js";
import { clamp } from "../core/utils.js";

export function createFrameUpdater({ scenes, sceneElements, root = document }) {
  const efficiencyScene = scenes.find(({ id }) => id === "efficiency");
  const efficiencyElement = sceneElements.get("efficiency");
  const dataUsedNumber = root.querySelector("#data-used-number");

  return function updateFrame({ time }) {
    if (!efficiencyScene || !efficiencyElement || !dataUsedNumber) return;
    const local = clamp((time - efficiencyScene.start) / (efficiencyScene.end - efficiencyScene.start));
    const reveal = clamp((local - 0.04) / 0.34);
    const step = Math.min(
      EFFICIENCY_READOUT_PERCENTAGES.length - 1,
      Math.floor(reveal * EFFICIENCY_READOUT_PERCENTAGES.length),
    );
    dataUsedNumber.textContent = String(EFFICIENCY_READOUT_PERCENTAGES[step]);
    efficiencyElement.style.setProperty("--data-reveal", reveal.toFixed(4));
  };
}
