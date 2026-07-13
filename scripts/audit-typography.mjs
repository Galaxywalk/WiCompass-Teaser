import assert from "node:assert/strict";
import { SCENES } from "../content/timeline.js";
import { openRenderSession } from "./lib/capture-session.mjs";

const allowedSizes = new Set([26, 36, 56, 96]);
const allowedFamilies = ["Inter Teaser", "JetBrains Mono Teaser"];
const selector = "h1, h2, p, span, strong, code, b, text";
const session = await openRenderSession();

try {
  for (const scene of SCENES) {
    await session.page.evaluate((time) => window.__setTime(time), scene.still);
    const textNodes = await session.page.evaluate(({ id, selector: textSelector }) => {
      const root = document.querySelector(`[data-scene="${id}"]`);
      return [...root.querySelectorAll(textSelector)].flatMap((element) => {
        const text = element.textContent.replace(/\s+/g, " ").trim();
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const visible = text
          && style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity) > 0.02
          && rect.width > 0
          && rect.height > 0;
        if (!visible) return [];
        return [{
          tag: element.tagName.toLowerCase(),
          text,
          fontSize: Number.parseFloat(style.fontSize),
          fontFamily: style.fontFamily,
          rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom },
        }];
      });
    }, { id: scene.id, selector });

    for (const node of textNodes) {
      const label = `${scene.id}: <${node.tag}> “${node.text.slice(0, 72)}”`;
      assert.ok(allowedSizes.has(node.fontSize), `${label} uses ${node.fontSize}px`);
      assert.ok(allowedFamilies.some((family) => node.fontFamily.includes(family)), `${label} uses ${node.fontFamily}`);
      assert.ok(node.rect.left >= -0.5 && node.rect.top >= -0.5, `${label} starts outside the canvas`);
      assert.ok(node.rect.right <= 1280.5 && node.rect.bottom <= 720.5, `${label} ends outside the canvas`);
    }
  }
  if (session.pageErrors.length) throw session.pageErrors[0];
} finally {
  await session.close();
}

process.stdout.write(`Audited ${SCENES.length} scenes: visible text uses Inter/JetBrains Mono at 26, 36, 56, or 96 px and stays inside 1280×720.\n`);
