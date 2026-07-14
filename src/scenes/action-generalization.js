import { ACTION_GENERALIZATION } from "../../content/chart-data.js";
import { requiredElement } from "../core/dom.js";

export function renderActionGeneralization(root = document, config = ACTION_GENERALIZATION) {
  const scene = requiredElement("#action-comparison", root);
  for (const condition of config.conditions) {
    const bar = requiredElement(`[data-action-bar="${condition.key}"]`, scene);
    bar.style.setProperty("--bar-ratio", (condition.value / config.yMax).toFixed(4));
  }
}
