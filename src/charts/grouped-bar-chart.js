import { requiredSvg, svgElement } from "./svg.js";

export function renderGroupedBarChart(selector, config, root = document) {
  const svg = requiredSvg(selector, root);
  const { width, height } = svg.viewBox.baseVal;
  const padding = config.padding ?? { left: 58, right: 18, top: 46, bottom: 44 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const y = (value) => padding.top + ((config.yMax - value) / (config.yMax - config.yMin)) * plotHeight;

  const grid = svgElement("g", { class: "chart-grid" });
  config.yTicks.forEach((tick) => {
    grid.append(svgElement("line", { x1: padding.left, x2: width - padding.right, y1: y(tick), y2: y(tick) }));
    grid.append(svgElement("text", { x: padding.left - 9, y: y(tick) + 4, "text-anchor": "end" }, tick));
  });
  svg.append(grid);
  svg.append(svgElement("text", {
    x: 13,
    y: height / 2,
    transform: `rotate(-90 13 ${height / 2})`,
    "text-anchor": "middle",
    class: "axis-label",
  }, config.yLabel ?? "MPJPE (mm)"));

  const legend = svgElement("g", { class: "chart-legend" });
  [["training MPJPE", "training"], ["testing MPJPE", "testing"]].forEach(([label, key], index) => {
    const offset = padding.left + index * 190;
    legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: 15, y2: 15, class: `legend-line series-${key}` }));
    legend.append(svgElement("text", { x: offset + 30, y: 19 }, label));
  });
  svg.append(legend);

  const groupWidth = plotWidth / config.groups.length;
  const barWidth = config.barWidth ?? 72;
  const gap = config.barGap ?? 10;
  config.groups.forEach((group, groupIndex) => {
    const center = padding.left + groupWidth * (groupIndex + 0.5);
    group.values.forEach((value, seriesIndex) => {
      const left = center + (seriesIndex === 0 ? -barWidth - gap / 2 : gap / 2);
      const top = y(value);
      svg.append(svgElement("rect", {
        x: left,
        y: top,
        width: barWidth,
        height: height - padding.bottom - top,
        class: `realworld-bar ${seriesIndex === 0 ? "bar-training" : "bar-testing"}`,
        style: `--delay:${(0.03 + groupIndex * 0.035 + seriesIndex * 0.025).toFixed(3)}`,
      }));
      svg.append(svgElement("text", {
        x: left + barWidth / 2,
        y: top - 9,
        "text-anchor": "middle",
        class: "bar-value",
      }, value.toFixed(1)));
    });
    svg.append(svgElement("text", {
      x: center,
      y: height - 14,
      "text-anchor": "middle",
      class: "bar-label",
    }, group.label));
  });
}
