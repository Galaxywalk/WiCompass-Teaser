import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import playwright from "playwright";
import { startServer } from "./serve.mjs";
import { SCENES } from "../content/timeline.js";

const { chromium } = playwright;
const systemChrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const server = await startServer();
const browser = await chromium.launch({ headless: true, ...(existsSync(systemChrome) ? { executablePath: systemChrome } : {}) });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4173/?render=1", { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__WICOMPASS_READY__ === true);
await mkdir("dist/stills", { recursive: true });

for (const [index, scene] of SCENES.entries()) {
  const time = scene.still ?? (scene.start + scene.end) / 2;
  await page.evaluate((value) => window.__setTime(value), time);
  await page.waitForTimeout(80);
  await page.screenshot({ path: `dist/stills/${String(index + 1).padStart(2, "0")}-${scene.id}-${time}s.png` });
}

await browser.close();
server.close();
process.stdout.write("Wrote ten review stills to dist/stills/.\n");
