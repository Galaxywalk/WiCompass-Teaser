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
  const yLabelX = config.yLabelX ?? 13;
  svg.append(svgElement("text", {
    x: yLabelX,
    y: height / 2,
    transform: `rotate(-90 ${yLabelX} ${height / 2})`,
    "text-anchor": "middle",
    class: "axis-label",
  }, config.yLabel ?? "MPJPE (mm)"));

  const legend = svgElement("g", { class: "chart-legend" });
  const legendY = config.legendY ?? 15;
  const legendLabels = config.legendLabels ?? ["training MPJPE", "testing MPJPE"];
  [[legendLabels[0], "training"], [legendLabels[1], "testing"]].forEach(([label, key], index) => {
    const offset = padding.left + index * (config.legendStep ?? 190);
    legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: legendY, y2: legendY, class: `legend-line series-${key}` }));
    legend.append(svgElement("text", { x: offset + 30, y: legendY + 4 }, label));
  });
  svg.append(legend);

  const groupWidth = plotWidth / config.groups.length;
  const barWidth = config.barWidth ?? 72;
  const gap = config.barGap ?? 10;
  const anchors = [];
  config.groups.forEach((group, groupIndex) => {
    const center = padding.left + groupWidth * (groupIndex + 0.5);
    group.values.forEach((value, seriesIndex) => {
      const left = center + (seriesIndex === 0 ? -barWidth - gap / 2 : gap / 2);
      const top = y(value);
      const isCompared = config.comparison
        && seriesIndex === config.comparison.seriesIndex
        && [config.comparison.groupA, config.comparison.groupB].includes(groupIndex);
      const comparisonClass = isCompared ? " comparison-bar" : "";
      anchors.push({ groupIndex, seriesIndex, x: left + barWidth / 2, top, value });
      svg.append(svgElement("rect", {
        x: left,
        y: top,
        width: barWidth,
        height: height - padding.bottom - top,
        class: `realworld-bar ${seriesIndex === 0 ? "bar-training" : "bar-testing"} group-${groupIndex} series-index-${seriesIndex}${comparisonClass}`,
        style: `--delay:${(0.03 + groupIndex * 0.035 + seriesIndex * 0.025).toFixed(3)}`,
      }));
      svg.append(svgElement("text", {
        x: left + barWidth / 2,
        y: top - 9,
        "text-anchor": "middle",
        class: `bar-value group-${groupIndex} series-index-${seriesIndex}${isCompared ? " comparison-value" : ""}`,
      }, value.toFixed(1)));
    });
    svg.append(svgElement("text", {
      x: center,
      y: config.barLabelY ?? height - 14,
      "text-anchor": "middle",
      class: "bar-label",
    }, group.label));
  });

  if (config.comparison) {
    const { groupA, groupB, seriesIndex, label } = config.comparison;
    const first = anchors.find((anchor) => anchor.groupIndex === groupA && anchor.seriesIndex === seriesIndex);
    const second = anchors.find((anchor) => anchor.groupIndex === groupB && anchor.seriesIndex === seriesIndex);
    if (!first || !second) throw new Error(`${selector}: comparison references a missing bar`);
    const measureX = first.x + (second.x - first.x) * 0.48;
    const upper = first.top < second.top ? first : second;
    const lower = first.top < second.top ? second : first;
    svg.append(svgElement("path", {
      d: `M${upper.x},${upper.top} H${measureX} M${measureX - 9},${upper.top} H${measureX + 9} M${measureX},${upper.top} V${lower.top} M${measureX - 9},${lower.top} H${measureX + 9} M${measureX},${lower.top} H${lower.x}`,
      class: "bar-comparison-bracket",
      pathLength: 1,
      "vector-effect": "non-scaling-stroke",
    }));
    svg.append(svgElement("text", {
      x: measureX + 18,
      y: lower.top + 32,
      class: "bar-comparison-label",
    }, label));
  }
}
