#!/usr/bin/env node
/**
 * Capture the still image of a launch's 3D site study, used as the Open Graph image and as
 * the fallback for browsers without WebGL. The image includes the indicative-study label.
 *
 * Usage (with the dev server running):
 *   npm run dev
 *   node scripts/launch-data/capture-site-still.mjs <slug> [baseUrl]
 *
 * Writes: public/launch-data/<slug>/site-study.jpg (1200 x 630)
 * Uses the patchright browser already installed for the listings sync (npm run pg:install).
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "patchright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WIDTH = 1200;
const HEIGHT = 630;

const [slug, baseUrl = "http://localhost:3000"] = process.argv.slice(2);
if (!slug) {
  console.error("Usage: node scripts/launch-data/capture-site-still.mjs <slug> [baseUrl]");
  process.exit(1);
}

const browser = await chromium
  .launch({ channel: "chrome", headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] })
  .catch(() => chromium.launch({ headless: true }));

try {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.goto(`${baseUrl}/new-launch/${slug}`, { waitUntil: "networkidle", timeout: 120000 });
  await page.getByRole("button", { name: "Open the 3D site study" }).click();
  await page.waitForSelector("[data-launch-canvas] canvas", { timeout: 60000 });

  // Pin the viewer to the full 1200 x 630 frame: label bar on top, canvas filling the rest.
  await page.addStyleTag({
    content: `
      [data-launch-viewer] { position: fixed !important; inset: 0 !important; z-index: 2147483647 !important;
        width: ${WIDTH}px !important; height: ${HEIGHT}px !important; border-radius: 0 !important;
        display: flex !important; flex-direction: column !important; }
      [data-launch-viewer] > p { font-size: 18px !important; padding: 14px 24px !important; }
      [data-launch-canvas] { flex: 1 1 auto !important; height: auto !important; }
      [data-launch-controls] { display: none !important; }
      body > *:not(:has([data-launch-viewer])) { visibility: hidden !important; }
    `,
  });
  await page.waitForTimeout(6000);

  const out = join(ROOT, "public", "launch-data", slug, "site-study.jpg");
  mkdirSync(dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: "jpeg", quality: 85, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
  console.log(`[launch-data] wrote public/launch-data/${slug}/site-study.jpg`);
} finally {
  await browser.close();
}
