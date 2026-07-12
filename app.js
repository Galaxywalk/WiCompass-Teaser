const DURATION = 86;

const scenes = [
  {
    start: 0,
    end: 11,
    caption: "Millimeter-wave radar can estimate human pose without cameras. But hold out one ordinary wave, and its joint error jumps from 41.1 to 151.1 millimeters.",
  },
  {
    start: 11,
    end: 22,
    caption: "Collect more data? Not so fast. Removing seventy percent of samples from today's datasets costs less than two percent accuracy. The bottleneck is coverage, not volume.",
  },
  {
    start: 22,
    end: 36,
    caption: "WiCompass turns large motion-capture corpora into an oracle for radar data collection. It learns a compact, universal vocabulary of human motion.",
  },
  {
    start: 36,
    end: 50,
    caption: "It maps pose labels into this shared space, revealing which motions are missing and which samples are redundant.",
  },
  {
    start: 50,
    end: 65,
    caption: "WiCompass selects the most informative targets. A participant mimics them for real radar capture, or a simulator generates the returns. Then coverage is measured again.",
  },
  {
    start: 65,
    end: 80,
    caption: "Across two to forty thousand simulated samples, WiCompass reduces out-of-distribution error by twenty-five to thirty millimeters. In the real world, test error falls from 112.9 to 105.7.",
  },
  {
    start: 80,
    end: 86,
    caption: "Stop collecting more of the same. Let WiCompass point to what your dataset needs next.",
  },
];

const stage = document.querySelector("#stage");
const sceneEls = [...document.querySelectorAll(".scene")];
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
let currentScene = -1;

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
  const index = Math.min(scenes.length - 1, scenes.findIndex((scene) => currentTime >= scene.start && currentTime < scene.end));
  const resolvedIndex = index < 0 ? scenes.length - 1 : index;
  const scene = scenes[resolvedIndex];
  const local = clamp((currentTime - scene.start) / (scene.end - scene.start));
  const entering = ease(local / 0.13);
  const exiting = 1 - ease((local - 0.9) / 0.1);
  const visibility = Math.min(entering, exiting);

  sceneEls.forEach((element, scenePosition) => {
    const active = scenePosition === resolvedIndex;
    element.classList.toggle("is-active", active);
    element.style.setProperty("--p", active ? local.toFixed(4) : 0);
    element.style.setProperty("--v", active ? visibility.toFixed(4) : 0);
  });

  if (currentScene !== resolvedIndex) {
    currentScene = resolvedIndex;
    stage.dataset.scene = String(resolvedIndex);
  }

  const failure = resolvedIndex === 0 && local > 0.44;
  stage.classList.toggle("show-failure", failure);
  document.querySelector("#error-number").textContent = String(Math.round(41 + ease((local - 0.42) / 0.35) * 110));
  document.querySelector("#discard-number").textContent = String(Math.round(ease(local / 0.72) * 70));

  caption.textContent = scene.caption;
  sceneIndex.textContent = `${String(resolvedIndex + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
  timelineProgress.style.width = `${(currentTime / DURATION) * 100}%`;
  scrubber.value = String(currentTime);
  timecode.textContent = `${formatTime(currentTime)} / ${formatTime(DURATION)}`;

  stage.style.setProperty("--global-p", (currentTime / DURATION).toFixed(4));
  stage.style.setProperty("--pulse", ((Math.sin(currentTime * 2.4) + 1) / 2).toFixed(4));
  stage.style.setProperty("--needle-angle", `${-36 + (currentTime / DURATION) * 244}deg`);

  if (syncAudio && Number.isFinite(voiceover.duration)) voiceover.currentTime = currentTime;
}

function setPlaying(value) {
  playing = value;
  playButton.textContent = value ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", value ? "Pause" : "Play");
  lastTick = performance.now();
  if (value) voiceover.play().catch(() => {});
  else voiceover.pause();
}

function tick(now) {
  if (playing) {
    const elapsed = (now - lastTick) / 1000;
    const next = currentTime + Math.min(elapsed, 0.1);
    if (next >= DURATION) {
      setTime(DURATION);
      setPlaying(false);
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

function buildPointCloud() {
  const random = seededRandom(701);
  const cloud = document.querySelector("#point-cloud");
  if (!cloud) return;
  for (let i = 0; i < 88; i += 1) {
    const dot = document.createElement("i");
    const torso = i < 48;
    const x = torso ? 50 + (random() - 0.5) * 24 : 20 + random() * 64;
    const y = torso ? 25 + random() * 53 : 18 + random() * 70;
    dot.style.cssText = `--x:${x}%;--y:${y}%;--d:${(1.8 + random() * 4).toFixed(1)}px;--a:${(0.25 + random() * 0.65).toFixed(2)};--delay:${(random() * 1.5).toFixed(2)}s`;
    cloud.append(dot);
  }
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
  const viewBox = svg.viewBox.baseVal;
  const width = viewBox.width;
  const height = viewBox.height;
  const padding = config.padding ?? { left: 42, right: 14, top: 38, bottom: 34 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const pointCount = config.series[0].values.length;
  const x = (index) => padding.left + (index / (pointCount - 1)) * plotWidth;
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
    legend.append(svgElement("line", { x1: offset, x2: offset + 22, y1: 14, y2: 14, stroke: series.color, class: "legend-line" }));
    legend.append(svgElement("text", { x: offset + 29, y: 18 }, series.label));

    const points = series.values.map((value, index) => [x(index), y(value)]);
    const path = svgElement("path", {
      d: points.map(([px, py], index) => `${index === 0 ? "M" : "L"}${px.toFixed(2)},${py.toFixed(2)}`).join(" "),
      fill: "none", stroke: series.color, class: "chart-line", pathLength: 1,
    });
    svg.append(path);
    points.forEach(([px, py], index) => {
      const important = config.highlight?.index === index;
      svg.append(svgElement("circle", {
        cx: px, cy: py, r: important ? 5.5 : (config.pointRadius ?? 2.8),
        fill: "#000", stroke: series.color, class: important ? "chart-point important" : "chart-point",
      }));
    });
  });
  svg.append(legend);

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
    yMin: 20, yMax: 190, yTicks: [60, 100, 140, 180],
    xTicks: [{ index: 0, label: "A01" }, { index: 8, label: "A09" }, { index: 16, label: "A17" }, { index: 26, label: "A27" }],
    highlight: { index: 16, label: "LEFT WAVE" },
    series: [
      { label: "all included", color: "#58c4dd", values: [41.26,32.70,39.01,43.64,41.91,33.36,37.41,42.83,48.25,43.34,37.68,51.73,33.03,37.26,42.64,42.11,41.11,55.92,56.47,46.18,46.49,45.54,45.18,46.15,48.67,41.01,37.26] },
      { label: "leave one out", color: "#fc6255", values: [112.84,92.74,113.37,115.40,110.22,92.38,85.82,84.00,156.57,167.67,90.60,150.46,106.64,110.71,100.69,98.62,151.12,148.48,167.60,125.30,126.06,101.62,109.96,103.43,108.31,107.90,84.61] },
    ],
  });

  buildLineChart("#efficiency-chart", {
    yMin: 60, yMax: 92, yTicks: [60, 70, 80, 90],
    xTicks: [{ index: 0, label: "10%" }, { index: 2, label: "30%" }, { index: 4, label: "50%" }, { index: 6, label: "70%" }, { index: 9, label: "100% data" }],
    annotation: { index: 2, value: 86.39, label: "70% discarded" },
    series: [
      { label: "mmBody", color: "#58c4dd", values: [71.10,69.00,68.55,68.68,69.53,67.82,66.40,68.55,68.94,66.88] },
      { label: "MMFi", color: "#f4d345", values: [89.15,86.76,86.39,85.10,85.34,85.03,84.18,83.47,84.19,84.24] },
    ],
  });

  buildLineChart("#scaling-chart", {
    padding: { left: 36, right: 8, top: 32, bottom: 28 },
    yMin: 148, yMax: 184, yTicks: [150, 165, 180],
    xTicks: [{ index: 0, label: "2k" }, { index: 2, label: "8k" }, { index: 4, label: "24k" }, { index: 6, label: "40k" }],
    legendStep: 132, pointRadius: 2.3,
    series: [
      { label: "WiCompass", color: "#83c167", values: [155.73,153.93,152.28,151.29,150.64,150.86,150.16] },
      { label: "mmBody trace", color: "#f4d345", values: [180.66,180.59,181.14,181.46,178.37,180.92,180.82] },
    ],
  });
}

function buildDuplicates() {
  const field = document.querySelector("#duplicate-field");
  for (let i = 0; i < 35; i += 1) {
    const card = document.createElement("div");
    card.className = `duplicate-pose ${i < 25 ? "will-discard" : "will-keep"}`;
    card.style.setProperty("--i", i);
    card.innerHTML = `<svg viewBox="0 0 120 210"><use href="#pose-standing" /></svg>`;
    field.append(card);
  }
}

function buildMap() {
  const random = seededRandom(1902);
  const map = document.querySelector("#map-points");
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

buildPointCloud();
buildDuplicates();
buildMap();
buildCoverage();
buildScienceCharts();
setTime(0);
requestAnimationFrame(tick);

const params = new URLSearchParams(location.search);
if (params.has("render")) document.body.classList.add("render-mode");
if (params.has("autoplay")) setPlaying(true);

window.__setTime = (time) => { setPlaying(false); setTime(time, true); };
window.__WICOMPASS_READY__ = true;
