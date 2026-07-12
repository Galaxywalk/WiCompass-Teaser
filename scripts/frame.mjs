import { mkdir } from "node:fs/promises";
import { SCENES } from "../content/timeline.js";
import { openRenderSession } from "./lib/capture-session.mjs";
import { captureTimelineFrame } from "./lib/frames.mjs";

const args = process.argv.slice(2);
const sceneFlag = args.indexOf("--scene");
const timeFlag = args.indexOf("--time");
const scene = sceneFlag >= 0 ? SCENES.find(({ id }) => id === args[sceneFlag + 1]) : undefined;
if (sceneFlag >= 0 && !scene) throw new Error(`Unknown scene: ${args[sceneFlag + 1]}`);
const time = timeFlag >= 0 ? Number(args[timeFlag + 1]) : (scene?.still ?? 0);
if (!Number.isFinite(time)) throw new Error("--time must be a finite number");

await mkdir("dist/frames", { recursive: true });
const label = scene?.id ?? `${time}s`.replace(".", "-");
const outputPath = `dist/frames/${label}.png`;
const session = await openRenderSession();
try {
  await captureTimelineFrame(session.page, { time, path: outputPath });
  if (session.pageErrors.length) throw session.pageErrors[0];
} finally {
  await session.close();
}
process.stdout.write(`Frame written to ${outputPath}.\n`);
