import { EFFICIENCY_READOUT_PERCENTAGES, LINE_CHARTS } from "./chart-data.js";

const lineConfig = (selector) => LINE_CHARTS.find((chart) => chart.selector === selector).config;
const action = lineConfig("#loo-chart");

const actionIndex = action.highlight.index;
const actionIncluded = action.series.find(({ key }) => key === "included").values[actionIndex];
const actionHeldout = action.series.find(({ key }) => key === "heldout").values[actionIndex];
const retainedEnd = EFFICIENCY_READOUT_PERCENTAGES.at(-1);

export const FACTS = Object.freeze({
  "action-gap": `${actionIncluded.toFixed(1)} → ${actionHeldout.toFixed(1)} mm`,
  "efficiency-title": `Keeping ${retainedEnd}% of the data barely changes error.`,
});
