# Creators Kootam

A WhatsApp community for Kerala's content creators and video editors, by Gowtham Das Thekkinkattil ([@thegowthamdas](https://instagram.com/thegowthamdas)). Spec: [`docs/BUILD_BRIEF.md`](docs/BUILD_BRIEF.md). Plan: [`docs/superpowers/plans/2026-10-13-creators-kootam.md`](docs/superpowers/plans/2026-10-13-creators-kootam.md).

## Stack

Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, RLS) · Vercel · Tailwind 4 · zod · motion · GSAP · Lenis · Vitest + PGlite · Playwright.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server |
| `pnpm check` | Lint, typecheck, unit + database tests, banned-style scan |
| `pnpm test:e2e` | Playwright against a production build (no Supabase needed) |
| `pnpm check:leaks` | Builds with sentinel secrets and proves no WhatsApp link or key reaches the browser |
| `pnpm test:deployed` | Playwright against the live site (`BASE_URL=…`, signed-in session in `.auth/`) |
| `pnpm check:launch` | Lists every launch blocker still open (unconfirmed Malayalam, draft articles, placeholders) |

## How joining works (and why the site can't add people itself)

WhatsApp's official API has no way to add someone to a group, and its groups cap at 8 members. Driving a personal account with an unofficial library would risk getting Gowtham's own number banned. So the site does what is possible:

1. The visitor signs in with Google, picks a lane (creator, editor, something else) and fills a short form.
2. The server writes their member row.
3. Only then does `POST /api/invite` return two links, read from server-only env: the Community, then their lane's group.

The lane always comes from the database row, never from the request. The links never appear in the page source, the JS bundle, or any `NEXT_PUBLIC_*` variable. `pnpm check:leaks` enforces this.

A WhatsApp **Community** holds 1 announcements group + up to 100 linked groups, and **2,000 members in total**. Plan for a second community before that ceiling.

## Setup

1. `pnpm install`, then copy `.env.example` to `.env.local`.
2. **Supabase:** create a project (region `ap-south-1`, Mumbai). `pnpm dlx supabase login`, `pnpm dlx supabase link --project-ref <ref>`, `pnpm dlx supabase db push` applies `supabase/migrations/*`.
3. **Google sign-in:** in Google Cloud, create an OAuth client (Web) with redirect URI `https://<ref>.supabase.co/auth/v1/callback`; paste its id/secret into Supabase → Authentication → Providers → Google. In Supabase → Authentication → URL configuration, set the Site URL to production and allow `<prod>/auth/callback` and `http://localhost:3000/auth/callback`.
4. **WhatsApp:** Gowtham creates the Community "Creators Kootam" and the linked groups "Frame Kootam" and "Cut Kootam" (groups, not Channels: Channels are one-way), and sends the three invite links. They go in `WA_COMMUNITY_URL`, `WA_CREATORS_URL`, `WA_EDITORS_URL`: server env only.
5. **Vercel:** `pnpm dlx vercel login`, `pnpm dlx vercel link`, add every `.env.example` key to Production and Preview, `pnpm dlx vercel deploy --prod`.

## Deployment status

Not yet deployed: waiting on the Vercel login (see Setup step 5).
