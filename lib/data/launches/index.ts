import type { LaunchReview, LaunchStatus, MeasuredFacts } from "./types";
import solanoGrand from "./solano-grand";
import solanoGrandMeasured from "./measured/solano-grand.json";

/**
 * To add a launch:
 *   1. Create lib/data/launches/<slug>.ts (copy solano-grand.ts).
 *   2. Run `npm run launch:build-site -- <slug>` (writes the 3D context and measured facts).
 *   3. Add one entry below.
 *   4. Optional, with `npm run dev` running: `node scripts/launch-data/capture-site-still.mjs <slug>`
 *      for the share image and no-WebGL fallback.
 */
const LAUNCHES: { review: LaunchReview; measured: MeasuredFacts | null }[] = [
  { review: solanoGrand, measured: solanoGrandMeasured as MeasuredFacts },
];

/**
 * The "How HomeUP is paid" wording is a draft until Tong Boon and C & H's KEO confirm it.
 * Set to true once confirmed; until then no review counts as publishable.
 */
export const DISCLOSURE_CONFIRMED = false;

export interface LaunchEntry {
  review: LaunchReview;
  measured: MeasuredFacts | null;
  /** What still blocks publication. Empty means the review can ship. */
  missing: string[];
}

export const STATUS_ORDER: LaunchStatus[] = ["upcoming", "preview", "launched", "completed"];

export const STATUS_LABEL: Record<LaunchStatus, string> = {
  upcoming: "Upcoming",
  preview: "Preview",
  launched: "Launched",
  completed: "Completed",
};

function missingForPublish(review: LaunchReview): string[] {
  const missing: string[] = [];
  if (!review.summary) missing.push("One-line summary");
  if (!review.hubTake) missing.push("One-line HomeUP take for the hub card");
  if (!review.sunStudy) missing.push("Sun-path study text");
  if (!review.landAnalysis) missing.push("Land price analysis");
  if (review.pros.length === 0) missing.push("Pros");
  if (review.cons.length === 0) missing.push("Cons");
  if (review.whoShouldSkip.length === 0) missing.push("Who should skip this");
  if (!review.lastVerified) missing.push("Fact check date (lastVerified)");
  if (!DISCLOSURE_CONFIRMED) missing.push("'How HomeUP is paid' wording confirmed by Tong Boon and KEO");
  return missing;
}

/**
 * Drafts are shown on Vercel preview deployments and in local dev only. Anything else,
 * including production and a local `next build`, fails closed and hides drafts.
 * Set SHOW_DRAFT_LAUNCHES=1 locally to check drafts in a production build.
 */
export function showDrafts(): boolean {
  return (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NODE_ENV === "development" ||
    process.env.SHOW_DRAFT_LAUNCHES === "1"
  );
}

function toEntry({ review, measured }: (typeof LAUNCHES)[number]): LaunchEntry {
  return { review, measured, missing: missingForPublish(review) };
}

/** Launches visible in this environment, ordered for the hub: upcoming first. */
export function getVisibleLaunches(): LaunchEntry[] {
  const drafts = showDrafts();
  return LAUNCHES.map(toEntry)
    .filter((entry) => drafts || entry.missing.length === 0)
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(a.review.status) - STATUS_ORDER.indexOf(b.review.status) ||
        a.review.name.localeCompare(b.review.name),
    );
}

/** Publishable launches only, whatever the environment. Used for the sitemap and IndexNow. */
export function getPublishedLaunches(): LaunchEntry[] {
  return LAUNCHES.map(toEntry).filter((entry) => entry.missing.length === 0);
}

export function getLaunchBySlug(slug: string): LaunchEntry | null {
  return getVisibleLaunches().find((entry) => entry.review.slug === slug) ?? null;
}

/** Reviews to show on a Playbook guide: visible, not completed, and listing that guide. */
export function getLaunchesForGuide(guideSlug: string): LaunchEntry[] {
  return getVisibleLaunches().filter(
    (entry) =>
      entry.review.status !== "completed" &&
      entry.review.relatedGuides.some((guide) => guide.slug === guideSlug),
  );
}

/** Pre-filled WhatsApp message for /go/whatsapp?ref=. Any launch, so preview links still work. */
export function getWhatsAppMessageForRef(ref: string): string | null {
  const match = LAUNCHES.find((entry) => entry.review.verdict.whatsappRef === ref);
  return match?.review.verdict.whatsappMessage ?? null;
}

export function launchPath(slug: string): string {
  return `/new-launch/${slug}`;
}

export function leadSlug(slug: string): string {
  return `new-launch-${slug}`;
}
