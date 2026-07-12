import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { SCENES } from "../content/timeline.js";
import { openRenderSession } from "./lib/capture-session.mjs";
import { captureTimelineFrame } from "./lib/frames.mjs";

const outputDir = "dist/stills/current";
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const session = await openRenderSession();
const manifest = [];
try {
  for (const [index, scene] of SCENES.entries()) {
    const time = scene.still ?? (scene.start + scene.end) / 2;
    const filename = `${String(index + 1).padStart(2, "0")}-${scene.id}-${time}s.png`;
    await captureTimelineFrame(session.page, { time, path: join(outputDir, filename) });
    manifest.push({ scene: scene.id, time, filename });
  }
  if (session.pageErrors.length) throw session.pageErrors[0];
  await writeFile(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
} finally {
  await session.close();
}

process.stdout.write(`Wrote ${SCENES.length} deterministic review stills to ${outputDir}/.\n`);
