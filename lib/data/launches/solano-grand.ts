import type { LaunchReview, SourceRef } from "./types";

/**
 * Solano Grand EC (Senja Close, Bukit Panjang). Phase 1: site, sun path, measured location,
 * land price, comparisons. Every fact needs checking against the HDB tender result before
 * `lastVerified` is set; until then the page stays a draft and never ships to production.
 */

const AS_OF = "11 Oct 2026";

const HDB_TENDER_CONDITIONS: SourceRef = {
  label: "HDB, Additional Conditions of Tender, Senja Close",
  url: "https://www.hdb.gov.sg/-/media/doc/PLG/Additional-Conditions-of-Tender-Senja-Close.pdf",
  asOf: AS_OF,
};

const EDGEPROP_TOP_BID: SourceRef = {
  label: "EdgeProp, CDL submits top bid of $771 psf ppr for Senja Close EC site",
  url: "https://www.edgeprop.sg/property-news/cdl-submits-top-bid-771-psf-ppr-senja-close-ec-site",
  asOf: AS_OF,
};

const NINETY_NINE_CO_TOP_BIDS: SourceRef = {
  label: "99.co, CDL top bids Senja and Woodlands EC sites",
  url: "https://www.99.co/singapore/insider/cdl-top-bids-senja-and-woodlands-ec-sites/",
  asOf: AS_OF,
};

const URA_MP2019: SourceRef = {
  label: "URA Master Plan 2019 Land Use layer (data.gov.sg)",
  url: "https://data.gov.sg/datasets/d_90d86daa5bfaa371668b84fa5f01424f/view",
  asOf: AS_OF,
};

const EC_RULES_2026: SourceRef = {
  label:
    "Stacked Homes, summary of the 8 May 2026 EC policy changes (to be checked against the MND release)",
  url: "https://stackedhomes.com/singapore-ec-rules-mop-10-years-dps-removed-2026/",
  asOf: AS_OF,
};

const ONEMAP_SEARCH: SourceRef = {
  label: "SLA OneMap address search",
  url: "https://www.onemap.gov.sg/",
  asOf: AS_OF,
};

const solanoGrand: LaunchReview = {
  slug: "solano-grand",
  name: "Solano Grand",
  propertyType: "EC",
  status: "upcoming",
  timingLabel: "Launch timing TBC",

  street: "Senja Close",
  area: "Bukit Panjang",
  district: "District 23",
  developer: "City Developments Limited (CDL)",
  biddingEntity: "CDL Constellation Pte",
  tenure: "99-year leasehold",
  statedMaxStoreys: 27,

  site: {
    lat: 1.38926,
    lng: 103.76261,
    boundary: {
      source: "ura-mp2019-land-use",
      pickPoint: { lat: 1.38926, lng: 103.76261 },
      statedAreaSqm: 10159.2,
    },
    contextRadiusM: 300,
  },

  seo: {
    title: "Solano Grand EC Review: Pros, Cons & Comparisons (Senja Close) | HomeUP",
    description:
      "Independent review of Solano Grand EC at Senja Close: 3D sun-path site study, measured distances, land price, and comparisons with Blossom Residences and HDB.",
    h1: "Solano Grand EC Review: An Independent Look Before Launch",
  },

  summary: null,
  hubTake: null,
  sunStudy: null,
  landAnalysis: null,

  keyFacts: [
    {
      label: "Location",
      fact: { value: "Senja Close, Bukit Panjang (District 23)", source: HDB_TENDER_CONDITIONS },
    },
    {
      label: "Developer",
      fact: { value: "City Developments Limited, bidding as CDL Constellation Pte", source: EDGEPROP_TOP_BID },
    },
    { label: "Tenure", fact: { value: "99-year leasehold", source: HDB_TENDER_CONDITIONS } },
    {
      label: "Site area",
      fact: { value: "10,159.2 sqm (about 109,353 sq ft)", source: HDB_TENDER_CONDITIONS },
    },
    { label: "Maximum gross plot ratio", fact: { value: "3.0", source: HDB_TENDER_CONDITIONS } },
    {
      label: "Land price",
      fact: { value: "S$252.9 million (S$771 psf ppr)", source: EDGEPROP_TOP_BID },
    },
    { label: "Tender closed", fact: { value: "5 Aug 2025", source: EDGEPROP_TOP_BID } },
    {
      label: "Stated scheme",
      fact: { value: "306 units in two towers of 26 and 27 storeys", source: EDGEPROP_TOP_BID },
    },
    {
      label: "Next to the plot",
      fact: {
        value: "A plot zoned Place of Worship on the Master Plan (reported as a proposed temple site)",
        source: URA_MP2019,
      },
    },
    {
      label: "Last EC in Bukit Panjang",
      fact: { value: "Blossom Residences, from the 2011 land sale", source: NINETY_NINE_CO_TOP_BIDS },
    },
    { label: "Launch timing", fact: { value: "TBC" } },
  ],

  landRatesAsOf: AS_OF,
  landRates: [
    {
      name: "Solano Grand (Senja Close)",
      location: "Bukit Panjang",
      psfPpr: 771,
      tenderDate: "Aug 2025",
      source: EDGEPROP_TOP_BID,
      isSubject: true,
    },
    {
      name: "Woodlands Drive 17 (Plot 1)",
      location: "Woodlands",
      psfPpr: 782,
      tenderDate: "Aug 2025",
      note: "Also won by CDL in the same round",
      source: NINETY_NINE_CO_TOP_BIDS,
    },
    {
      name: "Jalan Loyang Besar",
      location: "Pasir Ris",
      psfPpr: 728,
      tenderDate: "Aug 2024",
      note: "EdgeProp reported S$729 at tender close; the award figure is S$728",
      source: {
        label: "Qingjian Realty, Tender award of Jalan Loyang Besar",
        url: "https://qingjianrealty.com.sg/2024/08/01/tender-award-of-jalan-loyang-besar/",
        asOf: AS_OF,
      },
    },
    {
      name: "Plantation Close",
      location: "Tengah",
      psfPpr: 703,
      tenderDate: "Sep 2023",
      source: {
        label: "EdgeProp, Plantation Close EC site awarded at record $703 psf ppr",
        url: "https://www.edgeprop.sg/property-news/plantation-close-ec-site-tengah-awarded-hoi-hup-realty-and-sunway-developments-record-703-psf-ppr",
        asOf: AS_OF,
      },
    },
    {
      name: "Bukit Batok West Avenue 8",
      location: "Bukit Batok",
      psfPpr: 662,
      tenderDate: "TBC",
      note: "Described as the previous EC land record when Plantation Close was awarded",
      source: {
        label: "EdgeProp, Plantation Close EC site awarded at record $703 psf ppr",
        url: "https://www.edgeprop.sg/property-news/plantation-close-ec-site-tengah-awarded-hoi-hup-realty-and-sunway-developments-record-703-psf-ppr",
        asOf: AS_OF,
      },
    },
  ],

  comparison: {
    note: "Columns are the alternatives a Bukit Panjang EC buyer is usually weighing. Cells marked TBC are filled in as data is pulled and checked.",
    columns: [
      {
        key: "solano",
        name: "Solano Grand",
        kind: "New EC (this review)",
        coords: { lat: 1.38926, lng: 103.76261, source: URA_MP2019 },
      },
      {
        key: "blossom",
        name: "Blossom Residences",
        kind: "Resale EC",
        coords: { lat: 1.3896, lng: 103.76944, source: ONEMAP_SEARCH },
      },
      {
        key: "hillion",
        name: "Hillion Residences",
        kind: "Resale condo nearby",
        coords: { lat: 1.37843, lng: 103.76343, source: ONEMAP_SEARCH },
      },
      { key: "newEc", name: "Another new EC", kind: "Competing new launch (TBC)" },
      { key: "hdb", name: "Your current HDB", kind: "Stay put" },
    ],
    rows: [
      {
        label: "Land rate",
        cells: {
          solano: { value: "S$771 psf ppr (Aug 2025)", source: EDGEPROP_TOP_BID },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "Not applicable" },
        },
      },
      {
        label: "Nearest MRT/LRT (straight line)",
        fillFrom: "nearestRail",
        cells: {
          solano: { value: "TBC" },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "Not applicable" },
        },
      },
      {
        label: "Tenure",
        cells: {
          solano: { value: "99-year leasehold", source: HDB_TENDER_CONDITIONS },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "Not applicable" },
        },
      },
      {
        label: "Expected entry price",
        cells: {
          solano: { value: "TBC" },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "Not applicable" },
        },
      },
      {
        label: "MOP and privatisation",
        cells: {
          solano: {
            value:
              "5-year MOP from completion, fully private after 10 years (tender closed before the 8 May 2026 rule change)",
            source: EC_RULES_2026,
          },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "Not applicable" },
        },
      },
      {
        label: "Notes",
        cells: {
          solano: {
            value: "Adjacent plot zoned Place of Worship on the Master Plan",
            source: URA_MP2019,
          },
          blossom: { value: "TBC" },
          hillion: { value: "TBC" },
          newEc: { value: "TBC" },
          hdb: { value: "TBC" },
        },
      },
    ],
  },

  pros: [],
  cons: [],
  whoShouldSkip: [],

  verdict: {
    teaser:
      "Prices, the site plan and the unit mix are not out yet. When they are, we publish a stack-by-stack verdict. Message us now and we will send it to you with a comparison built around your budget and your current flat.",
    whatsappRef: "NL-SOLANO",
    whatsappMessage: "Hi HomeUP, I'd like your independent verdict on Solano Grand. (Ref: NL-SOLANO)",
  },

  faq: [
    {
      q: "Is Solano Grand worth buying?",
      a: "It is too early for a full answer. CDL has not released prices, the site plan or the unit mix. What is known now: the land cost S$771 psf ppr in August 2025, it is the first EC in Bukit Panjang since Blossom Residences, and the plot sits near Jelapang LRT. HomeUP publishes a verdict once prices are out, with the cons and the buyers who should skip it.",
    },
    {
      q: "Solano Grand vs Blossom Residences: which should I consider?",
      a: "They suit different buyers. Solano Grand is a new EC, so you buy from the developer, must meet EC eligibility rules and pay in stages during construction. Blossom Residences is a completed EC bought on the resale market, so you can move in sooner and see the actual unit. The comparison table on this page sets out both side by side, with any figure not yet checked marked TBC.",
    },
    {
      q: "What did CDL pay for the Solano Grand site?",
      a: "S$252.9 million, or S$771 per square foot per plot ratio, for the Senja Close EC site. The tender closed on 5 August 2025.",
    },
    {
      q: "What is the MOP for Solano Grand?",
      a: "The Senja Close tender closed before the EC rule changes announced on 8 May 2026, so Solano Grand is expected to follow the earlier rules: a 5-year minimum occupation period from completion, and full privatisation after 10 years. Check this against the final sales documents.",
    },
    {
      q: "When is Solano Grand launching?",
      a: "Launch timing has not been announced. This page is updated when the preview date, prices and site plan are released.",
    },
    {
      q: "Who is the developer of Solano Grand?",
      a: "City Developments Limited (CDL), which bid through CDL Constellation Pte. CDL's stated scheme is 306 units in two towers of 26 and 27 storeys.",
    },
    {
      q: "Is HomeUP part of the Solano Grand sales team?",
      a: "No. HomeUP is an independent advisory, not appointed by CDL to sell the project. This review compares Solano Grand with its alternatives, including resale and staying in your HDB, and the 'How HomeUP is paid' box on this page explains how we earn our fee.",
    },
  ],

  relatedGuides: [
    {
      slug: "private-condo-vs-ec-when-to-choose-condo",
      title: "EC or Condo as Your First Home? How the May 2026 Rule Changes Shift the Answer",
    },
    {
      slug: "cna-asked-me-to-review-coastal-cabana-ec-heres-what-i-actual-mqs48cxt",
      title: "CNA Interview with Yeo Tong Boon: Review of Coastal Cabana EC",
    },
    {
      slug: "new-launch-condo-showroom-tips-singapore",
      title: "The New Launch Showroom Is Designed to Impress. Here's What to Look Past",
    },
    {
      slug: "the-new-launch-vs-resale-decision-most-investors-get-wrong-mtyax9o5",
      title: "The New Launch vs Resale Decision Most Investors Get Wrong",
    },
    {
      slug: "hdb-mop-what-happens-when-your-5-years-are-up",
      title: "HDB MOP: What Happens When Your 5 Years Are Up",
    },
  ],

  datePublished: "2026-10-11",
  dateModified: "2026-10-11",
  lastVerified: null,
};

export default solanoGrand;
