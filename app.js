import { DURATION, SCENES } from "./content/timeline.js";

const params = new URLSearchParams(location.search);
const playbackRate = Math.max(0.25, Number(params.get("speed")) || 1);
const efficiencyPercentages = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10];
const efficiencyReadoutPercentages = efficiencyPercentages.slice(0, 8);

const stage = document.querySelector("#stage");
const sceneEls = new Map([...document.querySelectorAll(".scene")].map((element) => [element.dataset.scene, element]));
const caption = document.querySelector("#caption");
const sceneIndex = document.querySelector("#scene-index");
const timelineProgress = document.querySelector("#timeline-progress");
const scrubber = document.querySelector("#scrubber");
const timecode = document.querySelector("#timecode");
const playButton = document.querySelector("#play");
const voiceover = document.querySelector("#voiceover");

let currentTime = 0;
let playing = false;
let lastTick = performance.now();
let currentScene = "";

if (sceneEls.size !== SCENES.length || SCENES.some(({ id }) => !sceneEls.has(id))) {
  throw new Error("Timeline manifest and scene DOM are out of sync.");
}
scrubber.max = String(DURATION);

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function ease(value) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function formatTime(value) {
  const seconds = Math.max(0, Math.round(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function setTime(value, syncAudio = false) {
  currentTime = clamp(Number(value), 0, DURATION);
  const index = Math.min(SCENES.length - 1, SCENES.findIndex((scene) => currentTime >= scene.start && currentTime < scene.end));
  const resolvedIndex = index < 0 ? SCENES.length - 1 : index;
  const scene = SCENES[resolvedIndex];
  const local = clamp((currentTime - scene.start) / (scene.end - scene.start));
  const fadeDuration = 0.18;

  SCENES.forEach((item, scenePosition) => {
    const element = sceneEls.get(item.id);
    const itemLocal = clamp((currentTime - item.start) / (item.end - item.start));
    const entering = scenePosition === 0 ? 1 : ease((currentTime - item.start) / fadeDuration);
    const exiting = scenePosition === SCENES.length - 1 ? 1 : 1 - ease((currentTime - (item.end - fadeDuration)) / fadeDuration);
    const visibility = Math.min(entering, exiting);
    const active = scenePosition === resolvedIndex;
    element.classList.toggle("is-active", active);
    element.style.setProperty("--p", active ? itemLocal.toFixed(4) : 0);
    element.style.setProperty("--v", active ? visibility.toFixed(4) : 0);
  });

  if (currentScene !== scene.id) {
    currentScene = scene.id;
    stage.dataset.scene = scene.id;
  }

  const dataUsedNumber = document.querySelector("#data-used-number");
  if (dataUsedNumber) {
    const dataScene = SCENES.find(({ id }) => id === "efficiency");
    const dataLocal = clamp((currentTime - dataScene.start) / (dataScene.end - dataScene.start));
    const dataReveal = clamp((dataLocal - 0.04) / 0.34);
    const subsetStep = Math.min(efficiencyReadoutPercentages.length - 1, Math.floor(dataReveal * efficiencyReadoutPercentages.length));
    dataUsedNumber.textContent = String(efficiencyReadoutPercentages[subsetStep]);
    sceneEls.get("efficiency").style.setProperty("--data-reveal", dataReveal.toFixed(4));
  }

  caption.textContent = scene.caption;
  sceneIndex.textContent = `${String(resolvedIndex + 1).padStart(2, "0")} / ${String(SCENES.length).padStart(2, "0")}`;
  timelineProgress.style.width = `${(currentTime / DURATION) * 100}%`;
  scrubber.value = String(currentTime);
  timecode.textContent = `${formatTime(currentTime)} / ${formatTime(DURATION)}`;

  if (syncAudio && Number.isFinite(voiceover.duration)) voiceover.currentTime = currentTime;
}

function setPlaying(value) {
  playing = value;
  if (value) window.__WICOMPASS_FINISHED__ = false;
  playButton.textContent = value ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", value ? "Pause" : "Play");
  lastTick = performance.now();
  if (value && playbackRate === 1) voiceover.play().catch(() => {});
  else voiceover.pause();
}

function tick(now) {
  if (playing) {
    const elapsed = (now - lastTick) / 1000;
    const next = currentTime + Math.min(elapsed * playbackRate, 0.1 * playbackRate);
    if (next >= DURATION) {
      setTime(DURATION);
      setPlaying(false);
      window.__WICOMPASS_FINISHED__ = true;
    } else {
      setTime(next);
    }
  }
  lastTick = now;
  requestAnimationFrame(tick);
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const SVG_NS = "http://www.w3.org/2000/svg";

function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text) element.textContent = text;
  return element;
}

function buildLineChart(selector, config) {
  const svg = document.querySelector(selector);
  if (!svg) return;
  svg.replaceChildren();
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width;
  const height = viewBox.height;
  const padding = config.padding ?? { left: 42, right: 14, top: 38, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointCount = config.series[0].values.length;
  const xValues = config.xValues ?? Array.from({ length: pointCount }, (_, index) => index);
  const xDomain = config.xScale === "log" ? xValues.map(Math.log) : xValues;
  const xMin = Math.min(...xDomain);
  const xMax = Math.max(...xDomain);
  const x = (index) => padding.left + ((xDomain[index] - xMin) / (xMax - xMin)) * plotWidth;
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
      x: 13, y: height / 2, transform: `rotate(-90 13 ${height / 2})`,
      "text-anchor": "middle", class: "axis-label",
    }, config.yLabel));
  }
  if (config.xLabel) {
    svg.append(svgElement("text", {
      x: padding.left + plotWidth / 2, y: height - 1,
      "text-anchor": "middle", class: "axis-label",
    }, config.xLabel));
  }

  if (config.highlight) {
    const hx = x(config.highlight.index);
    svg.append(svgElement("rect", {
      x: hx - 10, y: padding.top, width: 20, height: plotHeight,
      class: "chart-highlight",
    }));
    svg.append(svgElement("text", {
      x: hx, y: padding.top - 10, "text-anchor": "middle", class: "chart-highlight-label",
    }, config.highlight.label));
  }

  const legend = svgElement("g", { class: "chart-legend" });
  config.series.forEach((series, seriesIndex) => {
    const offset = padding.left + seriesIndex * (config.legendStep ?? 142);
    const seriesClass = `series-${series.key}`;
    if (config.showLegend !== false) {
      legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: 14, y2: 14, class: `legend-line ${seriesClass}` }));
      legend.append(svgElement("text", { x: offset + 29, y: 18 }, series.label));
    }

    const points = series.values.map((value, index) => [x(index), y(value)]);
    const isGapSeries = config.gapSeriesIndex === seriesIndex;
    const path = svgElement("path", {
      d: points.map(([px, py], index) => `${index === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`).join(" "),
      class: `chart-line ${seriesClass} series-index-${seriesIndex}${isGapSeries ? " gap-series" : ""}`,
      pathLength: 1,
    });
    svg.append(path);
    points.forEach(([px, py], index) => {
      const important = config.highlight?.index === index;
      const pointAttributes = {
        cx: px, cy: py, r: important ? 5.5 : (config.pointRadius ?? 2.8),
        class: `chart-point ${seriesClass} series-index-${seriesIndex}${important ? " important" : ""}`,
      };
      if (isGapSeries) {
        const sourceValue = config.series[config.gapFromSeriesIndex ?? 0].values[index];
        const sourceY = y(sourceValue);
        svg.append(svgElement("line", {
          x1: px, x2: px, y1: py, y2: sourceY,
          class: `gap-stem ${seriesClass}`, pathLength: 1,
        }));
        pointAttributes.style = `--lift:${(sourceY - py).toFixed(2)}px;--i:${index}`;
      }
      svg.append(svgElement("circle", pointAttributes));
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
    const ax = x(config.annotation.index);
    const ay = y(config.annotation.value);
    svg.append(svgElement("line", { x1: ax, x2: ax, y1: ay + 8, y2: height - padding.bottom, class: "annotation-line" }));
    svg.append(svgElement("text", { x: ax + 7, y: ay + 20, class: "annotation-label" }, config.annotation.label));
  }
}

function buildScienceCharts() {
  // Exact values from the paper's experiment logs.
  buildLineChart("#loo-chart", {
    padding: { left: 58, right: 18, top: 48, bottom: 42 },
    yMin: 20, yMax: 190, yTicks: [60, 100, 140, 180],
    yLabel: "MPJPE (mm)", xLabel: "held-out action",
    xTicks: [{ index: 0, label: "A01" }, { index: 8, label: "A09" }, { index: 16, label: "A17" }, { index: 26, label: "A27" }],
    highlight: { index: 16, label: "LEFT WAVE" },
    gapSeriesIndex: 1,
    gapFromSeriesIndex: 0,
    series: [
      { key: "included", label: "all included", values: [41.26,32.70,39.01,43.64,41.91,33.36,37.41,42.83,48.25,43.34,37.68,51.73,33.03,37.26,42.64,42.11,41.11,55.92,56.47,46.18,46.49,45.54,45.18,46.15,48.67,41.01,37.26] },
      { key: "heldout", label: "leave one out", values: [112.84,92.74,113.37,115.40,110.22,92.38,85.82,84.00,156.57,167.67,90.60,150.46,106.64,110.71,100.69,98.62,151.12,148.48,167.60,125.30,126.06,101.62,109.96,103.43,108.31,107.90,84.61] },
    ],
  });

  buildLineChart("#efficiency-chart", {
    padding: { left: 58, right: 18, top: 48, bottom: 42 },
    yMin: 0, yMax: 90, yTicks: [0, 20, 40, 60, 80],
    showLegend: false,
    yLabel: "MPJPE (mm)", xLabel: "training data kept",
    xTicks: [0, 2, 4, 6, 7, 9].map((index) => ({ index, label: `${efficiencyPercentages[index]}%` })),
    referenceLine: { value: 68.2, label: "≈68 mm plateau from 100% to 30%" },
    series: [
      { key: "primary", label: "mmBody", values: [67.22,68.94,68.55,66.40,67.82,69.53,68.68,68.55,69.00,71.10] },
    ],
  });

  buildLineChart("#scaling-chart", {
    padding: { left: 58, right: 18, top: 48, bottom: 42 },
    yMin: 148, yMax: 184, yTicks: [150, 165, 180],
    yLabel: "OOD MPJPE (mm)", xLabel: "training samples",
    xValues: [2, 4, 8, 16, 24, 32, 40], xScale: "log",
    xTicks: [{ index: 0, label: "2k" }, { index: 2, label: "8k" }, { index: 4, label: "24k" }, { index: 6, label: "40k" }],
    legendStep: 132, pointRadius: 2.3,
    series: [
      { key: "wicompass", label: "WiCompass", values: [155.73,153.93,152.28,151.29,150.64,150.86,150.16] },
      { key: "baseline", label: "simulated mmBody", values: [180.66,180.59,181.14,181.46,178.37,180.92,180.82] },
    ],
  });

  buildGroupedBarChart("#realworld-chart", {
    yMin: 0,
    yMax: 130,
    yTicks: [0, 30, 60, 90, 120],
    groups: [
      { label: "Recollection oracle", values: [49.6, 95.7] },
      { label: "WiCompass", values: [48.3, 105.7] },
      { label: "Baseline", values: [43.4, 112.9] },
    ],
  });
}

function buildGroupedBarChart(selector, config) {
  const svg = document.querySelector(selector);
  if (!svg) return;
  svg.replaceChildren();
  const width = svg.viewBox.baseVal.width;
  const height = svg.viewBox.baseVal.height;
  const padding = { left: 58, right: 18, top: 46, bottom: 44 };
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
    x: 13, y: height / 2, transform: `rotate(-90 13 ${height / 2})`,
    "text-anchor": "middle", class: "axis-label",
  }, "MPJPE (mm)"));

  const legend = svgElement("g", { class: "chart-legend" });
  [["training MPJPE", "training"], ["testing MPJPE", "testing"]].forEach(([label, key], index) => {
    const offset = padding.left + index * 190;
    legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: 15, y2: 15, class: `legend-line series-${key}` }));
    legend.append(svgElement("text", { x: offset + 30, y: 19 }, label));
  });
  svg.append(legend);

  const groupWidth = plotWidth / config.groups.length;
  const barWidth = 72;
  const gap = 10;
  config.groups.forEach((group, groupIndex) => {
    const center = padding.left + groupWidth * (groupIndex + 0.5);
    group.values.forEach((value, seriesIndex) => {
      const left = center + (seriesIndex === 0 ? -barWidth - gap / 2 : gap / 2);
      const top = y(value);
      const bar = svgElement("rect", {
        x: left,
        y: top,
        width: barWidth,
        height: height - padding.bottom - top,
        class: `realworld-bar ${seriesIndex === 0 ? "bar-training" : "bar-testing"}`,
        style: `--delay:${(0.03 + groupIndex * 0.035 + seriesIndex * 0.025).toFixed(3)}`,
      });
      svg.append(bar);
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

function buildMap() {
  const random = seededRandom(1902);
  const map = document.querySelector("#map-points");
  map.replaceChildren();
  for (let i = 0; i < 92; i += 1) {
    const point = document.createElement("i");
    const angle = random() * Math.PI * 2;
    const radius = Math.pow(random(), 0.62) * 43;
    const x = 50 + Math.cos(angle) * radius * 1.35;
    const y = 50 + Math.sin(angle) * radius;
    point.style.cssText = `--x:${x}%;--y:${y}%;--s:${(2 + random() * 5).toFixed(1)}px;--i:${i}`;
    point.className = i % 11 === 0 ? "hot" : "";
    map.append(point);
  }
}

function buildCoverage() {
  const field = document.querySelector("#coverage-field");
  field.replaceChildren();
  const missing = new Set([8, 9, 15, 22, 23, 34, 47, 48, 55, 62, 69]);
  for (let i = 0; i < 84; i += 1) {
    const cell = document.createElement("i");
    cell.className = missing.has(i) ? "gap" : "covered";
    cell.style.setProperty("--i", i);
    field.append(cell);
  }
}

playButton.addEventListener("click", () => setPlaying(!playing));
document.querySelector("#restart").addEventListener("click", () => { setTime(0, true); setPlaying(true); });
document.querySelector("#mute").addEventListener("click", (event) => {
  voiceover.muted = !voiceover.muted;
  event.currentTarget.textContent = voiceover.muted ? "MUTE" : "VOL";
});
document.querySelector("#fullscreen").addEventListener("click", () => stage.requestFullscreen?.());
scrubber.addEventListener("input", (event) => setTime(event.target.value, true));

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") { event.preventDefault(); setPlaying(!playing); }
  if (event.code === "ArrowRight") setTime(currentTime + 5, true);
  if (event.code === "ArrowLeft") setTime(currentTime - 5, true);
  if (event.key.toLowerCase() === "f") stage.requestFullscreen?.();
});

buildMap();
buildCoverage();
buildScienceCharts();
window.__WICOMPASS_FINISHED__ = false;
setTime(0);
requestAnimationFrame(tick);

if (params.has("render")) document.body.classList.add("render-mode");
if (params.has("autoplay")) setPlaying(true);

window.__setTime = (time) => { setPlaying(false); setTime(time, true); };
window.__WICOMPASS_READY__ = true;
