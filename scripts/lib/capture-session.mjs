import { existsSync } from "node:fs";
import playwright from "playwright";
import { startServer } from "../serve.mjs";

const DEFAULT_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export async function openRenderSession({ speed = 1, recordVideo } = {}) {
  const { chromium } = playwright;
  const chrome = process.env.CHROME_PATH ?? DEFAULT_CHROME;
  const { server, origin } = await startServer(0);
  let browser;
  let context;

  try {
    browser = await chromium.launch({
      headless: true,
      ...(existsSync(chrome) ? { executablePath: chrome } : {}),
    });
    context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      ...(recordVideo ? { recordVideo } : {}),
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));
    page.on("requestfailed", (request) => pageErrors.push(new Error(`Request failed: ${request.url()}`)));

    await page.goto(`${origin}/?render=1&speed=${speed}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__WICOMPASS_READY__ === true);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((image) => image.decode()));
    });
    if (pageErrors.length) throw pageErrors[0];

    return {
      browser,
      context,
      origin,
      page,
      pageErrors,
      server,
      async close() {
        await context?.close().catch(() => {});
        await browser?.close().catch(() => {});
        await new Promise((resolve) => server.close(resolve));
      },
    };
  } catch (error) {
    await context?.close().catch(() => {});
    await browser?.close().catch(() => {});
    await new Promise((resolve) => server.close(resolve));
    throw error;
  }
}
