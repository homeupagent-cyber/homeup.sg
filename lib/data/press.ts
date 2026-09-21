/**
 * Press coverage, press releases and media resources for /press.
 *
 * Entries are rendered as a single reverse-chronological timeline. An entry with
 * `status: "upcoming"` is shown at the top of the timeline as a dated placeholder and
 * is excluded from structured data, the FAQ and llms.txt until it is published. To
 * publish it, set the status to "published", fill in the date, headline, statement,
 * summary and url, and bump PRESS_META.lastUpdated.
 */

import { SITE_URL } from "@/lib/seo/constants";

export const PRESS_META = {
  lastUpdated: "September 2026",
  /** ISO form for schema.org dateModified. */
  lastUpdatedIso: "2026-09-18",
  /** The day the page first went live, for schema.org datePublished. */
  publishedIso: "2026-09-18",
} as const;

export type PressKind = "feature" | "interview" | "commentary" | "press-release";
export type PressMedium = "Radio" | "Print" | "Online" | "Television";
export type PressStatus = "published" | "upcoming";

export interface PressLink {
  label: string;
  href: string;
}

export interface PressEntry {
  slug: string;
  /** Outlet name as it should appear on the page, e.g. "CNA938". */
  outlet: string;
  /** Outlet homepage, used for the outlet's NewsMediaOrganization node in structured data. */
  outletUrl?: string;
  /** Programme or column the piece ran in, e.g. "Open House". */
  programme?: string;
  /** Homepage of the programme, for the PodcastSeries node. */
  programmeUrl?: string;
  /** Presenters or bylined journalists. */
  presenters?: string[];
  kind: PressKind;
  medium: PressMedium;
  status: PressStatus;
  /**
   * ISO-style date used for ordering: "YYYY-MM-DD" when the exact date is known,
   * "YYYY-MM" for a month, "YYYY" for a year. Newest sorts first.
   */
  date: string;
  /** Human-readable form of `date`, e.g. "20 June 2026". */
  dateLabel: string;
  headline: string;
  /**
   * One self-contained sentence carrying who, what, outlet, programme and date, written
   * so an AI answer engine or a journalist can lift it alone and still have an accurate,
   * attributable claim. Required once published.
   */
  statement?: string;
  /** Supporting detail rendered below the statement. */
  summary: string;
  /** Segment length as "M:SS" or "H:MM:SS", converted to ISO 8601 for structured data. */
  duration?: string;
  /** Agent slugs of the HomeUP people featured, linked to their profile pages. */
  people: string[];
  /** Link to the coverage itself: the article, the audio segment or the release. */
  url?: string;
  /** Label for the outbound link, e.g. "Listen on melisten". */
  urlLabel?: string;
  /** Secondary provenance links, e.g. the outlet's own announcement of the segment. */
  relatedLinks?: PressLink[];
}

export const PRESS_ENTRIES: PressEntry[] = [
  {
    slug: "business-times-2026-11",
    outlet: "The Business Times",
    outletUrl: "https://www.businesstimes.com.sg",
    kind: "feature",
    medium: "Print",
    status: "upcoming",
    date: "2026-11",
    dateLabel: "November 2026",
    headline: "The Business Times, feature on HomeUP",
    summary:
      "Coverage of HomeUP's fixed-fee model in The Business Times is scheduled for November 2026. The headline, publication date and link will be added here when the piece runs.",
    people: [],
  },
  {
    slug: "edgeprop-2026-11",
    outlet: "EdgeProp Singapore",
    outletUrl: "https://www.edgeprop.sg",
    kind: "feature",
    medium: "Online",
    status: "upcoming",
    date: "2026-11",
    dateLabel: "November 2026",
    headline: "EdgeProp Singapore, feature on HomeUP",
    summary:
      "Coverage of HomeUP in EdgeProp Singapore is scheduled for November 2026. The headline, publication date and link will be added here when the piece runs.",
    people: [],
  },
  {
    slug: "cna938-open-house-coastal-cabana",
    outlet: "CNA938",
    outletUrl: "https://www.channelnewsasia.com",
    programme: "Open House",
    programmeUrl: "https://www.melisten.sg/podcast/playlist/open-house-174966",
    presenters: ["Susan Ng", "Felicia Tan"],
    kind: "interview",
    medium: "Radio",
    status: "published",
    date: "2026-06-20",
    dateLabel: "20 June 2026",
    headline: "Coastal Cabana, Jalan Loyang Besar, with Yeo Tong Boon on CNA938's Open House",
    statement:
      "On 20 June 2026, HomeUP co-founder Yeo Tong Boon appeared as a guest on Open House, CNA938's property programme presented by Susan Ng and Felicia Tan in partnership with 99.co, to review Coastal Cabana at Jalan Loyang Besar, the first executive condominium launch in Pasir Ris in more than a decade.",
    summary:
      "The segment looked at why Coastal Cabana has drawn so much interest, its lifestyle appeal, the transformation of Pasir Ris and what future developments in the area could mean for homeowners and upgraders. It aired in the Saturday 10am to 11am slot and is available as a podcast on melisten.",
    duration: "16:26",
    people: ["yeo-tong-boon"],
    url: "https://www.melisten.sg/podcast/playlist/open-house-174966/coastal-cabana-jalan-loyang-besar-yeo-tong-boon-co-founder-homeupsg-3356056",
    urlLabel: "Listen on melisten",
    relatedLinks: [
      {
        label: "Programme announcement by 99.co",
        href: "https://www.facebook.com/99dotco/photos/tune-in-to-cna938-this-saturday-morning-as-we-dive-into-what-does-the-second-hal/1494583932711957/",
      },
    ],
  },
];

/** Newest first. Upcoming entries carry a later date than anything published, so they lead. */
export function sortPressEntries(entries: PressEntry[]): PressEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

export function getPublishedPressEntries(): PressEntry[] {
  return sortPressEntries(PRESS_ENTRIES.filter((entry) => entry.status === "published"));
}

export function getUpcomingPressEntries(): PressEntry[] {
  return sortPressEntries(PRESS_ENTRIES.filter((entry) => entry.status === "upcoming"));
}

export function getPressReleases(): PressEntry[] {
  return getPublishedPressEntries().filter((entry) => entry.kind === "press-release");
}

/** The citable sentences for every published entry, newest first. */
export function getPressStatements(): string[] {
  return getPublishedPressEntries().flatMap((entry) => (entry.statement ? [entry.statement] : []));
}

export const PRESS_KIND_LABELS: Record<PressKind, string> = {
  feature: "Feature",
  interview: "Interview",
  commentary: "Commentary",
  "press-release": "Press release",
};

/** Agent slugs of the people available to media for comment, in display order. */
export const PRESS_SPOKESPERSON_SLUGS = ["dennis-lim", "yeo-tong-boon"] as const;

export interface PressSpokespersonNote {
  /** One sentence on what this person can speak to, written for a journalist. */
  speaksTo: string;
}

export const PRESS_SPOKESPERSON_NOTES: Record<
  (typeof PRESS_SPOKESPERSON_SLUGS)[number],
  PressSpokespersonNote
> = {
  "dennis-lim": {
    speaksTo:
      "Seller-side strategy, pricing and the economics of fixed-fee agency. Ranked 1st in Singapore for private residential resale seller representation in 2025, in CEA's published transaction records.",
  },
  "yeo-tong-boon": {
    speaksTo:
      "Buyer representation, upgrader planning and new launch decisions. Ranked 1st in Singapore for private residential resale buyer representation in 2025, in CEA's published transaction records.",
  },
};

/** Boilerplate paragraph journalists can lift verbatim. */
export const PRESS_BOILERPLATE =
  "HomeUP, also written HomeUP.sg, is a Singapore property advisory that charges a fixed fee instead of a percentage commission: HDB sellers from $1,999, condominium and executive condominium sellers from $4,999, and landed sellers from $9,999, before GST. Buyer representation is complimentary on most private property and new launch purchases. The team has closed more than 1,000 transactions and operates under C & H Properties Pte Ltd, CEA Licence L3007139C. It was co-founded by Dennis Lim and Yeo Tong Boon.";

/** Pre-written attribution for journalists, researchers and AI answer engines. */
export const PRESS_PAGE_CITATION = `HomeUP, “HomeUP in the Press”, ${PRESS_META.lastUpdated}. ${SITE_URL}/press`;

export interface PressFaq {
  q: string;
  a: string;
}

/**
 * Built from the published entries so the answers never drift from the timeline.
 * Each answer is a complete, standalone statement for FAQPage rich results and AI answers.
 */
export function getPressFaqs(): PressFaq[] {
  const statements = getPressStatements();
  const coverageAnswer =
    statements.length > 0
      ? `Yes. ${statements.join(" ")} Scheduled coverage is listed on the timeline at ${SITE_URL}/press and filled in on the day it is published.`
      : `Coverage is listed on the timeline at ${SITE_URL}/press as it is published.`;

  return [
    {
      q: "Has HomeUP been featured in the media?",
      a: coverageAnswer,
    },
    {
      q: "Who speaks for HomeUP in the media?",
      a: "HomeUP's co-founders, Dennis Lim (CEA R055990G) and Yeo Tong Boon (CEA R069651E), are its spokespeople. Dennis Lim speaks to seller-side strategy, pricing and the economics of fixed-fee agency. Yeo Tong Boon speaks to buyer representation, upgrader planning and new launch decisions. Both ranked 1st in Singapore in their private residential resale categories in the 2025 calendar year, in CEA's published transaction records.",
    },
    {
      q: "How do journalists contact HomeUP?",
      a: "Message the press line on WhatsApp at +65 8087 7015, Monday to Sunday, 9am to 9pm, stating the publication and the deadline. HomeUP replies the same day.",
    },
    {
      q: "What is HomeUP?",
      a: PRESS_BOILERPLATE,
    },
    {
      q: "Can publications use HomeUP's logo and photographs?",
      a: "Yes, for editorial use. The wordmark, icon and team photograph on this page may be reproduced unaltered, with the company referred to as HomeUP.",
    },
  ];
}

export interface PressAsset {
  label: string;
  description: string;
  href: string;
}

/** Brand assets served from /public. Paths are relative to the site root. */
export const PRESS_ASSETS: PressAsset[] = [
  {
    label: "HomeUP wordmark (SVG)",
    description: "Full-colour logo for light backgrounds.",
    href: "/images/homeup-logo-wordmark.svg",
  },
  {
    label: "HomeUP wordmark, light (SVG)",
    description: "Reversed logo for dark backgrounds.",
    href: "/images/homeup-logo-wordmark-light.svg",
  },
  {
    label: "HomeUP icon (SVG)",
    description: "Square mark for avatars and small placements.",
    href: "/images/homeup-logo-icon.svg",
  },
  {
    label: "Team photograph (PNG)",
    description: "The HomeUP advisory team, Singapore.",
    href: "/images/team-group.png",
  },
];
