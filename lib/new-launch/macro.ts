import type { MacroData } from "./types";

const URA_SOURCE = "URA 2Q 2026 real estate statistics";

export const MACRO_DATA: MacroData = {
  houseView: "[Selective buyer's market]",
  houseViewAsOf: "2Q 2026",

  priceIndex: {
    label: "Private residential price index",
    value: "+0.5% q-o-q",
    source: URA_SOURCE,
    asOf: "2Q 2026 (was +0.9% in 1Q 2026)",
  },
  firstHalf: {
    label: "First half 2026",
    value: "+1.4%",
    source: URA_SOURCE,
    asOf: "1H 2026 (was +1.8% in 1H 2025)",
  },
  vacancy: {
    label: "Private residential vacancy rate",
    value: "6.4%",
    source: URA_SOURCE,
    asOf: "2Q 2026 (up from 6.2%)",
  },
  sora: {
    label: "3M compounded SORA",
    value: "[Live MAS feed]",
    source: "MAS",
    asOf: "available from Phase 2",
  },

  segmentChanges: [
    { segment: "Landed", changePercent: 2.5 },
    { segment: "All non-landed", changePercent: -0.1 },
    { segment: "CCR non-landed", changePercent: 1.8 },
    { segment: "RCR non-landed", changePercent: -1.2 },
    { segment: "OCR non-landed", changePercent: -0.1 },
  ],

  glsSupply: [
    { label: "1H 2026", units: 4575 },
    { label: "2H 2026", units: 4745 },
  ],
  glsTenYearAverage: 6100,

  signals: [
    {
      name: "Price momentum",
      level: "amber",
      note: "Prices are still rising but the pace has slowed from 1Q to 2Q 2026.",
    },
    {
      name: "Supply pipeline",
      level: "amber",
      note: "About 61,000 private units, including ECs, are due to complete over the next few years.",
    },
    {
      name: "Rental market",
      level: "amber",
      note: "Vacancy has ticked up to 6.4%, worth watching if it keeps rising.",
    },
    {
      name: "Interest rates",
      level: "grey",
      note: "[Live MAS SORA feed in Phase 2]",
    },
    {
      name: "Policy",
      level: "grey",
      note: "[Advisor to confirm current cooling measure status]",
    },
    {
      name: "Economy and forecasts",
      level: "grey",
      note: "[Advisor to confirm current outlook]",
    },
  ],
};

export const GLS_SUPPLY_SOURCE = `${URA_SOURCE} — 2026 Confirmed List, over 50% above the 10-year annual average`;
export const PIPELINE_SUPPLY_SOURCE = URA_SOURCE;
