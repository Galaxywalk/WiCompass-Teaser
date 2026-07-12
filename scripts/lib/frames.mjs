export async function captureTimelineFrame(page, { time, path }) {
  await page.evaluate((value) => window.__renderFrame(value), time);
  await page.screenshot({ path });
}
