# HomeUp Handover Strip + Runbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove article generation, Anthropic admin helpers, and the media app from the codebase; land an ownership handover runbook with owner local env setup — without stripping PG listing Claude extract.

**Architecture:** Two commits/PR stages on branch `handover/strip-and-runbook`. Stage A deletes discarded surfaces and unlinks callers. Stage B adds `docs/HANDOVER.md` matched to the slimmed stack. Supabase media tables stay; ops teardown is checklist-only.

**Tech Stack:** Next.js App Router, Supabase, Vercel, GitHub Actions, Anthropic (PG extract only).

## Global Constraints

- Keep `lib/listings/import/extract-with-claude.ts`, edge `_shared/extract-with-claude.ts`, `@anthropic-ai/sdk`
- Keep public Playbook + manual `/api/admin/playbook*` CMS
- Keep existing video/file serving from Supabase storage
- Do not DROP media DB tables in this work
- Never commit secrets; `.env.local` stays local
- Node 20 for CI (`admin-cms-ci.yml`)

## File map

| Action | Paths |
|---|---|
| Delete | Article generation page/tab; generate/topics/publish/playbook-ai/ask/refresh-queue/freshness APIs; generation-only `lib/pipeline/*`; `apps/media/**`; `generate-room-clip`; generate CI scripts; `AnalyticsAskPanel` |
| Modify | `AdminShell`, `PlaybookForm`, `AnalyticsTab`, `ArticleAnalyticsDashboard`, CI workflows, `package.json`, `.env.example`, `vercel.json`, `supabase/config.toml`, check scripts |
| Keep | `cea-terminology.ts`, `transactions.ts`, `constants.ts`, playbook public/admin, listings import |
| Create | `docs/HANDOVER.md` (PR2), this plan |

---

### Task 1: Unlink admin UI from discarded features

**Files:**
- Modify: `components/admin/AdminShell.tsx`
- Modify: `components/admin/PlaybookForm.tsx`
- Modify: `components/admin/AnalyticsTab.tsx`
- Modify: `components/admin/ArticleAnalyticsDashboard.tsx`
- Delete: `components/admin/AnalyticsAskPanel.tsx`

- [ ] **Step 1:** Remove `{ href: "/admin/article-generation", label: "Article Generation" }` from `NAV_ITEMS` in `AdminShell.tsx`
- [ ] **Step 2:** In `PlaybookForm.tsx`, remove AI-fill handler/button and any fetch to `/api/admin/playbook-ai`
- [ ] **Step 3:** In `AnalyticsTab.tsx`, remove `AnalyticsAskPanel` import and render
- [ ] **Step 4:** In `ArticleAnalyticsDashboard.tsx`, remove refresh-queue fetches, freshness UI block, and links to `/admin/article-generation`
- [ ] **Step 5:** Delete `components/admin/AnalyticsAskPanel.tsx`
- [ ] **Step 6:** Commit `chore: unlink admin UI from article generation and AI helpers`

---

### Task 2: Delete discarded API routes and article-generation page

**Files:**
- Delete: `app/(admin)/admin/(dashboard)/article-generation/page.tsx`
- Delete: `components/admin/ArticleGenerationTab.tsx`
- Delete: `app/api/admin/generate/route.ts` (+ dir)
- Delete: `app/api/admin/topics/route.ts` (+ dir)
- Delete: `app/api/admin/publish/route.ts` (+ dir)
- Delete: `app/api/admin/playbook-ai/route.ts` (+ dir)
- Delete: `app/api/admin/analytics/ask/route.ts` (+ dir)
- Delete: `app/api/admin/analytics/refresh-queue/route.ts` (+ dir)
- Delete: `app/api/cron/freshness/route.ts` (+ dir)

- [ ] **Step 1:** Delete all paths listed above
- [ ] **Step 2:** Confirm `/api/admin/playbook` still exists
- [ ] **Step 3:** Commit `chore: remove article generation and Anthropic admin API routes`

---

### Task 3: Delete generation-only pipeline modules

**Files:**
- Keep: `lib/pipeline/cea-terminology.ts`, `lib/pipeline/transactions.ts`, `lib/pipeline/constants.ts`
- Delete (all under `lib/pipeline/`): `generate.ts`, `finalize-draft.ts`, `draft.ts`, `brief.ts`, `compliance.ts`, `internalLinks.ts`, `audit.ts`, `packageArticle.ts`, `prompt.ts`, `radar.ts`, `radarConfig.ts`, `dedup.ts`, `publishTarget.ts`, `sgFacts.ts`, `brand.ts`, `freshness.ts`, `types.ts`, `llm.ts`

- [ ] **Step 1:** Grep for imports of each file to delete; fix any unexpected keepers before deleting
- [ ] **Step 2:** Delete generation-only modules listed
- [ ] **Step 3:** `rg "lib/pipeline/(generate|llm|freshness|types)"` should only hit docs/history or nothing in app code
- [ ] **Step 4:** Commit `chore: remove article generation pipeline modules`

---

### Task 4: Remove media app and room-clip edge function

**Files:**
- Delete: `apps/media/**`
- Delete: `supabase/functions/generate-room-clip/**`
- Modify: `supabase/config.toml` — remove `[functions.generate-room-clip]` block
- Modify: `package.json` — remove `@aws-sdk/client-s3` if unused by main app

- [ ] **Step 1:** Delete `apps/media` tree and `generate-room-clip` function
- [ ] **Step 2:** Clear `supabase/config.toml` function block (file may become empty comment-only — leave a short comment that no function JWT overrides remain, or delete file if empty)
- [ ] **Step 3:** Grep root for `@aws-sdk/client-s3`; remove from `package.json` if only media used it; run `npm install` to refresh lockfile if removed
- [ ] **Step 4:** Commit `chore: remove media app and generate-room-clip`

---

### Task 5: Fix CI, package scripts, env example, vercel config

**Files:**
- Modify: `.github/workflows/admin-cms-ci.yml` — remove generate-route-imports and pipeline-finalize steps
- Delete or replace: `.github/workflows/production-health-check.yml` — delete (it only health-checks generate)
- Delete: `scripts/check-generate-route-imports.mjs`, `scripts/check-pipeline-finalize.ts`
- Modify: `package.json` — remove those two scripts
- Modify: `scripts/check-admin-catalog-imports.mjs`, `scripts/check-cea-terminology.mjs`, `.eslintrc.json` — drop deleted path allowlists
- Modify: `.env.example` — Anthropic for PG extract only; remove `HOMEUP_LLM_MODEL`
- Modify: `vercel.json` — remove generate `maxDuration` (delete file if empty `{}`)
- Delete or replace: `docs/PIPELINE.md`

- [ ] **Step 1:** Apply CI/script/env/vercel/docs edits
- [ ] **Step 2:** Run `npm run check:admin-catalog-imports` and `npm run check:cea-terminology` — expect PASS
- [ ] **Step 3:** Run `npm run build` — expect SUCCESS
- [ ] **Step 4:** Commit `chore: drop generate CI and retarget env docs for handover`

---

### Task 6: Land ownership handover runbook

**Files:**
- Create: `docs/HANDOVER.md` (from slimmed `origin/claude/homeup-handover-migration-x1uby3` content + owner local env section)

- [ ] **Step 1:** Write `docs/HANDOVER.md` with inventory excluding media/article-gen; mark those decommissioned
- [ ] **Step 2:** Include **Owner local environment setup** (clone, `.env.example` → `.env.local`, password manager, Vercel/Supabase/sync-kit mapping, smoke tests, rotate keys)
- [ ] **Step 3:** Align secrets table with post-strip `.env.example` (Anthropic = PG extract only; no FAL/R2/media)
- [ ] **Step 4:** Commit `docs: add HomeUp ownership handover runbook`

---

### Task 7: Final verification

- [ ] **Step 1:** `rg "article-generation|/api/admin/generate|playbook-ai|AnalyticsAsk|apps/media|generate-room-clip|FAL_API_KEY" --glob '!docs/**' --glob '!.git/**'` — expect no app/runtime hits (docs/HANDOVER may mention decommissioned names)
- [ ] **Step 2:** Confirm `extract-with-claude` still present in `lib/listings/import/` and `supabase/functions/_shared/`
- [ ] **Step 3:** `npm run build` PASS
- [ ] **Step 4:** Report ready for PR / merge options

---

## Spec coverage checklist

| Spec item | Task |
|---|---|
| Remove article generation | 1–3, 5 |
| Remove Anthropic admin helpers | 1–3 |
| Keep PG Claude extract | 3 keep list, 7 |
| Remove media app / room-clip | 4 |
| Keep playbook manual CMS | 2 (do not delete playbook API) |
| HANDOVER.md + local env | 6 |
| CI / env example | 5 |
| Two-stage delivery | Tasks 1–5 then 6 |
