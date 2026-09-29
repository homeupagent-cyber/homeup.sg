import path from "node:path";
import type { BrowserContext, Page } from "patchright";
import { validatePropertyGuruUrl } from "@/lib/listings/import/fetch-listing-page";

/**
 * Listing-page fetch through a real Chrome.
 *
 * The plain `fetchListingPage()` sends an iPhone User-Agent over a bare fetch with
 * no JS engine and no cookie jar. Cloudflare scores that as a bot and serves a
 * managed challenge whenever the source IP has middling reputation — which is what
 * happens from hotel wifi, mobile data, or anywhere outside Singapore. A real
 * browser clears the same challenge transparently.
 *
 * Local-only: this opens a visible Chrome window, so it never runs on Vercel.
 * Use it as a fallback after `fetchListingPage()` returns FETCH_BLOCKED.
 */

export type BrowserFetchResult = { ok: true; html: string } | { ok: false; error: string };

export type BrowserListingFetcher = {
  fetch(url: string): Promise<BrowserFetchResult>;
  close(): Promise<void>;
};

/**
 * Deliberately separate from the agent-sources profile (`.pg-profile`): Chrome locks
 * a profile directory, so sharing one would make a listing fetch and a sources fetch
 * collide whenever both run from the same machine.
 */
function listingProfileDir(): string {
  return process.env.PG_LISTING_PROFILE_DIR ?? path.join(process.cwd(), ".pg-listing-profile");
}

function challengeWaitMs(): number {
  const raw = process.env.PG_LISTING_CHALLENGE_WAIT ?? "120000";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120_000;
}

function politeDelayMs(): number {
  return 1500 + Math.floor(Math.random() * 2501);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isChallengeVisible(page: Page): Promise<boolean> {
  const title = await page.title().catch(() => "");
  if (/just a moment|attention required/i.test(title)) return true;
  const frames = await page
    .locator('iframe[src*="challenges.cloudflare.com"]')
    .count()
    .catch(() => 0);
  return frames > 0;
}

async function waitForChallengeToClear(page: Page, label: string): Promise<boolean> {
  const deadline = Date.now() + challengeWaitMs();
  let logged = false;

  while (Date.now() < deadline) {
    if (!(await isChallengeVisible(page))) return true;

    if (!logged) {
      console.warn(
        `[pg-browser] Cloudflare challenge on ${label} — it usually clears itself; solve it in the Chrome window if it does not`,
      );
      logged = true;
    }

    await sleep(2000);
  }

  return !(await isChallengeVisible(page));
}

export function createBrowserListingFetcher(): BrowserListingFetcher {
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let launchError: string | null = null;
  let fetchCount = 0;

  async function ensurePage(): Promise<{ ok: true; page: Page } | { ok: false; error: string }> {
    if (launchError) return { ok: false, error: launchError };
    if (page) return { ok: true, page };

    try {
      const { chromium } = await import("patchright");
      context = await chromium.launchPersistentContext(listingProfileDir(), {
        channel: "chrome",
        headless: false,
        viewport: null,
      });
      page = context.pages()[0] ?? (await context.newPage());
      console.info("[pg-browser] Chrome opened for listing fetches — leave the window open");
      return { ok: true, page };
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      launchError = /already in use|ProcessSingleton|SingletonLock/i.test(message)
        ? `Chrome profile already in use (${listingProfileDir()}) — close the other sync window and retry`
        : `Could not start Chrome: ${message} — run "npm run pg:install" if Chrome is missing`;
      return { ok: false, error: launchError };
    }
  }

  async function fetchOne(url: string): Promise<BrowserFetchResult> {
    const validationError = validatePropertyGuruUrl(url);
    if (validationError) return { ok: false, error: validationError };

    const ready = await ensurePage();
    if (!ready.ok) return { ok: false, error: ready.error };

    // Space out requests so a run of listings does not look like a scrape.
    if (fetchCount > 0) await sleep(politeDelayMs());
    fetchCount += 1;

    const label = url.slice(url.lastIndexOf("/") + 1);

    try {
      await ready.page.goto(url, { waitUntil: "domcontentloaded", timeout: 90_000 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "navigation failed";
      return { ok: false, error: `Browser navigation failed: ${message}` };
    }

    if (!(await waitForChallengeToClear(ready.page, label))) {
      return { ok: false, error: "FETCH_BLOCKED" };
    }

    const html = await ready.page.content().catch(() => "");

    // A cleared challenge should leave us on the listing itself, with a full page of
    // markup. Anything else is an error page the extractor cannot use.
    if (!ready.page.url().includes("/listing/") || html.trim().length < 2000) {
      return { ok: false, error: "FETCH_BLOCKED" };
    }

    return { ok: true, html };
  }

  async function close(): Promise<void> {
    if (!context) return;
    await context.close().catch(() => {});
    context = null;
    page = null;
  }

  return { fetch: fetchOne, close };
}
