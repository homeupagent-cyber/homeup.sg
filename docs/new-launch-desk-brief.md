# New Launch Desk: Phase 1 build brief

Repo: `homeupagent-cyber/homeup.sg`. Default branch is `master`.
Stack already in place: Next.js 14 App Router, React 18, TypeScript, Tailwind, Supabase, shadcn/Radix, hosted on Vercel (team HomeUP, project homeup-sg).

This brief is the full spec for Phase 1. Build only Phase 1. Phases 2 and 3 are listed at the end for context, do not build them yet.

---

## 1. What this is

A password-protected page where a HomeUP advisor shows a buyer whether a specific new launch is worth buying, and how it compares with a resale unit at the same budget. Audience is HDB owners buying their first private property, plus EC upgraders. Written for people with no property jargon.

Three screens:

1. `/new-launch/login` , access code entry
2. `/new-launch` , market pulse and the launch pipeline
3. `/new-launch/[slug]` , one project's full verdict

Plus a condensed client summary at `/new-launch/[slug]/summary`, phone-first.

---

## 2. Access control (Phase 1)

Simple and server-side. A shared code, not per client yet.

- `app/new-launch/login/page.tsx` , a form with mobile number (collected, not verified) and access code.
- `app/api/new-launch/login/route.ts` , POST handler. Compares the submitted code against `process.env.NEW_LAUNCH_ACCESS_CODE` using a constant-time comparison. On success, sets an HttpOnly, Secure, SameSite=Lax signed cookie named `nl_access`, expiry 30 days, then redirects to `/new-launch`. On failure, return a generic error, no hint about which field was wrong.
- Sign the cookie value with `process.env.NEW_LAUNCH_COOKIE_SECRET` so it cannot be forged by typing a cookie value in the browser.
- Add rate limiting on the login route: max 10 attempts per IP per 10 minutes, in-memory is acceptable for Phase 1.
- Log each successful entry (timestamp, mobile number, user agent) to a Supabase table `new_launch_access_log` if a Supabase server client already exists in `lib/`. If it does not, skip logging in Phase 1 and leave a TODO.

**Middleware.** `middleware.ts` already exists and handles other auth and redirects. Do not replace it. Read it first, then add a matcher for `/new-launch/:path*` that redirects to `/new-launch/login` when the `nl_access` cookie is missing or invalid, leaving `/new-launch/login` itself public. Do not change any existing matcher or behaviour.

**Environment variables.** Add `NEW_LAUNCH_ACCESS_CODE` and `NEW_LAUNCH_COOKIE_SECRET` to `.env.example` with placeholder values. Do not put real values in any committed file. The owner will add the real values in the Vercel dashboard and in his local `.env.local` by hand.

**Not in scope:** any client-side-only password check. The check must happen on the server, otherwise anyone can read the code in the page source.

---

## 3. Data (Phase 1)

All content in typed files, no database dependency, so the page works before the URA API key arrives.

- `lib/new-launch/types.ts` , TypeScript types for the shapes below.
- `lib/new-launch/macro.ts` , the market pulse figures, each with a `source` and `asOf` field.
- `lib/new-launch/projects/*.ts` , one file per project, exported from an index so the pipeline page can list them.

Every number that comes from a developer or is an advisor's judgement carries a `asOf` date, and the UI renders that date next to it. Stale pricing shown to a buyer is the main risk with this page.

### Project shape

```
slug, name, district, region ('CCR' | 'RCR' | 'OCR' | 'EC'),
tenure, totalUnits, developer, previewDate, expectedTop,
verdict: 'BUY' | 'CONDITIONAL' | 'WAIT' | 'PASS' | 'PENDING',
score: number | null,          // 0 to 100
thesis: string,                 // one paragraph, plain English
reviewedBy, reviewedOn,
fundamentals: Criterion[],      // six, see section 5
technicals: Criterion[],        // six, see section 5
pricing: { resale10yrPsf, resale5to10yrPsf, recentLaunchPsf, thisProjectPsfLow, thisProjectPsfHigh, breakevenPsf } // all nullable
breakeven: { landPsfPpr, construction, financeAndFees, breakeven, avgLaunchPsf, absdDeadline } // all nullable
versus: { budget, unitType, holdingYears, rows: VersusRow[] }
exitTest: { exitPriceFlatCase, upgraderBudget, competingSupplyUnits, leaseLeftAtExit }
catalysts: string[], risks: string[], wouldChangeView: string[]
```

`Criterion` = `{ name, measure, rule, result, score }` where `result` and `score` are nullable.

Anything null renders as a placeholder in square brackets, for example `[S$ psf]`. Never render `null`, `undefined`, `NaN` or `0` as a real value, and never invent a number to fill a gap.

### Macro figures to seed (real, verified)

All URA, 2Q 2026, unless stated.

- Private residential price index: +0.5% q-o-q in 2Q 2026, after +0.9% in 1Q 2026
- First half 2026: +1.4%, against +1.8% in 1H 2025
- By segment, 2Q 2026 q-o-q: landed +2.5%, all non-landed -0.1%, CCR non-landed +1.8%, RCR non-landed -1.2%, OCR non-landed -0.1%
- Private residential vacancy rate: 6.4% in 2Q 2026, up from 6.2%
- GLS Confirmed List: 4,745 private units in 2H 2026, 9,320 for full-year 2026, over 50% above the 10-year annual average (roughly 6,100)
- Pipeline: about 61,000 private units including ECs due to complete over the next few years
- House view: a string the advisor edits, seeded as `[Selective buyer's market]`
- 3M compounded SORA: leave null, labelled as a live MAS feed in Phase 2

Every macro item needs `source: 'URA 2Q 2026 real estate statistics'` or similar, rendered small under the card.

### Pipeline rows to seed

Mark all of these `verdict: 'PENDING'`, `score: null`, and set a `timingConfidence: 'reported'` flag so the UI can show a caution line. Timings come from developer and media reports and change often.

| Project | Segment | Units | Expected | Catalyst |
|---|---|---|---|---|
| Chuan Grove Residences | Condo, D19 | ~1,055 | 2H 2026 | Short walk to Lorong Chuan MRT (Circle Line) |
| Upper Thomson Residences | Condo, D20 | ~595 | Q4 2026 | Mixed use, retail and childcare at ground level |
| Dorset Road | Condo, RCR | TBC | 2H 2026 | City fringe, UOL, SingLand and Kheng Leong |
| Hougang Central | Condo, D19 | TBC | TBC | Integrated with bus interchange, mall, NEL and future CRL |
| Woodlands Drive 17 | EC, D25 | TBC | TBC | About 250m to Woodlands South MRT (TEL) |
| Senja Close | EC, D23 | TBC | TBC | TBC |

Also create one fully worked demo project file with slug `demo-project`, every field filled with bracketed placeholders, so the detail page can be viewed and reviewed before real data exists.

---

## 4. Pages and sections

### `/new-launch/login`

Split layout. Left, dark panel: HomeUP wordmark, "New Launch Desk" label, headline "Should you buy this new launch, or a resale unit instead?", one supporting paragraph, and three numbered items (Market pulse, Launch verdicts, New launch vs resale). Right, light panel: the form, a line saying the advisor issues the code and it expires after 30 days, and the disclaimer.

### `/new-launch` , market pulse and pipeline

In this order:

1. Header bar: HomeUP, nav (Market pulse, Launch pipeline, Verdicts, New launch vs resale), "Prepared for [client]" and Log out.
2. Hero: "Market pulse, [month year]" label, a headline, and a house view card.
3. Four KPI cards: price index 2Q, first half, vacancy, 3M SORA.
4. Two charts side by side, both inline SVG, no chart library: segment change bars, and GLS supply bars (2026 Confirmed List split 1H and 2H, against the 10-year average).
5. Macro signals: six cards with a green, amber, red or grey dot: price momentum, supply pipeline, rental market, interest rates, policy, economy and forecasts. Each with one or two plain sentences.
6. Top three picks as cards, each linking to its project page, showing verdict badge and score.
7. Full pipeline table: project, segment, units, expected, main catalyst, verdict. Below it, the caution line about reported timings.
8. "When a new launch beats resale, and when it does not": two columns, five bullets each, thresholds shown as editable numbers from the data file (15% and 20% today).
9. Footer: sources, "not financial advice", and HomeUP's CEA licence line.

### `/new-launch/[slug]` , the verdict

1. Same header, breadcrumb back to the pipeline.
2. Project name, meta chips (district and region, tenure, units, developer, preview date, expected TOP), and the thesis paragraph.
3. Verdict card: verdict word, score out of 100, fundamental and technical sub-scores with their weights, reviewer and date.
4. Buyer profile switch, three options, client component with React state: HDB upgrader own stay (fundamental 70 / technical 30), Investor (50 / 50), Right-sizer (80 / 20). Switching updates the displayed weights, the weighted total score, and the one-line description. Real `<button>` elements, keyboard reachable.
5. Two scorecards side by side, six criteria each. Every row: criterion name, what is measured, the green rule, the result, and the score out of 10.
6. Price positioning: horizontal SVG bars for resale 10+ years, resale 5 to 10 years, launches in the last 3 years, this project, and a dashed outline for developer breakeven. Bars scale to the data, and when values are null the bar renders as an empty outline, not a guessed length. Below: premium versus 5 to 10 year resale, premium versus recent launches, implied developer margin.
7. Developer breakeven panel: land psf ppr, construction, finance and fees, breakeven, average launch psf, ABSD deadline, plus the explanatory line about thin margins and deadlines meaning better pricing later.
8. Same budget, new launch versus resale: three-column table, nine rows (unit and size, price and psf, building age at exit, cash and loan before keys, rent or stay before TOP, estimated instalment at TOP, where upside comes from, main risk, stamp duties), then a "Better for you" row.
9. District price trend: SVG line chart, 4-quarter versus 8-quarter moving average of resale psf, with a signal label. Empty state until Phase 2 supplies the series.
10. Exit test panel: exit price flat case, typical upgrader budget nearby, competing supply completing near exit, lease left at exit, plus the explanatory line.
11. Three cards: catalysts, risks, what would change our view.
12. Two buttons: WhatsApp your advisor, View client summary.
13. Footer as above.

### `/new-launch/[slug]/summary` , phone-first

Verdict badge and score, one-line thesis, three reasons, three watch-outs, a four-row versus-resale mini table (price psf, size, move in, premium), a one-line market backdrop, WhatsApp button, link to the full analysis, disclaimer. Must read well at 390px wide.

---

## 5. The scoring framework

### Fundamental, six criteria

1. Location and connectivity , walk time to MRT, schools within 1km, daily amenities , green if MRT within 10 minutes walk
2. Entry price versus land cost , launch psf against developer breakeven psf , green if margin is 15% or less
3. Competing supply , uncompleted private units within 2km including upcoming GLS , green if under 2,000 units
4. Catalysts before exit , Master Plan items, new MRT lines, hubs landing before the exit year , green if at least one lands by year 7
5. Exit buyer pool , exit quantum against HDB upgrader budgets in nearby towns , green if the exit price is within upgrader reach
6. Rental demand , estimated gross yield and tenant pool , green if gross yield is 3.0% or more

### Technical, six criteria

1. New launch premium , launch psf versus 5 to 10 year old condos within 1km , green if 15% or less
2. District trend , 4-quarter versus 8-quarter moving average of resale psf , green if the 4Q average is above the 8Q
3. Sales momentum , launch weekend take-up then units sold per month , green if 30% or more sold at launch
4. Phase pricing , developer price increases since launch, by stack , green if increases are under 5% so far
5. Nearby launch absorption , sell-through of launches within 2km in the last 24 months , green if 70% or more sold
6. Volume signal , district transactions versus the same period last year , green if volume is flat or rising

All thresholds live in one constants file so they can be tuned in one place.

---

## 6. Look and feel

Do not use the default template look. No gradient washes, no emoji, no Inter or Roboto.

- Background `#F5F3EE`, surface `#FFFFFF`, ink `#16181B`, secondary text `#3E4248`, muted `#585C63`, hairline `#DEDAD1`
- Dark panels `#16181B` with `#F5F3EE` text, hairlines `#45494F`, muted `#BFC3C9`
- Green `#1E5B45` (buy, positive), amber `#B7791F` (watch), red `#9B3426` (headwind), navy `#1F3A5F` (supply and resale)
- Badge fills: green `#DDEEE6` on `#143F30`, amber `#F3E6CF` on `#6B4410`, navy `#E4E9F0` on `#1F3A5F`
- Type: Newsreader for headings, IBM Plex Sans for body, IBM Plex Mono for every number. Load via `next/font`. If the repo already standardises on other fonts, match the site instead and say so in the PR description.
- Cards: 1px hairline border, 12px radius, generous padding. No coloured left borders.
- Text contrast at least 4.5:1. Every tap target at least 44px. Icon-only buttons need an `aria-label`.
- Charts are inline SVG with a `role="img"` and a descriptive `aria-label`. Do not add a charting library.

A visual reference of all four screens exists as a Claude design canvas. If the owner supplies screenshots, follow them for layout.

---

## 7. Constraints

- Work on a branch, never commit straight to `master`. Open a PR against `master` and let the owner check the Vercel preview before merging.
- Read `docs/HANDOVER.md` and any `docs/*postmortem*` file before changing shared files.
- Do not touch `next.config.mjs`, the Supabase client setup, or existing middleware behaviour without saying why in the PR description.
- Do not run `npm audit fix --force`.
- Do not add a dependency without asking first. Everything here is buildable with what the repo already has.
- Never commit `.env.local` or any real key, code or secret.
- Run the local build and fix type errors before opening the PR.
- Keep the diff to Phase 1 files plus the minimum middleware addition.

## 8. Done when

- Visiting `/new-launch` without a cookie redirects to the login screen.
- A wrong code fails with a generic message. The correct code, read from an environment variable, lets you in and keeps you in for 30 days.
- The pipeline page renders the seeded macro figures with their sources and the six pipeline rows.
- `/new-launch/demo-project` renders every section, with placeholders where data is missing and no `NaN` or `undefined` anywhere.
- The profile switch changes weights and the weighted score.
- The summary page is readable on a 390px-wide screen.
- The build passes and the Vercel preview works.

## 9. Later phases, context only

- **Phase 2.** Nightly URA Data Service pull (access key exchanged for a daily token) writing into Supabase: private transactions in 4 district batches, developer sales by month, projects in the pipeline, median rentals. Feeds the launch premium, district trend, take-up, absorption and yield fields. Plus SORA from MAS.
- **Phase 3.** Admin form so an advisor enters developer data and scores without code, per-client access codes with names and expiry, and an intake path for developer WhatsApp updates.
