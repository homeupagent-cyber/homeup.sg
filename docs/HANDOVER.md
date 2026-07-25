# HomeUp — Ownership Handover Runbook

**Purpose:** Transfer the HomeUp website, database, domain, and supporting third-party
accounts from Joshua’s personal accounts to the owners’ own accounts — with **no rebuild,
no data migration, and zero downtime**.

**Strategy:** *Targeted per-asset transfer.* Every platform in the stack supports moving a
single project/app/domain into a different account, so we move each asset individually
rather than transferring whole organizations (which would drag along Joshua’s unrelated
assets — see [Entanglements](#8-known-entanglements--gotchas)).

> Owner of this doc: keep it updated as each step completes. Tick the checkboxes as you go.

**Code baseline:** Article Generation, Anthropic admin helpers (Playbook AI fill, Analytics
Ask, freshness), and the media app (`apps/media` / `media.homeup.sg` / fal / n8n / R2) have
been **removed from the repo**. Do not transfer those accounts. Published Playbook articles
and existing videos/images continue to serve from Supabase.

---

## 1. Asset inventory

| Asset | Identifier / location | Currently owned by | Target owner |
|---|---|---|---|
| **Website code** | GitHub `joshluicz/homeup.sg` (Next.js) | Joshua | Owners’ GitHub org |
| **Web hosting** | Vercel project for `homeup.sg` (confirm which team — not necessarily `joshluicz’s projects`) | Joshua | Owners’ Vercel team |
| **Database + backend** | Supabase project `HOMEUP`, ref `ixhikkbytusikgjiuvqa`, region `ap-southeast-1` | Supabase org `HOMEUP` — Joshua | Owners’ new Supabase org |
| **Domain** | `homeup.sg` (registrar TBD — confirm) | Joshua | Owners’ registrar account |
| **DNS** | Cloudflare zone for `homeup.sg` | Joshua’s Cloudflare | Owners’ Cloudflare |
| **LLM (listings only)** | Anthropic API key — PG listing text extract | Joshua | Owners’ Anthropic org |
| **Analytics** | GA4 property `G-FYWLSSTYJ6` + GA service-account JSON | Joshua | Owners |
| **Search Console** | GSC property `sc-domain:homeup.sg` + service account | Joshua | Owners |
| **Maps** | Google Maps API key (JS + Embed) | Joshua | Owners |
| **Listings source of truth** | Google Sheet `1CpaVMBfq6fJRb2ymeeBOfLYYeyfJ2hB8QzdlxdZN0io` | Joshua | Owners |
| **Sync kit** | `homeup-listings-sync-kit.zip` + Batam admin `.env.local` | Joshua | Owners |

### Decommissioned — do not transfer

| Asset | Action |
|---|---|
| Vercel `homeup-media` / `media.homeup.sg` | Pause or delete project; remove DNS |
| Cloudflare R2 `homeup-media-raw` | Archive or delete after confirming unused |
| fal.ai API key | Revoke; not needed |
| n8n room-clip / media workflows | Disable |
| Supabase edge `generate-room-clip` | Already removed from repo; undeploy if still live |
| Article Generation / Anthropic admin Ask / AI fill | Removed from codebase |

### Supabase project detail (`ixhikkbytusikgjiuvqa`)

- **Core tables still in use:** `listings`, `pg_listing_sources`, `pg_agent_profiles`,
  `playbook_videos`, `agent_profile_videos`, `rental_intakes`, `article_metrics`,
  `lead_events`, `url_index_checks`, plus related admin/auth tables as deployed.
- **Edge functions in use:** `import-listing` (JWT; uses `ANTHROPIC_API_KEY` for extract),
  `ga4-analytics` (JWT).
- **Storage buckets used by the main site:** e.g. `listing-images` (and any existing public
  URLs already stored in DB). Keep serving; do not empty buckets during transfer.
- **Legacy media tables** (`media_jobs`, `media_files`, `blueprints`, `media_pipeline_*`) may
  still exist in the DB but are unused by the app. Optional later `DROP` after audit — not
  required for cutover. Do **not** drop `profiles` without a separate auth audit.
- **Migrations:** files in `supabase/migrations/` remain the schema source of truth.

> A **project transfer** (not org transfer) keeps the project ref, database, storage,
> edge functions, **and the anon + service_role keys and URL** — so **no code or env URL
> changes are needed and the site never goes down**.

---

## 2. Prerequisites — what the owners must create first

Nothing below touches the live system; do these in advance.

- [ ] **Supabase account** + a **new organization** on a **paid plan** (the project uses
      paid features; the receiving org must be able to host it). Joshua must be added as a
      member of that org to perform the transfer.
- [ ] **Vercel team** (or account) on a plan matching current usage.
- [ ] **Cloudflare account** (free tier is fine for DNS).
- [ ] **Registrar access** for `homeup.sg` (confirm who the registrar is — SGNIC-accredited
      for `.sg`).
- [ ] **Anthropic** org + billing (for PG listing extract only).
- [ ] **Google Cloud** project (for GA/GSC service accounts + Maps key) and **Google account**
      to own the listings Sheet.
- [ ] **GitHub org/account** to receive the `homeup.sg` repo (and admin rights to accept the transfer).
- [ ] **Password manager** vault shared with owners (1Password / Bitwarden) for all secrets.

---

## 3. Secrets & environment inventory

Every variable the app / functions / scripts read. "Where set" = where the value must exist
after handover. **Do not paste any secret into git, chat, email, or WhatsApp** — move them
via a password manager.

### Web app (Vercel project env vars) + local `.env.local`

| Variable | Purpose | Sensitivity | Handover action |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | public | Unchanged after project transfer (ref stays) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | public | Unchanged |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin DB access | **secret** | Unchanged by transfer; **rotate after handover** |
| `SUPABASE_DB_PASSWORD` | Direct DB password (scripts) | **secret** | **Rotate after handover** |
| `INTAKE_FORM_SECRET` | Signs rent-intake form tokens (≥16 chars) | **secret** | Regenerate; owners set a new value |
| `CRON_SECRET` | Protects any remaining cron routes | **secret** | Regenerate if used |
| `ANTHROPIC_API_KEY` | PG listing text extract only | **secret** | New owner key |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 tag (`G-FYWLSSTYJ6`) | public | New owner property (or transfer) |
| `GA_PROPERTY_ID` | GA4 Data API (admin dashboard) | config | New owner property ID |
| `GA_SERVICE_ACCOUNT_JSON` | GA4 Data API auth | **secret** | New owner service account |
| `GSC_SERVICE_ACCOUNT_JSON` | Search Console API | **secret** | New owner service account |
| `GSC_SITE_URL` | GSC property | config | `sc-domain:homeup.sg` (unchanged) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps JS | public (restrict by referrer) | New owner key |
| `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` | Maps Embed | public | New owner key |
| `NEXT_PUBLIC_CONTACT_WHATSAPP` | Thank-you CTA number | public | Owners’ number |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | public | `https://homeup.sg` (unchanged) |
| `CLOUDFLARE_API_TOKEN` | DNS-AID publish script | **secret** | New owner token |
| `CLOUDFLARE_ZONE_ID` | Cloudflare zone | config | New owner’s zone ID after DNS move |
| `CLOUDFLARE_DOMAIN` | `homeup.sg` | config | Unchanged |

See also root `.env.example` for the canonical list.

### Edge function secrets (Supabase → Edge Functions → Secrets)

| Secret | Used by | Handover action |
|---|---|---|
| `ANTHROPIC_API_KEY` | `import-listing` | New owner key |
| `GA_SERVICE_ACCOUNT_JSON` | `ga4-analytics` | New owner service account |
| `GA_PROPERTY_ID` | `ga4-analytics` | New owner property ID |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | all | Auto-injected by Supabase — no action |

### ⚠️ Not for handover — leave with Joshua

`PROPMETA_DB_*`, `PROPMETA_AUTH_SECRET` — separate `propmeta-console` project. Do not move
with HomeUp. Confirm the handed-over site does not need them in production.

---

## 4. Owner local environment setup

Use this so owners can develop and store **new** API keys safely after (or during) transfer.

1. **Clone** the transferred GitHub repo. Use **Node 20** (matches CI in
   `.github/workflows/admin-cms-ci.yml`).
2. From the repo root: `npm ci --legacy-peer-deps` (or `npm install --legacy-peer-deps`).
3. Copy env template:  
   `copy .env.example .env.local` (Windows) or `cp .env.example .env.local` (macOS/Linux).  
   **Never commit `.env.local`.**
4. Open the shared **password manager** vault. For each secret in the table above, paste the
   value into `.env.local`. Prefer creating **new** keys under the owners’ Anthropic / Google /
   Cloudflare accounts rather than reusing Joshua’s forever.
5. Mirror the same values into production:
   - **Vercel** → Project → Settings → Environment Variables (Production + Preview as needed)
   - **Supabase** → Edge Functions → Secrets (`ANTHROPIC_API_KEY`, `GA_*`)
   - **Batam sync kit** — separate `.env.local` distributed via password manager when keys rotate
     (see `docs/listings-sync-kit-admin-handoff.md`)
6. Local smoke test:
   - `npm run dev`
   - Sign in to `/admin`
   - Open a listing page and a Playbook article
   - Confirm Maps if Maps keys are set
7. After Joshua’s access is revoked, **rotate** `SUPABASE_SERVICE_ROLE_KEY`,
   `INTAKE_FORM_SECRET`, and third-party keys; rebuild/redistribute the sync kit the same day.

---

## 5. Transfer sequence

Do the phases in order. After each phase, run its **Verify** step before moving on. Each
phase has a **Rollback**. Pick a low-traffic window; total hands-on time is ~1–2 hours plus
DNS propagation.

### Phase 0 — Prep & backup (no live change)
- [ ] Confirm all [prerequisites](#2-prerequisites--what-the-owners-must-create-first) are done.
- [ ] **Full DB backup**: Supabase → Database → Backups (on-demand), keep `supabase/migrations/`.
- [ ] Snapshot current **DNS records** (Cloudflare zone export / screenshots).
- [ ] Snapshot current **Vercel env vars** and **Supabase edge secrets** into the password manager.
- [ ] Optionally snapshot storage buckets used by the main site.
- **Rollback:** none needed.

### Phase 1 — Supabase project transfer
- [ ] Add Joshua to the owners’ new Supabase org (Owner/Admin).
- [ ] Supabase → project `HOMEUP` → Settings → General → **Transfer project** → owners’ org.
- [ ] Re-add **edge function secrets** if they do not carry over (`ANTHROPIC_API_KEY`, `GA_*`).
- **Verify:** listings page loads; rent-intake test write; admin login.
- **Rollback:** transfer the project back to Joshua’s org.

### Phase 2 — Vercel project transfer
- [ ] Identify the Vercel team currently hosting `homeup.sg`.
- [ ] Vercel → project → Settings → **Transfer** → owners’ team.
- [ ] Confirm all **env vars** carried over; re-enter any that did not.
- [ ] Reconnect **Git** integration after Phase 5 if the repo also moves.
- **Verify:** redeploy succeeds; `https://homeup.sg` serves the new deployment.
- **Rollback:** transfer the project back.

### Phase 3 — Domain & DNS
- [ ] In the owners’ Cloudflare: **Add site** `homeup.sg`, reconcile against Phase 0 snapshot
      (A/AAAA/CNAME to Vercel, MX, TXT/SPF/DKIM, `sc-domain` verification TXT).
- [ ] At the **registrar**, update nameservers to the owners’ Cloudflare NS.
- [ ] After propagation, verify `homeup.sg` on the transferred Vercel project.
- [ ] **Transfer the domain registration** (SGNIC process — can lag DNS).
- [ ] Update `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN`.
- [ ] Remove `media.homeup.sg` DNS if still present (media app decommissioned).
- **Verify:** `dig homeup.sg`; HTTPS; apex + www; email if any; GSC still verified.
- **Rollback:** revert nameservers to Joshua’s Cloudflare (keep old zone ~1 week).

### Phase 4 — Third-party accounts
- [ ] **Anthropic:** owners create API key; update Vercel + `import-listing` edge secret.
- [ ] **GA4 / GSC / Maps:** new or transferred properties/keys; update env vars.
- [ ] **Google Sheet:** transfer ownership; re-share with Batam admins.
- [ ] **Sync kit:** rebuild if needed (`npm run build:sync-kit`); redistribute fresh `.env.local`
      via password manager when keys rotate.
- [ ] **Decommission media stack:** delete/pause `homeup-media` on Vercel; disable n8n;
      revoke fal; archive R2 bucket.
- **Verify:** one listings sync/import using Claude extract; GA realtime; Maps; GSC.

### Phase 5 — GitHub repo
- [ ] Transfer `joshluicz/homeup.sg` to the owners’ org, **or** add owners as admins.
- [ ] Reconnect Vercel Git integration.
- [ ] Move GitHub Actions secrets / branch protections as needed.
- **Verify:** a test commit triggers a Vercel preview build.

### Phase 6 — Rotate & decommission
- [ ] Rotate every secret Joshua held (service role, intake secret, Anthropic, GA/GSC, Cloudflare).
- [ ] Remove Joshua from Supabase, Vercel, Cloudflare, GA/GSC, Anthropic, Sheet, GitHub —
      **after** owners confirm everything works.
- [ ] Delete stale `.env.local` copies from Joshua’s machines.
- **Verify:** full smoke test below with Joshua’s access already removed.

---

## 6. Final verification checklist

- [ ] `https://homeup.sg` and `https://www.homeup.sg` load over valid HTTPS.
- [ ] Listings page renders; listing detail images load.
- [ ] Rent-intake form submits; row in `rental_intakes`.
- [ ] Admin login works; Site Insights / Article Analytics render (no Ask / Article Generation).
- [ ] Playbook article + video pages load; manual Playbook admin create/edit/publish works.
- [ ] Listings Sync / Claude extract still works with the new Anthropic key.
- [ ] Google Maps embed renders (if configured).
- [ ] GA4 realtime + GSC show data under the owners’ accounts.
- [ ] A git push produces a successful Vercel deployment.
- [ ] `media.homeup.sg` is offline or intentionally removed.

---

## 7. Suggested cutover order (one-line)

**Phase 0 backup → Phase 1 Supabase → verify → Phase 2 Vercel → verify → Phase 3 DNS/domain
→ verify → Phase 4 third-parties → verify → Phase 5 GitHub → Phase 6 rotate + decommission.**

Keep the old DNS zone and Joshua’s access **live but idle** for ~1 week after cutover.

---

## 8. Known entanglements & gotchas

1. **`propmeta-console` shares Joshua’s Supabase org.** Transfer the **HomeUp project only**,
   never the org.
2. **HomeUp code may still reference `PROPMETA_DB_*` in scripts.** Confirm production does not
   need them before revoking access.
3. **Vercel account mismatch.** Confirm which team actually hosts `homeup.sg` before Phase 2.
4. **Sync kit `.env.local` redistribution.** Batam admins hold service-role keys. Rotating keys
   without redistributing breaks listings sync.
5. **`.sg` domain transfer** via SGNIC can take longer than `.com`. Move DNS first for uptime.
6. **GSC verification** rides on a DNS TXT record — do not drop it during DNS reconcile.
7. **Anthropic is listings-only** after the code strip — owners do not need keys for article
   generation or media blueprints.

---

## 9. Rollback summary

| Phase | How to undo |
|---|---|
| Supabase | Transfer project back (keys/ref unchanged) |
| Vercel | Transfer project back; prior deployments retained |
| DNS | Revert nameservers to Joshua’s Cloudflare |
| Domain registration | Registrar grace window if applicable |
| Third-parties | Old keys valid until Phase 6 revoke — don’t revoke early |

---

*Track progress by ticking the checkboxes above. Update the “Currently owned by” column as
each asset moves.*
