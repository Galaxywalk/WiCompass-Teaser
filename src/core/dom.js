export function requiredElement(selector, root = document) {
  const element = root.querySelector(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
}

export function collectSceneElements(root = document) {
  return new Map(
    [...root.querySelectorAll(".scene")].map((element) => [element.dataset.scene, element]),
  );
}

export function assertSceneManifest(sceneElements, scenes) {
  const actual = [...sceneElements.keys()];
  const expected = scenes.map(({ id }) => id);
  if (actual.length !== expected.length || expected.some((id) => !sceneElements.has(id))) {
    throw new Error(`Timeline and scene DOM are out of sync. Expected: ${expected.join(", ")}; found: ${actual.join(", ")}`);
  }
}
