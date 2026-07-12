import { mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { join } from "node:path";
import playwright from "playwright";
import { startServer } from "./serve.mjs";
import { DURATION } from "../content/timeline.js";

const { chromium } = playwright;
const systemChrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const previewSpeed = Math.max(1, Number(process.env.PREVIEW_SPEED) || 1);
const isPreview = previewSpeed > 1;
const timelineDuration = DURATION;
const captureDurationMs = Math.ceil((timelineDuration / previewSpeed) * 1000) + 650;
const tailHoldSeconds = 0.4;
const outputDir = "dist";
const captureDir = join(outputDir, "capture");
await mkdir(captureDir, { recursive: true });

const server = await startServer();
const browser = await chromium.launch({ headless: true, ...(existsSync(systemChrome) ? { executablePath: systemChrome } : {}) });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: captureDir, size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const video = page.video();
await page.goto(`http://127.0.0.1:4173/?render=1&speed=${previewSpeed}`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WICOMPASS_READY__ === true);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.querySelector("#play").click());
process.stdout.write(isPreview
  ? `Recording a ${previewSpeed}× timeline preview…\n`
  : `Recording the ${timelineDuration}-second HTML timeline…\n`);
await page.waitForFunction(() => window.__WICOMPASS_FINISHED__ === true, null, { timeout: captureDurationMs + 5_000 });
await page.waitForTimeout(400);
await context.close();
const capturedPath = await video.path();
await browser.close();
server.close();

const outputPath = join(outputDir, isPreview
  ? "WiCompass-MobiCom26-Teaser-preview.mp4"
  : "WiCompass-MobiCom26-Teaser-draft.mp4");

let hasAudio = false;
try { hasAudio = (await stat("assets/audio/voiceover.m4a")).isFile(); } catch {}

const outputDuration = (timelineDuration / previewSpeed).toFixed(3);
const durationProbe = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", capturedPath], { encoding: "utf8" });
if (durationProbe.status !== 0) throw new Error("Unable to probe captured video duration.");
const capturedDuration = Number(durationProbe.stdout.trim());
const preRollSeconds = Math.max(0, capturedDuration - Number(outputDuration) - tailHoldSeconds);
const previewVideoArgs = ["-t", outputDuration, "-r", "30", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "27", "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart", outputPath];
const args = isPreview
  ? ["-y", "-ss", preRollSeconds.toFixed(3), "-i", capturedPath, ...previewVideoArgs]
  : hasAudio
  ? ["-y", "-ss", preRollSeconds.toFixed(3), "-i", capturedPath, "-i", "assets/audio/voiceover.m4a", "-t", String(timelineDuration), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", outputPath]
  : ["-y", "-ss", preRollSeconds.toFixed(3), "-i", capturedPath, "-t", String(timelineDuration), "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outputPath];

process.stdout.write(`Trimming ${preRollSeconds.toFixed(3)} seconds of captured browser pre-roll.\n`);

await new Promise((resolve, reject) => {
  const process = spawn("ffmpeg", args, { stdio: "inherit" });
  process.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)));
});

process.stdout.write(`Video written to ${outputPath}.\n`);
