# Brief: Agent page fixes, batch 1

**Date:** 21 August 2026
**Repo:** `homeupagent-cyber/homeup.sg`
**Base branch:** `master`
**Reference page:** https://homeup.sg/agents/yeo-tong-boon

## Purpose

Three mechanical fixes to the agent page template. All three are already decided. Do not
substitute your own judgement on scope or wording. If something in this brief does not
match what you find in the code, stop and report rather than improvising.

## Ground rules

- Work on a branch, never commit directly to `master`.
- Branch name: `fix/agent-page-thumbnails-a11y`
- Do not run `npm audit fix --force`.
- Do not run `vercel env pull`. Most variables on this project are marked Sensitive and
  come back as the literal string `[SENSITIVE]`, and it drags in `VERCEL=1`, which breaks
  local asset loading.
- Do not modify `.env.local`, `next.config.mjs`, or anything under `supabase/`.
- These are template-level changes. They must apply to all six agent pages, not only
  `yeo-tong-boon`. If you find yourself hardcoding anything specific to one agent outside
  of that agent's own data record, that is wrong.
- Node 24 is installed. `npm install --legacy-peer-deps` is in the original handover doc
  but has not been needed.
- If the dev server behaves oddly, `npm run dev:clean` deletes `.next` and restarts.

## Stage 0: investigation, report before editing

Locate and report the following before making any change:

1. The component that renders the "Tips from Yeo" video carousel. Search for
   `Tips from`, `SWIPE TO EXPLORE`, and `tiktokcdn`.
2. Where the video list comes from. It may be a local file, a Supabase table, or an API
   route. Note that the videos served in the initial HTML differ from those visible in the
   browser, which suggests the list is fetched client side.
3. The component that renders the social icon row on the agent page. Note that this is a
   different component from the site footer's social links. Both exist. Only the agent
   page one is in scope for this brief.
4. Where agent profile data lives. Search for `R069651E`. If it is a file, give the path.
   If it returns nothing, it is in Supabase and you should say so.
5. The agent page route file, likely `app/agents/[slug]/page.tsx`.

Report these five findings and wait for confirmation before starting Task 1.

---

## Task 1: replace expired TikTok thumbnails

### Problem

Video thumbnails in the tips carousel are hotlinked from TikTok's CDN. Example URL from
the live page:

```
https://p16-common-sign.tiktokcdn-us.com/tos-alisg-p-0037/o4nQEU6uEFASe6HgQRADcvXNcIhFJvpTmBcfBc~tplv-tiktokx-origin.image?dr=9636&x-expires=1782651600&x-signature=5G3GIJ2m14D4Vsr3fRlPeh2WVmE%3D
```

The `x-expires` parameter is a Unix timestamp. Several of these lapsed around 29 June 2026
and at least one lapses within days of this brief. Those tiles currently render as an empty
grey box with a play triangle. This is visible to visitors right now.

TikTok signs these URLs specifically to prevent permanent embedding. There is no parameter
or workaround that makes them stable. The images must be served from our own domain.

### Required change

1. Download the current thumbnail for each video in the carousel.
2. Save them to `public/images/tips/` using the video's existing ID or slug as the
   filename, for example `public/images/tips/symphony-suites-3br.jpg`.
3. Change the data source so each video record points at the local path rather than the
   TikTok CDN URL.
4. Add an error fallback so a missing file renders a dark placeholder or the HomeUP mark,
   not a bare grey box. Next.js `Image` supports `onError` for this.
5. Leave YouTube thumbnails as they are. `img.youtube.com` URLs do not expire and are
   stable to hotlink.

### Note on expired sources

Some TikTok URLs have already expired, so the image can no longer be downloaded from them.
For those, fetch a fresh signed URL from the TikTok video ID, or if that is not possible,
list which videos could not be recovered and stop. Do not substitute a placeholder image
silently and do not remove the video from the carousel.

### Optional, only if straightforward

If the video list is stored in a file rather than the database, consider adding a small
script under `scripts/` that refreshes thumbnails for a given list of video IDs, following
the same pattern as the existing PropertyGuru sync scripts. Do not build this if it
requires new dependencies.

### Acceptance criteria

- No `tiktokcdn` URL remains anywhere in the repo.
- Every tile in the carousel shows an image on `localhost:3001/agents/yeo-tong-boon`.
- Deleting one file from `public/images/tips/` produces the fallback, not a broken image.
- The same holds on at least one other agent page.

---

## Task 2: hide the duplicated carousel sets from crawlers

### Problem

The carousel renders its full set of items three times in the HTML. This is the standard
technique for a seamless marquee loop. The consequence is that the server HTML contains 42
items where there are 14, so every video title appears three times. To a crawler this reads
as thin, repetitive content and it dilutes the actual profile copy on the page.

### Required change

Add `aria-hidden="true"` to the second and third rendered sets. The first set stays as is.

This is a semantic change only. Nothing moves, nothing changes visually, the loop still
works. `aria-hidden` tells screen readers and crawlers that an element is decorative.

If the duplicates are produced by a loop rather than written out three times, apply the
attribute conditionally on index, for example `aria-hidden={setIndex > 0}`.

Also add `tabIndex={-1}` to any focusable element inside the hidden sets. An element that
is `aria-hidden` but still keyboard-focusable is an accessibility violation, because a
keyboard user tabs into something a screen reader refuses to announce.

### Acceptance criteria

- The carousel looks and animates exactly as before.
- View source on the agent page shows exactly one set of video titles not marked
  `aria-hidden`.
- Tabbing through the page does not land on any control inside a hidden set.

---

## Task 3: label the social icons and clean the URLs

### Problem A: no accessible labels

In the rendered HTML the anchor text of each social icon is the raw URL. This means the
link has no `aria-label` and the icon has no alt text. A screen reader announces the entire
URL character by character. Search engines get no signal about the destination.

### Problem B: tracking parameters in the URLs

The links carry app-generated share parameters. These are session noise. They also prevent
a machine matching the profile to its canonical address, which matters because these same
URLs will later go into the page's structured data `sameAs` field.

Current and corrected:

| Platform | Current | Corrected |
|---|---|---|
| Instagram | `.../homeup_tongboon?igsh=azdldjc4NWNoZmUy` | `https://www.instagram.com/homeup_tongboon` |
| TikTok | `.../@homeup_tongboon?_r=1&_t=ZS-97B4uCSU72i` | `https://www.tiktok.com/@homeup_tongboon` |
| YouTube | `.../@homeup_tongboon?si=CVzemx3d-Qco95Vm` | `https://youtube.com/@homeup_tongboon` |
| Facebook | `https://www.facebook.com/share/1DAfh57HRg/?mibextid=wwXIfr` | See below |

**Facebook needs a decision.** The `/share/` format is a redirect, not a real profile
address. Do not guess the destination and do not resolve it by following the redirect.
Leave the Facebook URL untouched, apply only the `aria-label` to it, and flag it in your
report so the correct address can be supplied.

### Required change

1. Add an `aria-label` to every social link on the agent page, in the form
   `Tong Boon on Instagram`. The agent's name must come from the agent data record, not be
   hardcoded, since this template serves all six agents.
2. Replace the three URLs above with their cleaned versions in the agent data source.
3. Apply the same cleaning to the other five agents' social URLs if they carry the same
   tracking parameters. Report which ones you changed.
4. Add `rel="noopener noreferrer"` to any social link opening in a new tab, if not already
   present.

Do not touch the footer social links. Those are a separate component with known issues
being handled separately.

### Acceptance criteria

- Every social icon has a descriptive `aria-label` naming both the agent and the platform.
- No `igsh=`, `_r=`, `_t=`, `si=` or `mibextid=` parameter remains in any agent social URL.
- Every corrected link opens the right profile when clicked on localhost.
- The Facebook link is unchanged and flagged in the report.

---

## Out of scope

Do not attempt any of the following in this branch, even if you notice them:

- Rewriting the profile paragraph, page title or meta description
- Adding JSON-LD structured data
- Adding an FAQ block or video transcript
- The stale "Last updated: June 2026" footer date
- The `@homeupdennis` YouTube link in the footer
- The floating WhatsApp button overlapping the carousel arrow

These are tracked separately.

---

## Delivery

```
git checkout master
git pull
git checkout -b fix/agent-page-thumbnails-a11y
```

Commit in three separate commits, one per task, with plain messages such as
`Serve tips carousel thumbnails locally`.

```
git push -u origin HEAD
gh pr create --base master --title "Agent page: fix expired thumbnails and add a11y labels" --body "..."
```

Do not merge. The PR body should list, for each of the three tasks, what changed and which
acceptance criteria you verified. Flag anything you could not complete, particularly any
video whose thumbnail could not be recovered.
