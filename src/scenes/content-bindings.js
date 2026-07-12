import { FACTS } from "../../content/facts.js";

export function renderContentBindings(root = document) {
  root.querySelectorAll("[data-fact]").forEach((element) => {
    const value = FACTS[element.dataset.fact];
    if (value === undefined) throw new Error(`Unknown content fact: ${element.dataset.fact}`);
    element.textContent = value;
  });
}
