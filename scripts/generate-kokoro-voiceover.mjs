import { createHash } from "node:crypto";
import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { DURATION, SCENES } from "../content/timeline.js";
import { probeDuration, runFfmpeg } from "./lib/media.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const kokoroDir = resolve(process.env.KOKORO_DIR ?? join(homedir(), "Github/kokoro"));
const python = join(kokoroDir, ".venv/bin/python");
const ttsScript = join(kokoroDir, "local_tts.py");
const workDir = join(projectRoot, "tmp/kokoro-voiceover");
const cacheDir = join(projectRoot, "tmp/kokoro-cache");
const unnormalizedPath = join(workDir, "voiceover-unnormalized.wav");
const wavOutput = join(projectRoot, "assets/audio/voiceover.wav");
const m4aOutput = join(projectRoot, "assets/audio/voiceover.m4a");
const textOutput = join(projectRoot, "assets/audio/voiceover.txt");
const manifestOutput = join(projectRoot, "assets/audio/voiceover.manifest.json");
const voice = process.env.KOKORO_VOICE || "af_heart";
const speed = Number(process.env.KOKORO_SPEED) || 1.25;
const leadInSeconds = 0.25;
const minimumTailSeconds = 0.3;

function run(command, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.on("error", reject);
    child.on("exit", (code) => code === 0
      ? resolvePromise()
      : reject(new Error(`${command} exited with ${code}`)));
  });
}

await rm(workDir, { recursive: true, force: true });
await mkdir(workDir, { recursive: true });
await mkdir(cacheDir, { recursive: true });

const segmentPaths = [];
const manifestScenes = [];

for (const [index, scene] of SCENES.entries()) {
  const stem = `${String(index + 1).padStart(2, "0")}-${scene.id}`;
  const segmentPath = join(workDir, `${stem}.wav`);
  segmentPaths.push(segmentPath);

  if (!scene.voiceover) {
    await runFfmpeg([
      "-loglevel", "error", "-y",
      "-f", "lavfi", "-t", String(scene.duration),
      "-i", "anullsrc=r=24000:cl=mono",
      "-c:a", "pcm_s16le", segmentPath,
    ]);
    manifestScenes.push({ id: scene.id, sceneDuration: scene.duration, speechDuration: 0, leadIn: 0 });
    continue;
  }

  const cacheKey = createHash("sha256")
    .update(JSON.stringify({ text: scene.voiceover, language: "a", voice, speed }))
    .digest("hex")
    .slice(0, 16);
  const rawPath = join(cacheDir, `${scene.id}-${cacheKey}.wav`);
  try {
    await access(rawPath);
    process.stdout.write(`Kokoro cache: ${scene.id}\n`);
  } catch {
    process.stdout.write(`Kokoro generate: ${scene.id}\n`);
    await run(python, [
      ttsScript,
      scene.voiceover,
      "--lang", "a",
      "--voice", voice,
      "--speed", String(speed),
      "--output", rawPath,
    ], { cwd: kokoroDir });
  }

  const speechDuration = probeDuration(rawPath);
  const tailSeconds = scene.duration - leadInSeconds - speechDuration;
  if (tailSeconds < minimumTailSeconds) {
    throw new Error(`${scene.id}: ${speechDuration.toFixed(2)}s of speech does not fit the ${scene.duration.toFixed(2)}s scene with natural pauses.`);
  }

  await runFfmpeg([
    "-loglevel", "error", "-y",
    "-f", "lavfi", "-t", String(leadInSeconds), "-i", "anullsrc=r=24000:cl=mono",
    "-i", rawPath,
    "-f", "lavfi", "-t", tailSeconds.toFixed(4), "-i", "anullsrc=r=24000:cl=mono",
    "-filter_complex", "[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]",
    "-map", "[out]", "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le",
    segmentPath,
  ]);

  manifestScenes.push({
    id: scene.id,
    sceneDuration: scene.duration,
    speechDuration: Number(speechDuration.toFixed(4)),
    leadIn: leadInSeconds,
    tail: Number(tailSeconds.toFixed(4)),
  });
}

const concatPath = join(workDir, "segments.txt");
await writeFile(concatPath, `${segmentPaths.map((path) => `file '${path}'`).join("\n")}\n`);
await runFfmpeg([
  "-loglevel", "error", "-y",
  "-f", "concat", "-safe", "0", "-i", concatPath,
  "-c:a", "pcm_s16le", unnormalizedPath,
]);
await runFfmpeg([
  "-loglevel", "error", "-y",
  "-i", unnormalizedPath,
  "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
  "-ar", "24000", "-ac", "1", "-c:a", "pcm_s16le", wavOutput,
]);
await runFfmpeg([
  "-loglevel", "error", "-y",
  "-i", wavOutput,
  "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2",
  m4aOutput,
]);

const narrationText = SCENES.map(({ voiceover }) => voiceover).filter(Boolean).join("\n\n");
await writeFile(textOutput, `${narrationText}\n`);
const sourceHash = createHash("sha256")
  .update(JSON.stringify(SCENES.map(({ id, duration, voiceover }) => ({ id, duration, voiceover }))))
  .digest("hex");
await writeFile(manifestOutput, `${JSON.stringify({
  engine: "Kokoro local_tts.py",
  language: "a",
  voice,
  speed,
  normalization: { integratedLufs: -16, truePeakDbtp: -1.5, loudnessRange: 11 },
  sourceHash,
  duration: DURATION,
  generatedAt: new Date().toISOString(),
  scenes: manifestScenes,
}, null, 2)}\n`);

const wavDuration = probeDuration(wavOutput);
const m4aDuration = probeDuration(m4aOutput);
if (Math.abs(wavDuration - DURATION) > 0.1 || Math.abs(m4aDuration - DURATION) > 0.1) {
  throw new Error(`Generated audio duration mismatch: WAV ${wavDuration}s, M4A ${m4aDuration}s, timeline ${DURATION}s.`);
}

process.stdout.write(`Kokoro master written to ${wavOutput}\nMux audio written to ${m4aOutput}\n`);
