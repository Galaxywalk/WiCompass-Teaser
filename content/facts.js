import { ACTION_GENERALIZATION } from "./chart-data.js";

const actionSeen = ACTION_GENERALIZATION.conditions.find(({ key }) => key === "seen");
const actionHeldout = ACTION_GENERALIZATION.conditions.find(({ key }) => key === "heldout");
export const FACTS = Object.freeze({
  "action-seen": `${actionSeen.value.toFixed(1)} mm`,
  "action-heldout": `${actionHeldout.value.toFixed(1)} mm`,
  "action-ratio": `${(actionHeldout.value / actionSeen.value).toFixed(1)}× error`,
  "efficiency-title": "More of the same data barely helps.",
});
