import { COVERAGE_GRID, LATENT_MAP } from "../../content/procedural-data.js";
import { requiredElement } from "../core/dom.js";
import { seededRandom } from "../core/utils.js";

export function renderLatentMap(root = document, config = LATENT_MAP) {
  const random = seededRandom(config.seed);
  const map = requiredElement("#map-points", root);
  map.replaceChildren();
  for (let index = 0; index < config.pointCount; index += 1) {
    const point = document.createElement("i");
    const angle = random() * Math.PI * 2;
    const radius = Math.pow(random(), 0.62) * 43;
    const x = 50 + Math.cos(angle) * radius * 1.35;
    const y = 50 + Math.sin(angle) * radius;
    point.style.cssText = `--x:${x}%;--y:${y}%;--s:${(2 + random() * 5).toFixed(1)}px;--i:${index}`;
    point.className = index % config.hotEvery === 0 ? "hot" : "";
    map.append(point);
  }
}

export function renderCoverageGrid(root = document, config = COVERAGE_GRID) {
  const field = requiredElement("#coverage-field", root);
  const gaps = new Set(config.gapIndices);
  field.replaceChildren();
  for (let index = 0; index < config.cellCount; index += 1) {
    const cell = document.createElement("i");
    cell.className = gaps.has(index) ? "gap" : "covered";
    cell.style.setProperty("--i", index);
    field.append(cell);
  }
}

export function renderProceduralVisuals(root = document) {
  renderLatentMap(root);
  renderCoverageGrid(root);
}
