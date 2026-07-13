import { METHOD_SPACE } from "../../content/procedural-data.js";
import { requiredElement } from "../core/dom.js";
import { seededRandom } from "../core/utils.js";

const SVG_NS = "http://www.w3.org/2000/svg";

function createSvgElement(name, attributes, className) {
  const element = document.createElementNS(SVG_NS, name);
  if (className) element.setAttribute("class", className);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  return element;
}

function sampleClusterPoint(cluster, random) {
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random());
  const localX = Math.cos(angle) * cluster.rx * radius;
  const localY = Math.sin(angle) * cluster.ry * radius;
  const cos = Math.cos(cluster.rotation);
  const sin = Math.sin(cluster.rotation);
  return {
    x: cluster.cx + localX * cos - localY * sin,
    y: cluster.cy + localX * sin + localY * cos,
  };
}

export function renderMethodSpace(root = document, config = METHOD_SPACE) {
  const random = seededRandom(config.seed);
  const amassLayer = requiredElement("#method-amass-points", root);
  const mmwaveLayer = requiredElement("#method-mmwave-points", root);
  const gapLayer = requiredElement("#method-gap-points", root);
  amassLayer.replaceChildren();
  mmwaveLayer.replaceChildren();
  gapLayer.replaceChildren();

  let pointIndex = 0;
  config.referenceClusters.forEach((cluster) => {
    for (let index = 0; index < cluster.count; index += 1) {
      const { x, y } = sampleClusterPoint(cluster, random);
      const point = createSvgElement("circle", {
        cx: x.toFixed(2),
        cy: y.toFixed(2),
        r: (2.35 + random() * 1.15).toFixed(2),
      }, "method-amass-point");
      point.style.setProperty("--i", pointIndex);
      amassLayer.append(point);
      pointIndex += 1;
    }
  });

  config.mmwavePoints.forEach(([x, y], index) => {
    const point = createSvgElement("circle", { cx: x, cy: y, r: 5.5 }, "method-mmwave-point");
    point.style.setProperty("--i", index);
    mmwaveLayer.append(point);
  });

  config.gapPoints.forEach(({ x, y, selected }, index) => {
    const group = createSvgElement("g", {}, selected ? "method-gap-point is-selected" : "method-gap-point");
    group.style.setProperty("--i", index);
    group.append(
      createSvgElement("circle", { cx: x, cy: y, r: 4 }, "method-gap-origin"),
      createSvgElement("circle", { cx: x, cy: y, r: 9 }, "method-gap-ring"),
    );
    if (selected) group.append(createSvgElement("circle", { cx: x, cy: y, r: 5.5 }, "method-selected-target"));
    gapLayer.append(group);
  });
}

export function renderProceduralVisuals(root = document) {
  renderMethodSpace(root);
}
