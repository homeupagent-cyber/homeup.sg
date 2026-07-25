# HomeUp handover prep — strip discarded systems + ownership runbook

**Date:** 2026-07-25  
**Status:** Approved for planning (Approach 1)  
**Goal:** Prepare HomeUp for ownership transfer by removing systems the owners will not receive, then land a handover runbook on `master` that matches the slimmed stack — including how owners set up local env and store new API keys.

---

## 1. Decisions (locked)

| Decision | Choice |
|---|---|
| Delivery style | **Two PRs** (code strip first, then runbook) |
| Article Generation admin + pipeline | **Remove** |
| Anthropic admin helpers (Playbook AI fill, Analytics Ask, freshness/refresh-queue) | **Remove** |
| PG listing Claude extract (`extract-with-claude` + import path) | **Keep** |
| Media app (`apps/media`), fal/n8n/R2/room-clip path | **Remove** |
| Published Playbook + manual edit/publish admin | **Keep** |
| Existing videos/files served from Supabase storage | **Keep serving**; stop generating |
| Handover doc | Polish `docs/HANDOVER.md` on `master`; include **owner local env setup** for new keys |

Out of scope for these PRs: performing the live account transfers, undeploying Vercel `homeup-media` / DNS / R2 (documented as runbook checkboxes only).

---

## 2. Architecture after strip

```
Owners operate:
  homeup.sg (Next.js on Vercel)
    ├── Public site (listings, playbook articles/videos, agents, intakes)
    ├── Admin CMS (manual playbook, listings sync, analytics GA/GSC without Ask)
    └── Anthropic — PG listing text extract only

Discarded (code removed; ops teardown in runbook):
  /admin/article-generation + lib/pipeline generation
  playbook-ai, analytics/ask, freshness cron + refresh-queue
  apps/media + media.homeup.sg + R2 homeup-media-raw + generate-room-clip + fal/n8n
```

Supabase project ref stays transferable as-is. Media-only tables (`media_jobs`, `media_files`, `blueprints`, `media_pipeline_*`) are left in the DB for PR1; optional `DROP` is a later ops note in the runbook. Do **not** drop `profiles` without a separate audit (auth triggers).

---

## 3. PR1 — Code strip

### 3.1 Delete

**Article generation / Anthropic admin**

| Area | Paths |
|---|---|
| Admin UI | `app/(admin)/admin/(dashboard)/article-generation/page.tsx`, `components/admin/ArticleGenerationTab.tsx`, `components/admin/AnalyticsAskPanel.tsx` |
| APIs | `app/api/admin/generate/`, `topics/`, `publish/` (AI publish only), `playbook-ai/`, `analytics/ask/`, `analytics/refresh-queue/`, `app/api/cron/freshness/` |
| Pipeline (generation-only) | `generate.ts`, `finalize-draft.ts`, `draft.ts`, `brief.ts`, `compliance.ts`, `internalLinks.ts`, `audit.ts`, `packageArticle.ts`, `prompt.ts`, `radar.ts`, `radarConfig.ts`, `dedup.ts`, `publishTarget.ts`, `sgFacts.ts`, `brand.ts`, `freshness.ts`, `types.ts` (if unused after), `llm.ts` (only used by ask + generate — delete with ask) |
| Scripts / npm | `scripts/check-generate-route-imports.mjs`, `scripts/check-pipeline-finalize.ts`; remove `check:generate-route-imports`, `check:pipeline-finalize` from `package.json` |
| Docs / config | `docs/PIPELINE.md` (replace with short “manual playbook only” note or delete); `vercel.json` `functions` entry for generate route |
| CI | Steps in `.github/workflows/admin-cms-ci.yml` for generate/finalize checks; replace or delete `.github/workflows/production-health-check.yml` (currently curls `/api/admin/generate`) |

**Media stack**

| Area | Paths |
|---|---|
| App | Entire `apps/media/**` |
| Edge | `supabase/functions/generate-room-clip/**`; remove `[functions.generate-room-clip]` from `supabase/config.toml` |
| Deps | Root `@aws-sdk/client-s3` if no main-app imports remain |

### 3.2 Edit to unlink

| Path | Change |
|---|---|
| `components/admin/AdminShell.tsx` | Remove Article Generation nav item |
| `components/admin/PlaybookForm.tsx` | Remove AI-fill UI + `/api/admin/playbook-ai` calls |
| `components/admin/AnalyticsTab.tsx` | Remove `AnalyticsAskPanel` |
| `components/admin/ArticleAnalyticsDashboard.tsx` | Remove refresh-queue fetch/UI and regenerate deep-links to article-generation |
| `.eslintrc.json` / `scripts/check-admin-catalog-imports.mjs` / `scripts/check-cea-terminology.mjs` | Drop allowlists/paths for deleted modules; keep scanning `cea-terminology` + remaining playbook routes |
| `.env.example` | Document `ANTHROPIC_API_KEY` as **PG listing extract only**; **remove** `HOMEUP_LLM_MODEL` (only used by deleted `llm.ts`; extract hardcodes its model) |

### 3.3 Keep (must still work)

- Public `app/(public)/playbook/**`, listings, agents, intakes
- Manual playbook admin: `PlaybookTab` / form / editor + `/api/admin/playbook*`, revalidate, sync-sheet-videos
- `lib/pipeline/cea-terminology.ts` (playbook + FAQs)
- `lib/pipeline/transactions.ts` + `constants.ts` + transactions admin API/UI
- `lib/listings/import/extract-with-claude.ts` + `run-import.ts`; edge `_shared/extract-with-claude.ts` + `import-listing`
- GA/GSC admin analytics (without Ask), published-articles catalog
- Agent/playbook video display + Supabase storage buckets used by the main site
- `@anthropic-ai/sdk` at root (still required for PG extract)

### 3.4 Verification (PR1)

- `npm run lint` and relevant `check:*` scripts pass
- Admin: no Article Generation nav; Playbook manual create/edit/publish works; no AI fill button
- Analytics: dashboard loads without Ask / freshness queue
- Listings import path still references Claude extract (unit/script or dry-run as available)
- `apps/media` absent; no broken workspace references
- Build succeeds without generate route / media package

---

## 4. PR2 — Ownership handover runbook

Land `docs/HANDOVER.md` on `master`, derived from `origin/claude/homeup-handover-migration-x1uby3` and updated for the slimmed stack.

### 4.1 Document structure

1. **Purpose** — transfer site, DB, domain, accounts; zero downtime; per-asset transfer (not whole orgs)
2. **Asset inventory** — GitHub, Vercel (main site only), Supabase, domain/DNS/Cloudflare, Anthropic (**PG extract**), GA4, GSC, Maps, listings Google Sheet, sync kit  
   - Explicit **Do not transfer / decommissioned:** media app, fal.ai, n8n room-clip, R2 `homeup-media-raw`, article generation, Analytics Ask
3. **Prerequisites** — accounts owners must create first
4. **Secrets inventory** — Vercel env, Supabase edge secrets for `import-listing` / `ga4-analytics`, Batam sync-kit `.env.local`
5. **Owner local environment setup** (required section — see §4.2)
6. **Transfer sequence** — Phase 0 backup → Supabase project transfer → Vercel → DNS/domain → third parties (incl. new Anthropic key for PG extract) → GitHub → rotate & decommission
7. **Final verification checklist** + rollback + entanglements (propmeta, sync-kit redistribution, Vercel team mismatch)

### 4.2 Owner local env setup (required content)

Guide owners to store and apply **new** keys safely:

1. Clone the transferred GitHub repo; use the Node/npm version the repo expects (`package.json` / lockfile).
2. Copy `.env.example` → `.env.local` (never commit `.env.local`).
3. Pull secret values from the shared **password manager** (1Password/Bitwarden) — not email/WhatsApp/git.
4. Map each variable to where it must also exist in production:
   - Main app: Vercel project env (Production + Preview as needed)
   - Edge: Supabase Edge Function secrets (`ANTHROPIC_API_KEY` for `import-listing`, GA secrets for `ga4-analytics`)
   - Batam sync kit: separate `.env.local` redistributed when keys rotate
5. After account transfer, **create new** Anthropic / Cloudflare / Google service-account credentials under the owners’ orgs; paste into password manager first, then into `.env.local` and Vercel/Supabase.
6. Local smoke: `npm install`, `npm run dev`, admin login, open a listing, open a playbook article, confirm Maps if keyed.
7. Remind: rotate `SUPABASE_SERVICE_ROLE_KEY`, `INTAKE_FORM_SECRET`, `CRON_SECRET` (if used), and third-party keys after Joshua’s access is removed; rebuild sync kit the same day.

### 4.3 Ops checkboxes (not code)

- Pause/delete Vercel `homeup-media`; remove `media.homeup.sg` DNS; archive/delete R2 bucket; disable n8n workflows; remove fal key
- Optional later: SQL `DROP` for unused media tables after confirming no consumers

---

## 5. Error handling & risk

| Risk | Mitigation |
|---|---|
| CI red after deleting generate checks | Update/remove workflows in the same PR1 commit |
| Accidental removal of PG Claude extract | Explicit keep list + grep for `extract-with-claude` in PR1 review |
| Broken Playbook manual publish | Do not delete `/api/admin/playbook`; only AI `publish` + generate |
| Orphan imports after pipeline deletes | Delete generation modules in dependency order; run build/lint |
| Runbook drift | PR2 merges only after PR1 is on `master` so inventory matches code |
| Secret leakage during handover | Password manager only; runbook forbids pasting secrets into chat/git |

---

## 6. Testing plan

**PR1:** lint + catalog/CEA checks; admin UI smoke (nav, playbook CRUD); analytics without Ask; build; confirm media package gone.  
**PR2:** doc review only — checklist completeness, env table matches `.env.example`, local setup steps runnable by a non-author.

---

## 7. Implementation order

1. Write implementation plan via writing-plans skill  
2. Execute PR1 on a feature branch → review → merge  
3. Execute PR2 (HANDOVER.md + any `.env.example` polish leftover) → merge  
4. Owners follow runbook for live transfer (separate session)

---

## 8. Non-goals

- Live Supabase/Vercel/DNS transfers in these PRs  
- Dropping media DB tables in PR1  
- Removing PG listing Claude extract or `@anthropic-ai/sdk`  
- Removing public Playbook or existing stored media URLs
