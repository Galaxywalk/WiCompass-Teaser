import { mkdir, readdir, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";
import playwright from "playwright";
import { startServer } from "./serve.mjs";

const { chromium } = playwright;
const systemChrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const DURATION_MS = 86_500;
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
await page.goto("http://127.0.0.1:4173/?render=1&autoplay=1", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WICOMPASS_READY__ === true);
process.stdout.write("Recording the 86-second HTML timeline…\n");
await page.waitForTimeout(DURATION_MS);
await context.close();
await browser.close();
server.close();

const [capturedName] = (await readdir(captureDir)).filter((name) => name.endsWith(".webm"));
if (!capturedName) throw new Error("Playwright did not produce a WebM capture.");
const capturedPath = join(captureDir, capturedName);
const outputPath = join(outputDir, "WiCompass-MobiCom26-Teaser-draft.mp4");

let hasAudio = false;
try { hasAudio = (await stat("assets/audio/voiceover.m4a")).isFile(); } catch {}

const args = hasAudio
  ? ["-y", "-i", capturedPath, "-i", "assets/audio/voiceover.m4a", "-t", "86", "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-movflags", "+faststart", outputPath]
  : ["-y", "-i", capturedPath, "-t", "86", "-r", "30", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-maxrate", "5M", "-bufsize", "10M", "-pix_fmt", "yuv420p", "-movflags", "+faststart", outputPath];

await new Promise((resolve, reject) => {
  const process = spawn("ffmpeg", args, { stdio: "inherit" });
  process.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)));
});

process.stdout.write(`Draft written to ${outputPath}.\n`);
