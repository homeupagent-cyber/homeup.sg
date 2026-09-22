# New Launch Desk: Phase 2 brief, URA data pipeline and auto-fill

Read `CLAUDE.md` and `docs/new-launch-desk-brief.md` first. Build Phase 1 before this if it does not exist yet, because everything here sits behind the Phase 1 access gate.

Goal: pull URA private residential data into Supabase every night, then let the New Launch Desk tools auto-fill resale comparables and project details from that data.

---

## 1. Hard rules from URA

- **Server only.** URA's registration email says the data services must be called from our server, never directly from the product. No browser code may call URA. Only the scheduled job below talks to URA; every page reads from Supabase.
- **Access key stays secret.** Read it from `process.env.URA_ACCESS_KEY` in server code only. Never prefix it with `NEXT_PUBLIC_`, never log it, never return it in an API response, never commit it. Add `URA_ACCESS_KEY=` with no value to `.env.example`.
- **Licence attribution.** The data is under the Singapore Open Data Licence v1.0. Every page or report that shows URA-derived figures must show a visible notice, for example: "Contains information from URA private residential transaction data, accessed on {date}, made available under the Singapore Open Data Licence version 1.0", linking to https://data.gov.sg/open-data-licence . Never word anything as "URA verified" or "official".
- **Data may be revised.** URA can modify or abort older records. Each run replaces the transaction set rather than appending, and keeps the latest 5 years only.

## 2. How the URA API works

The documentation is at https://eservice.ura.gov.sg/maps/api/ . Confirm the exact endpoint URLs and parameter names there before coding, and follow the page if anything below differs.

- Each day, exchange the access key for a token. The token is valid for that day only.
- Every data request sends two headers: the access key and the day's token.
- Services needed:
  - Private residential property transactions. Four batches split by postal district (batch 1 covers districts 01 to 07, and so on). Fetch all four. Updated end of day every Tuesday and Friday.
  - Units sold by developers. Monthly, by project, with units launched and sold and median, lowest and highest psf. Takes a reference period as mmyy. Updated on the 15th of each month.
  - Private residential projects in the pipeline. Total units, developer, expected TOP year. Updated on the 4th Friday of Jan, Apr, Jul and Oct.
  - Median rentals by project, quarterly.
- If URA returns empty or blocked responses from Vercel, try adding a normal browser-like `User-Agent` header. Record what was needed in the PR description.

## 3. Supabase

Use the website's Supabase project only, **HOMEUP, ref `ixhikkbytusikgjiuvqa`**.

Warning: around 14 Aug, environment variables from a separate project (`propmeta-console`), including `POSTGRES_URL`, `POSTGRES_PASSWORD`, `SUPABASE_SECRET_KEY` and `SUPABASE_PUBLISHABLE_KEY`, were added to this Vercel project by mistake. Before writing any server code, check which variables the existing server-side Supabase client reads, and confirm they point at `ixhikkbytusikgjiuvqa`. If in doubt, stop and tell the owner rather than guessing. Do not write URA data into the wrong database.

Create migrations in `supabase/` for these tables. Enable row level security on all of them with no public policies, so only server code with the service key can read or write.

- `ura_transactions` , one row per transaction: project, street, district, market_segment, property_type, tenure_text, area_sqm, area_sqft, price, psf, nett_price, floor_range, contract_date (first of the month), type_of_sale (1 new sale, 2 sub sale, 3 resale), no_of_units, x, y, batch, fetched_at.
- `ura_projects` , one row per project name, rebuilt after each transaction load: project, street, district, market_segment, tenure_type (`99` or `FH`, with 999-year treated as `FH`), lease_start_year, x, y, first_resale_date, est_top_year (from the first resale, flagged as an estimate), resale_count_24m, updated_at.
- `ura_developer_sales` , project, ref_period, units launched, units sold, median, lowest and highest psf, fetched_at.
- `ura_pipeline` , project, street, district, developer, total_units, expected_top_year, fetched_at.
- `ura_rental_median` , project, street, district, ref_period, median, 25th and 75th percentile psf per month, fetched_at.
- `ura_ingest_log` , run_id, service, batch, started_at, finished_at, rows, status, error_message (never the key or token).

Parsing notes:

- Area comes in square metres. Convert with 1 sqm = 10.7639 sqft. psf = price / area_sqft.
- Parse the lease start year from tenure text such as "99 yrs lease commencing from 2012". "Freehold" and 999-year leases map to `FH`.
- Exclude rows where `no_of_units` is more than 1 from every average. Those are bulk deals.
- Coordinates are SVY21, which is in metres, so straight-line distance is `sqrt(dx*dx + dy*dy)`.

## 4. The nightly job

- Route: `app/api/cron/ura/route.ts`, scheduled in `vercel.json` for about 22:00 UTC (6am Singapore).
- Protect it with `CRON_SECRET`: reject any request whose `Authorization` header is not `Bearer <CRON_SECRET>`. Add `CRON_SECRET=` to `.env.example`, and tell the owner to add a long random value in Vercel.
- Steps: get the day's token, fetch each service, write inside a transaction so a failed run leaves yesterday's data intact, rebuild `ura_projects`, then write the log.
- Check the Vercel plan's cron and function duration limits. If four transaction batches do not fit in one run, split into one route call per batch with staggered schedules, and say so in the PR.
- Transactions only change on Tuesday and Friday, and developer sales only monthly. Skip services whose source has not updated since the last successful run, so we do not hit URA needlessly.

## 5. Read APIs for the tools

All under `/api/new-launch/`, behind the Phase 1 access cookie, server-side reads from Supabase.

- `GET projects?q=thom` , up to 10 project names matching the text, for autocomplete. Show names in title case but match against URA's capitals.
- `GET projects/{name}/summary?sizeSqft=750&months=12` , tenure_type, lease_start_year, district, est_top_year with its estimate flag, and the resale average psf using the rule in section 6, with its count and date range.
- `GET nearby?project={name}&radius=1000` , resale projects within the radius in metres, each with distance, tenure and resale count, nearest first.
- `GET launch/{name}` , the latest developer sales rows and pipeline row for a new launch.

## 6. Resale average psf rule (show it on screen)

- Resale only, `type_of_sale = 3`. Exclude new sales, sub sales and bulk deals.
- Last 12 months by contract date.
- Units within 25% of the size being compared (`sizeSqft`). If no size is given, all sizes.
- If fewer than 3 transactions match, widen to 24 months and set a `widened: true` flag.
- Return the average, the median, the count and the first and last contract months. The UI shows them together, for example "S$2,150 psf, 9 resales, Oct 2025 to Sep 2026".

## 7. Changes to the New Launch Desk tool

In the tool at `/new-launch/compare`, which was ported from `docs/nl-compare.html`:

- **Resale vs new launch tab.** The resale project name field becomes an autocomplete. Picking a name fills tenure, lease start, TOP year (marked "est.") and average psf, and shows the count and date range under the psf.
- **Suggest nearby.** Add a "Suggest nearby" button that lists resale projects within 1km of the new launch, with checkboxes, and adds the ticked ones as rows. The new launch's location comes from its own URA record, where one exists. If there is none, ask the user to pick the nearest existing project as the anchor.
- **Overrides.** Any auto-filled field can still be typed over. Typed values get a small "edited" marker, and a later refresh must never overwrite them.
- **Projects tab.** For a launched project, offer "Fill from URA", using developer sales for the psf range and the as-at month. For an upcoming project, fill total units and expected TOP from the pipeline once URA lists it.
- **Attribution.** Add the licence notice from section 1 to the tool's footer and to the printed report, with the data date.
- **Keep every calculation identical.** Stamp duty tiers, the SLA lease table, walk-away, the waiting bet and the resale projection must not change. This phase only changes where inputs come from.

## 8. Done when

- The cron route runs locally when called with the secret, and fills all tables in the HOMEUP Supabase project.
- A second run replaces the data rather than duplicating it, and a forced failure leaves the previous data intact.
- Typing "cann" in the resale name field suggests Canninghill Piers, and picking it fills its tenure, lease start and average psf with count and date range.
- "Suggest nearby" for a test launch returns sensible projects within 1km.
- No request to any `ura.gov.sg` address appears in the browser's network tab while using the tool.
- The attribution notice shows on the tool and the report.
- The build passes and the Vercel preview works.
