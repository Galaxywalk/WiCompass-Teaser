import { BAR_CHARTS, EFFICIENCY_READOUT_PERCENTAGES, LINE_CHARTS } from "./chart-data.js";

const lineConfig = (selector) => LINE_CHARTS.find((chart) => chart.selector === selector).config;
const action = lineConfig("#loo-chart");
const efficiency = lineConfig("#efficiency-chart");
const scaling = lineConfig("#scaling-chart");
const realworld = BAR_CHARTS.find((chart) => chart.selector === "#realworld-chart").config;

const actionIndex = action.highlight.index;
const actionIncluded = action.series.find(({ key }) => key === "included").values[actionIndex];
const actionHeldout = action.series.find(({ key }) => key === "heldout").values[actionIndex];
const scalingGaps = scaling.series[1].values.map((value, index) => value - scaling.series[0].values[index]);
const retainedStart = EFFICIENCY_READOUT_PERCENTAGES[0];
const retainedEnd = EFFICIENCY_READOUT_PERCENTAGES.at(-1);
const realworldRows = Object.fromEntries(realworld.groups.map((group) => [group.label, group.values]));
const wicompassTest = realworldRows.WiCompass[1];
const baselineTest = realworldRows.Baseline[1];

export const FACTS = Object.freeze({
  "action-gap": `${actionIncluded.toFixed(1)} → ${actionHeldout.toFixed(1)} mm`,
  "efficiency-title": `Removing ${retainedStart - retainedEnd}% of training frames barely changes error.`,
  "efficiency-note": `From ${retainedStart}% down to ${retainedEnd}% of mmBody, MPJPE remains close to ${Math.round(efficiency.referenceLine.value)} mm. Repeated poses add volume without expanding motion coverage.`,
  "simulation-gap": `${Math.round(Math.min(...scalingGaps))}–${Math.floor(Math.max(...scalingGaps))} mm lower OOD MPJPE`,
  "oracle-test": `${realworldRows["Recollection oracle"][1].toFixed(1)} mm`,
  "wicompass-test": `${wicompassTest.toFixed(1)} mm`,
  "baseline-test": `${baselineTest.toFixed(1)} mm`,
  "realworld-improvement": `${(baselineTest - wicompassTest).toFixed(1)} mm better than action-list collection`,
});
