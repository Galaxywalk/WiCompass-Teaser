import { DURATION, SCENES } from "../content/timeline.js";
import { renderScienceCharts } from "./charts/index.js";
import { bindPlaybackControls } from "./core/controls.js";
import { assertSceneManifest, collectSceneElements, requiredElement } from "./core/dom.js";
import { createTimelinePlayer } from "./core/timeline-player.js";
import { createFrameUpdater } from "./scenes/frame-updaters.js";
import { renderContentBindings } from "./scenes/content-bindings.js";
import { renderProceduralVisuals } from "./scenes/procedural-visuals.js";
import { renderProjectMetadata } from "./scenes/project-metadata.js";

export function bootstrapTeaser(root = document) {
  const params = new URLSearchParams(location.search);
  const playbackRate = Math.max(0.25, Number(params.get("speed")) || 1);
  const stage = requiredElement("#stage", root);
  const sceneElements = collectSceneElements(root);
  assertSceneManifest(sceneElements, SCENES);

  renderContentBindings(root);
  renderProjectMetadata(root);
  renderProceduralVisuals(root);
  renderScienceCharts(root);

  const controls = {
    play: requiredElement("#play", root),
    restart: requiredElement("#restart", root),
    mute: requiredElement("#mute", root),
    fullscreen: requiredElement("#fullscreen", root),
    scrubber: requiredElement("#scrubber", root),
  };
  const voiceover = requiredElement("#voiceover", root);
  const updateSceneFrame = createFrameUpdater({ scenes: SCENES, sceneElements, root });
  const player = createTimelinePlayer({
    scenes: SCENES,
    duration: DURATION,
    sceneElements,
    stage,
    caption: requiredElement("#caption", root),
    sceneIndex: requiredElement("#scene-index", root),
    timelineProgress: requiredElement("#timeline-progress", root),
    scrubber: controls.scrubber,
    timecode: requiredElement("#timecode", root),
    playButton: controls.play,
    voiceover,
    playbackRate,
    onFrame: (frame) => {
      window.__WICOMPASS_TIME__ = frame.time;
      updateSceneFrame(frame);
    },
    onPlay: () => { window.__WICOMPASS_FINISHED__ = false; },
    onFinish: () => { window.__WICOMPASS_FINISHED__ = true; },
  });

  bindPlaybackControls({ player, stage, voiceover, ...controls });
  if (params.has("render")) document.body.classList.add("render-mode");
  if (params.has("autoplay")) player.setPlaying(true);

  window.__setTime = (time) => {
    player.setPlaying(false);
    player.seek(time, true);
  };
  window.__renderFrame = async (time) => {
    window.__setTime(time);
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : image.decode()));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  };
  window.__WICOMPASS_FINISHED__ = false;
  window.__WICOMPASS_READY__ = true;
  return player;
}
