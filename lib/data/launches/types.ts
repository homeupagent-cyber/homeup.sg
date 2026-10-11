/**
 * Launch review data model. One file per project in lib/data/launches/, plus the measured
 * facts that scripts/launch-data/build-site-context.mjs writes to lib/data/launches/measured/.
 *
 * This file and every launch data file must use type-only imports, because the build script
 * imports the data files directly with Node's TypeScript type stripping.
 */
import type { FaqItem } from "@/lib/data/faqs";

/** Upcoming launches list first on the hub, then preview, launched, completed. */
export type LaunchStatus = "upcoming" | "preview" | "launched" | "completed";

export interface SourceRef {
  label: string;
  url?: string;
  /** Plain date the source was checked, e.g. "11 Oct 2026". */
  asOf: string;
}

/**
 * A fact is either sourced, explicitly "TBC" until it can be sourced, or "Not applicable"
 * (e.g. land rate for the "stay in your HDB" option).
 */
export type SourcedValue =
  | { value: string; source: SourceRef }
  | { value: "TBC" | "Not applicable"; source?: SourceRef };

export interface KeyFact {
  label: string;
  fact: SourcedValue;
}

export interface LandRateComparable {
  name: string;
  location: string;
  /** S$ psf per plot ratio, or "TBC". */
  psfPpr: number | "TBC";
  tenderDate: string;
  note?: string;
  source: SourceRef;
  /** True for the project this page reviews. */
  isSubject?: boolean;
}

export interface ComparisonColumn {
  key: string;
  name: string;
  /** Short descriptor under the name, e.g. "Resale EC". */
  kind: string;
  /** Lets the build script measure the nearest MRT/LRT for this option. */
  coords?: { lat: number; lng: number; source: SourceRef };
}

export interface ComparisonRow {
  label: string;
  /** Keyed by ComparisonColumn.key. */
  cells: Record<string, SourcedValue>;
  /**
   * "nearestRail": cells for columns with coords are replaced by the measured nearest MRT/LRT
   * (straight line) from lib/data/launches/measured/[slug].json.
   */
  fillFrom?: "nearestRail";
}

export interface RelatedGuide {
  slug: string;
  title: string;
}

export interface LaunchReview {
  slug: string;
  name: string;
  propertyType: "EC" | "Condo";
  status: LaunchStatus;
  /** Shown in the hero and on the hub card, e.g. "Launch timing TBC". */
  timingLabel: string;

  street: string;
  area: string;
  district: string;
  developer: string;
  biddingEntity?: string;
  tenure: string;
  /** Stated maximum storeys in the developer's announced scheme. Drawn as a height marker only. */
  statedMaxStoreys: number | null;

  site: {
    /** Approximate plot centre, used before the boundary is built. */
    lat: number;
    lng: number;
    boundary: {
      source: "ura-mp2019-land-use";
      /** A point inside the plot. The script picks the Master Plan polygon that contains it. */
      pickPoint: { lat: number; lng: number };
      /** The land area stated in the tender, for the script to compare against. */
      statedAreaSqm: number;
    };
    /** Radius for surrounding buildings, in metres. */
    contextRadiusM: number;
  };

  seo: {
    title: string;
    description: string;
    h1: string;
  };

  /** Tong Boon's one-line hero summary. Null until written. */
  summary: string | null;
  /** One-line HomeUP take for the hub card. Null until written. */
  hubTake: string | null;
  /** Sun-path explanation, written after viewing the model. Null until written. */
  sunStudy: string | null;
  /** Land price analysis. Null until written. */
  landAnalysis: string | null;

  keyFacts: KeyFact[];
  landRates: LandRateComparable[];
  landRatesAsOf: string;

  comparison: {
    columns: ComparisonColumn[];
    rows: ComparisonRow[];
    note?: string;
  };

  pros: string[];
  cons: string[];
  whoShouldSkip: string[];

  verdict: {
    teaser: string;
    /** Reference code sent in the WhatsApp message and accepted by /go/whatsapp?ref=. */
    whatsappRef: string;
    whatsappMessage: string;
  };

  /** Hidden until set. */
  youtubeUrl?: string;

  faq: FaqItem[];
  /** Playbook guides this review links to. Each guide also shows this review in its "Current launch reviews" block. */
  relatedGuides: RelatedGuide[];

  datePublished: string;
  dateModified: string;
  /** ISO date Tong Boon last checked every fact against the tender result pages. Null until checked. */
  lastVerified: string | null;
}

/** Written by scripts/launch-data/build-site-context.mjs. */
export interface MeasuredDistance {
  name: string;
  straightM: number;
  walkM?: number;
  walkMin?: number;
}

export interface MeasuredFacts {
  slug: string;
  generatedAt: string;
  centre: { lat: number; lng: number };
  boundary: {
    areaSqm: number;
    statedAreaSqm: number;
    landUse: string;
    grossPlotRatio: string;
  };
  rail: MeasuredDistance[];
  expressways: MeasuredDistance[];
  schoolsWithin1km: MeasuredDistance[];
  schools1to2km: MeasuredDistance[];
  malls: MeasuredDistance[];
  comparisonNearestRail: Record<string, MeasuredDistance>;
  buildings: { total: number; hdbMatched: number; osmHeight: number; estimated: number };
}
