# Creators Kootam Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Creators Kootam, a dark, bilingual Next.js site. It signs Kerala creators and editors in with Google, records their lane, and hands each person the community link plus their lane's WhatsApp invite link, served only by the server.

**Architecture:** Next.js 16 App Router on Vercel. Supabase handles Postgres and Auth, with RLS on every table. The browser can only *read* its own member row; every write goes through a server action that validates with zod and uses the service role. WhatsApp URLs exist only in server env, and the only way out is `POST /api/invite`, after the member row exists. There are two visual surfaces: Poster (public pages, GSAP + Lenis scroll film) and Editing Bay (join, me, admin, built with motion). Both share one token layer and one motif library.

**Tech Stack:** Next.js 16.4 · React 19.3 · TypeScript strict · Tailwind 4.3 · @supabase/ssr 0.12 + supabase-js 2.117 · zod 4.6 · motion 14 · gsap 3.15 (+ScrollTrigger, CustomEase) · lenis 1.3 · Vitest 5 + Testing Library + PGlite 0.5 · Playwright 1.64 · pnpm 12. These were the npm `latest` versions on 2026-10-13.

**Spec:** `docs/BUILD_BRIEF.md`. Today the brief sits at the repo root as `BUILD_BRIEF_goutham_community.md`, and Task 1 moves it. References like §7 point into the brief.

## Global Constraints

- The site is dark only: `color-scheme: dark`, `<meta name="theme-color" content="#0A0A0B">`, body background `--ink`. No light mode. Nothing flashes white. (§4.1)
- Every color resolves through a token. Raw hex is allowed only in `src/app/globals.css` and `src/config/tokens.ts`. (§4.1)
- Banned (§2.1):
  - the hexes `#CC785C #D97757 #DA7756 #D4A27F #EBDBBC #F0EEE6 #FAF9F5 #F5F4EF #BFB8AC`, plus any color within OKLab ΔE < 0.08 of them that is warm (OKLab b > 0.002)
  - the fonts `Styrene` and `Tiempos`, and Inter above 18px
  - the string `Claude` on any user-facing surface
  - the layout clichés in §2.1, and unmodified shadcn

  `pnpm check:bans` enforces this.
- Never load these skills: `anthropic-skills:brand-guidelines`, `anthropic-skills:web-artifacts-builder`, `artifact-design`, `artifact-diagramming`, `artifact-capabilities`, `anthropic-skills:canvas-design`, `anthropic-skills:algorithmic-art`.
- Load these skills at these points:
  - `design:design-system` in Task 2
  - `design:ux-copy` in Tasks 10, 17, 18 and 27
  - `design:accessibility-review` in Task 30
  - `superpowers:test-driven-development` in every task marked **TDD**
  - `superpowers:verification-before-completion` at every **Phase gate** (§3)
- WhatsApp URLs: only `src/lib/env.server.ts` reads `WA_COMMUNITY_URL`, `WA_CREATORS_URL`, `WA_EDITORS_URL` and `WA_OTHER_URL`, and its first line is `import 'server-only'`. These values never go in `NEXT_PUBLIC_*`, props, static output or page source. A `NEXT_PUBLIC_WA_*` variable is a security incident. (§2.2, §8)
- The lane is always read from the DB row, never from a request body. (§8)
- Brand strings, room names and the founder's name live only in `src/config/brand.ts`. Malayalam strings live only in `src/i18n/ml.ts`, each with an English fallback. (§4.0, §4.2, §8 Env)
- Lane colors: creator is `--rosso`, editor is `--lumen`, other is `--mint`. A lane color always appears with its text label (`LANE 01 · CREATORS`). (§4.1, §11)
- Type: the faces and sizes are exactly those in §4.2, self-hosted through `next/font` with `display: 'swap'`.
- Motion:
  - Never animate layout properties (width, height, top, left, margin, padding).
  - Use transforms and opacity. Paint-only properties (clip-path, stroke-dashoffset, filter) are allowed only on small elements, and only where the brief names them.
  - Eases: `cut` = `cubic-bezier(.85,0,.15,1)` for 90–180ms; `pan` = `cubic-bezier(.33,1,.68,1)` for 400–620ms; `settle` = spring with stiffness 180 and damping 22. The lane-select moment uses §7's `cubic-bezier(.76,0,.24,1)`.
  - Nothing runs longer than 700ms.
  - `will-change` is added when an animation starts and removed when it ends.
  - One GSAP context per page. No raw scroll listeners. (§10)
- Reduced motion turns these off: Lenis, grain, gate weave, marquee, odometer rolling, the preloader and title cards. GSAP jumps to final states, and reveals become a 150ms opacity fade. (§10)
- Fixed layers (grain, scrubber, letterbox, preloader) render as siblings of `<main>`, never inside it, because gate weave transforms `<main>`. No ScrollTrigger `pin` inside `<main>`.
- Contrast:
  - Text needs ≥ 4.5:1. 3:1 is allowed only at ≥ 24px, or ≥ 18.66px bold.
  - `--rosso` is used as text only at those large sizes.
  - No text under 24px sits directly on a `--rosso` field.
  - Focus rings need 3:1 against what is around them. (§11, measured in Departure 7)
- Touch targets are at least 44px. Build mobile-first at 390px, with breakpoints at 375/768/1024/1440/1920. (§11)
- Copy is short, flat, confident and a little dry. No hype. Nothing outside §16's scope.
- There is no header anywhere. On `/`, the timeline scrubber is the navigation. (§6.2, §16)
- Any `--rosso` or `--mustard` element larger than 48px gets `.halation-rosso` or `.halation-mustard`. (§4.3)
- No Ferrari, F1 or studio marks, logos or poster artwork. Original compositions only. Fonts come from Google Fonts or npm, OFL only. (§15)
- Members are never hard-deleted. Admins only change `status`. (§9)
- **Task close (every task):** `pnpm check` (lint, typecheck, unit tests, ban check) exits 0, then commit with the message listed.

## Review Focus

1. **Instagram in-app browser.** Most visitors tap the link in his IG bio, which opens Instagram's WebView. Google refuses OAuth there (`403 disallowed_useragent`). Step 1 should give a clear way out: an `intent://` link that opens Chrome on Android, and instructions on iOS. Test: Task 10.
2. **Pasted Instagram handles.** `@the.gowtham_das`, `instagram.com/the.gowtham_das`, `https://www.instagram.com/the.gowtham_das/?igsh=abc`, `instagr.am/…`, mixed case and stray spaces should all normalise to `the.gowtham_das`. Test: Task 8.
3. **Leaving for WhatsApp and coming back.** Opening chip 01 switches apps, and the phone may throw the tab away. On return, chip 02 must still be unlocked, and the reveal must come back from the server, not from a step-4 URL alone. Test: Task 18.
4. **A flagged or removed member reaching the reveal.** `/api/invite` returns 403. The UI must say something human and not hang on the render bar. Test: Task 18.
5. **Supabase down or not configured.** `/` and `/code` must still render. The counts and the member wall fall back to a quiet "signal lost" line. Test: Task 24 (counts) and Task 27 (wall). The Phase 1 and Phase 4 e2e suites run with no Supabase env at all.

---

## Departures from the brief, for sign-off (§0.5)

The plan is written with these changes. If you reject one, that part goes back to the brief's version.

1. **Added: an exit for in-app browsers.** The brief doesn't mention it, and it is the biggest single risk to signups (Review Focus 1). Task 10 adds UA detection plus an "open in browser" exit on step 1.
2. **Next.js 16.4, not 15.** 16 is the current stable major, and 15 only gets backports (15.5.x). The visible differences are that `src/proxy.ts` replaces `middleware.ts`, lint runs through the ESLint CLI (`next lint` is gone), and Turbopack is the default for builds.
3. **No client-side insert or update on `members`.** The brief's own-row update policy combined with the public anon key would let a flagged member run `update members set status='active', role_changes=0` from devtools. That un-flags them and resets the change-once limit. Instead, `authenticated` gets SELECT on its own row only. All writes are server actions with zod validation and the service role.
4. **The member wall comes from `security definer` functions (`member_wall()`, `member_counts()`), not a view.** Supabase's linter rates security-definer views as an error. Functions with `set search_path = ''` are the supported pattern. Same guarantee: no email ever reaches the client.
5. **One admin list.** The brief has both an `admins` table and `ADMIN_EMAILS`, and two lists drift apart. `ADMIN_EMAILS` stays, checked server-side in every admin page and action. The table is dropped.
6. **The rate limit counts rows in `link_reveals`.** Vercel functions don't share memory between instances, so an in-memory counter limits nothing. Each request logs a `community` row. If a member has 10 or more in the last 10 minutes, the request gets a 429. No new infrastructure.
7. **Token contrast fixes,** measured with the WCAG formula:
   - `--chalk-mute #62626B` scores 3.28:1 on ink and 2.75:1 on graphite, so timecode and labels fail AA. It becomes `#85858F` (5.42 on ink, 5.12 on carbon, 4.54 on graphite).
   - Small text on full-bleed `--rosso` fails whatever its color (chalk 4.11, ink 4.33). The JOIN section's mono line goes on an ink band, and button labels on rosso use Anton at 24px or larger.
   - `--focus` (mint) on rosso is 2.62:1. On rosso surfaces the focus ring becomes a 2px ink ring with a 2px chalk outer ring.
   - On graphite inputs, the `--rule` border makes the field boundary invisible (about 1.3:1, against WCAG 1.4.11's 3:1). Inputs get a resting `--chalk-dim` bottom border (6.0:1), and the lane-colored edge still wipes in on focus.
   - `--chalk #F2F3F0` is slightly warm (OKLab b +0.0035) and sits 0.005 ΔE from banned `#F5F4EF`, so the brief fails its own "within ~8%" rule. It becomes `#F2F3F5`, which is neutral-cool and visually the same.
8. **Layout animations become transforms, as §10.1 requires.** §6.6's "width animates from 0" becomes `scaleX` from the left edge, with the label fading in after the trim so it isn't squashed. §7's "frame expands to fill the viewport" becomes a FLIP layout animation in motion.
9. **IntersectionObserver arms animations; it doesn't mount content.** Every section is server-rendered so /code, the teaser and the roll call are crawlable, find-in-page works, and the page works without JS. IntersectionObserver only starts timelines and loads stills.
10. **The leak test checks values, not just names.** §8 test 9 greps `.next/static` for `WA_`, but the real leak is the URL *value*, and prerendered HTML/RSC lives in `.next/server/app`. The test builds with sentinel URLs and greps both trees for the sentinels and for `chat.whatsapp.com`, plus the variable names in `.next/static`.
11. **A Malayalam spike before building on next/og.** next/og (Satori) has no HarfBuzz shaping, so Malayalam conjuncts may render wrong on OG images and the member pass. Task 19 tests this first. If shaping is broken, the fixed Malayalam strings are pre-rendered in Chromium to transparent PNGs.
12. **Spelling of the founder's name.** The brief has both "Gowtham" (full name, handle) and "Goutham" (in the `other` reveal copy). User-facing copy uses `brand.founder.shortName = 'Gowtham'`, and this goes on the [ASK GOUTHAM] list.
13. **The Code: the brief gives 3 of 7 articles.** Articles 04–07 are drafted in his voice and marked `draft: true`. `pnpm check:launch` fails while any article is still a draft.

## Human inputs (blocking points)

| Needed at | What | Who |
|---|---|---|
| Task 5 | Vercel account, then run `! pnpm dlx vercel login` | you |
| Task 13 | A Supabase project (region `ap-south-1`, Mumbai), then `! pnpm dlx supabase login` | you |
| Task 13 | A Google Cloud OAuth client (Web) with redirect URI `https://<ref>.supabase.co/auth/v1/callback`, and a test Google account | you |
| Task 13 | WhatsApp invite links: the Community "Creators Kootam", plus linked groups "Frame Kootam" and "Cut Kootam" (§2.3) | Gowtham |
| Task 27 | The name for the "SITE BY" credit, and a contact address for the footer | you / Gowtham |
| Task 30 | A real mid-range Android phone | you |
| Launch | Every `[ASK GOUTHAM]` item: Malayalam sign-off, name spelling, Code articles 04–07, 9–12 stills | Gowtham, tracked by `pnpm check:launch` |

## File map

```
src/app/            layout.tsx globals.css fonts.ts page.tsx opengraph-image.tsx robots.ts sitemap.ts
  code/             page.tsx opengraph-image.tsx
  join/             page.tsx actions.ts layout.tsx (sets data-surface="bay")
  me/               page.tsx actions.ts
  admin/            page.tsx actions.ts export/route.ts
  auth/callback/    route.ts
  api/              invite/route.ts  me/route.ts  pass/[id]/route.tsx
  dev/specimen/     page.tsx (404 in production)
src/proxy.ts        Supabase session refresh
src/config/         brand.ts tokens.ts code.ts join.ts
src/i18n/ml.ts
src/lib/            env.server.ts csv.ts timecode.ts
  supabase/         server.ts browser.ts admin.ts
  members/          types.ts schema.ts row.ts repo.ts role-change.ts
  invite/           resolve.ts handler.ts
  join/             step.ts in-app-browser.ts draft.ts render-progress.ts
  auth/             session.ts next-path.ts admin.ts
  wall/queries.ts   pass/data.ts   film/scrub.ts
  motion/           ease.ts will-change.ts reduced-motion.ts
src/components/
  brand/            Wordmark Star CropMarks ClipBlock SlateStripes Timecode Odometer
  texture/          Grain GateWeave
  ui/               Button Field Checkbox Combobox TagSelect
  join/             JoinFlow StepTimeline SignIn LaneFrame LanePicker DetailsForm RenderBar Reveal DeliverableChip SavePassButton
  film/             ScrollFilm sections.ts Scrubber ColdOpen Hero ReelCards SectionCard TheRoom WhosInside CodeTeaser Inside RollCall JoinGate EndCredits Marquee
  admin/            MembersTable
supabase/migrations/ 0001_members.sql 0002_rls_and_wall.sql
scripts/            check-bans.mjs check-leaks.mjs check-launch.mjs render-ml-assets.mjs (only if Task 19's spike fails)
tests/db/           supabase-shim.sql harness.ts *.test.ts      (Vitest + PGlite)
tests/unit/         *.test.ts / *.test.tsx                      (Vitest; .tsx files start with `// @vitest-environment jsdom`)
tests/e2e/          *.spec.ts                                   (Playwright against `pnpm build && pnpm start`, no Supabase env)
tests/deployed/     *.spec.ts                                   (Playwright against the live URL, storage state in .auth/)
```

## Test strategy

- **Pure logic and server handlers:** Vitest, with dependencies injected as plain objects.
- **Schema, constraints and RLS:** Vitest + PGlite. The tests run the real migration files on top of `tests/db/supabase-shim.sql`, which recreates Supabase's `auth.uid()`, `auth.jwt()`, the roles `anon`/`authenticated`/`service_role` (bypassrls), and Supabase's default `grant all on tables in schema public` to all three roles, so revokes are actually tested. This machine has no Docker, which rules out `supabase start`. On 2026-10-13 I checked that PGlite enforces `SET ROLE` and RLS policies the way Supabase does.
- **Interactive components:** Vitest jsdom + Testing Library. Server actions are passed in as props.
- **Pages, keyboard, reduced motion, axe and leaks:** Playwright against a production build with no Supabase env.
- **Real auth:** `tests/deployed/` runs against the live URL. It uses a storage state saved from one manual Google sign-in: `pnpm exec playwright codegen --save-storage=.auth/creator.json <url>/join`. `.auth/` is gitignored.
- **What stays thin:** `src/lib/members/repo.ts` (the supabase-js calls) is kept small and covered only by `tests/deployed/`, because PostgREST can't point at PGlite.

---

## Phase 1: Skeleton (§13 P1)

### Task 1: Repository, toolchain, ban check — TDD

**Files:**
- Move: `BUILD_BRIEF_goutham_community.md` → `docs/BUILD_BRIEF.md`
- Create: the Next scaffold, `vitest.config.ts`, `playwright.config.ts`, `.env.example`, `scripts/check-bans.mjs`
- Test: `tests/unit/bans.test.ts`

**Interfaces:**
- Produces: `findBans(text: string, file: string): BanHit[]`, where `BanHit = { file: string; line: number; kind: 'hex' | 'near-hex' | 'font' | 'brand'; match: string }`.
- Produces: package scripts `dev build start lint typecheck test test:e2e test:deployed check:bans check:leaks check:launch check`, where `check` = `lint && typecheck && test && check:bans`.

- [ ] **Step 1:** Install pnpm with `npm i -g pnpm@12`. If that fails with EACCES, run `npm config set prefix ~/.local`, make sure `~/.local/bin` is on PATH, and try again. Then `mkdir docs && mv BUILD_BRIEF_goutham_community.md docs/BUILD_BRIEF.md && git init -b main`.
- [ ] **Step 2:** Scaffold in place: `pnpm dlx create-next-app@16.4.0 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git`. Expect success: `docs` is on create-next-app's allowed-files list. Strip the starter page, `public/*.svg` and the starter CSS.
- [ ] **Step 3:** Add dev dependencies: `vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @electric-sql/pglite @playwright/test @axe-core/playwright`, then run `pnpm exec playwright install chromium`. In tsconfig, add `noUncheckedIndexedAccess: true`. In Vitest, alias `server-only` to an empty module.
- [ ] **Step 4: Write the failing test** in `tests/unit/bans.test.ts`:

```ts
import { findBans } from '../../scripts/check-bans.mjs';
test('banned hex, any case', () => expect(findBans('a{color:#cc785c}', 'a.css')[0]).toMatchObject({ kind: 'hex', line: 1 }));
test('warm near-neighbour', () => expect(findBans('--chalk:#F2F3F0;', 'a.css')[0]?.kind).toBe('near-hex'));
test('palette passes', () => {
  for (const h of ['#0A0A0B','#121215','#1E1E24','#2E2E37','#F2F3F5','#9B9BA3','#85858F','#E4261C','#9E1009','#F2B705','#C6F24E','#7FD4B8','#FFFFFF'])
    expect(findBans(`--t:${h};`, 'a.css')).toEqual([]);
});
test('fonts', () => { expect(findBans("font-family:'Styrene B'", 'a.css')[0]?.kind).toBe('font'); expect(findBans('Tiempos Text', 'a.tsx')[0]?.kind).toBe('font'); });
test('brand only in user-facing paths', () => {
  expect(findBans('<p>Made with Claude</p>', 'src/app/x.tsx')[0]?.kind).toBe('brand');
  expect(findBans('Claude', 'docs/x.md')).toEqual([]);
});
```

- [ ] **Step 5:** Run `pnpm vitest run tests/unit/bans.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 6:** Implement `scripts/check-bans.mjs`. Match `#RGB` and `#RRGGBB`, convert to OKLab, and flag `near-hex` when ΔE < 0.08 to any banned hex **and** b > 0.002. Font matches are case-insensitive. `brand` applies only to files under `src/` and `public/`. As a CLI it walks `src/`, `public/` and `supabase/`, and skips itself, `tests/unit/bans.test.ts`, `docs/`, `node_modules/` and `.next/`. It prints `file:line kind match` and exits 1 on any hit.
- [ ] **Step 7:** Run the test again. Expected: PASS.
- [ ] **Step 8:** Write `.env.example` with every key from §8 Env and a one-line comment each, marking `WA_*` as "server only — never NEXT_PUBLIC_". Add `.env*.local`, `.auth/`, `test-results/` and `playwright-report/` to `.gitignore`. Add the package scripts.
- [ ] **Step 9:** Close the task. Commit: `chore: scaffold next 16 app, test toolchain, ban check`.

### Task 2: Tokens, fonts, brand + Malayalam config — TDD

**Files:** create `src/app/globals.css`, `src/config/tokens.ts`, `src/app/fonts.ts`, `src/config/brand.ts` and `src/i18n/ml.ts`; modify `src/app/layout.tsx`. Test: `tests/unit/tokens.test.ts`, `tests/unit/ml.test.ts`.

**Interfaces:**
- Produces:
  - CSS vars `--ink --carbon --graphite --rule --chalk --chalk-dim --chalk-mute --rosso --rosso-deep --mustard --lumen --mint --focus --lane`.
  - `[data-lane=creator|editor|other]` sets `--lane`. `[data-surface=poster|bay]` sets the page base: `--ink` for poster, `--carbon` for bay.
  - Tailwind color utilities generated from the tokens only (`bg-ink`, `text-lane`, …). Font utilities `font-display font-subhead font-sans font-mono font-ml`. Type utilities `text-hero text-title text-subhead text-body text-label`. `.halation-rosso` and `.halation-mustard`.
- Produces: `TOKENS: Record<TokenName, \`#${string}\`>`.
- Produces: `LANES = ['creator','editor','other'] as const` and `type Lane`.
- Produces: `brand`, with these keys:
  - `name: 'Creators Kootam'`
  - `titleTemplate: '%s · Creators Kootam'`
  - `wordmark.latin: 'CREATORS'`
  - `rooms.community.name: 'CREATORS KOOTAM'`
  - `rooms.creator = { name: 'FRAME KOOTAM', label: 'LANE 01 · CREATORS' }`
  - `rooms.editor = { name: 'CUT KOOTAM', label: 'LANE 02 · EDITORS' }`
  - `rooms.other = { name: 'SOMETHING ELSE', label: 'LANE 03 · OTHER' }`
  - `founder = { fullName: 'GOWTHAM DAS THEKKINKATTIL', slateName: 'GOWTHAM DAS', shortName: 'Gowtham', instagram: 'thegowthamdas' }`
  - `siteBy: null` (filled in at Task 27)
  - `contact: null`
  - `region: 'KERALA'`
  - `year: 2026`
- Produces: `ML: Record<MlKey, { ml: string | null; en: string; confirmed: boolean }>`, `t(key): { ml: string | null; en: string }`, and `unconfirmedMlKeys(): MlKey[]`. The keys are:
  - `wordmark` = `കൂട്ടം`
  - `name` = `ക്രിയേറ്റേഴ്‌സ് കൂട്ടം` (keep the ZWNJ)
  - `youreIn` = `നിങ്ങൾ കൂട്ടത്തിലാണ്.` / "You're in the kootam."
  - `codeEyebrow`, `codeFooter` and `footerSignoff`, all with `ml: null`
  - Every key starts with `confirmed: false`.

- [ ] **Step 1: Write the failing tests:**
  - **Parity:** parse every `--name: #hex` inside `:root` in `globals.css` and check it equals the matching `TOKENS` entry, in both directions.
  - Every `TOKENS` value gives `findBans` an empty result.
  - `TOKENS.chalk === '#F2F3F5'`, `TOKENS['chalk-mute'] === '#85858F'`, and every other token equals its §4.1 value.
  - `unconfirmedMlKeys()` contains `'wordmark'`.
  - Every `ML[k].en` is a non-empty string.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement the token layer. Set the `:root` values, then in `@theme inline` add `--color-*: initial;`, map each `--color-x: var(--x)`, and map the fonts. Put the type scale clamps from §4.2 into `@utility` blocks (hero/title: Anton, uppercase, line-height .86, tracking −0.02em; label: Geist Mono, uppercase, tracking .14em). Set `html { color-scheme: dark; background: var(--ink) }`. In `fonts.ts`:
  - Anton weight 400
  - Archivo with axes `['wdth']`, used at `font-stretch: 112%; font-weight: 700`
  - `geist/font/sans` and `geist/font/mono`
  - Anek Malayalam with `subsets: ['malayalam']`
  - All with `display: 'swap'` and CSS variables.
- [ ] **Step 4:** Implement `brand.ts` and `ml.ts`. In `layout.tsx`:
  - `export const viewport = { themeColor: TOKENS.ink, colorScheme: 'dark' }`
  - `metadata.title = { template: brand.titleTemplate, default: brand.name }`
  - `metadataBase` from `NEXT_PUBLIC_SITE_URL`
  - `<html lang="en" data-surface="poster">` with the font variables.
- [ ] **Step 5:** Run. Expected: PASS. Then `pnpm build` succeeds.
- [ ] **Step 6:** Close the task. Commit: `feat: token layer, fonts, brand and malayalam config`.

### Task 3: Motif primitives + specimen page — TDD for the pure parts

**Files:** create `src/lib/timecode.ts`, `src/components/brand/{Wordmark,Star,CropMarks,ClipBlock,SlateStripes,Timecode,Odometer}.tsx` and `src/app/dev/specimen/page.tsx`. Test: `tests/unit/timecode.test.ts`.

**Interfaces:**
- Produces: `formatTimecode(frames: number, fps = 25): string` (`HH:MM:SS:FF`, at the PAL rate), `padCount(n: number, width = 6): string`, and `toDigits(n: number, width: number): number[]`.
- Produces these components:
  - `<Wordmark size: 'sm'|'md'|'lg'|'xl'; lane?: Lane />`: `CREATORS` in Anton stacked over `t('wordmark').ml ?? 'KOOTAM'` in Anek. Tune optically on the specimen page so the Malayalam carries the same visual weight.
  - `<Star size?: number />`: an SVG in `var(--mustard)`, `aria-hidden`.
  - `<CropMarks draw?: boolean; tone?: 'rule' | 'lane' | 'chalk' />`: four L-brackets. With `draw`, stroke-dashoffset animates over 240ms on `.group:hover` and `:focus-visible`.
  - `<ClipBlock label: string; lane?: Lane | 'neutral'; active?: boolean; as?: 'div' | 'button' />`: a 3px lane edge on the left and a mono label.
  - `<SlateStripes />`
  - `<Timecode frames: number />`
  - `<Odometer value: number; digits: number; label?: string />`: one strip per digit, moved with `translateY(-d * 1em)` over `pan`. The strips are `aria-hidden`, and the wrapper's `aria-label` is the full number. It doesn't roll under reduced motion.

- [ ] **Step 1: Write the failing test:**

```ts
expect(formatTimecode(0)).toBe('00:00:00:00');
expect(formatTimecode(37)).toBe('00:00:01:12');              // §6.0 end value
expect(formatTimecode(25 * 3600 + 1)).toBe('01:00:00:01');
expect(padCount(147)).toBe('000147');                        // §6.7
expect(toDigits(147, 6)).toEqual([0, 0, 0, 1, 4, 7]);
expect(toDigits(1_234_567, 6)).toEqual([9, 9, 9, 9, 9, 9]);  // clamps rather than overflowing
```

- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Build the components and the specimen page. The page shows every primitive at every size, the type scale and every lane, and calls `notFound()` when `NODE_ENV === 'production'`. Verify visually: take Playwright screenshots of `pnpm dev` at `/dev/specimen` at 390 and 1440 widths, save them to the scratchpad, and check them by eye. Look for the stacked Malayalam reading as the same weight, and crisp crop marks.
- [ ] **Step 6:** Close the task. Commit: `feat: motif primitives and specimen page`.

### Task 4: Every route rendering with real type

**Files:** create or modify `src/app/page.tsx`, `src/app/code/page.tsx`, `src/config/code.ts`, `src/components/film/sections.ts`, `src/app/join/{layout,page}.tsx`, `src/app/me/page.tsx`, `src/app/admin/page.tsx`, `src/app/auth/callback/route.ts` (a stub that redirects to `/join`), `src/app/robots.ts` and `src/app/sitemap.ts`. Test: `tests/e2e/routes.spec.ts`.

**Interfaces:**
- Produces: `SECTIONS`, `as const`, with `type SectionId = typeof SECTIONS[number]['id']`. Tasks 21 and 22 consume it.

| `id` | `n` | `label` |
|---|---|---|
| `cold-open` (the hero) | `01` | `COLD OPEN` |
| `the-room` | `02` | `THE ROOM` |
| `whos-inside` | `03` | `WHO'S INSIDE` |
| `the-code` | `04` | `THE CODE` |
| `inside` | `05` | `INSIDE` |
| `roll-call` | `06` | `ROLL CALL` |
| `join` | `07` | `JOIN` |

- Produces: `CODE_ARTICLES: readonly { n: string; text: string; draft: boolean }[]`.
  - 01–03 come verbatim from §6.5, with `draft: false`.
  - 04–07 are drafts, with `draft: true`:
    - "Tag everyone in the frame. The stylist, the DOP, the friend holding the reflector."
    - "Tear the cut apart. Leave the editor standing."
    - "Pay people. Exposure is not a rate. Agree the fee before the first frame."
    - "Ask before you use it. Their audio, their grade, their look. A DM costs nothing."

- [ ] **Step 1:** Write the failing Playwright spec. `playwright.config.ts` uses `webServer: pnpm build && pnpm start` and sets no Supabase env. The spec checks:
  - `/`, `/code` and `/join` return 200 with exactly one `h1`.
  - `/` has `h1` text `WE'D RATHER SHOW THAN TELL.`
  - `meta[name=theme-color]` has content `#0A0A0B`.
  - The computed `body` background is `rgb(10, 10, 11)`.
  - `/me` and `/admin` have `meta[name=robots]` containing `noindex`.
  - `/robots.txt` disallows `/admin` and `/me`.
  - `/sitemap.xml` lists `/` and `/code`.
- [ ] **Step 2:** Run `pnpm test:e2e tests/e2e/routes.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Build static, animation-free versions of every §6 section on `/`, each using its `SECTIONS` id, and all copy exactly as written in the brief. Build `/code` with all seven articles. `/join`, `/me` and `/admin` are Editing Bay placeholders (`/join/layout.tsx` sets `data-surface="bay"`).
- [ ] **Step 4:** Run. Expected: PASS. Take screenshots at 390 and 1440 and check that the type scale is real and nothing overflows horizontally.
- [ ] **Step 5:** Close the task. Commit: `feat: all routes render with real type`.

### Task 5: Phase 1 gate: deploy

- [ ] **Step 1:** Load `superpowers:verification-before-completion`. Run `pnpm check && pnpm build && pnpm test:e2e` and keep the output.
- [ ] **Step 2:** Ask the user to run `! pnpm dlx vercel login`. Then run `pnpm dlx vercel link --yes --project creators-kootam`. Set `NEXT_PUBLIC_SITE_URL` in Vercel production env to the production URL, then run `pnpm dlx vercel deploy --prod`.
- [ ] **Step 3:** Verify: `curl -sI <url>` returns 200, `curl -s <url> | grep -o 'theme-color[^>]*'` shows `#0A0A0B`, and `/code` and `/join` return 200.
- [ ] **Step 4:** Record the URL in `README.md`. Commit: `chore: phase 1 deployed`. Report the URL along with the command output.

---

## Phase 2: Data & auth (§8, all TDD)

### Task 6: DB harness + members schema — TDD

**Files:** create `tests/db/supabase-shim.sql`, `tests/db/harness.ts` and `supabase/migrations/0001_members.sql`. Test: `tests/db/members.test.ts`.

**Interfaces:**
- Produces:

```ts
createTestDb(): Promise<TestDb>
TestDb = {
  pg: PGlite;
  addUser(u?: { id?: string; email?: string }): Promise<{ id: string; email: string }>;
  asAnon<T>(fn: (q: PGlite['query']) => Promise<T>): Promise<T>;
  asUser<T>(u, fn): Promise<T>;
  asService<T>(fn): Promise<T>;
}
memberFixture(userId: string, overrides?: Partial<Record<string, unknown>>): Record<string, unknown>  // a valid creator row
```

  The role helpers switch with `set role …` plus `set_config('request.jwt.claims', <json>, false)`, and always reset afterwards.
- Produces: the §8 schema, verbatim, with these additions:
  - `constraint one_role_change check (role_changes between 0 and 1)`
  - a `set_updated_at` trigger
  - an index `link_reveals(member_id, revealed_at desc)`
  - and without the `admins` table (Departure 5).

- [ ] **Step 1: Write the failing tests.** Create one DB per file in `beforeAll`. PGlite errors expose SQLSTATE as `.code`.
  - `role 'other'` with `role_text null` is rejected with `{ code: '23514' }` (§8 test 5).
  - `'x'` is rejected and `'DOP'` is accepted.
  - `accepted_code false` is rejected with `23514` (§8 test 6).
  - The DB instagram check accepts `the.gowtham_das` and rejects `https://instagram.com/x` and `a b` (§8 test 7, DB side).
  - A second row with the same `user_id` fails with `23505` (§8 test 8).
  - `role_changes = 2` is rejected.
  - `updated_at` advances on update.
  - Deleting the auth user cascades to `members` and `link_reveals`.
- [ ] **Step 2:** Run `pnpm vitest run tests/db/members.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Write the shim. It contains:
  - the `auth` schema, `auth.users(id uuid pk, email text)`
  - `auth.uid()` and `auth.jwt()`, reading `request.jwt.claims` exactly as Supabase does
  - the roles, with `service_role bypassrls`
  - `alter default privileges in schema public grant all on tables, sequences, functions to anon, authenticated, service_role`

  Then write the migration and the harness, which loads the shim and then every `supabase/migrations/*.sql` in name order.
- [ ] **Step 4:** Run. Expected: PASS. **Step 5:** Close the task. Commit: `feat(db): members schema with constraints, pglite test harness`.

### Task 7: RLS, grants, wall functions — TDD

**Files:** create `supabase/migrations/0002_rls_and_wall.sql`. Test: `tests/db/rls.test.ts`.

**Interfaces:**
- Produces: `public.member_wall(max_rows int default 200) returns table(display_name text, instagram text, role member_role, created_at timestamptz)`. It returns only rows where `show_on_wall and status = 'active'`, ordered `created_at desc`.
- Produces: `public.member_counts() returns table(total bigint, creators bigint, editors bigint, other bigint)`, counting active members only.
- Both are `security definer`, `set search_path = ''`, with `execute` granted to `anon` and `authenticated` and revoked from `public`.
- `members`: RLS on, `revoke all … from anon, authenticated`, `grant select … to authenticated`, and a `members_select_own` policy `using (user_id = (select auth.uid()))`.
- `link_reveals`: RLS on, `revoke all … from anon, authenticated`.

- [ ] **Step 1: Write the failing tests:**
  - As anon, `select * from members` is rejected with `42501`.
  - With two users, user A sees exactly one row, its own.
  - As user A, `update members set status='active'` is rejected with `42501`, and the same holds for `insert` and `delete` (Departure 3).
  - **Wall columns:** as anon, `select * from member_wall()` returns rows where `Object.keys(row).sort()` equals `['created_at','display_name','instagram','role']`, with no `email` (§8 test 10).
  - The wall excludes `show_on_wall=false`, `flagged` and `removed` rows.
  - `member_counts()` with 2 active creators, 1 active editor and 1 removed editor returns `{ total: 3, creators: 2, editors: 1, other: 0 }`.
  - Anon and authenticated inserts into `link_reveals` are rejected with `42501`, and a service insert succeeds.
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Write the migration. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat(db): rls, server-only writes, member wall functions`.

### Task 8: Member input schema & normalisers — TDD

**Files:** create `src/config/join.ts`, `src/lib/members/types.ts` and `src/lib/members/schema.ts`. Test: `tests/unit/member-schema.test.ts`.

**Interfaces:**
- Produces:
  - `DISTRICTS`: Thiruvananthapuram, Kollam, Pathanamthitta, Alappuzha, Kottayam, Idukki, Ernakulam, Thrissur, Palakkad, Malappuram, Kozhikode, Wayanad, Kannur, Kasaragod, Outside Kerala.
  - `TAGS = { creator: ['reels','fashion','food','travel','comedy','tech'], editor: ['premiere','after effects','davinci','capcut','final cut','color','sound','motion'] }`.
- Produces: `MemberRow`, mirroring the `members` columns, with `status: 'active'|'flagged'|'removed'`.
- Produces: `INSTAGRAM_RE = /^[a-zA-Z0-9._]{1,30}$/` and `normalizeInstagram(raw: string): string`. It trims, strips `@`, the scheme, `www.`, `instagram.com/` or `instagr.am/`, any path after the first segment, the query and the hash, then lowercases.
- Produces: `memberInputSchema`, a zod 4 discriminated union on `role`, `.strict()`. Its fields:
  - `role`
  - `roleOtherText`: trimmed, 2–60, and present only for `other`
  - `displayName`: trimmed, 2–60
  - `instagram`: preprocessed with `normalizeInstagram`, then checked against the regex
  - `city`: one of `DISTRICTS`
  - `tags`: a subset of `TAGS[role]`, and `[]` for `other`
  - `portfolioUrl`: optional `http(s)` URL, with `''` treated as undefined
  - `showOnWall`: boolean, default `true`
  - `acceptedCode`: `z.literal(true)`
- Produces: `type MemberInput`.

- [ ] **Step 1: Write the failing tests:**
  - `INSTAGRAM_RE` accepts `the.gowtham_das` and rejects `https://instagram.com/x` and `a b` (§8 test 7).
  - `it.each` over `['@the.gowtham_das','instagram.com/the.gowtham_das','https://www.instagram.com/the.gowtham_das/?igsh=abc','  The.Gowtham_Das ','instagr.am/the.gowtham_das']`: each normalises to `the.gowtham_das` (Review Focus 2).
  - A valid creator parses.
  - These are rejected: `acceptedCode: false`; `other` without `roleOtherText`; `other` with `'x'`; an editor with tag `'fashion'`; an extra key `status: 'active'`; an extra key `userId`; `displayName: '   '`; `portfolioUrl: 'javascript:alert(1)'`; `city: 'Chennai'`.
  - `displayName: 'ഗൗതം ദാസ്'` is accepted.
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat: shared member input schema and handle normaliser`.

### Task 9: Server env + invite resolution — TDD

**Files:** create `src/lib/env.server.ts` and `src/lib/invite/resolve.ts`. Test: `tests/unit/invite-resolve.test.ts`.

**Interfaces:**
- Produces:

```ts
type WaLinks = { community: string; creators: string; editors: string; other: string | null };
type ServerEnv = { supabaseUrl: string; serviceRoleKey: string; siteUrl: string; adminEmails: string[]; wa: WaLinks };
parseServerEnv(raw: Record<string, string | undefined>): ServerEnv   // pure
getServerEnv(): ServerEnv                                           // memoised parseServerEnv(process.env)
resolveInviteLinks(role: Lane, wa: WaLinks): { community: string; lane: string | null; laneKey: 'creators' | 'editors' | 'other' | null }
```

- Every `WA_*` value must match `^https://chat\.whatsapp\.com/[A-Za-z0-9]+$`. An empty `WA_OTHER_URL` becomes `null`. Errors name the missing or invalid **key**, never its value.
- For `other`, `lane` is `wa.other` unless `wa.other` is null or equals `community`. In those cases `lane` is `null`, and the UI shows the mint note.

- [ ] **Step 1: Write the failing test:**

```ts
const wa = { community: 'https://chat.whatsapp.com/COMM', creators: 'https://chat.whatsapp.com/CRE', editors: 'https://chat.whatsapp.com/EDI', other: null };
expect(resolveInviteLinks('creator', wa)).toEqual({ community: wa.community, lane: wa.creators, laneKey: 'creators' });
expect(JSON.stringify(resolveInviteLinks('creator', wa))).not.toContain('EDI');               // §8 test 3
expect(resolveInviteLinks('editor', wa)).toMatchObject({ lane: wa.editors, laneKey: 'editors' }); // §8 test 4
expect(resolveInviteLinks('other', wa).lane).toBeNull();
expect(resolveInviteLinks('other', { ...wa, other: wa.community }).lane).toBeNull();
expect(resolveInviteLinks('other', { ...wa, other: 'https://chat.whatsapp.com/OTH' }).lane).toBe('https://chat.whatsapp.com/OTH');
expect(() => parseServerEnv({ ...validRaw, WA_EDITORS_URL: undefined })).toThrow(/WA_EDITORS_URL/);
expect(() => parseServerEnv({ ...validRaw, WA_CREATORS_URL: 'https://evil.example/x' })).toThrow(/WA_CREATORS_URL/);
try { parseServerEnv({ ...validRaw, WA_CREATORS_URL: 'https://evil.example/x' }) } catch (e) { expect(String(e)).not.toContain('evil.example') }
expect(parseServerEnv({ ...validRaw, ADMIN_EMAILS: ' A@x.com, b@y.com ' }).adminEmails).toEqual(['a@x.com', 'b@y.com']);
```

- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. The first line of `env.server.ts` is `import 'server-only'`. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat: server-only env and lane link resolution`.

### Task 10: Supabase clients, session proxy, Google sign-in, in-app escape — TDD

**Files:** create `src/lib/supabase/{server,browser,admin}.ts`, `src/lib/auth/{session,next-path}.ts`, `src/lib/join/in-app-browser.ts`, `src/proxy.ts`, `src/app/auth/callback/route.ts` and `src/components/join/SignIn.tsx`. Test: `tests/unit/next-path.test.ts`, `tests/unit/in-app-browser.test.ts`, `tests/unit/sign-in.test.tsx`.

**Interfaces:**
- Produces:

```ts
createServerSupabase(): Promise<SupabaseClient>   // @supabase/ssr createServerClient over `await cookies()` getAll/setAll
createBrowserSupabase(): SupabaseClient
createAdminSupabase(): SupabaseClient             // server-only, service role, persistSession false
type SessionUser = { id: string; email: string; name: string | null; avatarUrl: string | null };
getSessionUser(): Promise<SessionUser | null>     // auth.getUser(): validated by the Auth server, not a cookie read
safeNextPath(raw: string | null, fallback = '/join'): string
type InAppInfo = { inApp: boolean; app: 'instagram' | 'facebook' | 'linkedin' | 'webview' | null; platform: 'android' | 'ios' | 'other' };
detectInAppBrowser(ua: string): InAppInfo
chromeIntentUrl(url: string): string
<SignIn inApp: InAppInfo; siteUrl: string />
```

- `proxy.ts` refreshes the session cookie. Matcher: `/join/:path*`, `/me`, `/admin/:path*`, `/api/:path*`, `/auth/:path*`.
- The callback runs `exchangeCodeForSession(code)` and redirects to `safeNextPath(next)`. On error it redirects to `/join?error=auth`.
- `SignIn` calls `signInWithOAuth({ provider: 'google', options: { redirectTo: \`${siteUrl}/auth/callback?next=${encodeURIComponent('/join?step=lane')}\` } })`. Below the button, in mono, verbatim from §7: `We read your name, email and profile photo. Nothing else. We never post anything.`

- [ ] **Step 1: Write the failing tests:**
  - `safeNextPath('/join?step=lane')` returns it unchanged.
  - `'https://evil.com'`, `'//evil.com'`, `'/\\evil.com'` and `null` all give `'/join'`.
  - `detectInAppBrowser` uses real UA strings:
    - Instagram Android (`… Instagram 3xx.0.0 Android …`) gives `{ inApp: true, app: 'instagram', platform: 'android' }`.
    - Instagram iPhone gives `platform: 'ios'`.
    - A `FBAN/FBIOS` UA gives `app: 'facebook'`.
    - An Android WebView `; wv)` UA gives `app: 'webview'`.
    - Chrome Android and Safari iOS give `inApp: false`.
  - `chromeIntentUrl('https://creatorskootam.in/join')` returns `'intent://creatorskootam.in/join#Intent;scheme=https;package=com.android.chrome;end'`.
  - `SignIn` with Instagram on Android has no Google button, and its link `href` starts with `intent://`.
  - With Instagram on iOS, it shows instructions plus a copy-link button.
  - With `inApp: false`, it shows a single button named `CONTINUE WITH GOOGLE` (wording via `design:ux-copy`).
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. Detect the UA server-side in `/join/page.tsx` from `headers()` so there's no flash. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat: supabase auth wiring, google sign-in, in-app browser escape`.

### Task 11: `/api/invite` — TDD

**Files:** create `src/lib/invite/handler.ts`, `src/lib/members/repo.ts` and `src/app/api/invite/route.ts`. Test: `tests/unit/invite-handler.test.ts`.

**Interfaces:**
- Consumes: `resolveInviteLinks`, `getServerEnv`, `getSessionUser`, `createAdminSupabase`, `MemberRow`.
- Produces:

```ts
const RATE_LIMIT = { max: 10, windowMs: 600_000 };
type InviteDeps = {
  getUserId(): Promise<string | null>;
  getMemberByUserId(userId: string): Promise<MemberRow | null>;
  countRecentReveals(memberId: string, since: Date): Promise<number>;   // counts link_key = 'community'
  logReveals(memberId: string, keys: string[]): Promise<void>;
  wa: WaLinks; now(): Date;
};
type InviteOk = { community: string; lane: string | null; laneKey: 'creators' | 'editors' | 'other' | null };
type InviteResponse =
  | { status: 200; body: InviteOk }
  | { status: 401 | 403 | 404 | 429; body: { error: 'unauthenticated' | 'inactive' | 'no_member' | 'rate_limited' } };
handleInvite(deps: InviteDeps): Promise<InviteResponse>
```

- `repo.ts`, using the admin client: `getMemberByUserId`, `countRecentReveals`, `logReveals`, `insertMember(row)` and `updateMember(id, patch, guard?)`.
- The route exports only `POST`. It never reads the request body, and every response has `Cache-Control: no-store`.

- [ ] **Step 1: Write the failing tests,** using fakes:
  - With `getUserId` returning `null`, the response is `{ status: 401 }` (§8 test 1).
  - With no member row, it is `404` (§8 test 2).
  - For a creator it is `200`, `body.lane === CRE`, and `JSON.stringify(body)` doesn't contain `EDI` (§8 test 3).
  - For an editor, `body.lane === EDI` (§8 test 4).
  - `flagged` and `removed` get `403`, and `logReveals` is not called.
  - When `countRecentReveals` returns 10, the response is `429`. When it returns 9, it's `200`. The `since` argument equals `now - 600_000`.
  - Creators log `['community','creators']`.
  - `other` with no lane logs `['community']`.
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement the handler, then the repo and the route wiring. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat: /api/invite with db-sourced lane and reveal-log rate limit`.

### Task 12: Member writes, `/join` (ugly but correct), `/api/me` — TDD

**Files:** create `src/lib/members/row.ts`, `src/lib/join/step.ts`, `src/app/join/actions.ts` and `src/app/api/me/route.ts`; modify `src/app/join/page.tsx`. Test: `tests/unit/member-row.test.ts`, `tests/unit/join-step.test.ts`.

**Interfaces:**
- Produces:

```ts
type MemberInsert = Omit<MemberRow, 'id' | 'status' | 'role_changes' | 'created_at' | 'updated_at'>;
buildMemberInsert(user: SessionUser, input: MemberInput): MemberInsert   // user_id, email, avatar_url come from the session only
mapInsertError(code: string | undefined): 'already_member' | 'invalid' | 'unknown'   // 23505 / 23514, 22P02 / anything else
type SubmitResult = { ok: true; alreadyMember: boolean } | { ok: false; error: 'unauthenticated' | 'invalid' | 'unknown'; fieldErrors?: Record<string, string> };
submitMember(input: unknown): Promise<SubmitResult>   // 'use server': session → safeParse → insert via admin client → map errors
type JoinStep = 'signin' | 'lane' | 'details' | 'reveal';
resolveStep(q: { step?: string; lane?: string }, s: { signedIn: boolean; hasMember: boolean }): { step: JoinStep; lane: Lane | null }
```

- `GET /api/me` returns 401, 404, or 200 with `{ member: MemberRow }` (the caller's own row), with `no-store`.

- [ ] **Step 1: Write the failing tests** for `resolveStep`, `buildMemberInsert` and `mapInsertError`:

| `q` | `s` | Expected |
|---|---|---|
| `{}` | not signed in | `signin` |
| `{ step: 'reveal' }` | signed in, no member | `lane` |
| `{ step: 'details', lane: 'editor' }` | signed in, no member | `{ step: 'details', lane: 'editor' }` |
| `{ step: 'details' }` | signed in, no member | `lane` |
| `{ step: 'details', lane: 'admin' }` | signed in, no member | `lane` |
| `{ step: 'lane' }` | signed in, has member | `reveal` (§7 returning users) |

  - `buildMemberInsert(user, input)` has `email === user.email` and `user_id === user.id`, and has no `status` or `role_changes` keys.
  - `mapInsertError('23505')` returns `'already_member'` (§8 test 8, app side).
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement. Then build the unstyled `/join`: plain HTML per step, with a details `<form>` calling `submitMember` and a "Get my links" button that runs `POST /api/invite` and lists both links. **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Close the task. Commit: `feat: member writes via server action, join step resolution, /api/me`.

### Task 13: Phase 2 gate: live Supabase, leak scan, deployed checks — TDD for the scanner

**Files:** create `scripts/check-leaks.mjs` and `tests/deployed/invite.spec.ts`; modify `README.md`. Test: `tests/unit/leaks.test.ts`.

**Interfaces:**
- Produces: `scanForLeaks(dirs: string[], needles: string[], exts?: string[]): Promise<{ file: string; needle: string }[]>`.

- [ ] **Step 1: Write the failing test.** In a temp-dir fixture, a file containing `https://chat.whatsapp.com/LEAKSENTINEL1` is reported, and a clean dir returns `[]`.
- [ ] **Step 2:** Run. Expected: FAIL. **Step 3:** Implement the scanner. Then implement the `check:leaks` CLI:
  - Run `next build` with sentinel env: `WA_*=https://chat.whatsapp.com/LEAKSENTINEL{COMMUNITY,CREATORS,EDITORS,OTHER}`.
  - Scan `.next/static/**` for the sentinels, `chat.whatsapp.com` and the four `WA_*` names.
  - Scan `.next/server/app/**/*.{html,rsc,body,meta}` for the sentinels and `chat.whatsapp.com`.
  - Exit 1 on any hit.

  **Step 4:** Run the unit test, then `pnpm check:leaks`. Expected: PASS, with 0 hits (§8 test 9).
- [ ] **Step 5:** Live Supabase:
  - The user runs `! pnpm dlx supabase login`.
  - Run `pnpm dlx supabase link --project-ref <ref>`, then `pnpm dlx supabase db push`.
  - Verify: `curl "$SUPABASE_URL/rest/v1/members?select=*" -H "apikey: $ANON_KEY"` returns a permission error, and `curl -X POST "$SUPABASE_URL/rest/v1/rpc/member_wall" -H "apikey: $ANON_KEY"` returns `[]`.
- [ ] **Step 6:** Google provider: the user creates the OAuth client and pastes its id and secret into Supabase Auth → Google. Set Supabase Auth's Site URL to production, and its redirect allow-list to `<prod>/auth/callback` and `http://localhost:3000/auth/callback`.
- [ ] **Step 7:** Put every `.env.example` key into Vercel's Production and Preview env. If Gowtham hasn't sent the WhatsApp links yet, use `https://chat.whatsapp.com/PENDINGCOMMUNITY` and so on, and record that in the README. Deploy.
- [ ] **Step 8:** Write `tests/deployed/invite.spec.ts`. It needs `BASE_URL` and `.auth/creator.json`, saved after the user signs in once with the test account as a creator, with `show_on_wall` off. It checks:
  - With the storage state, `POST /api/invite` returns 200, `laneKey === 'creators'`, and the response text does not contain `process.env.WA_EDITORS_URL` (from `.env.local`).
  - Without the storage state, it returns 401.
  - The `/join` HTML for the signed-in member contains no `chat.whatsapp.com`.
  - `GET /api/me` returns their row.

  Run `pnpm test:deployed`. Expected: PASS.
- [ ] **Step 9:** Run `superpowers:verification-before-completion` with the outputs of `pnpm check`, `pnpm check:leaks` and `pnpm test:deployed`. Commit: `feat: leak scan, live supabase, deployed invite checks`.

---

## Phase 3: The join sequence (§7)

### Task 14: Editing Bay form primitives — TDD for behaviour

**Files:** create `src/components/ui/{Button,Field,Checkbox,Combobox,TagSelect}.tsx`. Test: `tests/unit/ui-primitives.test.tsx`.

**Interfaces:**
- Produces:
  - `<Button variant: 'poster' | 'ghost' | 'bay' | 'ink' … />`:
    - `poster` is a rosso block with radius ≤ 2px, an Anton label at 24px or more, and `CropMarks draw`.
    - `ink` is an ink block for use on rosso.
    - Focus rings follow Departure 7.
    - The minimum height is 44px.
  - `<Field label name error? hint? …inputProps />`:
    - graphite fill, radius 0, a mono label above
    - a resting 1px `--chalk-dim` bottom border
    - a 2px `--lane` bar animating `scaleX(0→1)` from the left on focus, using `cut` over 180ms
    - `aria-invalid` and `aria-describedby` pointing at the error
  - `<Checkbox label checked onChange />`: a styled native input.
  - `<Combobox label options value onChange />`: the WAI-ARIA combobox pattern (input + listbox, `aria-activedescendant`), filtering by case-insensitive substring.
  - `<TagSelect label options value onChange />`: toggle buttons with `aria-pressed`.

- [ ] **Step 1: Write the failing tests:**
  - **Combobox:** type `ern`, and the `Ernakulam` option shows. `ArrowDown` then `Enter` calls `onChange('Ernakulam')`. `Escape` sets `aria-expanded` to `false`.
  - **TagSelect:** clicking `davinci` sets `aria-pressed=true` and calls `onChange(['davinci'])`. Clicking it again gives `[]`.
  - **Field:** with `error="Required"`, it has `aria-invalid="true"`, and its `aria-describedby` element's text is `Required`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: editing bay form primitives`.

### Task 15: JoinFlow shell, step timeline, the cut to Editing Bay — TDD for behaviour

**Files:** create `src/components/join/{JoinFlow,StepTimeline}.tsx` and `src/lib/join/draft.ts`; modify `src/app/join/page.tsx`, replacing the ugly UI. Test: `tests/unit/join-flow.test.tsx`.

**Interfaces:**
- Consumes: `resolveStep`, `submitMember`, `SignIn`, `InAppInfo`.
- Produces:

```ts
type InviteClientResult = { status: 200; body: InviteOk } | { status: 401 | 403 | 404 | 429 | 0; error: string };  // 0 = network
type JoinFlowProps = {
  initial: { step: JoinStep; lane: Lane | null };
  user: { name: string | null; email: string } | null;
  member: MemberRow | null;
  inApp: InAppInfo; siteUrl: string;
  submitMember(input: unknown): Promise<SubmitResult>;
  fetchInvite?(): Promise<InviteClientResult>;   // default: POST /api/invite
};
type JoinDraft = Partial<{ lane: Lane; roleOtherText: string; displayName: string; instagram: string; city: string; tags: string[]; portfolioUrl: string; showOnWall: boolean }>;
useJoinDraft(): [JoinDraft, (patch: JoinDraft) => void, () => void]
// sessionStorage key 'ck:join-draft'; every access wrapped in try/catch
```

- `StepTimeline`: four `ClipBlock`s, `01 SIGN IN / 02 LANE / 03 DETAILS / 04 EXPORT`. The active one gets `aria-current="step"`. Clip 02 fills with `--lane` once a lane is chosen.
- URL sync uses `router.replace('?step=…&lane=…')`. Back and forward re-derive the step from the URL.
- An `aria-live="polite"` region announces `Step N of 4: <name>.`
- Lane flood: `data-lane` goes on the flow root.

- [ ] **Step 1: Write the failing tests,** mocking `next/navigation`:
  - With `initial lane`, the live region contains `Step 2 of 4`.
  - Choosing editor calls `router.replace` with `?step=details&lane=editor`.
  - The draft is persisted.
  - With `sessionStorage.setItem` stubbed to throw, the flow still advances.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: join flow shell, step timeline, url-reflected steps`.

### Task 16: LaneFrame + LanePicker — TDD for behaviour

**Files:** create `src/components/join/{LaneFrame,LanePicker}.tsx`. Test: `tests/unit/lane-picker.test.tsx`.

**Interfaces:**
- Produces: `<LaneFrame lane: Lane; mode: 'static' | 'radio'; selected?: boolean />`. It is a 9:16 film gate with crop marks, the lane label text, the room name and the §6.4 copy verbatim. Task 26 reuses it in `static` mode.
- Produces: `<LanePicker value: Lane | null; onCommit(lane: Lane, otherText?: string): void />`:
  - `role="radiogroup"`, `aria-label="Pick your lane"`, roving tabindex.
  - Arrow keys move focus and check the option. `Enter`, `Space` or `CONTINUE` commits.
  - `other` opens a slate input inside the expanded frame (mono, blinking block cursor, required, 2–60 characters).
- Motion:
  - The unchosen frames slide off at ±110vw over 420ms with `cubic-bezier(.76,0,.24,1)`.
  - The chosen frame FLIP-expands to the viewport (motion `layout`) over 520ms with `pan`, then the lane floods.
  - Under reduced motion, it's a 150ms opacity crossfade.

- [ ] **Step 1: Write the failing tests:**
  - There is one `radiogroup` with 3 `radio`s, named with `FRAME KOOTAM`, `CUT KOOTAM` and `SOMETHING ELSE`.
  - With focus on the first, `ArrowRight` focuses the second and sets `aria-checked=true`.
  - `Space` on CUT calls `onCommit('editor')`.
  - Choosing other with text `x` shows an error and doesn't commit. With `DOP` it calls `onCommit('other','DOP')`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Check visually at 390 and 1440, in both motion modes.
- [ ] **Step 5:** Close the task. Commit: `feat: lane picker radiogroup with selection cut`.

### Task 17: DetailsForm — TDD for behaviour

**Files:** create `src/components/join/DetailsForm.tsx`. Test: `tests/unit/details-form.test.tsx`.

**Interfaces:**
- Produces: `<DetailsForm lane: Lane; otherText?: string; user: { name: string | null }; draft: JoinDraft; onDraft(p): void; onSubmit(input: MemberInput): Promise<SubmitResult>; onDone(): void />`.
- The fields, labels and defaults are exactly those in the §7 step 3 table. It validates client-side with the same `memberInputSchema`.
- It shows a live `@handle` preview of the normalised handle.
- The Code link opens `/code` with `target="_blank"`.
- The submit button is disabled while pending, and server `fieldErrors` map onto the fields. Error copy comes from `design:ux-copy`.

- [ ] **Step 1: Write the failing tests:**
  - `displayName` is prefilled from `user.name`.
  - Submitting with The Code unchecked puts an error on the checkbox and doesn't call `onSubmit`.
  - The editor lane shows `davinci` and not `fashion`.
  - A double-click on submit calls `onSubmit` once.
  - `{ ok: true, alreadyMember: true }` calls `onDone`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: details form`.

### Task 18: Render bar, reveal, deliverable chips — TDD for behaviour

**Files:** create `src/lib/join/render-progress.ts` and `src/components/join/{RenderBar,Reveal,DeliverableChip}.tsx`. Test: `tests/unit/render-progress.test.ts`, `tests/unit/reveal.test.tsx`.

**Interfaces:**
- Produces: `useRenderProgress<T>(task: Promise<T> | null, opts?: { minMs?: number /* 600 */ }): { progress: number; frames: number; done: boolean; result?: T; error?: unknown }`. While pending, progress eases toward 0.9. It reaches 1 when the promise settles, and never before `minMs`.
- Produces `<RenderBar progress frames />`:
  - `RENDERING YOUR PASS ...` with a 20-cell text bar (`█`/`░`) in the lane color.
  - The percentage and a ticking `Timecode`.
  - `role="progressbar"` with `aria-valuenow`.
- Produces `<Reveal memberId lane links: InviteClientResult; returning: boolean />`:
  - A 1-frame (40ms) hard cut to ink.
  - `EXPORT COMPLETE.` in Anton, lane-colored, with `.halation-*` and Star flicks around it.
  - `t('youreIn')`: the Malayalam at half size in `--chalk`, plus the English line.
  - Two chips sliding in from the right, staggered 300ms (translateX).
- Produces `<DeliverableChip index: '01' | '02'; title; body; href: string | null; locked: boolean; laneTag?: string; onOpen(): void />`:
  - The `OPEN WHATSAPP` link uses `target="_blank" rel="noopener noreferrer"` and is at least 44px.
  - A copy button.
  - When locked: `aria-disabled`, no `href`, a lock glyph, and a `--rule` border.
- Sequencing:
  - Chip 02 unlocks once chip 01 is opened or copied. This is stored in `sessionStorage['ck:chip01']`, inside try/catch.
  - `returning` unlocks both.
  - `fetchInvite` runs only after `submitMember` resolves `ok`.
- `other` with `lane: null` shows the mint note: `We're building your room. For now you're in the main kootam — ${brand.founder.shortName} will reach out.`
- Error states, with copy via `design:ux-copy`:
  - 403: `Your pass is on hold. Message @thegowthamdas on Instagram.`
  - 429: `Too many tries. Wait ten minutes, then refresh.`
  - Network error: a `TRY AGAIN` button.
- The footer line comes verbatim from §7, with a copy fallback for each link.

- [ ] **Step 1: Write the failing tests,** with fake timers:
  - With a promise that resolves at 10ms, `done` is false at 300ms and true at 600ms.
  - Chip 02 starts with `aria-disabled="true"` and no `href`. Clicking chip 01's link gives chip 02 `href === lane URL`.
  - With `sessionStorage['ck:chip01'] = '1'` before mount, chip 02 is unlocked (Review Focus 3).
  - `other` with a null lane shows no chip 02, and the note contains `Gowtham`.
  - `fetchInvite` resolving to `{ status: 403 }` shows `Your pass is on hold`, and no progressbar remains (Review Focus 4).
  - The spy order shows `submitMember` before `fetchInvite`.
  - The copy button calls `navigator.clipboard.writeText(community URL)`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Check visually at 390, in both motion modes.
- [ ] **Step 5:** Close the task. Commit: `feat: render bar, reveal and locked deliverable chips`.

### Task 19: Member pass PNG (Malayalam spike first) — TDD for the data

**Files:** create `src/lib/pass/data.ts`, `src/app/api/pass/[id]/route.tsx`, `src/components/join/SavePassButton.tsx` and `src/assets/fonts/*.ttf` (Anton, Anek Malayalam SemiBold, Geist Mono, plus `OFL.txt`). Test: `tests/unit/pass-data.test.ts`.

**Interfaces:**
- Produces: `toPassData(row: MemberRow): { displayName: string; instagram: string; role: Lane; roomName: string; laneLabel: string; joined: string } | null`. It returns `null` unless `status === 'active'`, and never includes the email.
- Produces: `GET /api/pass/[id]`, a 1080×1920 PNG (9:16, story-ready) built with `ImageResponse`. It returns 404 for a non-uuid, an unknown member or an inactive one, and sets `Cache-Control: public, max-age=300`.
- Produces: `<SavePassButton memberId instagram />`. If `navigator.canShare({ files })` is true it uses the Web Share API with the PNG. Otherwise it falls back to `<a download="kootam-pass-<instagram>.png">`.

- [ ] **Step 1, spike:** render `കൂട്ടം`, `ക്രിയേറ്റേഴ്‌സ് കൂട്ടം` and `നിങ്ങൾ കൂട്ടത്തിലാണ്.` through `ImageResponse` with the Anek TTF. Compare that image side by side with a Chromium screenshot of the same strings, and record the verdict in the README.
  - If they match, use the text directly.
  - If they don't, write `scripts/render-ml-assets.mjs` (Playwright Chromium, transparent 2x PNGs into `public/brand/ml/<key>.png`) and use `<img>` in next/og. A display name containing `[ഀ-ൿ]` then falls back to `@instagram` on the pass.
- [ ] **Step 2: Write the failing tests:** `toPassData({ …row, status: 'removed' })` returns `null`; `Object.keys(toPassData(row)!)` doesn't contain `email`; and `roomName` is `CUT KOOTAM` for an editor.
- [ ] **Step 3:** FAIL. **Step 4:** Implement. **Step 5:** PASS. Add to `tests/deployed/`: `GET /api/pass/<own id>` returns 200 `image/png`, and a random UUID returns 404.
- [ ] **Step 6:** Close the task. Commit: `feat: shareable member pass`.

### Task 20: `/me` + change lane once (Phase 3 gate) — TDD

**Files:** create `src/lib/members/role-change.ts` and `src/app/me/actions.ts`; modify `src/app/me/page.tsx`. Test: `tests/unit/role-change.test.ts`.

**Interfaces:**
- Produces: `canChangeRole(m: Pick<MemberRow, 'role' | 'role_changes' | 'status'>, next: Lane): { ok: true } | { ok: false; reason: 'used' | 'inactive' | 'same' }`.
- Produces: `changeLane(input: { role: Lane; roleOtherText?: string }): Promise<{ ok: true } | { ok: false; reason: string }>`. It is a server action. It re-validates, then runs an update with `role_changes: 1`, `tags: []` and the guard `.eq('role_changes', 0)` (race-safe; the DB check backs it up).
- `/me` redirects to `/join` when signed out, and to `/join?step=lane` when there's no member row. Otherwise it shows:
  - a condensed reveal with both chips unlocked
  - the pass with `SavePassButton`
  - `CHANGE LANE`, while it is still available. The confirm copy says the old WhatsApp group isn't left automatically.

- [ ] **Step 1: Write the failing tests:**
  - `{ role_changes: 0, status: 'active', role: 'creator' }` to `editor` returns `ok`.
  - `role_changes: 1` returns `used`.
  - `flagged` returns `inactive`.
  - Changing to the same lane returns `same`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5, phase gate:** use `superpowers:verification-before-completion`. Deploy, then run `pnpm check`, `pnpm check:leaks` and `pnpm test:deployed`. Walk through the full flow on the deployed site with the test account: sign-in, lane, details, reveal, open chip 01, chip 02 unlocks, save pass, refresh lands on the reveal, `/me`.
- [ ] **Step 6:** Commit: `feat: /me with one-time lane change`.

---

## Phase 4: The scroll film (§6)

### Task 21: Motion infrastructure + texture — TDD for will-change

**Files:** create `src/lib/motion/{ease,will-change,reduced-motion}.ts`, `src/components/film/ScrollFilm.tsx` and `src/components/texture/{Grain,GateWeave}.tsx`. Test: `tests/unit/will-change.test.ts`, `tests/e2e/reduced-motion.spec.ts`.

**Interfaces:**
- Produces:
  - `EASE` (CSS strings `cut`, `pan` and `laneSelect`), and the matching `EASE_ARR` for motion.
  - `SETTLE = { type: 'spring', stiffness: 180, damping: 22 }`.
  - `registerGsapEases()`: `CustomEase.create('cut', '.85,0,.15,1')`, and the same for `pan`.
- Produces: `withWillChange<T extends gsap.core.Animation>(anim: T, targets: Element[], props: string): T`. It sets `will-change` on start and clears it on complete or interrupt.
- Produces: `usePrefersReducedMotion(): boolean`.
- Produces `<ScrollFilm>`, the client provider for `/`:
  - one `gsap.context()`
  - Lenis, unless reduced motion is on
  - `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))` and `lagSmoothing(0)`
  - cleanup on unmount
  - `useScrollFilm(): { scrollTo(id: SectionId): void }`

  GSAP and Lenis load only inside this provider, so `/join` never ships them.
- Produces `<Grain />`:
  - a fixed canvas, `pointer-events: none`, `mix-blend-mode: overlay`, opacity `0.045`
  - six 128×128 noise tiles generated once
  - a 12fps tick that fills with `createPattern(tile[i])` at a random offset
  - DPR capped at 1, paused while `document.hidden`
  - not rendered under reduced motion
- Produces `<GateWeave>`, which wraps `<main>`. Every random 4–7s it runs a WAAPI `translateX(±0.3–0.6px)` over 120ms and back. It is off under reduced motion.

- [ ] **Step 1: Write the failing tests:**
  - **Unit (gsap in jsdom):** after `play()`, `el.style.willChange === 'transform'`, and after completion it is `''`.
  - **e2e, default:** `canvas[data-grain]` exists with computed `pointer-events: none`.
  - **e2e, `emulateMedia({ reducedMotion: 'reduce' })`:** no `canvas[data-grain]`, and after 2s `document.getAnimations().length === 0`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: motion infrastructure, grain, gate weave`.

### Task 22: Timeline scrubber — TDD

**Files:** create `src/lib/film/scrub.ts` and `src/components/film/Scrubber.tsx`. Test: `tests/unit/scrub.test.ts`, `tests/e2e/scrubber.spec.ts`.

**Interfaces:**
- Consumes: `SECTIONS` and `SectionId` (from Task 4), and `useScrollFilm` (from Task 21).
- Produces: `clipFractions(lengths: number[], min = 0.06): number[]` (the fractions sum to 1, and each is at least `min`) and `activeIndex(scrollY: number, tops: number[]): number`.
- Produces `<Scrubber />`:
  - `<nav aria-label="Section navigation">` containing one `<button aria-current>` per clip, named `"{n} {label}"`.
  - A 2px rosso playhead driven by `translateX` from the ScrollTrigger progress.
  - On hover, the section's start timecode: `formatTimecode(round(top / innerHeight * 25))`.
  - Clicking a clip calls `scrollTo`.
  - At ≥ 768px it's 56px tall, `--carbon`, with a `--rule` top border and `backdrop-filter: blur(12px)`.
  - Below 768px it's a 3px hairline (`scaleX`) plus `[data-scrub-current]` showing the label.

- [ ] **Step 1: Write the failing tests:**
  - `clipFractions([100, 100, 200])` gives `[.25, .25, .5]`.
  - `clipFractions([1000, 10])` gives a second value of at least 0.06 and a sum within 1e-9 of 1.
  - `activeIndex(0, [0, 800, 1600])` is 0, `activeIndex(850, …)` is 1, and `activeIndex(5000, …)` is 2.
  - **e2e at 1440:** Tab to `04 THE CODE`, press Enter, wait 1s. `#the-code`'s top is within ±2px of 0, and the button has `aria-current="true"`.
  - **e2e at 390:** the clip buttons are hidden, and `[data-scrub-current]` reads `COLD OPEN`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: timeline scrubber navigation`.

### Task 23: Cold open preloader

**Files:** create `src/components/film/ColdOpen.tsx`; modify `src/app/layout.tsx` to add an inline head script. Test: `tests/e2e/cold-open.spec.ts`.

**Interfaces:**
- The inline script runs before paint. It adds `js` to `<html>`. It adds `no-cold-open` if `sessionStorage['ck:cold-open']` is set, if reduced motion is on, or if storage throws. CSS then hides `[data-cold-open]` under `.no-cold-open`.
- `<ColdOpen />` renders only on `/`, is fixed, and sits outside `<main>` with `aria-hidden`:
  - It shows SlateStripes, and the slate lines are typed out verbatim from §6.0, using `brand.founder.slateName` and the ml wordmark.
  - The `Timecode` runs from 0 to 37 frames.
  - The arm snaps shut over 90ms with `cut`. A 40ms chalk flash at 8% follows.
  - The two halves translate out to become the top and bottom letterbox bars.
  - A hard-cap `setTimeout(1600)` force-removes it. When it finishes it sets `ck:cold-open`.
  - The hero is server-rendered underneath the whole time.

- [ ] **Step 1: Write the failing e2e tests:**
  - On a first visit, `[data-cold-open]` is visible and is hidden by 1700ms.
  - Reloading in the same context, it's never visible.
  - With reduced motion, it's never visible.
  - The `layout-shift` entries (`PerformanceObserver`, buffered) sum to `0`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Close the task. Commit: `feat: cold open slate preloader`.

### Task 24: Hero, reel cards, CTAs, member odometer — TDD for the queries

**Files:** create `src/lib/wall/queries.ts` and `src/components/film/{Hero,ReelCards}.tsx`. Test: `tests/unit/wall-queries.test.ts`, plus additions to `tests/e2e/landing.spec.ts`.

**Interfaces:**
- Produces: `type MemberCounts = { total: number; creators: number; editors: number; other: number }` and `getMemberCounts(): Promise<MemberCounts | null>`, an anon RPC. It returns `null` when the Supabase env is missing or the call errors.
- Produces: `getMemberWall(limit = 200): Promise<WallMember[] | null>`, where `WallMember = { displayName: string; instagram: string; role: Lane; createdAt: string; isNew: boolean }`. `isNew` means under 24h old.
- `/` exports `revalidate = 60`.
- The hero `h1` is three lines of words. Each word is a `[data-wipe]` from `clip-path: inset(0 0 100% 0)` to `inset(0)`, staggered 55ms with `pan`. The hidden state applies only under `html.js` and not under reduced motion.
- The hero sub copy is verbatim. The CTAs are `TAKE YOUR PLACE`, a `poster` Button linking to `/join`, and `READ THE CODE`, a `ghost` Button linking to `/code`. Bottom-left is an `Odometer` showing `total`, omitted when the count is `null`.
- `ReelCards`: three 9:16 panels, lane-colored with crop marks until the stills arrive (an `[ASK]` item; no stock photos).
  - Parallax via ScrollTrigger scrub at rates 0.6, 1.0 and 1.4.
  - `saturate(.35)` with an ink vignette.
  - Only with `(pointer: fine)`, the nearest card goes to `saturate(1)` with `.halation-rosso`.

- [ ] **Step 1: Write the failing tests,** with the Supabase client mocked:
  - With no URL env, the result is `null`.
  - With an RPC error, the result is `null`.
  - An RPC row maps to numbers.
  - **e2e, no Supabase:** the `h1` text is `WE'D RATHER SHOW THAN TELL.`, there's no odometer, and the console has no errors (Review Focus 5).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Check visually at 390, 1440 and 1920.
- [ ] **Step 5:** Close the task. Commit: `feat: hero, reel cards, live member odometer`.

### Task 25: Section title cards + THE ROOM

**Files:** create `src/components/film/{SectionCard,TheRoom}.tsx`. Test: additions to `tests/e2e/landing.spec.ts`.

**Interfaces:**
- Produces: `<SectionCard n: string; label: string />`. It's an absolute overlay inside its section that fires once when the section's top passes 70%:
  - a rosso panel moving `translateX(-100%→0)` over 300ms with `pan`
  - a 350ms hold
  - `translateY(0→-100%)` over 300ms with `cut`
  - It shows `02 — THE ROOM` in Anton, and isn't rendered under reduced motion.
- Every later section (Tasks 26 and 27) opens with a `SectionCard` too ("every section gets this treatment", §6.3).
- `TheRoom`: the four lines and the closer, verbatim from §6.3, set in Archivo at subhead size. The lines alternate `--chalk` and `--rosso`; the subhead minimum of 20px bold passes 3:1. Each line reveals with `translateY(16px)` and opacity, using `pan`.

- [ ] **Step 1:** Write the e2e test: with reduced motion, `#the-room` contains `So we made a room.` and there's no `[data-section-card]` in the DOM.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Screenshots at 390 and 1440, mid-cut and at the end state.
- [ ] **Step 5:** Close the task. Commit: `feat: section title-card cuts, the room`.

### Task 26: WHO'S INSIDE, THE CODE teaser, styled `/code`

**Files:** create `src/components/film/{WhosInside,CodeTeaser}.tsx`; modify `src/app/code/page.tsx`. Test: additions to `tests/e2e/landing.spec.ts`.

**Interfaces:**
- Consumes: `LaneFrame` in `static` mode, and `CODE_ARTICLES`.
- `WhosInside`:
  - Two `LaneFrame`s, side by side at ≥ 768px and stacked below that.
  - Only with `(pointer: fine)`: a 3D tilt of at most 4° that follows the pointer (`settle`), a rack focus from `blur(3px)` to `blur(0)` over 180ms, the border going from `--rule` to `--lane`, and a frame-local grain pseudo-element whose opacity doubles from .045 to .09.
  - Below the frames, the mint OTHER slate card with the §6.4 copy verbatim.
- `CodeTeaser`: articles 01–03 with `Star` bullets, and `READ ALL SEVEN →` linking to `/code`.
- `/code`:
  - Anton numerals in `--rosso` at `clamp(6rem, 22vw, 11.25rem)` (180px at desktop) and Archivo body.
  - The `t('codeEyebrow')` eyebrow and `t('codeFooter')` foot line, falling back to English.
  - Its own `<title>`, `The Code`.

- [ ] **Step 1:** Write the e2e tests:
  - `/code` has seven `[data-article]` elements, and article 01 reads `Credit the editor. Every time. In the caption, not the comments.`
  - The teaser link resolves to `/code`.
  - At 390, `#whos-inside` has no horizontal overflow (`scrollWidth <= clientWidth`).
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Check visually.
- [ ] **Step 5:** Close the task. Commit: `feat: lanes, code teaser, the code page`.

### Task 27: INSIDE, ROLL CALL, JOIN gate, END CREDITS, marquee (Phase 4 gate) — TDD for roll-call states

**Files:** create `src/components/film/{Inside,RollCall,JoinGate,EndCredits,Marquee}.tsx`; modify `src/config/brand.ts` (`siteBy`, `contact`). Test: `tests/unit/roll-call.test.tsx`, plus additions to `tests/e2e/landing.spec.ts`.

**Interfaces:**
- Each section here opens with a `SectionCard`.
- Produces: `<RollCall wall: WallMember[] | null; counts: MemberCounts | null />`, with three states:
  - **Populated:** chips showing the display name, a 3px lane edge, the mono `@instagram`, and a pulsing `Star` (static under reduced motion) when `isNew`. The counts line is `MEMBERS 000147  CREATORS 000089  EDITORS 000051  OTHER 000007` as `Odometer`s.
  - **Empty** (`total === 0`), exactly: `ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.`
  - **Unreachable** (`null`): `ROLL CALL — signal lost. Refresh in a minute.`, refined with `design:ux-copy`.
- `Inside`: four `ClipBlock`s on stacked tracks, with the §6.6 names and copy. They trim in with `scaleX(0 → 1.04 → 1)` from the left over 500ms, and then the label fades in.
- `JoinGate`: full-bleed `--rosso`, with Anton `TAKE / YOUR / PLACE.` and one `ink` Button linking to `/join`. The mono line `GOOGLE SIGN-IN · 30 SECONDS · NO SPAM, EVER` sits on an ink band.
- `EndCredits`: the §6.9 credit block filled from `brand`, plus the Instagram link, contact and `/code` link. On entering view it drifts upward with `translateY`.
- `Marquee`: a `--rosso` band reading `KOOTAM ★ KOOTAM ★ …` with mustard `Star`s.
  - The track is duplicated and animated with CSS `translateX(0 → -50%)` over 40s, linear and infinite, with `will-change: transform`.
  - It pauses on hover and under reduced motion.
  - The visual track is `aria-hidden`, with visually hidden text `Kootam`.

- [ ] **Step 1: Write the failing tests:**
  - **Unit:** `counts.total === 0` renders the empty copy verbatim. `null` renders `signal lost`. A wall member renders `@the.gowtham_das` and no email.
  - **e2e, no Supabase:** `#roll-call` shows `signal lost`; `#join` contains `TAKE YOUR PLACE.`; the footer contains `GOWTHAM DAS THEKKINKATTIL`; and with reduced motion, `getAnimations()` is empty.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. Ask the user for the `SITE BY` name and contact, or leave them `null`; `check:launch` flags them. **Step 4:** PASS.
- [ ] **Step 5, phase gate:** use `superpowers:verification-before-completion`. Run `pnpm check`, `pnpm test:e2e` and `pnpm check:leaks`. Deploy, then take screenshots of every section at 390, 1440 and 1920, with reduced motion both on and off.
- [ ] **Step 6:** Commit: `feat: inside, roll call, join gate, end credits, marquee`.

---

## Phase 5: Polish & ship

### Task 28: `/admin` — TDD

**Files:** create `src/lib/auth/admin.ts`, `src/lib/csv.ts`, `src/app/admin/{page,actions}.tsx` and `src/app/admin/export/route.ts`; modify `src/components/admin/MembersTable.tsx`. Test: `tests/unit/admin.test.ts`, `tests/unit/csv.test.ts`.

**Interfaces:**
- Produces:

```ts
isAdminEmail(email: string | null | undefined, allow: string[]): boolean   // trim + lowercase
requireAdmin(): Promise<SessionUser>        // otherwise notFound(), so the page's existence isn't revealed
toCsv(rows: Record<string, unknown>[], columns: string[]): string
// RFC 4180; a cell starting with = + - @ \t \r gets a ' prefix (formula injection)
type AdminQuery = { lane: Lane | 'all'; q: string; sort: 'new' | 'old'; view: 'all' | 'other' };
parseAdminQuery(sp: Record<string, string | string[] | undefined>): AdminQuery
setMemberStatusCore(deps: { requireAdmin(): Promise<unknown>; update(id: string, status: MemberRow['status']): Promise<void> }, id: string, status: MemberRow['status']): Promise<{ ok: boolean }>
```

- The `setMemberStatus` server action wraps the core function. Server actions are public endpoints, so the action checks admin itself.
- The page shows lane counts as `Odometer`s and has two tabs: `ALL`, and `OTHER QUEUE` (with `role_other_text` prominent, newest first). It has a lane filter and a search over name and handle (`ilike`, with `%` and `_` escaped). The table has the §9 columns, plus Flag, Remove and Restore buttons. Export links to `/admin/export?…`, which also checks admin.

- [ ] **Step 1: Write the failing tests:**
  - `isAdminEmail(' Foo@X.com ', ['foo@x.com'])` is true, and `null` is false.
  - `toCsv([{ a: 'x,"y"\nz' }], ['a'])` gives `'a\r\n"x,""y""\nz"'`.
  - `=HYPERLINK("u")` becomes `"'=HYPERLINK(""u"")"`.
  - When `requireAdmin` rejects, `setMemberStatusCore` rejects and `update` is never called.
  - `parseAdminQuery({})` returns `{ lane: 'all', q: '', sort: 'new', view: 'all' }`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Add to `tests/deployed/`: the creator's storage state gets a 404 from `/admin`.
- [ ] **Step 5:** Close the task. Commit: `feat: admin table, other queue, csv export, flag/remove`.

### Task 29: OG images, metadata, sitemap

**Files:** create `src/lib/og/poster.tsx`, `src/app/opengraph-image.tsx`, `src/app/code/opengraph-image.tsx`, `src/app/icon.tsx` and `src/app/apple-icon.tsx`; modify the metadata in `layout.tsx` and `code/page.tsx`. Test: `tests/e2e/seo.spec.ts`.

The brief puts the Wordmark in the favicon (§4.0). The stacked wordmark is unreadable at 32px, so `icon.tsx` (32×32) uses only `കൂ` or the mustard Star on ink, while `apple-icon.tsx` (180×180) carries the full stack. Check both by eye.

**Interfaces:**
- Produces: `<OgPoster title: string; kicker?: string; lane?: Lane />`, a 1200×630 poster: ink field, an Anton title, mustard stars, a lane-colored rule, and the wordmark (using Task 19's Malayalam approach).
- Metadata: `openGraph: { locale: 'en_IN', siteName: brand.name, type: 'website' }` and `twitter: { card: 'summary_large_image' }`.

- [ ] **Step 1:** Write the e2e tests:
  - `/opengraph-image` and `/code/opengraph-image` return 200 with `image/png`.
  - `/` has `meta[property="og:locale"][content="en_IN"]`, `og:image` and `twitter:card`.
  - `/code` has its own `og:image`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS, and check both PNGs by eye.
- [ ] **Step 5:** Close the task. Commit: `feat: poster og images and share metadata`.

### Task 30: Accessibility, reduced motion, keyboard, performance

**Files:** create `tests/e2e/a11y.spec.ts`, plus fixes wherever needed. Save reports to `docs/launch/`.

- [ ] **Step 1:** Write `a11y.spec.ts`. `@axe-core/playwright` with tags `wcag2a` and `wcag2aa` must report 0 violations on `/`, `/code` and signed-out `/join`, in both default and reduced-motion modes. Add a keyboard walk: Tab from the top of `/` reaches the scrubber clips and both CTAs, and every focused element has a visible outline (screenshot check).
- [ ] **Step 2:** Run it and fix until it passes. Run the `design:accessibility-review` skill over the join screens (lane, details, reveal), and fix what it finds.
- [ ] **Step 3:** Reduced-motion walkthrough: screenshots of every section and every join step at 390 and 1440. Check for "still beautiful" and nothing broken.
- [ ] **Step 4:** Lighthouse: `pnpm dlx lighthouse <prod-url> --form-factor=mobile --only-categories=performance,accessibility --output=html --output-path=docs/launch/lighthouse-mobile.html`. Expect performance ≥ 90 and accessibility ≥ 95. If it falls short, the levers in order are:
  1. preload only Anton, Geist Sans and Anek
  2. start the grain after `requestIdleCallback`
  3. lazy-load reel stills with `next/image` `sizes`
  4. defer Lenis until first scroll
- [ ] **Step 5:** Real devices (the user does this): the full flow in Chrome on a mid-range Android, and the same link opened from Instagram's in-app browser, where the exit must work. Also open DevTools' Network tab on the creator account's `/api/invite` response and confirm there's no editors URL (§14). Record the results in the README.
- [ ] **Step 6:** Close the task. Commit: `fix: accessibility, motion and performance pass`.

### Task 31: README, launch check, Definition of Done — TDD for the launch check

**Files:** create `scripts/check-launch.mjs`; modify `README.md`. Test: `tests/unit/check-launch.test.ts`.

**Interfaces:**
- Produces: `findLaunchBlockers(input: { ml: typeof ML; articles: typeof CODE_ARTICLES; brand: typeof brand; env: Record<string, string | undefined>; stillsReady: boolean }): string[]`. It reports:
  - every unconfirmed ml key
  - every draft article
  - `siteBy` or `contact` still null
  - any `WA_*` containing `PENDING`
  - placeholder reel stills

- [ ] **Step 1: Write the failing tests:** the shipped config gives a list that includes `ml:wordmark` and `code:04`. A fully confirmed fixture gives `[]`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Write the README. It covers:
  - what the product is
  - the stack
  - local setup (`.env.local` from `.env.example`, `supabase link` and `db push`)
  - the scripts
  - the WhatsApp model: why the site can't add people to groups, the 2,000-member and 100-linked-group limits, and why "groups, not Channels"
  - the server-only link rule
  - deploying
  - domain availability for `creatorskootam.com` and `.in`, using `whois` with the check date
  - the **[ASK GOUTHAM] checklist**, from `pnpm check:launch` plus the non-code asks
  - skill gaps (`theme-factory` wasn't needed, because §4 fully specifies the tokens)
  - the Malayalam spike result
- [ ] **Step 6:** Remove the test accounts from production with SQL (they aren't real members). Run `pnpm check:launch`; its output goes to the README checklist.
- [ ] **Step 7, final gate:** use `superpowers:verification-before-completion`. Check each §14 line with real output: `pnpm build` (0 TS and ESLint errors); `pnpm test`, `pnpm test:e2e`, `pnpm check:leaks` and `pnpm test:deployed`; the Lighthouse report; the real-phone notes; the reduced-motion and keyboard walkthroughs; `pnpm check:bans` plus `git grep -niE 'styrene|tiempos'`; `.env.example` complete; and `git log -p | grep -E 'sb_secret_|service_role|chat\.whatsapp\.com/[A-Za-z0-9]{10,}'` finding nothing. Report every line with its evidence.
- [ ] **Step 8:** Commit: `docs: readme, launch checklist, definition of done`.
