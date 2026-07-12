const DURATION = 86;

const scenes = [
  {
    start: 0,
    end: 11,
    caption: "Millimeter-wave radar can estimate human pose without cameras. But one unseen motion can push joint error from about fifty to over one hundred and twenty millimeters.",
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
  document.querySelector("#error-number").textContent = String(Math.round(50 + ease((local - 0.42) / 0.35) * 73));
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
  for (let i = 0; i < 88; i += 1) {
    const dot = document.createElement("i");
    const torso = i < 48;
    const x = torso ? 50 + (random() - 0.5) * 24 : 20 + random() * 64;
    const y = torso ? 25 + random() * 53 : 18 + random() * 70;
    dot.style.cssText = `--x:${x}%;--y:${y}%;--d:${(1.8 + random() * 4).toFixed(1)}px;--a:${(0.25 + random() * 0.65).toFixed(2)};--delay:${(random() * 1.5).toFixed(2)}s`;
    cloud.append(dot);
  }
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
setTime(0);
requestAnimationFrame(tick);

const params = new URLSearchParams(location.search);
if (params.has("render")) document.body.classList.add("render-mode");
if (params.has("autoplay")) setPlaying(true);

window.__setTime = (time) => { setPlaying(false); setTime(time, true); };
window.__WICOMPASS_READY__ = true;

