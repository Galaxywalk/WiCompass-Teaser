import { spawn, spawnSync } from "node:child_process";

export function probeDuration(path) {
  const result = spawnSync("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nk=1:nw=1",
    path,
  ], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Unable to probe media duration: ${path}`);
  return Number(result.stdout.trim());
}

export function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const process = spawn("ffmpeg", args, { stdio: "inherit" });
    process.on("error", reject);
    process.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`)));
  });
}
