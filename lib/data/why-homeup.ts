/**
 * Content for /why-homeup, the "HomeUP vs Other Agents" page under About.
 *
 * Source: "HomeUp vs Other Agents" one-pager (September 2026). Every advantage and
 * comparison row on the page is rendered from here so the copy lives in one place.
 *
 * Key phrases are wrapped in `**double asterisks**`. The page renders them as
 * highlighted text, the markdown representation renders them as bold, and
 * `stripEmphasis` removes them for structured data.
 */

export const WHY_HOMEUP_META = {
  lastUpdated: "September 2026",
  /** ISO form for schema.org dateModified. */
  lastUpdatedIso: "2026-09-21",
  /** The day the page first went live, for schema.org datePublished. */
  publishedIso: "2026-09-21",
} as const;

/** Remove `**` emphasis markers for contexts that cannot render them (schema.org, alt text). */
export function stripEmphasis(text: string): string {
  return text.replace(/\*\*/g, "");
}

export const WHY_HOMEUP_INTRO =
  "Same job: sell your home for the **best possible price**. Very different way of doing it. Here is what **actually changes** when you list with HomeUP instead of a traditional agent.";

/**
 * Headline numbers shown as a strip under the intro. Kept to three on purpose: three
 * numbers are what a reader remembers. The 180+ listings figure lives in the pricing
 * advantage below, where it has the context to make sense.
 */
export interface HeadlineStat {
  value: string;
  label: string;
  /** The one stat to draw the eye to. Rendered filled rather than outlined. */
  featured?: boolean;
  /** Show the row of portal and social icons under the label. */
  platformIcons?: boolean;
}

export const HEADLINE_STATS: HeadlineStat[] = [
  { value: "5 min", label: "Response time to viewing requests" },
  { value: "8", label: "Listing platforms", platformIcons: true },
  { value: "24/7", label: "Live seller feedback portal", featured: true },
];

export interface Advantage {
  slug: string;
  number: string;
  title: string;
  body: string;
  /** The advantage that gets the large featured panel instead of a standard card. */
  featured?: boolean;
}

export const ADVANTAGES: Advantage[] = [
  {
    slug: "seller-portal",
    number: "01",
    title: "24/7 live seller portal",
    body: "Sellers get their own live portal showing **every viewing booked**, **real buyer feedback themes** (price concern, still deciding, no reply, and more) plus a running **viewing-health score**. No chasing your agent for an update: **log in anytime** and see exactly what is happening with your own listing.",
    featured: true,
  },
  {
    slug: "exposure",
    number: "02",
    title: "8 platforms, video-first exposure",
    body: "Every listing goes out on **all 4 major portals**, PropertyGuru, 99.co, SRX and HomeUP.sg, plus **4 social channels**: TikTok, Instagram, Facebook and YouTube. On PropertyGuru, HomeUP runs the **top-tier Platinum account**, the most expensive agent tier PropertyGuru sells: a video as the listing's cover image, permanently boosted.",
  },
  {
    slug: "pricing",
    number: "03",
    title: "Pricing backed by data",
    body: "We do not just rely on online valuation estimates. Pricing recommendations are built from **data analytics and market research**, cross-checked against real-time activity across the **180+ listings** we are actively managing.",
  },
  {
    slug: "response",
    number: "04",
    title: "Under-5-minute response to viewing enquiries",
    body: "Every enquiry, whether it arrives on WhatsApp, TikTok, Instagram or Facebook, lands in **one AI-powered omnichannel inbox** and gets a **reply within 5 minutes**. That speed is what secures more viewings: buyers get an answer while they are still interested.",
  },
];

export interface ComparisonRow {
  label: string;
  traditional: string;
  homeup: string;
  /** Tagged on the page as the biggest difference between the two columns. */
  featured?: boolean;
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Buyer enquiry response",
    traditional: "Depends on agent: minutes to days, manual callbacks or texts",
    homeup: "**Under 5 minutes**, AI-powered omnichannel inbox",
  },
  {
    label: "Marketing reach",
    traditional: "Usually 1 to 2 portals, occasional social posts",
    homeup: "**8 platforms**: 4 portals + 4 social, video-first Platinum listing",
  },
  {
    label: "Listing pricing",
    traditional: "Depends on agent: usually based on online valuation",
    homeup: "**Data analytics + AI research**, benchmarked on 180+ live listings",
  },
  {
    label: "Seller updates",
    traditional: "Ad hoc phone calls or texts",
    homeup: "**24/7 live portal**: every viewing and feedback theme, on demand",
    featured: true,
  },
  {
    label: "Track record",
    traditional: "Depends on agent",
    homeup: "**Published, CEA-sourced**, independently checkable",
  },
  {
    label: "Fees",
    traditional: "Typically ~2% commission",
    homeup: "**Fixed fee from $1,999**, known before you sign",
  },
];

/** The closing line from the one-pager, linked to the track record page. */
export const WHY_HOMEUP_PROOF_LINE =
  "**#1 in Singapore** for private resale in 2025, CEA-verified.";
