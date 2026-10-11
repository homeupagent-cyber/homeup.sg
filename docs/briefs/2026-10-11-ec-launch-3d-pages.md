# Brief: EC Launch 3D Pages (Solano Grand + Wynwood Grand), Phase 1

- Date: 11 Oct 2026
- Owner: Tong Boon
- Repo: `homeupagent-cyber/homeup.sg` (default branch `master`). Work on a new branch.
- Save this file to: `docs/briefs/2026-10-11-ec-launch-3d-pages.md`

---

## Controls (non-negotiable)

1. **Stage 0 stop.** Read the repo, answer the Stage 0 questions below, then STOP and wait for approval. No file edits, no installs before approval.
2. **No database writes.** No migrations, no inserts, no Supabase dashboard changes. No new tables.
3. **No merging.** Push the branch and open a PR. Tong Boon checks the Vercel preview and merges himself.
4. **Terminology.** HomeUP is an advisory. Never describe HomeUP as an agency. Never use the word "specialist". Never call any page, model or data "official", "developer's" or "showflat".
5. **Do not touch** `next.config.mjs` caching (`no-store` stays), Cloudflare, Vercel env vars, or the listings sync.

---

## Goal

Build a reusable template: one page per new launch at `homeup.sg/new-launch/[slug]`, driven by one data file per project. Pilot with two CDL ECs:

- `/new-launch/solano-grand`
- `/new-launch/wynwood-grand`
- `/new-launch` (hub page listing every review, see "Hub page" below)

## Hub page (`/new-launch`)

- Public page listing every launch review as cards, upcoming launches first, then launched, then completed. Cards generated from the data files, so a new data file adds a card automatically.
- Each card: project name, EC or condo, location, developer, status (Upcoming / Preview / Launched), one-line HomeUP take, link.
- Title pattern: `New Launch & EC Reviews 2026: Independent Analysis | HomeUP`. Short intro explaining HomeUP reviews launches independently, plus the "How HomeUP is paid" box.
- Add `ItemList` JSON-LD for the cards.
- **Navigation:** add "New Launch Reviews" under the Buy menu, linking to `/new-launch`. Keep it separate from Playbook.
- **Cross-links:** `/buy-new-launch` links prominently to the hub. Each review links to relevant Playbook guides (Stage 0: list which exist), and those guides link back to current reviews.
- The password-protected New Launch Desk is not linked from the public menu.

**Positioning: independent review, never project marketing.** HomeUP is not the developer's appointed sales team, so these pages do not sell the project. They work like a mortgage broker's comparison: an independent, buyer-side review that compares the project against its alternatives and states honest pros, cons and who should skip it.

Each page pulls decision-stage search traffic ("review", "worth buying", "vs", "pros and cons"), shows an interactive 3D site-context model with a sun-path study, and converts readers into consultation leads through a gated "HomeUP Verdict" section.

## Phases

| Phase | When | Adds |
|---|---|---|
| **1 (this brief)** | Now, before launch | Site boundary, surrounding buildings, sun-path study, measured location facts, land price facts, lead form |
| 2 (later brief) | When CDL releases site plan and floor plans | Blocks, stacks, facings, unit types colour-tagged, per-stack sun study |
| 3 (later brief) | At preview, when price list is out | Prices per unit, psf, stack ranking, gated verdict |

Phase 1 must not draw tower positions, stacks or unit layouts. Nothing has been released, so anything drawn would be invented.

---

## Compliance rules for the page content

- **No sales language.** Banned on these pages: "register interest", "VVIP", "direct developer price", "book showflat", "priority booking", "limited units", "best price guaranteed", or any wording implying HomeUP sells units for the developer.
- **No unit-for-sale presentation.** Prices may appear only inside analysis and comparison (Phase 3), never as units offered through HomeUP.
- **Every review includes a Cons section and a "Who should skip this" section.** A page with no negatives is not allowed to ship.
- **Disclosure box** beside the verdict, titled "How HomeUP is paid". Draft wording (Tong Boon and KEO to confirm before publishing):
  > If you buy a new launch unit with us, the developer pays our commission. We share it with the developer's appointed sales team, so we earn less than they do. You pay the same developer price as buying at the showflat, and you pay HomeUP nothing. We are also paid when we help clients buy resale, so we can tell you honestly when a project is not right for you.
- Every 3D view carries the label: **"HomeUP indicative site study. Not a developer model. Layout and heights subject to the developer's final plans."**
- Every data block shows its source and an "as of" date.
- **No traffic simulation of any kind.** Location facts are measured distances only.
- **No developer renders, logos, brochures, floor plans or price lists** on the page unless Tong Boon confirms written permission.
- Footer block on every launch page: Yeo Tong Boon, CEA Reg. No. R069651E, C & H Properties Pte Ltd, CEA Licence L3007139C, plus contact.
- Attribution line: "© OpenStreetMap contributors" (ODbL), and data.gov.sg / SLA OneMap attributions under the Singapore Open Data Licence for any dataset used.
- Tong Boon gets C & H's KEO to sign off the Vercel preview before merge.

---

## Project facts for the data files

Put these in the data files with their source URLs. Tong Boon verifies each against the HDB/URA tender result pages before publishing. Mark anything unverified as `"TBC"`.

**Solano Grand** (`solano-grand`)
- Location: Senja Close, Bukit Panjang (District 23), near Jelapang LRT, off the KJE
- Developer: City Developments Limited (bidding entity CDL Constellation Pte)
- Tenure: 99-year leasehold
- Site area: about 109,353 sq ft
- Land price: S$252.9M, S$771 psf ppr (tender closed 5 Aug 2025)
- CDL's stated scheme: 306 units, two towers of 26 and 27 storeys
- Context: first EC in Bukit Panjang since Blossom Residences (2011); a proposed temple site is reported adjacent to the plot (verify on URA Master Plan)
- Launch timing: TBC

**Wynwood Grand** (`wynwood-grand`)
- Location: Woodlands Drive 17 (Plot 1), District 25, about 5 min walk to Woodlands South MRT (TEL)
- Developer: City Developments Limited (bidding entity CDL Divine Pte)
- Tenure: 99-year leasehold
- Site area: about 271,328 sq ft, plot ratio 1.7, max GFA about 461,259 sq ft, about 420 units
- Land price: S$360.9M, S$782 psf ppr (EC land record at the time, tender closed 5 Aug 2025)
- Context: across the road from Norwood Grand (CDL private condo). Woodlands Drive 17 Plot 2 awarded to Sim Lian at about S$794 psf ppr, so a second EC will compete on the same road
- Launch timing: TBC

---

## Page structure (top to bottom)

1. **Hero**: project name with "EC", location, developer, tenure, estimated units, status "Launch timing TBC". One-line summary written by Tong Boon (leave a placeholder).
2. **3D Site Context viewer** (spec below).
3. **Sun-path study**: short plain-English explanation of which sides of the plot catch morning sun, afternoon sun, and shade from neighbouring blocks, with the viewer presets beside it. Text placeholder for Tong Boon to write after viewing the model.
4. **Location facts (measured)**: straight-line and walking distance to nearest MRT/LRT, nearest expressway, primary schools within 1 km and 1 to 2 km (MOE school list), nearest malls. State the method ("measured from the plot centre").
5. **Land price and what it means**: land rate, how it compares with recent EC land rates. Facts only, analysis placeholder for Tong Boon.
6. **Comparisons (the core of the page)**: side-by-side table driven by the data file. Columns are the alternatives a buyer is really weighing. Wynwood: Woodlands Drive 17 Plot 2 EC, Norwood Grand, a nearby resale EC, staying in HDB. Solano: Blossom Residences (resale EC), a nearby resale condo, a competing new EC, staying in HDB. Rows: land rate, location facts, tenure, expected entry price (TBC until Phase 3), MOP/privatisation timeline, notes. Every cell sourced or marked TBC.
7. **Pros, Cons, and Who should skip this**: three short lists. Placeholders for Tong Boon.
8. **HomeUP Verdict (gated)**: teaser text plus lead form, framed as "Get our independent verdict and a comparison for your budget". Disclosure line beside it. Full content arrives at Phase 3.
9. **Video slot**: hidden until a YouTube URL is set in the data file.
10. **FAQ**: 5 to 8 questions from the data file (AEO), weighted to decision questions ("Is Solano Grand worth buying?", "Solano Grand vs Blossom Residences").
11. **Disclaimer, sources, CEA footer.** Disclaimer states the page is independent analysis, not affiliated with or endorsed by the developer.

---

## 3D viewer spec

- **Libraries**: `three`, `@react-three/fiber` v8 and `@react-three/drei` v9 (React 18 compatible), `suncalc`. Pin exact versions. List them in Stage 0 before installing. Use `npm install` the way the repo already does (check whether `--legacy-peer-deps` is needed and report).
- **Loading**: client-side only (`next/dynamic` with `ssr: false`). The page text must render without the 3D so search engines and slow phones get the content first. Show a static fallback image plus text if WebGL is unavailable.
- **Geometry, all in local metres around the plot centre:**
  - Plot boundary: GeoJSON polygon. Report in Stage 0 the best source (URA Master Plan land use layer on data.gov.sg, SLA land parcel, or the HDB tender site plan). If no clean source exists, Tong Boon traces it manually.
  - Surrounding buildings within 300 m: footprints from OpenStreetMap.
  - Heights: HDB blocks from the data.gov.sg "HDB Property Information" dataset (`max_floor_lvl` x 3.0 m, assumption stated on the page). Other buildings from OSM `height` or `building:levels`. Unknown heights render in a lighter grey with a "height estimated" note.
  - The project plot itself: highlighted outline plus a height reference marker showing the stated maximum storeys. **No tower blocks drawn in Phase 1.**
- **Sun**: `suncalc` with the plot's lat/lng and `Asia/Singapore` time. Directional light with real-time shadows.
- **Controls**: orbit, pinch zoom, compass arrow, preset buttons for 21 Jun, 21 Mar / 23 Sep, 21 Dec, time slider 7am to 7pm, play button.
- **Toggles**: plot outline, labels (MRT, schools, expressway), shadows on/off.
- **Mobile first**: works at 380 px wide with touch. Keep each project's geometry file under 2 MB.

## Data pipeline

- Script: `scripts/launch-data/build-site-context.mjs [slug]`. Fetches OSM buildings for the bounding box (Overpass API) and the HDB dataset, writes `public/launch-data/[slug]/context.geojson`. Outputs are committed so the live site never calls these APIs.
- Project data: `data/launches/[slug].ts` (typed). Fields: name, slug, location, district, developer, tenure, site area, units, land price, psf ppr, tender date, lat/lng, status, facts with sources, FAQ, YouTube URL (optional), last verified date.
- Adding a new launch later should need only a new data file plus one script run.

## SEO / AEO

- Title pattern: `Solano Grand EC Review: Pros, Cons & Comparisons (Senja Close) | HomeUP`
- H1 and meta description use "independent review" framing. Never "official site" or "launch page".
- Canonical URL, Open Graph image (static render of the model).
- JSON-LD: `Article` + `FAQPage`; add `VideoObject` when a YouTube URL is set. Reuse existing schema helpers if any.
- Add both pages to the sitemap. If the IndexNow setup from the Bing/AEO build exists, ping on publish; if not, report and skip.
- Internal link from `/buy-new-launch` (EC section) to both pages.

## Analytics

GA4 events: `launch_viewer_open`, `launch_sun_preset`, `launch_time_slider`, `launch_lead_submit`, each with the project slug.

## Lead capture

Reuse the site's existing lead form component and its existing destination. Report in Stage 0 what exists and where submissions land. No new tables, no schema changes.

---

## Stage 0 questions (answer, then STOP)

1. Does `/new-launch/` or any route that would clash already exist? What links to `/buy-new-launch`?
2. Which lead form component exists and where do its submissions go?
3. Existing JSON-LD / schema helpers and sitemap setup: where are they?
4. Is IndexNow implemented yet?
5. Proposed exact package versions and whether install needs `--legacy-peer-deps`.
6. Best available source for each plot boundary, with links.
7. Any terminology guardrail script (`scripts/check-cea-terminology.mjs`) that must pass, and how to run it.
8. List of files you plan to create or change.

## Acceptance criteria

- Both pages load on a phone over 4G with text visible before the 3D loads.
- Sun presets visibly move shadows correctly (morning shadows fall west, afternoon east).
- Indicative-study label, sources, dates and CEA footer present on both pages.
- No developer material, no traffic simulation, no tower positions.
- Comparison table, Cons and "Who should skip this" sections present. No banned sales phrases anywhere on the page (add them to the guardrail script check).
- `check-cea-terminology` passes. `npm run build` passes locally.
- PR opened against `master`, not merged.
