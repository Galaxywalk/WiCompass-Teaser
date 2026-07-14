import { ACTION_GENERALIZATION, EFFICIENCY_READOUT_PERCENTAGES } from "./chart-data.js";

const actionSeen = ACTION_GENERALIZATION.conditions.find(({ key }) => key === "seen");
const actionHeldout = ACTION_GENERALIZATION.conditions.find(({ key }) => key === "heldout");
const retainedEnd = EFFICIENCY_READOUT_PERCENTAGES.at(-1);

export const FACTS = Object.freeze({
  "action-seen": `${actionSeen.value.toFixed(1)} mm`,
  "action-heldout": `${actionHeldout.value.toFixed(1)} mm`,
  "action-ratio": `${(actionHeldout.value / actionSeen.value).toFixed(1)}× error`,
  "efficiency-title": `Keeping ${retainedEnd}% of the data barely changes error.`,
});
