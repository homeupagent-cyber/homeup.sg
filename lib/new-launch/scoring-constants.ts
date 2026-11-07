// All New Launch Desk thresholds live here so they can be tuned in one place.

export const FUNDAMENTAL_CRITERIA_DEFS = [
  {
    name: "Location and connectivity",
    measure: "Walk time to MRT, schools within 1km, daily amenities",
    rule: "Green if MRT is within a 10 minute walk",
  },
  {
    name: "Entry price versus land cost",
    measure: "Launch psf against developer breakeven psf",
    rule: "Green if the margin is 15% or less",
  },
  {
    name: "Competing supply",
    measure: "Uncompleted private units within 2km, including upcoming GLS",
    rule: "Green if under 2,000 units",
  },
  {
    name: "Catalysts before exit",
    measure: "Master Plan items, new MRT lines, hubs landing before the exit year",
    rule: "Green if at least one lands by year 7",
  },
  {
    name: "Exit buyer pool",
    measure: "Exit quantum against HDB upgrader budgets in nearby towns",
    rule: "Green if the exit price is within upgrader reach",
  },
  {
    name: "Rental demand",
    measure: "Estimated gross yield and tenant pool",
    rule: "Green if gross yield is 3.0% or more",
  },
] as const;

export const TECHNICAL_CRITERIA_DEFS = [
  {
    name: "New launch premium",
    measure: "Launch psf versus 5 to 10 year old condos within 1km",
    rule: "Green if 15% or less",
  },
  {
    name: "District trend",
    measure: "4-quarter versus 8-quarter moving average of resale psf",
    rule: "Green if the 4Q average is above the 8Q",
  },
  {
    name: "Sales momentum",
    measure: "Launch weekend take-up, then units sold per month",
    rule: "Green if 30% or more sold at launch",
  },
  {
    name: "Phase pricing",
    measure: "Developer price increases since launch, by stack",
    rule: "Green if increases are under 5% so far",
  },
  {
    name: "Nearby launch absorption",
    measure: "Sell-through of launches within 2km in the last 24 months",
    rule: "Green if 70% or more sold",
  },
  {
    name: "Volume signal",
    measure: "District transactions versus the same period last year",
    rule: "Green if volume is flat or rising",
  },
] as const;

export type BuyerProfileKey = "hdbUpgrader" | "investor" | "rightSizer";

export const BUYER_PROFILES: Array<{
  key: BuyerProfileKey;
  label: string;
  fundamentalWeight: number;
  technicalWeight: number;
  description: string;
}> = [
  {
    key: "hdbUpgrader",
    label: "HDB upgrader, own stay",
    fundamentalWeight: 70,
    technicalWeight: 30,
    description: "Weighs livability and long-term fundamentals over short-term pricing signals.",
  },
  {
    key: "investor",
    label: "Investor",
    fundamentalWeight: 50,
    technicalWeight: 50,
    description: "Balances fundamentals with entry price, momentum and absorption signals.",
  },
  {
    key: "rightSizer",
    label: "Right-sizer",
    fundamentalWeight: 80,
    technicalWeight: 20,
    description: "Prioritises location, exit liquidity and long-term fundamentals.",
  },
];

// "When a new launch beats resale, and when it does not" thresholds (market pulse page).
export const NEW_LAUNCH_PREMIUM_GOOD_THRESHOLD_PERCENT = 15;
export const NEW_LAUNCH_PREMIUM_BAD_THRESHOLD_PERCENT = 20;
