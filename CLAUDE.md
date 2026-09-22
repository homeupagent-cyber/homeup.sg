# Working rules for this repo

HomeUP's public website, `homeup.sg`. Next.js 14 App Router, React 18, TypeScript, Tailwind, Supabase, shadcn/Radix, hosted on Vercel (team HomeUP, project homeup-sg). The owner has no coding background, so explain what you changed in plain English and name the file and the reason.

## Git

- Default branch is **`master`**, not `main`. Pushes to `master` deploy to production.
- Never commit directly to `master`. Work on a short-named branch, then open a PR against `master`.
- Let the owner check the Vercel preview before merging. Merge with squash.
- Commit messages a non-coder can read, for example "Add password gate to new launch page".

## Secrets

- Never commit `.env.local` or any real key, password, access code or token.
- New environment variables go into `.env.example` with placeholder values only. Tell the owner to add the real value in the Vercel dashboard and in his local `.env.local` by hand.
- Do not run `vercel env pull` for this project. Most variables are marked Sensitive, so they come back as the literal text `[SENSITIVE]`, and it also pulls Vercel system variables that break local asset loading.

## Supabase

- The website uses the **HOMEUP** project, ref `ixhikkbytusikgjiuvqa`, Singapore region, only.
- There is a separate `propmeta-console` Supabase project belonging to a teammate's Buy Dashboard. Keep the two systems separate.
- Do not disable JWT-based API keys in Supabase. Production may still rely on a legacy key.

## Dependencies and build

- Node 24 is installed locally. The original handover specifies Node 20 and `npm install --legacy-peer-deps`. Install currently works without the flag.
- **Never run `npm audit fix --force`.** The reported vulnerabilities are in build tooling and the force upgrade breaks the build.
- Do not add a new dependency without asking first.
- `npm run dev:clean` deletes `.next` and restarts. Use it when the site behaves oddly for no clear reason.
- Run the build and clear type errors before opening a PR.

## Care needed

- `middleware.ts` runs on every request and already handles auth and redirects. Read it fully before touching it, add rather than replace, and never change an existing matcher without saying why.
- There is a caching and CDN history worth knowing: Cloudflare sits in front of Vercel, which caused a stale-chunk outage. See `docs/` for the postmortem before changing anything about caching, headers or asset paths.
- `homeup.sg` is the live domain. `homeup.com.sg` does not resolve.

## House style for anything user-facing

- Plain English, no property or tech jargon. The readers are HDB owners buying their first private property.
- No em-dashes.
- Every property figure shown to a client carries its source and its as-at date.
- Never invent a number to fill a gap in a layout. Render a bracketed placeholder instead.
- Client-facing pages carry "not financial advice" and HomeUP's CEA licence line.
