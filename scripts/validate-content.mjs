import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { ACTION_GENERALIZATION, BAR_CHARTS, LINE_CHARTS } from "../content/chart-data.js";
import { FACTS } from "../content/facts.js";
import { LEFT_HAND_WAVE_POSE } from "../content/pose-data.js";
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
assert.equal((html.match(/class="[^"]*scene-kicker[^"]*"/g) ?? []).length, 7, "Every narrative scene needs one shared scene-kicker");
assert.equal((html.match(/class="[^"]*scene-headline[^"]*"/g) ?? []).length, 7, "Every narrative scene needs one shared scene-headline");
assert.equal((html.match(/class="[^"]*scene-footer[^"]*"/g) ?? []).length, 6, "Expected six single-sentence narrative footers");
assert.doesNotMatch(html, /class="[^"]*scene-footer[^"]*"[^>]*>(?:(?!<\/footer>)[\s\S])*?<strong>/, "Scene footers must not introduce a second emphasized headline");

const methodInputs = html.match(/<section class="method-inputs"[\s\S]*?<\/section>/)?.[0] ?? "";
const methodTargets = html.match(/<section class="method-targets"[\s\S]*?<\/section>/)?.[0] ?? "";
const imageSources = (markup) => [...markup.matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1]);
const inputPoseSources = imageSources(methodInputs);
const targetPoseSources = imageSources(methodTargets);
assert.equal(targetPoseSources.length, 1, "Method scene needs exactly one selected collection target");
assert.equal(new Set(targetPoseSources).size, targetPoseSources.length, "Next-target poses must be distinct");
assert.ok(targetPoseSources.every((path) => !inputPoseSources.includes(path)), "Next-target poses must not reuse encoder input poses");

const visibleCopy = JSON.stringify({
  html: html.replace(/<[^>]+>/g, " "),
  charts: { ACTION_GENERALIZATION, LINE_CHARTS, BAR_CHARTS },
  facts: FACTS,
  project: PROJECT,
});
for (const [variant, canonical] of [
  ["Wi-Compass", "WiCompass"],
  ["mmwave", "mmWave"],
  ["MMWave", "mmWave"],
  ["MmWave", "mmWave"],
  ["Mocap", "MoCap"],
  ["MOCAP", "MoCap"],
  ["Amass", "AMASS"],
  ["MMbody", "mmBody"],
  ["Mmbody", "mmBody"],
]) {
  assert.ok(!visibleCopy.includes(variant), `Visible copy uses ${variant}; use ${canonical}`);
}

for (const { selector, config } of LINE_CHARTS) {
  assert.ok(config.series.length > 0, `${selector}: missing series`);
  const lengths = config.series.map(({ values }) => values.length);
  assert.equal(new Set(lengths).size, 1, `${selector}: series lengths differ`);
  assert.ok(config.series.flatMap(({ values }) => values).every(Number.isFinite), `${selector}: non-finite value`);
  assert.equal(config.xValues?.length ?? lengths[0], lengths[0], `${selector}: x/series length mismatch`);
  assert.ok(config.xTicks.every(({ index }) => index >= 0 && index < lengths[0]), `${selector}: invalid x tick index`);
  if (config.xScale === "log") assert.ok(config.xValues.every((value) => value > 0), `${selector}: log x values must be positive`);
  config.series.filter(({ fit }) => fit).forEach(({ fit }) => {
    assert.equal(fit.model, "power", `${selector}: unsupported fit model`);
    assert.ok(Number.isFinite(fit.coefficient) && fit.coefficient > 0, `${selector}: invalid fit coefficient`);
    assert.ok(Number.isFinite(fit.exponent), `${selector}: invalid fit exponent`);
  });
  const values = config.series.flatMap(({ values }) => values);
  assert.ok(Math.min(...values) >= config.yMin && Math.max(...values) <= config.yMax, `${selector}: data outside y domain`);
}

for (const { selector, config } of BAR_CHARTS) {
  assert.ok(config.groups.length > 0, `${selector}: missing groups`);
  assert.ok(config.groups.every(({ values }) => values.length === 2 && values.every(Number.isFinite)), `${selector}: each group needs train/test values`);
  const values = config.groups.flatMap(({ values }) => values);
  assert.ok(Math.min(...values) >= config.yMin && Math.max(...values) <= config.yMax, `${selector}: data outside y domain`);
}

assert.equal(ACTION_GENERALIZATION.action.id, "A17");
assert.equal(ACTION_GENERALIZATION.action.label, "Left-hand wave");
assert.equal(ACTION_GENERALIZATION.conditions.length, 2);
assert.ok(ACTION_GENERALIZATION.conditions.every(({ value }) => Number.isFinite(value) && value >= 0 && value <= ACTION_GENERALIZATION.yMax));
assert.equal(FACTS["action-seen"], "41.1 mm");
assert.equal(FACTS["action-heldout"], "151.1 mm");
assert.equal(FACTS["action-ratio"], "3.7× error");
assert.equal(FACTS["efficiency-title"], "More of the same data barely helps.");
assert.equal(LEFT_HAND_WAVE_POSE.joints.length, 24, "Shared action motif must use the canonical 24-joint pose");
assert.ok(
  LEFT_HAND_WAVE_POSE.chains.flat().every((index) => Number.isInteger(index) && index >= 0 && index < LEFT_HAND_WAVE_POSE.joints.length),
  "Shared action motif contains an invalid joint index",
);

const assetPaths = [
  ...[...html.matchAll(/(?:src|href)="((?:assets\/)[^"]+)"/g)].map((match) => match[1]),
  ...PROJECT.institutions.map(({ src }) => src),
];
for (const path of new Set(assetPaths)) assert.ok((await stat(path)).isFile(), `Missing asset: ${path}`);

const cssFiles = files.filter((path) => extname(path) === ".css");
for (const path of cssFiles) {
  const css = await readFile(path, "utf8");
  assert.doesNotMatch(css, /Source Sans/, `${path}: Inter is the only prose font`);
  for (const match of css.matchAll(/font-size:\s*([^;]+);/g)) {
    assert.match(match[1], /^var\(--(?:type-(utility|body|deck|title|hero)|spec-type-(hero|section|explanation|annotation))\)$/, `${path}: font-size must use the locked type scale (${match[1]})`);
  }
}
const methodCss = await readFile("styles/migrated/method.css", "utf8");
assert.doesNotMatch(methodCss, /var\(--yellow\)/, "Method colors are fixed: yellow must not reappear as an ambiguous coverage marker");

const expectedVoiceover = `${SCENES.map(({ voiceover }) => voiceover).filter(Boolean).join("\n\n")}\n`;
assert.equal(await readFile("assets/audio/voiceover.txt", "utf8"), expectedVoiceover, "voiceover.txt is stale");

const manifestPath = "assets/audio/voiceover.manifest.json";
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
assert.equal(manifest.engine, "Kokoro local_tts.py", `${manifestPath}: unexpected TTS engine`);
assert.equal(manifest.language, "a", `${manifestPath}: Kokoro language must be American English (a)`);
assert.equal(manifest.voice, "af_heart", `${manifestPath}: unexpected Kokoro voice`);
assert.ok(Number.isFinite(manifest.speed) && manifest.speed > 0, `${manifestPath}: speed must be positive`);
assert.deepEqual(
  manifest.normalization,
  { integratedLufs: -16, truePeakDbtp: -1.5, loudnessRange: 11 },
  `${manifestPath}: narration loudness target is stale`,
);

const expectedSourceHash = createHash("sha256")
  .update(JSON.stringify(SCENES.map(({ id, duration, voiceover }) => ({ id, duration, voiceover }))))
  .digest("hex");
assert.equal(manifest.sourceHash, expectedSourceHash, `${manifestPath}: sourceHash does not match content/timeline.js`);
assert.equal(manifest.duration, DURATION, `${manifestPath}: duration does not match the timeline`);
assert.ok(Array.isArray(manifest.scenes), `${manifestPath}: scenes must be an array`);
assert.equal(manifest.scenes.length, SCENES.length, `${manifestPath}: scene count does not match the timeline`);

manifest.scenes.forEach((audioScene, index) => {
  const timelineScene = SCENES[index];
  assert.equal(audioScene.id, timelineScene.id, `${manifestPath}: scene ${index + 1} ID/order mismatch`);
  assert.equal(audioScene.sceneDuration, timelineScene.duration, `${manifestPath}: ${timelineScene.id} duration mismatch`);
  assert.ok(Number.isFinite(audioScene.speechDuration) && audioScene.speechDuration >= 0, `${manifestPath}: ${timelineScene.id} has invalid speechDuration`);
  assert.ok(Number.isFinite(audioScene.leadIn) && audioScene.leadIn >= 0, `${manifestPath}: ${timelineScene.id} has invalid leadIn`);
  if (timelineScene.voiceover) {
    assert.ok(audioScene.speechDuration > 0, `${manifestPath}: ${timelineScene.id} is missing generated speech`);
    assert.ok(Number.isFinite(audioScene.tail) && audioScene.tail >= 0, `${manifestPath}: ${timelineScene.id} has invalid tail`);
    const composedDuration = audioScene.leadIn + audioScene.speechDuration + audioScene.tail;
    assert.ok(Math.abs(composedDuration - timelineScene.duration) < 0.01, `${manifestPath}: ${timelineScene.id} segment timing does not fill its scene`);
  } else {
    assert.equal(audioScene.speechDuration, 0, `${manifestPath}: silent scene ${timelineScene.id} contains speech`);
  }
});

const audioPaths = ["assets/audio/voiceover.wav", "assets/audio/voiceover.m4a"];
const audioDurations = audioPaths.map((path) => ({ path, duration: probeDuration(path) }));
for (const { path, duration } of audioDurations) {
  assert.ok(Number.isFinite(duration) && duration > 0, `${path}: invalid media duration`);
  assert.ok(Math.abs(duration - manifest.duration) < 0.1, `${path} is ${duration}s but the Kokoro manifest is ${manifest.duration}s`);
  assert.ok(Math.abs(duration - DURATION) < 0.1, `${path} is ${duration}s but the timeline is ${DURATION}s`);
}
assert.ok(Math.abs(audioDurations[0].duration - audioDurations[1].duration) < 0.1, "Kokoro WAV and M4A durations differ");

process.stdout.write(`Validated ${SCENES.length} scenes, ${DURATION}s timeline, ${1 + LINE_CHARTS.length + BAR_CHARTS.length} figures, locked typography, assets, and Kokoro audio manifest.\n`);
