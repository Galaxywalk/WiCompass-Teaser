import { requiredSvg, svgElement } from "./svg.js";

function evaluateFit(fit, value) {
  if (fit.model !== "power") throw new Error(`Unsupported fit model: ${fit.model}`);
  return fit.coefficient * (value * (fit.xMultiplier ?? 1)) ** fit.exponent;
}

export function renderLineChart(selector, config, root = document) {
  const svg = requiredSvg(selector, root);
  const { width, height } = svg.viewBox.baseVal;
  const padding = config.padding ?? { left: 42, right: 14, top: 38, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointCount = config.series[0].values.length;
  const xValues = config.xValues ?? Array.from({ length: pointCount }, (_, index) => index);
  const xDomain = config.xScale === "log" ? xValues.map(Math.log) : xValues;
  const xMin = Math.min(...xDomain);
  const xMax = Math.max(...xDomain);
  const projectX = (value) => {
    const domainValue = config.xScale === "log" ? Math.log(value) : value;
    return padding.left + ((domainValue - xMin) / (xMax - xMin)) * plotWidth;
  };
  const x = (index) => projectX(xValues[index]);
  const y = (value) => padding.top + ((config.yMax - value) / (config.yMax - config.yMin)) * plotHeight;

  const grid = svgElement("g", { class: "chart-grid" });
  config.yTicks.forEach((tick) => {
    grid.append(svgElement("line", { x1: padding.left, x2: width - padding.right, y1: y(tick), y2: y(tick) }));
    grid.append(svgElement("text", { x: padding.left - 9, y: y(tick) + 4, "text-anchor": "end" }, tick));
  });
  config.xTicks.forEach(({ index, label }) => {
    grid.append(svgElement("line", { x1: x(index), x2: x(index), y1: padding.top, y2: height - padding.bottom, class: "vertical" }));
    grid.append(svgElement("text", { x: x(index), y: height - 10, "text-anchor": "middle" }, label));
  });
  svg.append(grid);

  if (config.yLabel) {
    svg.append(svgElement("text", {
      x: 13,
      y: height / 2,
      transform: `rotate(-90 13 ${height / 2})`,
      "text-anchor": "middle",
      class: "axis-label",
    }, config.yLabel));
  }
  if (config.xLabel) {
    svg.append(svgElement("text", {
      x: padding.left + plotWidth / 2,
      y: height - 1,
      "text-anchor": "middle",
      class: "axis-label",
    }, config.xLabel));
  }

  if (config.highlight) {
    const highlightX = x(config.highlight.index);
    svg.append(svgElement("rect", {
      x: highlightX - 10,
      y: padding.top,
      width: 20,
      height: plotHeight,
      class: "chart-highlight",
    }));
    svg.append(svgElement("text", {
      x: highlightX,
      y: padding.top - 10,
      "text-anchor": "middle",
      class: "chart-highlight-label",
    }, config.highlight.label));
  }

  const legend = svgElement("g", { class: "chart-legend" });
  config.series.forEach((series, seriesIndex) => {
    const offset = padding.left + seriesIndex * (config.legendStep ?? 142);
    const seriesClass = `series-${series.key}`;
    if (config.showLegend !== false) {
      if (series.fit && series.marker === "square") {
        legend.append(svgElement("rect", { x: offset + 5, y: 8, width: 12, height: 12, class: `chart-legend-marker ${seriesClass}` }));
      } else if (series.fit) {
        legend.append(svgElement("circle", { cx: offset + 11, cy: 14, r: 6, class: `chart-legend-marker ${seriesClass}` }));
      } else {
        legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: 14, y2: 14, class: `legend-line ${seriesClass}` }));
      }
      legend.append(svgElement("text", { x: offset + 29, y: 18 }, series.label));
    }

    const points = series.values.map((value, index) => [x(index), y(value)]);
    const isGapSeries = config.gapSeriesIndex === seriesIndex;
    if (series.fit) {
      const sampleCount = series.fit.samples ?? 64;
      const fitPoints = Array.from({ length: sampleCount }, (_, index) => {
        const ratio = index / (sampleCount - 1);
        const domainValue = xMin + (xMax - xMin) * ratio;
        const sourceValue = config.xScale === "log" ? Math.exp(domainValue) : domainValue;
        return [projectX(sourceValue), y(evaluateFit(series.fit, sourceValue))];
      });
      svg.append(svgElement("path", {
        d: fitPoints.map(([pointX, pointY], index) => `${index === 0 ? "M" : "L"}${pointX.toFixed(2)},${pointY.toFixed(2)}`).join(" "),
        class: `chart-fit ${seriesClass} series-index-${seriesIndex}`,
        "vector-effect": "non-scaling-stroke",
      }));
    }
    if (series.connectPoints !== false) {
      svg.append(svgElement("path", {
        d: points.map(([pointX, pointY], index) => `${index === 0 ? "M" : "L"}${pointX.toFixed(2)},${pointY.toFixed(2)}`).join(" "),
        class: `chart-line ${seriesClass} series-index-${seriesIndex}${isGapSeries ? " gap-series" : ""}`,
        pathLength: 1,
      }));
    }

    points.forEach(([pointX, pointY], index) => {
      const important = config.highlight?.index === index;
      const attributes = {
        cx: pointX,
        cy: pointY,
        r: important ? 5.5 : (config.pointRadius ?? 2.8),
        class: `chart-point ${seriesClass} series-index-${seriesIndex}${important ? " important" : ""}`,
      };
      if (isGapSeries) {
        const sourceValue = config.series[config.gapFromSeriesIndex ?? 0].values[index];
        const sourceY = y(sourceValue);
        svg.append(svgElement("line", {
          x1: pointX,
          x2: pointX,
          y1: pointY,
          y2: sourceY,
          class: `gap-stem ${seriesClass}`,
          pathLength: 1,
        }));
        attributes.style = `--lift:${(sourceY - pointY).toFixed(2)}px;--i:${index}`;
      }
      if (series.marker === "square") {
        const radius = Number(attributes.r);
        svg.append(svgElement("rect", {
          x: pointX - radius,
          y: pointY - radius,
          width: radius * 2,
          height: radius * 2,
          class: attributes.class,
        }));
      } else {
        svg.append(svgElement("circle", attributes));
      }
    });
  });
  svg.append(legend);

  if (config.referenceLine) {
    const referenceY = y(config.referenceLine.value);
    svg.append(svgElement("line", {
      x1: padding.left,
      x2: width - padding.right,
      y1: referenceY,
      y2: referenceY,
      class: "efficiency-reference",
      pathLength: 1,
    }));
    svg.append(svgElement("text", {
      x: width - padding.right - 4,
      y: referenceY - 9,
      "text-anchor": "end",
      class: "reference-label",
    }, config.referenceLine.label));
  }

  if (config.annotation) {
    const annotationX = x(config.annotation.index);
    const annotationY = y(config.annotation.value);
    svg.append(svgElement("line", { x1: annotationX, x2: annotationX, y1: annotationY + 8, y2: height - padding.bottom, class: "annotation-line" }));
    svg.append(svgElement("text", { x: annotationX + 7, y: annotationY + 20, class: "annotation-label" }, config.annotation.label));
  }
}
