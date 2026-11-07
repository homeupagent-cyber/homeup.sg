export type Region = "CCR" | "RCR" | "OCR" | "EC";
export type Verdict = "BUY" | "CONDITIONAL" | "WAIT" | "PASS" | "PENDING";
export type SignalLevel = "green" | "amber" | "red" | "grey";

export type Criterion = {
  name: string;
  measure: string;
  rule: string;
  result: string | null;
  score: number | null; // 0 to 10
};

export type PricingBars = {
  resale10yrPsf: number | null;
  resale5to10yrPsf: number | null;
  recentLaunchPsf: number | null;
  thisProjectPsfLow: number | null;
  thisProjectPsfHigh: number | null;
  breakevenPsf: number | null;
};

export type DeveloperBreakeven = {
  landPsfPpr: number | null;
  construction: number | null;
  financeAndFees: number | null;
  breakeven: number | null;
  avgLaunchPsf: number | null;
  absdDeadline: string | null;
};

export type VersusRow = {
  label: string;
  newLaunch: string | null;
  resale: string | null;
};

export type VersusResale = {
  budget: number | null;
  unitType: string | null;
  holdingYears: number | null;
  rows: VersusRow[];
  betterForYou: {
    verdict: "New launch" | "Resale" | "Either" | null;
    note: string | null;
  };
};

export type ExitTest = {
  exitPriceFlatCase: number | null;
  upgraderBudget: number | null;
  competingSupplyUnits: number | null;
  leaseLeftAtExit: number | null;
};

export type Project = {
  slug: string;
  name: string;
  district: string | null;
  region: Region;
  tenure: string | null;
  totalUnits: number | null;
  developer: string | null;
  previewDate: string | null;
  expectedTop: string | null;
  verdict: Verdict;
  score: number | null; // 0 to 100
  thesis: string;
  reviewedBy: string | null;
  reviewedOn: string | null;
  fundamentals: Criterion[];
  technicals: Criterion[];
  pricing: PricingBars;
  breakeven: DeveloperBreakeven;
  versus: VersusResale;
  exitTest: ExitTest;
  catalysts: string[];
  risks: string[];
  wouldChangeView: string[];
};

export type PipelineRow = {
  slug: string | null;
  project: string;
  segment: string;
  units: string;
  expected: string;
  catalyst: string;
  verdict: Verdict;
  score: number | null;
  timingConfidence: "reported" | "confirmed";
};

export type MacroFigure = {
  label: string;
  value: string;
  source: string;
  asOf: string;
};

export type MacroSignal = {
  name: string;
  level: SignalLevel;
  note: string;
};

export type SegmentChange = {
  segment: string;
  changePercent: number;
};

export type GlsSupplyBar = {
  label: string;
  units: number;
};

export type MacroData = {
  houseView: string;
  houseViewAsOf: string;
  priceIndex: MacroFigure;
  firstHalf: MacroFigure;
  vacancy: MacroFigure;
  sora: MacroFigure;
  segmentChanges: SegmentChange[];
  glsSupply: GlsSupplyBar[];
  glsTenYearAverage: number;
  signals: MacroSignal[];
};
