import { clamp, formatTime, smoothstep } from "./utils.js";

const DEFAULT_FADE_SECONDS = 0.18;

export function createTimelinePlayer({
  scenes,
  duration,
  sceneElements,
  stage,
  scrubber,
  timecode,
  playButton,
  voiceover,
  playbackRate = 1,
  fadeSeconds = DEFAULT_FADE_SECONDS,
  onFrame = () => {},
  onFinish = () => {},
  onPlay = () => {},
}) {
  let currentTime = 0;
  let currentScene = "";
  let playing = false;
  let playStartedAt = performance.now();

  scrubber.max = String(duration);

  function renderTime(value, syncAudio = false) {
    currentTime = clamp(Number(value), 0, duration);
    const foundIndex = scenes.findIndex((scene) => currentTime >= scene.start && currentTime < scene.end);
    const resolvedIndex = foundIndex < 0 ? scenes.length - 1 : foundIndex;
    const scene = scenes[resolvedIndex];

    scenes.forEach((item, position) => {
      const element = sceneElements.get(item.id);
      const local = clamp((currentTime - item.start) / (item.end - item.start));
      const entering = position === 0 ? 1 : smoothstep((currentTime - item.start) / fadeSeconds);
      const exiting = position === scenes.length - 1 ? 1 : 1 - smoothstep((currentTime - (item.end - fadeSeconds)) / fadeSeconds);
      const active = position === resolvedIndex;
      element.classList.toggle("is-active", active);
      element.style.setProperty("--p", active ? local.toFixed(4) : 0);
      element.style.setProperty("--v", active ? Math.min(entering, exiting).toFixed(4) : 0);
    });

    if (currentScene !== scene.id) {
      currentScene = scene.id;
      stage.dataset.scene = scene.id;
    }

    scrubber.value = String(currentTime);
    timecode.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    onFrame({ time: currentTime, scene, sceneIndex: resolvedIndex });

    if (syncAudio && Number.isFinite(voiceover.duration)) voiceover.currentTime = currentTime;
  }

  function seek(value, syncAudio = false) {
    renderTime(value, syncAudio);
    if (playing) playStartedAt = performance.now() - (currentTime / playbackRate) * 1000;
  }

  function setPlaying(value) {
    if (playing === value) return;
    playing = value;
    playButton.textContent = value ? "Ⅱ" : "▶";
    playButton.setAttribute("aria-label", value ? "Pause" : "Play");

    if (value) {
      playStartedAt = performance.now() - (currentTime / playbackRate) * 1000;
      onPlay();
      if (playbackRate === 1) voiceover.play().catch(() => {});
    } else {
      voiceover.pause();
    }
  }

  function tick(now) {
    if (playing) {
      const next = ((now - playStartedAt) / 1000) * playbackRate;
      if (next >= duration) {
        renderTime(duration);
        setPlaying(false);
        onFinish();
      } else {
        renderTime(next);
      }
    }
    requestAnimationFrame(tick);
  }

  function restart() {
    seek(0, true);
    setPlaying(true);
  }

  function toggle() {
    setPlaying(!playing);
  }

  renderTime(0);
  requestAnimationFrame(tick);

  return {
    get currentTime() { return currentTime; },
    get playing() { return playing; },
    restart,
    seek,
    setPlaying,
    toggle,
  };
}
