import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import { DURATION, SCENES } from "../content/timeline.js";

const work = resolve("tmp/placeholder-audio");
const output = resolve("assets/audio/voiceover.m4a");

const segments = SCENES.map(({ duration, voiceover }) => ({ duration, text: voiceover }));

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} exited with ${result.status}`);
}

function probeDuration(path) {
  const result = spawnSync("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", path,
  ], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`ffprobe failed for ${path}`);
  return Number(result.stdout.trim());
}

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });

const rendered = [];
segments.forEach((segment, index) => {
  const wav = join(work, `${String(index).padStart(2, "0")}.wav`);
  if (!segment.text) {
    run("ffmpeg", ["-y", "-f", "lavfi", "-i", "anullsrc=r=48000:cl=mono", "-t", String(segment.duration), "-c:a", "pcm_s16le", wav]);
  } else {
    const raw = join(work, `${String(index).padStart(2, "0")}-raw.aiff`);
    run("say", ["-v", "Samantha", "-r", "180", "-o", raw, segment.text]);
    const rawDuration = probeDuration(raw);
    const spokenWindow = Math.max(0.5, segment.duration - 0.3);
    const speed = Math.max(1, rawDuration / spokenWindow);
    const filter = `${speed > 1.001 ? `atempo=${speed.toFixed(5)},` : ""}apad,atrim=duration=${segment.duration},asetpts=N/SR/TB`;
    run("ffmpeg", ["-y", "-i", raw, "-af", filter, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", wav]);
  }
  rendered.push(wav);
});

const concatList = join(work, "concat.txt");
writeFileSync(concatList, rendered.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n"));
run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatList, "-t", String(DURATION), "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "160k", output]);

writeFileSync("assets/audio/voiceover.txt", segments.filter((segment) => segment.text).map((segment) => segment.text).join("\n\n") + "\n");
process.stdout.write(`Placeholder voiceover written to ${output}. Final narration should use the selected MiniMax Gentle Teacher voice after picture lock.\n`);
