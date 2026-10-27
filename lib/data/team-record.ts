/**
 * Team transaction record for /track-record, compiled from HomeUP's accounts panel.
 *
 * Two different things live on this page and must not be conflated:
 *   - HEADLINE_RANKINGS in track-record.ts are 2025 calendar year *rankings*.
 *   - The figures here are lifetime *totals* across each advisor's whole record span.
 *
 * Counts cover sale and resale transactions only. Rentals are excluded. The CEA
 * public register begins January 2017, so anything earlier is office record rather
 * than publicly verifiable, and is labelled as such wherever it appears.
 */

export const TEAM_RECORD_META = {
  totalSales: "1,218",
  hdbSales: "898",
  hdbShare: "74%",
  privateSales: "320",
  privateShare: "26%",
  lastUpdated: "October 2026",
  registerStart: "January 2017",
  /** Last month present in the source download. */
  registerEnd: "August 2026",
  ceaResourceId: "d_ee7e46d3c57f7865790704632b0aef71",
  /** Provenance for the pre-2017 portion of Edmund Lee's total. */
  officeRecordSource: "C & H Properties",
} as const;

export interface TeamRecordAdvisor {
  name: string;
  slug: string;
  cea: string;
  photo: string;
  total: number;
  hdb: number;
  private: number;
  sellerSide: number;
  buyerSide: number;
  /** Label for the side split, since Edmund's is CEA-era only. */
  sideNote?: string;
  spanLabel: string;
  span: string;
  detail?: string;
}

export const TEAM_RECORD_ADVISORS: TeamRecordAdvisor[] = [
  {
    name: "Edmund Lee",
    slug: "edmund-lee",
    cea: "R023385H",
    photo: "/images/agent-edmund.png",
    total: 809,
    hdb: 797,
    private: 12,
    sellerSide: 65,
    buyerSide: 27,
    sideNote: "2017 onwards",
    spanLabel: "Record span",
    span: "January 1997 to August 2026",
    detail:
      "In CEA’s public register, 2017 to August 2026: 80 HDB and 12 private. Office records provided by C & H Properties, 1997 to 2016: 717 HDB.",
  },
  {
    name: "Dennis Lim",
    slug: "dennis-lim",
    cea: "R055990G",
    photo: "/images/agent-dennis.png",
    total: 275,
    hdb: 20,
    private: 255,
    sellerSide: 243,
    buyerSide: 32,
    spanLabel: "CEA record",
    span: "June 2019 to August 2026",
    detail: "246 condominium or EC, 9 landed.",
  },
  {
    name: "Yeo Tong Boon",
    slug: "yeo-tong-boon",
    cea: "R069651E",
    photo: "/images/agent-tong-boon.png",
    total: 101,
    hdb: 49,
    private: 52,
    sellerSide: 35,
    buyerSide: 66,
    spanLabel: "CEA record",
    span: "May 2024 to August 2026",
  },
  {
    name: "Kenji Ching",
    slug: "kenji-ching",
    cea: "R070948I",
    photo: "/images/agent-kenji.png",
    total: 33,
    hdb: 32,
    private: 1,
    sellerSide: 22,
    buyerSide: 11,
    spanLabel: "CEA record",
    span: "May 2025 to August 2026",
  },
];

/** Shown directly under the team total, per the CEA accuracy review. */
export const TEAM_RECORD_SHARED_NOTE =
  "Where two of our advisors acted in the same transaction, it is counted once for each advisor.";

export const TEAM_RECORD_METHOD: string[] = [
  "Figures from 2017 onwards are matched to each advisor by CEA registration number.",
  "Counts cover sale and resale transactions only, across HDB resale, private resale and new sale. Rental and lease transactions are excluded.",
  "The CEA public register begins January 2017. Where an advisor's career predates it, earlier transactions are not in the register and are shown separately.",
  "2026 figures run to August 2026, the last month in the source file, not a full calendar year.",
  "Edmund Lee's HDB total blends two sources: 80 sales from CEA's public register for 2017 to August 2026, plus 717 from office records provided by C & H Properties for 1997 to 2016, split at 1 January 2017 so nothing is counted twice. The pre-2017 portion is not in CEA's public register, which begins in January 2017, so it cannot be checked against that register.",
];
