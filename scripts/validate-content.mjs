import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { BAR_CHARTS, LINE_CHARTS } from "../content/chart-data.js";
import { FACTS } from "../content/facts.js";
import { PROJECT } from "../content/project.js";
import { DURATION, SCENES } from "../content/timeline.js";
import { probeDuration } from "./lib/media.mjs";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    if (["node_modules", ".git", "dist", ".venv", "tmp"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await walk(path));
    else paths.push(path);
  }
  return paths;
}

const files = await walk(".");
for (const path of files.filter((file) => [".js", ".mjs"].includes(extname(file)))) {
  const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
  assert.equal(result.status, 0, `Syntax error in ${path}:\n${result.stderr}`);
}

const ids = SCENES.map(({ id }) => id);
assert.equal(new Set(ids).size, ids.length, "Timeline scene IDs must be unique");
assert.ok(SCENES.every(({ duration }) => duration > 0), "Every scene needs a positive duration");
assert.ok(DURATION <= 90, `Teaser is ${DURATION}s; MobiCom allows at most 90s`);
SCENES.forEach((scene) => {
  assert.ok(scene.still >= scene.start && scene.still <= scene.end, `${scene.id}: review still is outside its scene`);
});

const html = await readFile("index.html", "utf8");
const domIds = [...html.matchAll(/data-scene="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(domIds, ids, "Scene DOM IDs and order must exactly match the timeline");

for (const { selector, config } of LINE_CHARTS) {
  assert.ok(config.series.length > 0, `${selector}: missing series`);
  const lengths = config.series.map(({ values }) => values.length);
  assert.equal(new Set(lengths).size, 1, `${selector}: series lengths differ`);
  assert.ok(config.series.flatMap(({ values }) => values).every(Number.isFinite), `${selector}: non-finite value`);
  assert.equal(config.xValues?.length ?? lengths[0], lengths[0], `${selector}: x/series length mismatch`);
  assert.ok(config.xTicks.every(({ index }) => index >= 0 && index < lengths[0]), `${selector}: invalid x tick index`);
  if (config.xScale === "log") assert.ok(config.xValues.every((value) => value > 0), `${selector}: log x values must be positive`);
  const values = config.series.flatMap(({ values }) => values);
  assert.ok(Math.min(...values) >= config.yMin && Math.max(...values) <= config.yMax, `${selector}: data outside y domain`);
}

for (const { selector, config } of BAR_CHARTS) {
  assert.ok(config.groups.length > 0, `${selector}: missing groups`);
  assert.ok(config.groups.every(({ values }) => values.length === 2 && values.every(Number.isFinite)), `${selector}: each group needs train/test values`);
  const values = config.groups.flatMap(({ values }) => values);
  assert.ok(Math.min(...values) >= config.yMin && Math.max(...values) <= config.yMax, `${selector}: data outside y domain`);
}

assert.equal(FACTS["action-gap"], "41.1 → 151.1 mm");
assert.equal(FACTS["realworld-improvement"], "7.2 mm better than action-list collection");
assert.equal(FACTS["simulation-gap"], "25–30 mm lower OOD MPJPE");

const assetPaths = [
  ...[...html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g)].map((match) => match[1]),
  ...PROJECT.institutions.map(({ src }) => src),
];
for (const path of new Set(assetPaths)) assert.ok((await stat(path)).isFile(), `Missing asset: ${path}`);

const cssFiles = files.filter((path) => extname(path) === ".css");
for (const path of cssFiles) {
  const css = await readFile(path, "utf8");
  for (const match of css.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(match[1], /^var\(--type-(utility|body|deck|title|hero)\)$/, `${path}: font-size must use the locked type scale (${match[1]})`);
  }
}

const expectedVoiceover = `${SCENES.map(({ voiceover }) => voiceover).filter(Boolean).join("\n\n")}\n`;
assert.equal(await readFile("assets/audio/voiceover.txt", "utf8"), expectedVoiceover, "voiceover.txt is stale");
const audioDuration = probeDuration("assets/audio/voiceover.m4a");
assert.ok(Math.abs(audioDuration - DURATION) < 0.1, `Audio is ${audioDuration}s but timeline is ${DURATION}s`);

process.stdout.write(`Validated ${SCENES.length} scenes, ${DURATION}s timeline, ${LINE_CHARTS.length + BAR_CHARTS.length} charts, locked typography, assets, and audio.\n`);
