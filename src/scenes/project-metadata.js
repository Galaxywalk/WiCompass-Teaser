import { PROJECT } from "../../content/project.js";

function renderTitle(element) {
  const name = document.createElement("span");
  name.textContent = PROJECT.name;
  const breakAfterName = element.closest(".scene-back") ? document.createElement("br") : " ";
  element.replaceChildren(
    name,
    ":",
    breakAfterName,
    PROJECT.subtitleLines[0],
    document.createElement("br"),
    PROJECT.subtitleLines[1],
  );
}

function renderLogos(element) {
  const fragment = document.createDocumentFragment();
  PROJECT.institutions.forEach((institution) => {
    const image = document.createElement("img");
    image.className = institution.className;
    image.src = institution.src;
    image.alt = institution.alt;
    fragment.append(image);
  });
  element.replaceChildren(fragment);
}

function renderLines(element, lines) {
  const nodes = lines.flatMap((line, index) => index === 0
    ? [line]
    : [document.createElement("br"), line]);
  element.replaceChildren(...nodes);
}

export function renderProjectMetadata(root = document) {
  root.querySelectorAll("[data-project-title]").forEach(renderTitle);
  root.querySelectorAll("[data-project-authors]").forEach((element) => {
    renderLines(element, PROJECT.authorLines);
  });
  root.querySelectorAll("[data-project-conference]").forEach((element) => {
    element.textContent = PROJECT.conference;
  });
  root.querySelectorAll("[data-project-repository]").forEach((element) => {
    element.textContent = PROJECT.repository;
  });
  root.querySelectorAll("[data-project-logos]").forEach(renderLogos);
}
