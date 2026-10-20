# Creators Kootam

A WhatsApp community for Kerala's content creators and video editors, by Gowtham Das Thekkinkattil ([@thegowthamdas](https://instagram.com/thegowthamdas)).

- **Spec:** [`docs/BUILD_BRIEF.md`](docs/BUILD_BRIEF.md)
- **Plan:** [`docs/superpowers/plans/2026-10-13-creators-kootam.md`](docs/superpowers/plans/2026-10-13-creators-kootam.md), which includes the 13 approved departures from the brief.

**Redesign (branch `redesign/creative-v2`, 2026-10-20): "The Wall."** The public pages (`/`, `/creators`, `/code`, `/privacy`) are a Kerala wall: neelam lime-wash, കൂട്ടം hand-painted across it, the three rooms pasted on as film posters. Joining (`/join`, `/me`, `/admin`) stays the dark editing bay: you walk off the street into the edit suite. Reasoning, tokens and what was cut: [`docs/design/2026-10-20-the-wall.md`](docs/design/2026-10-20-the-wall.md). The page structure follows creator-platform sites (how to join, inside, member pass, brands, members, Code, FAQ, a ready-to-join dock). New: `/creators` (members directory) and brand briefs (form → `brand_briefs` → `/admin`). No invented numbers: the only live figure is the member count. **Before merging to `main`, apply migrations `0004_brand_briefs.sql` and `0005_member_profiles.sql` to production** (`pnpm dlx supabase db push`). Until then the brief form falls back to "email us", `/admin` says briefs are unavailable, the directory falls back to the plain wall (no craft/district filters) and member pages say they didn't load; nothing else breaks.

**Member pages (2026-10-20), after linkflueverse.in's "creator kit":** every member on the wall has a page at `/m/<handle>` with their pass as a poster, an Instagram button and a "Work with …" brief form addressed to them (it goes to the team, who pass it on: members' emails are never public). District, crafts, what they do and portfolio show only if the member turned on **profile_public** — a new consent, off by default for everyone who joined before it; new joiners get a ticked "Give me a public profile page" box, and `/me` has a switch. `/creators` filters by room, craft and district (craft and district only from public profiles). `/dev/profile` (and `?view=private`) previews a page with sample data.

**Motion (2026-10-20, on request):** React Bits components are back, vendored in `src/components/bits/` (see "Motion" below), with Lenis smooth scrolling site-wide.

**Live:** https://creators-kootam.vercel.app (Vercel project `creators-kootam`, functions in `bom1`). Supabase project `creators-kootam` (ref `jbldqvkthpbzjmfyyegm`, Mumbai) and Google sign-in are connected; the WhatsApp hand-off switches on once the invite links are in Vercel env (see Setup).

## Stack

Next.js 16.4 (App Router, Cache Components) · React 19 · TypeScript strict · Supabase (Postgres, Auth, RLS) · Vercel · Tailwind 4 · zod · motion (join flow only) · Vitest + PGlite · Playwright · axe-core.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Local dev server. `/dev/specimen` and `/dev/join?step=lane\|details\|reveal` preview every primitive and join step without Supabase; both are 404 in production |
| `pnpm check` | Lint, typecheck, unit and database tests (PGlite runs the real migrations and RLS), banned-style scan |
| `pnpm test:e2e` | Playwright against a production build with no Supabase: routes, scroll film, keyboard, reduced motion, axe, reflow, touch targets, SEO |
| `pnpm check:leaks` | Builds with sentinel secrets and proves no WhatsApp link, service key or admin email reaches the browser bundle or the prerendered HTML/RSC |
| `pnpm test:deployed` | Playwright against the live site (`BASE_URL=…`, needs `.auth/creator.json`; see the file header) |
| `pnpm check:launch` | Lists every launch blocker still open, and exits 1 until there are none |
| `pnpm render:ml` | Re-renders the fixed Malayalam strings to PNGs. Run it after editing `src/i18n/ml.ts`; a test fails until you do. `pnpm render:ml --wall` re-renders only the billboard-size wall-writing (`public/brand/ml/wordmark-wall.png`). On a machine without Playwright's browser, set `CHROMIUM_PATH=/usr/bin/chromium` |

## How joining works (and why the site can't add people itself)

WhatsApp's official API has no way to add someone to a group, and its groups cap at 8 members. Driving a personal account with an unofficial library would risk getting Gowtham's own number banned. So the site does what is possible, and makes the hand-off feel deliberate:

1. The visitor signs in with Google, picks a lane (creator, editor, something else) and fills a 30-second form.
2. A server action validates the form and writes their member row. The browser can never write member rows itself (RLS).
3. Only then does `POST /api/invite` return two links, read from server-only env: the Community, then their lane's group.
4. Chip 02 stays locked until chip 01 is opened, so everyone lands in the announcements group first.

**Security rules:**
- The lane always comes from the database row, never from the request.
- The links never appear in page source, the JS bundle, or any `NEXT_PUBLIC_*` variable. `pnpm check:leaks` enforces this.
- `/admin` is a real 404 for anyone who isn't on `ADMIN_EMAILS` with a confirmed Google identity.
- Admins never see the join flow: the proxy sends an admin who lands on `/join` (where Google sign-in returns everyone) to `/admin`.
- The admin panel lists **everyone who signed in** — email, Google name, what they are (lane, "something else: …", or not joined yet; admins tagged), handle, city, tags, last sign-in, joined, status — with search by name, email or handle, a "Not joined yet" view, flag/remove/restore, and a CSV export of the same rows. `/dev/admin` previews it with sample people (404 in production).

**Limits:**
- A WhatsApp **Community** holds 1 announcements group plus up to 100 linked groups, and **2,000 members in total**. Plan a second community before that.
- Use groups, not Channels: Channels are one-way broadcast, and nobody can reply.

**Instagram's in-app browser blocks Google sign-in.** Most visitors will tap the link in his bio, and Instagram opens it in its own browser. `/join` detects Instagram, Threads, Facebook, TikTok, Snapchat and bare WebViews:
- On Android it offers an "Open in Chrome" button (an `intent://` link).
- On iPhone it shows the ••• → "Open in external browser" instruction, with a copy-link fallback.

## Brand briefs

The "For brands" section on `/` is a public form (no sign-in). A server action validates it with zod and inserts with the service role; `brand_briefs` has RLS on and no grants for `anon`/`authenticated`, so the public key can never read brand contacts. Two cheap bot guards answer bots with a fake success: a hidden honeypot field, and a client-side timestamp (a form finished in under 3s wasn't typed by a person). If the database is unreachable, the form says so and offers the contact email instead. Briefs appear at the bottom of `/admin` with a reply-by-email link; `/dev/admin` previews them.

## Setup

1. Run `pnpm install`, then fill `.env.local`: `pnpm dlx vercel link`, then `pnpm dlx vercel env pull .env.local`.
   - **Signing in locally:** run `pnpm dev` on port **3000**. `http://localhost:3000/**` is the only local origin on Supabase's redirect list; any other port sends you back to production after Google.
   - With only the two `NEXT_PUBLIC_SUPABASE_*` values, Google sign-in works but finishing the join form doesn't: that needs `SUPABASE_SERVICE_ROLE_KEY` and the `WA_*` links too.
   - With no Supabase values at all (a fresh clone, or a Vercel preview without env), `/join` says sign-in isn't set up on this copy and links to the live site, instead of a button that can only fail. Likewise, without the server env, the pass page says the WhatsApp links aren't set up on this copy (instead of "check your connection").
2. **Supabase:**
   - Create a project in region `ap-south-1` (Mumbai).
   - Run `pnpm dlx supabase login`, then `pnpm dlx supabase link --project-ref <ref>`, then `pnpm dlx supabase db push`. The last command applies `supabase/migrations/*` — including `0004_brand_briefs.sql`, which the brand-brief form needs.
3. **Google sign-in:**
   - In Google Cloud, create an OAuth client (Web) with redirect URI `https://<ref>.supabase.co/auth/v1/callback`. Paste its id and secret into Supabase → Authentication → Providers → Google.
   - In Supabase → Authentication → URL configuration, set the Site URL to production. Allow `<prod>/auth/callback**`, `http://localhost:3000/**` and your Vercel preview pattern.
   - **Disable the Email and Anonymous providers.** Google is the only way in, and the admin check trusts the Google-verified email.
4. **WhatsApp:**
   - Gowtham created the Community "Creators Kootam" and the linked groups "Creators kootam(Content creators)" and "Creators kootam(Editors)". The site names the rooms CONTENT CREATORS and EDITORS to match (`brand.rooms`).
   - Put the three invite links in `WA_COMMUNITY_URL`, `WA_CREATORS_URL` and `WA_EDITORS_URL`. These are server env only, never `NEXT_PUBLIC_`.
   - `WA_OTHER_URL` stays empty until there is an "other" room; until then those members get the mint "we're building your room" note.
5. **Vercel:**
   - Run `pnpm dlx vercel login`, then `pnpm dlx vercel link`.
   - Add every `.env.example` key to Production and Preview.
   - The project is connected to GitHub (`Kirankumars73/Creators`): **every push to `main` builds and deploys production** on its own. Pushes to other branches get preview deployments; Preview has no Supabase or WhatsApp env yet, so sign-in and joining are off there.
   - A manual deploy still works: `pnpm dlx vercel deploy --prod`.
   - Functions run in `bom1` (Mumbai), next to Supabase in `ap-south-1`; `vercel.json` pins this. Left on the default US region, every sign-in round trip would cross the world several times.
6. **Verify on the live URL:** sign in as a test creator account (wall opt-out ticked), save `.auth/creator.json` (see `tests/deployed/invite.spec.ts`), and run `BASE_URL=<url> pnpm test:deployed`. Delete test accounts from production before launch.

**Domain.** RDAP lookups on 2026-10-13 22:31 UTC found no registration for `creatorskootam.com` or `creatorskootam.in`; both appear available. Confirm with a registrar before announcing.

## [ASK GOUTHAM] — launch checklist

`pnpm check:launch` prints the live version of this list. As of the last commit:

| Item | Where |
|---|---|
| The Code articles 04–07 are drafts written in his voice; he approves or rewrites them. 01–03 are his, verbatim | `src/config/code.ts` |
| Read and agree with `/privacy`, which speaks for him | `src/config/brand.ts` (`privacyReviewed`) |
| Read the redesigned landing copy: "free to join", the FAQ answers, and how brand briefs are handled | `src/config/landing.ts`, then `src/config/brand.ts` (`landingReviewed`) |

## Notes for whoever maintains this

- **Malayalam and `next/og`.** Satori, which powers `next/og`, can't shape Malayalam: conjuncts break and vowel signs land on the wrong side. Every fixed Malayalam string is rendered once by Chromium (`pnpm render:ml`) into a PNG.
  - OG images, the member pass and the icons use those images.
  - On the web, the wordmark and the slate draw them as CSS masks, so `/` and `/code` never download the 200 KB Malayalam font.
  - Real Malayalam text (the join confirmation) uses Anek Malayalam directly.
  - Members with Indic-script names get their `@handle` as the pass headline.
- **Performance** (Lighthouse mobile, local production build, simulated 4G):

  | Page | Perf | A11y | BP | SEO | LCP | CLS |
  |---|---|---|---|---|---|---|
  | `/` | 96 | 100 | 100 | 100 | 2.3s | 0 |
  | `/code` | 98 | 100 | 100 | 100 | 2.0s | 0 |
  | `/join` | 98 | 100 | 100 | 100 | 2.1s | 0 |

  **Live** (`creators-kootam.vercel.app`, Lighthouse 13.5, same settings, 2026-10-14):

  | Page | Perf | A11y | BP | SEO | LCP | CLS |
  |---|---|---|---|---|---|---|
  | `/` | 93 (median of 3 runs, 92–97; was 90 with the cold open) | 100 | 100 | 100 | 1.4–2.7s | 0 |
  | `/code` | 97 | 100 | 100 | 100 | 2.2s | 0 |
  | `/join` | 95 | 100 | 100 | 100 | 2.2s | 0 |

  Lighthouse's simulated LCP on `/` is pessimistic: a real Chromium run on the live site with 4× CPU and 150 ms / 1.6 Mbps throttling paints the LCP element (the TAKE YOUR PLACE button) at 0.94s, with or without the cold open. Removing the cold open (2026-10-14) took Speed Index from 4.5s to about 3.2s.

  Reports are in `docs/launch/` (`lighthouse-live-*` for the live site). To keep this:
  - No WebGL, GSAP or Lenis on the public pages (removed with the wall redesign).
  - The hero has no intro and no wipe: the headline and the button paint at first paint.
  - Join steps and supabase-js load on demand.
  - Archivo is the static 700 face. The brief's "width 112" variable costs 74 KB and pushed LCP to 2.6s; to restore it, put `axes: ['wdth']` back in `src/app/fonts.ts`.
- **Motion** (2026-10-20). The wall's one orchestrated moment stays (the wall-writing brushes in, the posters slap on). On top, at the owner's request, React Bits components, vendored as published in `src/components/bits/` (type-checking is off inside those files only, and the React Compiler lint advisories are relaxed for that folder; local patches are marked `Local:`):
  - **Landing:** RotatingText ("Find your editor/DOP/…"), ScrollVelocity (the craft strips), BlurText (the manifesto), CountUp (member count), Magnet (the join button), GlareHover (poster photos), TiltedCard (the sample pass).
  - **Join and /me:** TiltedCard (the live pass preview while you fill the form, and your real pass image on /me), ElectricBorder (your room's WhatsApp link once it unlocks), a numbered stepper, and steps that blur into each other.
  - **Everywhere:** ClickSpark (mustard sparks on tap) and **Lenis** smooth scrolling (`src/components/motion/SmoothScroll.tsx`): same-page anchors glide below the fixed nav (Lenis reads `scroll-padding-top`), it pauses while the phone menu locks scrolling, and it's off under reduced motion.
  - Reduced motion: every component above holds still (RotatingText and ScrollVelocity don't check it themselves, so `HeroFind` and `CraftTicker` render them static).
- **Theming.** `[data-surface="wall"]` remaps the token names light (`chalk` = foreground, `carbon` = raised panel), so shared components restyle themselves; `[data-surface="night"]` restores the dark values inside a wall page (the brands band, the footer, a poster's photo frame). A test keeps the night block equal to `:root`.
- **Performance** (2026-10-20, local production build; Lighthouse not re-run): a real Chromium run with 4× CPU and 150 ms / 1.6 Mbps throttling paints LCP at ~0.95s on `/` (3 runs, 0.932–0.964s; 0.89s before the React Bits components, the original 0.94s) and ~0.85s on `/join`, CLS 0 on both.
- **Skills.** `anthropic-skills:theme-factory` was not used: §4 of the brief fully specifies the tokens. The wall redesign followed Anthropic's open-source `frontend-design` skill (plan, review against generic defaults, build, critique from screenshots).

## Launch verification (§14 Definition of Done)

| Check | Status |
|---|---|
| `pnpm build` clean, 0 TS errors, 0 ESLint errors | ✅ |
| All §8 tests pass, incl. the bundle grep (`pnpm check`, `pnpm check:leaks`) | ✅ locally |
| Deployed, live URL, Google sign-in works on the deployed domain | ✅ full round trip with a real Google account, then a completed join |
| A creator never receives the editors link, verified in the network response | ✅ unit + handler tests; ✅ `pnpm test:deployed` on the live URL (5/6; the non-admin `/admin` check needs a non-admin test account) |
| Lighthouse mobile ≥ 90 perf / ≥ 95 a11y | ✅ local production build; ✅ live URL — `/` 93 (median), `/code` 97, `/join` 95, a11y 100 (`docs/launch/`) |
| Full flow on a real mid-range Android, including from the Instagram app | ⏳ |
| `prefers-reduced-motion` walkthrough | ✅ screenshots of every section and join step; e2e asserts no running animations |
| Keyboard-only walkthrough | ✅ e2e: scrubber first, visible focus everywhere, radiogroup arrows, combobox, focus moves to errors |
| Zero banned hexes, zero Styrene/Tiempos, zero user-facing "Claude" | ✅ `pnpm check:bans` |
| `.env.example` complete, no secrets committed | ✅ |
| README lists every [ASK GOUTHAM] item | ✅ (above, and `pnpm check:launch`) |
