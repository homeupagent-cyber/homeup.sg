import type { LaunchReview, MeasuredFacts, SourceRef } from "@/lib/data/launches/types";
import { formatIsoDate } from "./copy";

export interface SourceList {
  items: SourceRef[];
  /** 1-based footnote number for a source already in the list. */
  number: (source: SourceRef) => number;
}

/** Datasets behind the measured facts and the 3D site study. */
export function measuredSources(measured: MeasuredFacts): Record<
  "osm" | "masterPlan" | "hdb" | "moe" | "oneMap" | "footRouter",
  SourceRef
> {
  const asOf = formatIsoDate(measured.generatedAt);
  return {
    osm: {
      label: "© OpenStreetMap contributors: buildings, stations, malls and expressways (ODbL)",
      url: "https://www.openstreetmap.org/copyright",
      asOf,
    },
    masterPlan: {
      label: "URA Master Plan 2019 Land Use layer (data.gov.sg)",
      url: "https://data.gov.sg/datasets/d_90d86daa5bfaa371668b84fa5f01424f/view",
      asOf,
    },
    hdb: {
      label: "HDB Property Information (data.gov.sg)",
      url: "https://data.gov.sg/datasets/d_17f5382f26140b1fdae0ba2ef6239d2f/view",
      asOf,
    },
    moe: {
      label: "MOE General information of schools (data.gov.sg)",
      url: "https://data.gov.sg/datasets/d_688b934f82c1059ed0a6993d2a829089/view",
      asOf,
    },
    oneMap: { label: "SLA OneMap, school postcode locations", url: "https://www.onemap.gov.sg/", asOf },
    footRouter: {
      label: "OpenStreetMap foot router (FOSSGIS), walking distances",
      url: "https://routing.openstreetmap.de/",
      asOf,
    },
  };
}

const keyOf = (source: SourceRef) => source.url ?? source.label;

/**
 * Collects every source on the page once, in reading order, so each block can cite
 * a footnote number that matches the Sources list at the bottom.
 */
export function buildSourceList(review: LaunchReview, measured: MeasuredFacts | null): SourceList {
  const items: SourceRef[] = [];
  const index = new Map<string, number>();
  const add = (source?: SourceRef) => {
    if (!source) return;
    const key = keyOf(source);
    if (!index.has(key)) {
      items.push(source);
      index.set(key, items.length);
    }
  };

  review.keyFacts.forEach((fact) => add(fact.fact.source));
  if (measured) Object.values(measuredSources(measured)).forEach(add);
  review.landRates.forEach((rate) => add(rate.source));
  review.comparison.columns.forEach((column) => add(column.coords?.source));
  review.comparison.rows.forEach((row) => Object.values(row.cells).forEach((cell) => add(cell.source)));

  return {
    items,
    number: (source) => {
      const n = index.get(keyOf(source));
      if (!n) throw new Error(`Source not collected: ${source.label}`);
      return n;
    },
  };
}
