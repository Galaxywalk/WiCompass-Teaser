import { lstat, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

async function entries(path) {
  try {
    return await readdir(path, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

const removed = [];
async function remove(path) {
  try {
    await lstat(path);
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  await rm(path, { recursive: true, force: true });
  removed.push(path);
}

await remove(".DS_Store");
await remove("dist/frames");

for (const entry of await entries("dist")) {
  if (!entry.isFile()) continue;
  if (entry.name === "WiCompass-MobiCom26-Teaser.mp4") continue;
  if (/^WiCompass-(?:scene-.*|MobiCom26-Teaser-(?:preview|fast-draft|draft)).*\.mp4$/.test(entry.name)) {
    await remove(join("dist", entry.name));
  }
}

for (const entry of await entries("tmp")) {
  if (entry.name === "data") continue;
  await remove(join("tmp", entry.name));
}

process.stdout.write(`Removed ${removed.length} intermediate paths; preserved the final MP4, current review stills, and tmp/data.\n`);
