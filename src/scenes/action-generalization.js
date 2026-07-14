import { ACTION_GENERALIZATION } from "../../content/chart-data.js";
import { requiredElement } from "../core/dom.js";

function actionToken(index, targetIndex, excluded) {
  const token = document.createElement("span");
  if (index === targetIndex) token.classList.add("is-target");
  if (excluded && index === targetIndex) token.classList.add("is-excluded");
  return token;
}

export function renderActionGeneralization(root = document, config = ACTION_GENERALIZATION) {
  const scene = requiredElement("#action-comparison", root);
  for (const condition of config.conditions) {
    const tokens = requiredElement(`[data-action-dots="${condition.key}"]`, scene);
    tokens.replaceChildren(...Array.from(
      { length: 27 },
      (_, index) => actionToken(index, config.action.index, condition.key === "heldout"),
    ));

    const bar = requiredElement(`[data-action-bar="${condition.key}"]`, scene);
    bar.style.setProperty("--bar-ratio", (condition.value / config.yMax).toFixed(4));
  }
}
