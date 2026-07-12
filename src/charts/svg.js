const SVG_NS = "http://www.w3.org/2000/svg";

export function svgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS(SVG_NS, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text) element.textContent = text;
  return element;
}

export function requiredSvg(selector, root = document) {
  const svg = root.querySelector(selector);
  if (!(svg instanceof SVGSVGElement)) throw new Error(`SVG mount not found: ${selector}`);
  svg.replaceChildren();
  return svg;
}
