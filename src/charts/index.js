import { BAR_CHARTS, LINE_CHARTS } from "../../content/chart-data.js";
import { renderGroupedBarChart } from "./grouped-bar-chart.js";
import { renderLineChart } from "./line-chart.js";

export function renderScienceCharts(root = document) {
  LINE_CHARTS.forEach(({ selector, config }) => renderLineChart(selector, config, root));
  BAR_CHARTS.forEach(({ selector, config }) => renderGroupedBarChart(selector, config, root));
}
