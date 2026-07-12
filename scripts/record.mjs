import { existsSync } from "node:fs";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DURATION, SCENES } from "../content/timeline.js";
import { openRenderSession } from "./lib/capture-session.mjs";
import { probeDuration, runFfmpeg } from "./lib/media.mjs";

const args = process.argv.slice(2);
const sceneFlag = args.indexOf("--scene");
const requestedScene = sceneFlag >= 0 ? SCENES.find(({ id }) => id === args[sceneFlag + 1]) : undefined;
if (sceneFlag >= 0 && !requestedScene) throw new Error(`Unknown scene: ${args[sceneFlag + 1]}`);

const previewSpeed = Math.max(1, Number(process.env.PREVIEW_SPEED) || 1);
const isPreview = previewSpeed > 1;
const isDraft = isPreview || args.includes("--draft");
const segmentStart = requestedScene?.start ?? 0;
const segmentEnd = requestedScene?.end ?? DURATION;
const timelineSeconds = segmentEnd - segmentStart;
const outputSeconds = timelineSeconds / previewSpeed;
const captureTimeoutMs = Math.ceil(outputSeconds * 1000) + 8_000;
const tailHoldSeconds = 0.4;
const outputDir = "dist";
const captureDir = await mkdtemp(join(tmpdir(), "wicompass-capture-"));
await mkdir(outputDir, { recursive: true });

const session = await openRenderSession({
  speed: previewSpeed,
  recordVideo: { dir: captureDir, size: { width: 1280, height: 720 } },
});
const video = session.page.video();
let capturedPath;
try {
  if (requestedScene) await session.page.evaluate((time) => window.__setTime(time), segmentStart);
  await session.page.evaluate(() => document.querySelector("#play").click());
  process.stdout.write(requestedScene
    ? `Recording scene “${requestedScene.id}” at ${previewSpeed}×…\n`
    : isPreview
      ? `Recording a ${previewSpeed}× timeline preview…\n`
      : `Recording the ${DURATION}-second HTML timeline…\n`);

  if (requestedScene) {
    await session.page.waitForFunction((end) => window.__WICOMPASS_TIME__ >= end, segmentEnd, { timeout: captureTimeoutMs });
    await session.page.evaluate(() => document.querySelector("#play").click());
  } else {
    await session.page.waitForFunction(() => window.__WICOMPASS_FINISHED__ === true, null, { timeout: captureTimeoutMs });
  }
  await session.page.waitForTimeout(tailHoldSeconds * 1000);
  if (session.pageErrors.length) throw session.pageErrors[0];
  await session.context.close();
  capturedPath = await video.path();
} finally {
  await session.close();
  if (!capturedPath && !process.env.KEEP_CAPTURE) await rm(captureDir, { recursive: true, force: true });
}

const outputName = requestedScene
  ? `WiCompass-scene-${requestedScene.id}${isDraft ? "-draft" : ""}.mp4`
  : isPreview
    ? "WiCompass-MobiCom26-Teaser-preview.mp4"
    : isDraft
      ? "WiCompass-MobiCom26-Teaser-fast-draft.mp4"
      : "WiCompass-MobiCom26-Teaser-draft.mp4";
const outputPath = join(outputDir, outputName);

let hasAudio = false;
try { hasAudio = (await stat("assets/audio/voiceover.m4a")).isFile(); } catch {}
const capturedDuration = probeDuration(capturedPath);
const preRollSeconds = Math.max(0, capturedDuration - outputSeconds - tailHoldSeconds);
const videoCodecArgs = isDraft
  ? ["-r", "30", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "25", "-pix_fmt", "yuv420p"]
  : ["-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p"];

const ffmpegArgs = ["-y", "-ss", preRollSeconds.toFixed(3), "-i", capturedPath];
const includeAudio = !requestedScene && !isPreview && hasAudio;
if (includeAudio) ffmpegArgs.push("-i", "assets/audio/voiceover.m4a");
ffmpegArgs.push("-t", outputSeconds.toFixed(3), ...videoCodecArgs);
if (includeAudio) ffmpegArgs.push("-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2");
else ffmpegArgs.push("-an");
ffmpegArgs.push("-movflags", "+faststart", outputPath);

process.stdout.write(`Trimming ${preRollSeconds.toFixed(3)} seconds of browser pre-roll.\n`);
try {
  await runFfmpeg(ffmpegArgs);
} finally {
  if (!process.env.KEEP_CAPTURE && existsSync(captureDir)) await rm(captureDir, { recursive: true, force: true });
}

process.stdout.write(`Video written to ${outputPath}.\n`);
