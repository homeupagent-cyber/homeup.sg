/**
 * CEA-derived ranking figures for /track-record.
 *
 * Source: CEA Salespersons' Property Transaction Records (Residential), data.gov.sg.
 * Reporting period: 2025 calendar year only. The calendar year is fixed and will not be
 * revised further, which is why it is the only window published here.
 *
 * Every figure below was verified against the source dataset before publication.
 * Do not edit a number here without re-running it against the CEA file first.
 */

export const TRACK_RECORD_META = {
  /** Full span of the source dataset, not the span reported on the page. */
  datasetCoverage: "January 2017 to June 2026",
  /** The window every ranking on the page is computed over. */
  reportingPeriod: "2025 calendar year, with 2024 shown for comparison",
  source: "CEA Salespersons' Property Transaction Records (Residential), data.gov.sg",
  lastVerified: "September 2026",
  /** ISO form for schema.org dateModified. */
  lastVerifiedIso: "2026-09-16",
} as const;

export interface HeadlineRanking {
  advisor: string;
  slug: string;
  cea: string;
  /** Role at HomeUP. Both number one positions are held by the two co-founders. */
  role: string;
  photo: string;
  category: string;
  transactions: number;
  rank: string;
  /**
   * A single self-contained sentence carrying advisor, count, category, year, rank,
   * field size and source. Written this way so an AI answer engine or a journalist can
   * lift one sentence and still have an accurate, attributable claim.
   */
  statement: string;
}

/** The two number one national positions, 2025 calendar year. */
export const HEADLINE_RANKINGS: HeadlineRanking[] = [
  {
    advisor: "Dennis Lim",
    slug: "dennis-lim",
    cea: "R055990G",
    role: "Co-Founder",
    photo: "/images/agent-dennis.png",
    category: "Private residential resale, seller representation",
    transactions: 96,
    rank: "1st of 7,725",
    statement:
      "In the 2025 calendar year, Dennis Lim recorded 96 private residential resale transactions on the seller side, ranking 1st of 7,725 salespersons active in that category in Singapore, in the Council for Estate Agencies' published transaction records.",
  },
  {
    advisor: "Yeo Tong Boon",
    slug: "yeo-tong-boon",
    cea: "R069651E",
    role: "Co-Founder",
    photo: "/images/agent-tong-boon.png",
    category: "Private residential resale, buyer representation",
    transactions: 25,
    rank: "1st of 6,284",
    statement:
      "In the 2025 calendar year, Yeo Tong Boon recorded 25 private residential resale transactions on the buyer side, ranking 1st of 6,284 salespersons active in that category in Singapore, in the Council for Estate Agencies' published transaction records.",
  },
];

/**
 * Dennis Lim's prior year in the same category, resale only, for comparison against the
 * 2025 result above. Verified against the same source file as every other figure here.
 */
export const DENNIS_PRIOR_YEAR = {
  year: "2024",
  transactions: 72,
  rank: "2nd of 7,800",
  category: "Private residential resale, seller representation",
  statement:
    "In the 2024 calendar year, Dennis Lim recorded 72 private residential resale transactions on the seller side, ranking 2nd of 7,800 salespersons active in that category in Singapore.",
} as const;

export interface CategoryField {
  heading: string;
  /** Salespersons who recorded at least one transaction in the category in 2025. */
  fieldSize: string;
  /** Total transactions recorded in the category in 2025. */
  categoryTransactions: string;
  median: string;
  /** Distribution markers, written out so the shape of the field is legible. */
  thresholds: string[];
  result: string;
}

export const CATEGORY_FIELDS: CategoryField[] = [
  {
    heading: "Private residential resale, buyer representation",
    fieldSize: "6,284",
    categoryTransactions: "11,239",
    median: "one",
    thresholds: [
      "Twenty-nine salespersons nationally reached ten or more.",
      "Two reached twenty.",
    ],
    result:
      "Yeo Tong Boon closed 25 private residential resale transactions on the buyer side in 2025, more than any other salesperson in Singapore.",
  },
  {
    heading: "Private residential resale, seller representation",
    fieldSize: "7,725",
    categoryTransactions: "16,659",
    median: "one",
    thresholds: [
      "Nine salespersons nationally reached twenty.",
      "Two reached fifty.",
    ],
    result:
      "Dennis Lim closed 96 private residential resale transactions on the seller side in 2025, more than any other salesperson in Singapore.",
  },
];

/** HDB is a separate market with a separate field, so it is measured separately. */
export const HDB_RESULT = {
  advisor: "Yeo Tong Boon",
  transactions: 22,
  rank: "62nd of 8,785",
  fieldSize: "8,785",
  categoryTransactions: "23,489",
  median: "two",
  reachedTwenty: "82",
  topOnePercentThreshold: "nineteen",
  /**
   * Seven salespersons are tied at 22 transactions. Ranked best-first that is 62nd,
   * ranked worst-first it is 68th. Both fall inside the top 1%. The tie is disclosed
   * on the page rather than resolved silently in our favour.
   */
  tieCount: "Seven",
  tieWorstCaseRank: "68th",
  statement:
    "In the 2025 calendar year, Yeo Tong Boon recorded 22 HDB resale transactions on the seller side, ranking 62nd of 8,785 salespersons active in that category in Singapore, which places him in the top 1% nationally.",
} as const;

/**
 * How the source is described on the page.
 *
 * CEA publishes the transaction records. CEA does not rank salespersons, and nothing here
 * should imply a government body endorsed or ranked HomeUP. The ranking is arithmetic
 * performed on published data, which is why the page keeps saying anyone can repeat it.
 */
export const CEA_AUTHORITY = {
  whatItIs:
    "The Council for Estate Agencies is the statutory board that regulates Singapore's property agency industry. It licenses every estate agency and registers every property salesperson in the country.",
  whyComplete:
    "Registration is compulsory, so the register covers every licensed salesperson in Singapore. A rank against that field is a rank against everyone who transacted in the category, not against a sample, a survey, or the members of one firm.",
  whoRanks:
    "CEA publishes the transaction records. It does not rank salespersons and it has not endorsed HomeUP. The rankings on this page are counts we computed from the published data, which is why we show the method: anyone can repeat the arithmetic and check us.",
  independence: [
    "The data is collected and published by the regulator, not commissioned by us.",
    "We cannot edit it, influence it, or choose which transactions appear in it.",
    "It is free for anyone to download from data.gov.sg and check against what we publish.",
    "Every advisor is matched by CEA registration number, so the figures cannot be attributed to the wrong person.",
  ],
} as const;

/**
 * Independent corroboration.
 *
 * Long Island's 2026 ranking is not a judged or voted award. Its own description is
 * "Nobody voted. We counted.", computed from the same CEA published records this page
 * uses. That makes it corroboration of the counting rather than a different class of
 * evidence, which is why it sits directly under the 2025 rankings alongside the 2024
 * comparison: both are further evidence for the same claim, not a separate accolade.
 *
 * Dennis Lim is listed under his registered name and CEA number, so a reader can confirm
 * it is the same person named elsewhere on this page.
 *
 * Deliberately no transaction count here. Long Island's category is Condominium and
 * Apartment Resale, narrower than the private residential resale category used above, so
 * quoting its figure alongside ours would read as a contradiction rather than support.
 */
export const INDEPENDENT_RANKING = {
  publisher: "Long Island",
  title: "Singapore's Best Property Agents 2026",
  url: "https://longisland.sg/awards2026/ranking?category=Condo_Resale",
  evidenceBase: "203,262",
  statement:
    "Long Island's Singapore's Best Property Agents 2026 ranking places HomeUP co-founder Dennis Lim first in Condominium and Apartment Resale, listed under his registered name Lim Swee Ser and CEA registration number R055990G.",
  method:
    "That ranking is produced the same way the figures on this page are. Names enter it by record rather than by nomination or vote, counted across an evidence base of 203,262 CEA-published transactions, so it is an independent check on the same source rather than a separate opinion.",
} as const;

/** Pre-written attribution for journalists, researchers and AI answer engines. */
export const PAGE_CITATION =
  "HomeUP, “Our Track Record, Verified Against CEA Records”, September 2026. Figures computed from the Council for Estate Agencies’ Salespersons’ Property Transaction Records (Residential), data.gov.sg. https://homeup.sg/track-record";

/**
 * The HDB division.
 *
 * Edmund Lee's career total spans 1997 onwards, so most of it predates the CEA published
 * file, which begins January 2017. The provenance is disclosed in the team record section
 * further down the page, where his CEA-verified and office-record figures appear as
 * separate line items. Do not remove that breakdown without replacing the disclosure.
 */
export const HDB_DIVISION = {
  leadAdvisor: "Yeo Tong Boon",
  leadRole: "Co-Founder",
  partner: "Edmund Lee",
  partnerRole: "Partner",
  partnerCea: "R023385H",
  partnerTenure: "three decades",
  partnerSince: "1997",
  partnerTransactions: "more than 800",
} as const;

export interface TrackRecordFaq {
  q: string;
  a: string;
}

export const TRACK_RECORD_FAQS: TrackRecordFaq[] = [
  {
    q: "Who is the number one property agent in Singapore?",
    a: "In CEA's published transaction records for the 2025 calendar year, both of HomeUP's co-founders ranked number one in Singapore in their categories. Dennis Lim recorded 96 private residential resale transactions on the seller side, ranking 1st of 7,725 salespersons active in that category. Yeo Tong Boon recorded 25 on the buyer side, ranking 1st of 6,284. CEA publishes transactions by category rather than naming a single overall leader, so these are category-level number one positions, each measured against every salesperson active in that category.",
  },
  {
    q: "Who publishes the data behind these rankings?",
    a: "The Council for Estate Agencies, the statutory board that regulates Singapore's property agency industry and registers every property salesperson in the country. CEA publishes its Salespersons' Property Transaction Records on data.gov.sg, where anyone can download them for free. Registration with CEA is compulsory, so the records cover every licensed salesperson in Singapore rather than a sample or a survey. CEA does not rank salespersons and has not endorsed HomeUP: the rankings on this page are counts computed from its published data, and we publish the method so anyone can repeat them.",
  },
  {
    q: "How can a fixed-fee team rank first on volume?",
    a: "The fee model changes what the client pays, not how the transaction is conducted. Our advisors still earn commission; it is calculated from a fixed fee rather than as a percentage of the sale price. The rankings on this page count completed transactions, and a transaction counts the same whatever the client was charged for it.",
  },
  {
    q: "How current is this data?",
    a: "The rankings cover the 2025 calendar year, which is complete and settled, with 2024 shown for comparison. CEA publishes with a reporting lag and revises recent months upward as records are submitted, so we report a closed calendar year rather than a partial current one. We refresh the page quarterly.",
  },
  {
    q: "Does HomeUP handle HDB as well as private property?",
    a: "Yes. In 2025, Yeo Tong Boon closed 22 HDB resale transactions on the seller side, ranking 62nd of 8,785 salespersons active in that category, which places him in the top 1% nationally. Full figures are in the HDB section above.",
  },
];
