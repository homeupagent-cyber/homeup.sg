# Brief: build the /track-record page

**Date:** 21 August 2026
**Repo:** `homeupagent-cyber/homeup.sg`
**Base branch:** `master`
**Branch to create:** `feat/track-record-page`
**Route to build:** `homeup.sg/track-record`

## Purpose

Build a new page presenting HomeUP's transaction rankings, computed from CEA's published
salesperson transaction records. The page's whole value is that every figure on it can be
reproduced by a reader from public data. It is a citation asset for journalists, editors
and AI answer engines, not a conversion page.

**The copy below is final and verified.** Do not rewrite it, do not improve it, do not add
figures. Every number was computed from the CEA dataset on 21 August 2026 and checked. If
you think a number is wrong, stop and report rather than changing it.

## Scope: founders only

This page covers **Dennis Lim and Yeo Tong Boon only**. That is a deliberate editorial
decision, not an oversight.

The argument the page makes is two number one national rankings. Adding other advisors'
figures, however respectable, invites the reader to average them against the headline
rather than take it at face value. Team totals have the same weakening effect, because a
combined count is not a ranking and prompts the question "across how many people, over how
long".

Do not add any other advisor, any team total, or any aggregate transaction count to this
page, even if you find figures elsewhere in the repo that look relevant.

## Terminology: non-negotiable

**HomeUP is not an estate agency.** It is a property advisory team operating under
C & H Properties Pte Ltd, which holds CEA Licence L3007139C. This is a regulatory
distinction, not a style preference. Only a licensed estate agent may hold itself out as an
estate agency, and describing HomeUP as one would be a misrepresentation.

Rules for any word you write on this page:

- Never describe HomeUP as an agency, an agent, a brokerage or a firm of agents.
- Use: advisory, advisory team, team, or simply HomeUP.
- Individuals are **advisors** or, where the regulatory term is needed, **salespersons**.
  Never "agents".
- "Agency" is correct only when referring to C & H Properties Pte Ltd, or to CEA itself
  (Council for Estate Agencies).
- The word "agent" is acceptable only inside a URL path or file name, for example
  `/agents/yeo-tong-boon`, which is existing site structure and out of scope here.

If a sentence in the copy below appears to breach this, stop and report it rather than
rewriting it yourself.

## Ground rules

- Branch, never commit to `master` directly.
- Do not run `npm audit fix --force`.
- Do not run `vercel env pull` on this project. Variables are marked Sensitive and return
  the literal string `[SENSITIVE]`, and it pulls in `VERCEL=1` which breaks local assets.
- Do not modify `.env.local`, `next.config.mjs`, or anything under `supabase/`.
- Match the existing site conventions. Read two or three existing pages under `app/` first
  and follow their patterns for metadata export, layout components and Tailwind usage.
- All content must render server side. No client-only fetching, no accordion that hides
  answers from crawlers, no text that only appears after an animation completes.

## Stage 0: investigate, report, wait

Before writing anything, report:

1. How other static pages under `app/` are structured, for example `app/about/page.tsx`.
2. How page metadata is exported on this site, and whether a shared helper exists in
   `lib/seo/`.
3. Whether any JSON-LD structured data already exists sitewide, and if so where the
   `#organization` and `#website` nodes are defined. The schema below references them.
4. How the sitemap is generated, and what needs to change to include a new route.
5. Which shared layout, header and footer components a new page should use.

Report these five, then wait for confirmation.

---

## Page copy: use exactly as written

### Metadata

- **Title tag:** `Our Track Record | HomeUP, Verified Against CEA Records`
- **Meta description:** `Two HomeUP advisors rank #1 in Singapore for private residential resale, with a top 1% HDB result, in CEA's published transaction records. Full figures and methodology.`
- **Canonical:** `https://homeup.sg/track-record`
- **OG image:** reuse the site default unless one already exists for this route.

### Body

---

# Our Track Record, Verified Against CEA Records

Plenty of people in Singapore property describe themselves as top producers. Almost none
show you where the number comes from.

Every figure on this page is computed from the Council for Estate Agencies' published
salesperson transaction records, the same dataset anyone can download from data.gov.sg.
We show the method, the size of the field and the shape of the distribution, so you can
reproduce the work yourself.

**Data covers:** January 2017 to June 2026
**Source:** CEA Salespersons' Property Transaction Records (Residential), data.gov.sg
**Last verified:** August 2026

---

## The headline

Two HomeUP advisors hold the **number one position in Singapore** in their categories.

Figures below cover the twelve months to June 2026, the most recent period for which every
month is complete.

| Advisor | Category | Transactions | Rank |
|---|---|---|---|
| **Dennis Lim** | Private residential resale, seller representation | 81 | **1st of 7,404** |
| **Yeo Tong Boon** | Private residential resale, buyer representation | 26 | **1st of 6,143** |

Both also finished the 2025 calendar year in first place in the same categories.

---

## What first place actually means

A rank is only meaningful next to the field it was measured against. Here is the shape of
each category.

### Private residential resale, buyer representation

In the twelve months to June 2026, **6,143 salespersons** in Singapore represented a buyer
in at least one private residential resale transaction. Between them they closed 10,704
transactions.

- The median salesperson in this category closed **one** transaction.
- 63% closed exactly one all year.
- **26 salespersons** in the whole country reached ten or more.
- **Two** reached twenty.

Yeo Tong Boon closed 26, more than any other salesperson in Singapore.

### Private residential resale, seller representation

In the same twelve months, **7,404 salespersons** represented a seller in at least one
private residential resale transaction, closing 15,423 transactions between them.

- The median salesperson closed **one** transaction.
- 56% closed exactly one.
- **93 salespersons** reached ten or more.
- **Three** reached fifty.

Dennis Lim closed 81, more than any other salesperson in Singapore.

---

## 2025 calendar year

The twelve-month view above rolls forward. The calendar year below is fixed and will not
change, which makes it the cleaner reference point.

### Dennis Lim, first in Singapore, private resale seller representation

- **96 transactions** in 2025
- **Ranked 1st of 7,721** salespersons active in the category
- The category recorded 16,659 transactions in total; the median salesperson closed one
- Nine salespersons nationally reached twenty; two reached fifty

CEA registration: R055990G. Registered name: Lim Swee Ser.

### Yeo Tong Boon, first in Singapore, private resale buyer representation

- **25 transactions** in 2025
- **Ranked 1st of 6,284** salespersons active in the category
- The category recorded 11,239 transactions in total; the median salesperson closed one
- Twenty-nine salespersons nationally reached ten; two reached twenty

This was his first full calendar year in practice. His first recorded transaction in the
CEA dataset is May 2024.

CEA registration: R069651E.

---

## HDB resale, 2025

The two number one positions on this page are in private property. HDB is a separate
market with a separate field, so it is measured separately.

### Yeo Tong Boon, top 1% in Singapore, HDB resale seller representation, 2025

- **22 transactions** on the seller side in the 2025 calendar year
- **Ranked 62nd of 8,785** salespersons active in the category
- That is the **top 0.71%** nationally

The field, for context. In 2025, 8,785 salespersons represented an HDB seller in at least
one resale transaction, closing 23,489 transactions between them.

- The median salesperson in this category closed **two** transactions.
- **82 salespersons** nationally reached twenty.
- The threshold for the top 1% was nineteen transactions.

**This is a 2025 figure and we state it as one.** The rolling twelve-month view used
elsewhere on this page is led by private resale work, where his buyer-side practice now
sits. We report the calendar year result because that is the period in which it was
achieved, not because it is the most flattering window available.

---

## For HDB sellers

If you are selling an HDB flat, two of the rankings on this page are in a different market.
Here is why they still matter to you, alongside the HDB result above.

Buyer representation volume is a direct measure of how many active buyers an advisory team
is working with at any time. When your flat is listed with us, it is being shown to the
buyer pipeline of the salesperson who represented more private resale buyers than anyone
else in Singapore, plus the rest of our team.

Upgrader demand is also the main driver of HDB resale pricing at the upper end. A team that
transacts heavily in private resale sees where that demand is moving before it shows up in
HDB data.

---

## Methodology

- **Source:** CEA Salespersons' Property Transaction Records (Residential), published on
  data.gov.sg. The version used here contains 1,388,678 records covering 32,744
  salespersons, of which 577,393 are sale-side transactions and the remainder are rentals.
- **Coverage:** January 2017 to June 2026. Rental and new sale records appear in the
  dataset only from 2020 onward.
- **Reporting lag.** CEA publishes with a delay and recent months are revised upward as
  records are submitted. We therefore exclude the two most recent months from every figure
  on this page. At the time of writing that means we stop at June 2026, even though the
  published file extends to August.
- **Category** means a single combination of property type, transaction type and side
  represented, for example private residential resale on the buyer side.
- **Rank** is by transaction count within a single category and a single time window.
- **The field** is the number of salespersons who recorded at least one transaction in
  that category and window. Salespersons who recorded none are excluded, which makes every
  rank on this page harder to achieve than it would be against the full register.
- **Private residential** covers condominium and apartment, executive condominium, landed,
  and strata landed.
- Where an advisor holds more than one CEA registration number, records under both are
  combined.
- We report rank against the field rather than percentile bands, because percentile
  boundaries depend on how ties are broken and rank does not.

---

## Verify this yourself

- **CEA Public Register:** search any registration number above at
  eservices.cea.gov.sg/aceas/public-register
- **Licensed estate agency:** C & H Properties Pte Ltd, CEA Licence L3007139C. HomeUP is a
  property advisory team operating under this licence. It is not itself a licensed estate
  agency.
- **Source dataset:** CEA Salespersons' Property Transaction Records (Residential),
  data.gov.sg

If you reproduce these figures and get a different answer, tell us and we will either
correct the page or show you our working.

---

## Frequently asked questions

### Who is the number one property agent in Singapore?

There is no single answer, because CEA publishes transactions by category rather than
awarding an overall title. In the twelve months to June 2026, HomeUP's Dennis Lim recorded
more private residential resale transactions on the seller side than any other salesperson
in Singapore, and Yeo Tong Boon recorded more on the buyer side.

### Is HomeUP's ranking an award?

No. These are counts computed from CEA's published data. CEA does not confer rankings or
awards, and nobody gave us a prize. We publish the method so the figures can be checked.

### How can a fixed-fee team rank first on volume?

The fee model changes what the client pays, not how the transaction is conducted. Our
advisors still earn commission; it is calculated from a fixed fee rather than as a
percentage of the sale price. The rankings on this page count completed transactions, and
a transaction counts the same whatever the client was charged for it.

### How current is this data?

The figures cover the twelve months to June 2026. CEA publishes with a reporting lag, so we
exclude the two most recent months and refresh the page quarterly.

### Does HomeUP handle HDB as well as private property?

Yes. In 2025, Yeo Tong Boon closed 22 HDB resale transactions on the seller side, ranking
62nd of 8,785 salespersons active in that category, which places him in the top 1%
nationally. Full figures are in the HDB section above.

---

## End of page copy

---

## Technical requirements

### Routing

Create `app/track-record/page.tsx` following the conventions found in Stage 0. Add the
route to the sitemap.

### Structured data

Add this JSON-LD inside the page component as a `<script type="application/ld+json">` tag,
with the object passed through `JSON.stringify`. If sitewide `#organization` and `#website`
nodes do not exist yet, report that and leave the references in place rather than inventing
new nodes.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://homeup.sg/track-record#webpage",
      "url": "https://homeup.sg/track-record",
      "name": "Our Track Record | HomeUP, Verified Against CEA Records",
      "description": "Two HomeUP advisors rank #1 in Singapore for private residential resale, with a top 1% HDB seller-side result, in CEA's published transaction records.",
      "isPartOf": { "@id": "https://homeup.sg/#website" },
      "about": { "@id": "https://homeup.sg/#organization" },
      "dateModified": "2026-08-21"
    },
    {
      "@type": "Person",
      "@id": "https://homeup.sg/agents/dennis-lim#person",
      "name": "Dennis Lim",
      "alternateName": "Lim Swee Ser",
      "identifier": "R055990G",
      "jobTitle": "Co-Founder",
      "worksFor": { "@id": "https://homeup.sg/#organization" },
      "url": "https://homeup.sg/agents/dennis-lim"
    },
    {
      "@type": "Person",
      "@id": "https://homeup.sg/agents/yeo-tong-boon#person",
      "name": "Yeo Tong Boon",
      "identifier": "R069651E",
      "jobTitle": "Co-Founder",
      "worksFor": { "@id": "https://homeup.sg/#organization" },
      "url": "https://homeup.sg/agents/yeo-tong-boon",
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "National University of Singapore"
      }
    },
    {
      "@type": "Dataset",
      "@id": "https://homeup.sg/track-record#dataset",
      "name": "CEA Salespersons' Property Transaction Records (Residential)",
      "description": "Published transaction records for licensed property salespersons in Singapore, used as the source for all figures on this page.",
      "creator": {
        "@type": "GovernmentOrganization",
        "name": "Council for Estate Agencies"
      },
      "isAccessibleForFree": true,
      "url": "https://data.gov.sg"
    }
  ]
}
```

Also add `FAQPage` schema for the five questions in the FAQ section, using the exact
question and answer text above.

### FAQ rendering

The FAQ answers must be present in the server-rendered HTML. If you use a collapsible
component, the answer text must still be in the DOM when collapsed, not injected on click.

### Internal links

- Link `/track-record` from the footer, under Company.
- Link it from the About page.
- Link it from each agent page whose figures appear on it, using the anchor text
  `See our verified track record`.

### Verify the agent page slugs

The schema above assumes `dennis-lim` and `yeo-tong-boon`. Check the actual slugs before
committing. There is a known issue where Isaac Teh's slug reads `isaac-tay`.
Report any mismatch rather than guessing, and do not fix unrelated slugs in this branch.

---

## Acceptance criteria

- `/track-record` renders on localhost with all copy above present and correct.
- Viewing page source shows every figure, heading and FAQ answer in the raw HTML.
- Google's Rich Results Test on the preview URL reports valid `WebPage`, `Person`,
  `Dataset` and `FAQPage` items with no errors.
- The page appears in the sitemap.
- The three internal links exist and resolve.
- The page is responsive and readable at 375px width.
- No figure differs from this brief by even one digit.
- Every HDB figure is presented with its year attached. The top 1% HDB claim must never
  appear without "2025" adjacent to it.

---

## Out of scope

Do not do any of the following in this branch:

- Build the `/press` page. Separate brief.
- Change the homepage hero or its statistics.
- Alter any existing agent page copy beyond adding the one internal link.
- Add media logos to this page. It stays purely data driven, by decision.
- Add any independent ranking or third-party award mention. Pending verification.
- Fix the stale footer date or the footer YouTube link.

---

## Delivery

```
git checkout master
git pull
git checkout -b feat/track-record-page
```

Commit in logical steps. Then:

```
git push -u origin HEAD
gh pr create --base master --title "Add /track-record page" --body "..."
```

Do not merge. In the PR body, list what you built, confirm each acceptance criterion you
verified, and flag anything you could not complete or that did not match this brief.
