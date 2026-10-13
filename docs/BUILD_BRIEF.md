# BUILD BRIEF — CREATORS KOOTAM

**For: Claude Code (Opus 5.5)**
**Client: Gowtham Das Thekkinkattil (@thegowthamdas) — Kerala**
**Product: Creators Kootam — a WhatsApp community for Kerala's content creators and video editors**
**Status: Official client project. Not a demo, not a sketch. Ship-quality.**

---

## 0 — OPERATING PROTOCOL (read before anything else)

1. **Do not start coding.** First load `superpowers:writing-plans` and produce a written implementation plan against this brief. The discovery/brainstorm phase is already done — this document *is* the output of it. Do not re-run `superpowers:brainstorming`; do not ask me to re-specify what is already specified below.
2. Build in the phases in **§14**. Do not jump ahead. Phase 1 must render and deploy before Phase 2 begins.
3. Use `superpowers:test-driven-development` for everything in **§8** (auth, role routing, invite-link gating). The visual layer does not need TDD; the data and auth layer absolutely does.
4. Before you claim any phase is complete, run `superpowers:verification-before-completion`. "It should work" is not a completion signal. Run the build, run the tests, show the output.
5. If something in this brief is technically wrong or a worse idea than an alternative you can see — **say so and argue the case before implementing**. Do not silently substitute. Do not silently comply with something you think is bad.
6. Anything marked **[ASK GOUTHAM]** is a human input you cannot invent. Stub it, flag it in the README, keep building.

---

## 1 — WHO THIS IS FOR

Gowtham Das Thekkinkattil runs `@thegowthamdas` — ~8.5k followers, Kerala.

His bio, verbatim:

> I style fits. I fix rooms. I edit frames. 🎬
> Fashion | Editor | Outfits | Kerala
> moments i'd rather show than tell —

**What he actually makes**, from his grid:

- Reels-first. Vertical video is his native format. Nearly every recent post is a reel.
- **Talking-head commentary on creator culture**, shot in his room against a wall of film posters. One pinned reel: *"Content creation ✗ / content stealing ✓"*. Another: *"Nowadays what feed looks like:"*. He has opinions about credit, originality, and theft in the creator economy. **This is the emotional core of the whole community and the site must carry it.**
- **Character comedy and transformation bits** — prosthetics, makeup, costume, VFX. He plays characters.
- **Fashion / fit checks** — black-and-white mirror selfies in clothing stores, outfit content.
- **Interiors** — "I fix rooms." Soft, color-graded spaces (a mint-green bookstore shot stands out).
- **Short films** — pinned highlights read `short film 🍿`, `Sarvam Maya 🎥`, `naam thanne!!`.
- **Poster design** — his standout graphic is a hand-built retro motorsport-style poster: saturated red field, mustard-yellow five-point stars, a big numeral, condensed display type, his handle set as a credit line.

**Read him as:** a one-man production house. Stylist, editor, director, designer, performer. Someone who thinks editors deserve their name in the credits.

**Why he's building this:** to put Kerala's content creators and video editors into one room, with the creators and the editors each also getting a room of their own.

---

## 2 — NON-NEGOTIABLE CONSTRAINTS

### 2.1 — THE AESTHETIC BAN (most important rule in this document)

This site must carry **zero** trace of default-assistant visual language. Specifically, the following are **forbidden anywhere in the output**:

**Banned colors** — do not use these hexes or anything within ~8% of them:

```
#CC785C  #D97757  #DA7756  #D4A27F  #EBDBBC   ← terracotta / coral / kraft / manilla
#F0EEE6  #FAF9F5  #F5F4EF  #BFB8AC             ← warm cream / ivory page backgrounds
```

No warm beige or cream page background of any kind. The base of this site is **ink black**.

**Banned typography:** Styrene, Tiempos, or any serif-body + warm-sans-display pairing that reads as assistant-default. Inter as a *display* face is also banned (it is permitted nowhere larger than 18px, and even then prefer the stack in §4.2).

**Banned layout clichés** — the "AI-generated landing page" look:

- purple→blue gradient hero, glassmorphism cards, floating blurred orbs
- uniform `rounded-2xl` cards on a light background with soft drop shadows
- a 3-column "✨ Features" grid with emoji bullets
- default shadcn/ui components shipped unmodified
- centered-everything with generous neutral whitespace and nothing else

**Banned skills** — do not load these, under any circumstance:

| Skill | Why |
|---|---|
| `anthropic-skills:brand-guidelines` | Its entire purpose is applying Anthropic's palette and type. Loading it would destroy this brief. |
| `anthropic-skills:web-artifacts-builder` | Artifact-scoped; drags in shadcn/Tailwind defaults. We are building a real Next.js app. |
| `artifact-design`, `artifact-diagramming`, `artifact-capabilities` | Artifact-scoped. Irrelevant. |
| `anthropic-skills:canvas-design`, `anthropic-skills:algorithmic-art` | Not applicable. |

**Self-check before every commit:** grep the diff. If it contains any banned hex, `Styrene`, `Tiempos`, or the string `Claude` in any user-facing surface — revert it.

### 2.2 — THE WHATSAPP REALITY CHECK

The client's mental model is "the site adds them to the community and the right channel automatically." **It cannot.** Build what is actually possible, and make it feel better than what he imagined.

Verified constraints:

- The official **WhatsApp Cloud API cannot add a participant to a group.** There is no add endpoint. It can only read/reset an invite link and approve inbound join requests.
- Cloud API groups are capped at **8 participants** — useless for a community.
- Doing it anyway requires an unofficial library driving a logged-in personal account. That is a **ban risk on Goutham's own number**. Do not propose it, do not build it.
- A **WhatsApp Community** = 1 announcement group + up to **100 linked groups**, **2,000 members total** across the whole community.

**Therefore the join mechanic is: role-gated invite links, served from the server.**

The user signs in with Google → declares their role → we write their row → we reveal **two** links: the Community link, then their role-group link. Two taps, clearly sequenced, visually framed as a hand-off. This is honest, it works today, and §7 makes it the best-feeling moment on the site.

**Security rule, non-negotiable:** the WhatsApp URLs must **never** appear in the client bundle, in `NEXT_PUBLIC_*` env vars, in static props, or in any page source. They are returned only by an authenticated server route after the member row exists. Otherwise the links leak via view-source and the community gets raided.

### 2.3 — "CHANNELS" vs GROUPS **[ASK GOUTHAM]**

He said "channels." WhatsApp has two different things:

- **Channels** (Updates tab) — one-way broadcast. Nobody can reply. Wrong for a working community.
- **Communities + linked groups** — two-way. Members talk to each other. **This is what he wants.**

Ask him to create, and send you the invite links for:

1. The **Community — "Creators Kootam"** (this auto-creates the Announcements group — everyone lands here)
2. Linked group: **"Frame Kootam"** (creators)
3. Linked group: **"Cut Kootam"** (editors)

Note the 2,000-member ceiling in the README so he isn't surprised at scale.

---

## 3 — SKILLS PROTOCOL

**Load these, at these moments:**

| When | Skill |
|---|---|
| Before writing any code | `superpowers:writing-plans` |
| Auth, role routing, invite gating | `superpowers:test-driven-development` |
| Before declaring any phase done | `superpowers:verification-before-completion` |
| While writing the token layer (§4) | `design:design-system` |
| While writing microcopy, errors, empty states | `design:ux-copy` |
| Phase 5, before launch | `design:accessibility-review` |
| Only to *generate a bespoke theme* from §4 values | `anthropic-skills:theme-factory` — generate on-the-fly, never use a preset |

If a skill above is not available in your environment, **do not fetch arbitrary code from the internet to get it.** §4 and §10 are written to be self-sufficient without any skill. Proceed and note the gap in the README.

---

## 4 — BRAND SYSTEM: "POSTER × EDITING BAY"

### 4.0 — THE NAME

**CREATORS KOOTAM.**

*Kootam* (കൂട്ടം) is Malayalam for a group, a gathering, a crowd that showed up together. It is not a brand word — it's a word people actually say. That is the whole tone of this product in one noun, and it means **the brand is bilingual by birth, not by decoration.**

Consequences you must carry through the entire build:

- The wordmark is **two scripts stacked**: `CREATORS` in Anton, `കൂട്ടം` in Anek Malayalam directly beneath it, optically size-matched so the Malayalam reads as the same weight — not as a subtitle. Build this as one `<Wordmark/>` component with `size` and `lane` props; it appears in the preloader slate, the footer, every OG image, the member pass, and the favicon.
- **[ASK GOUTHAM] — confirm the Malayalam spelling before it ships anywhere.** Use `ക്രിയേറ്റേഴ്‌സ് കൂട്ടം` as the working string, but a native speaker signs off on the final orthography. Getting his own language wrong on his own project is the one mistake that cannot be recovered from. Do not ship unconfirmed Malayalam.
- The three rooms get real names, and these names are used everywhere — the WhatsApp groups, the lane cards, the reveal chips, the admin table:

| Room | Name | Lane color |
|---|---|---|
| Community (announcements, everyone) | **CREATORS KOOTAM** | `--rosso` |
| Creators' room | **FRAME KOOTAM** — the people who shoot it | `--rosso` |
| Editors' room | **CUT KOOTAM** — the people who cut it | `--lumen` |
| Other / everyone else | routed to the community, flagged for Goutham | `--mint` |

- "Kootam" is short, chant-able, and repeats well. Use the repetition: the footer marquee becomes `KOOTAM ★ KOOTAM ★ KOOTAM ★`, and the join confirmation is simply **`നിങ്ങൾ കൂട്ടത്തിലാണ്.`** / *"You're in the kootam."* — again, **[ASK GOUTHAM]** confirms the Malayalam.
- Suggest `creatorskootam.com` / `.in` to the client, and note in the README whether it's free at build time.

---

Two visual languages, deliberately split by audience.

- **Poster** — his red/mustard motorsport-poster energy. Loud, printed, physical. Owns the **public pages**: landing, The Code, credits.
- **Editing Bay** — a dark NLE workspace. Timelines, timecode, keyframes, scrub handles. Owns the **functional pages**: role picker, join sequence, member area, admin.

The cut between them is a feature. You scroll through a poster, and when it's time to *do* something, the site cuts to the edit suite.

### 4.1 — Tokens

Define once as CSS custom properties on `:root`. Every color in the app resolves through a token. No raw hex in components.

```css
:root {
  /* base — ink, never cream */
  --ink:        #0A0A0B;   /* page base */
  --carbon:     #121215;   /* raised panel */
  --graphite:   #1E1E24;   /* card, input field */
  --rule:       #2E2E37;   /* 1px borders, timeline grid */

  /* type */
  --chalk:      #F2F3F0;   /* primary text on ink — neutral, NOT warm */
  --chalk-dim:  #9B9BA3;   /* secondary */
  --chalk-mute: #62626B;   /* tertiary, timecode */

  /* POSTER accents */
  --rosso:      #E4261C;   /* primary. the poster red. */
  --rosso-deep: #9E1009;   /* pressed / shadow */
  --mustard:    #F2B705;   /* the five-point stars */

  /* EDITING BAY accents — lane colors */
  --lumen:      #C6F24E;   /* EDITOR lane. acid lime = selected clip */
  --mint:       #7FD4B8;   /* OTHER lane. from his bookstore frame. */
  /* CREATOR lane uses --rosso */

  --focus:      #7FD4B8;   /* focus ring — must hit 3:1 on --ink */
}
```

**Lane color is a hard rule and it runs through the entire product:**

| Lane | Color | Where it shows |
|---|---|---|
| Creator | `--rosso` | role card, timeline clip, success screen, admin row, member badge |
| Editor | `--lumen` | same |
| Other | `--mint` | same |

Light mode: **do not build one.** This site is dark, always. Set `color-scheme: dark`, ship a correct `<meta name="theme-color" content="#0A0A0B">`, and make sure nothing flashes white on load.

### 4.2 — Type

```
Display / poster  →  Anton            (Google) — uppercase, tracking -0.02em, line-height 0.86
Subhead           →  Archivo          (Google, variable) — weight 700, width 112
Body / UI         →  Geist Sans       (npm: geist)
Timecode / labels →  Geist Mono       — uppercase, tracking +0.14em, 11–13px
Malayalam         →  Anek Malayalam   (Google)
```

Load via `next/font` with `display: 'swap'` and subsetting. Self-host — no render-blocking font CDN.

**Malayalam is load-bearing here, not decoration** — the brand name is half Malayalam (§4.0). Anek Malayalam must be treated as a first-class face: proper weight axis, correct line-height (Malayalam needs more leading than Latin — start at 1.5 and tune by eye), and never squeezed to match a Latin cap-height it doesn't share.

Use it at: the wordmark, the preloader slate, section eyebrows on The Code, the join confirmation, the footer sign-off, the member pass.

**[ASK GOUTHAM] for every Malayalam string.** Do not machine-translate and ship. Hold them in one `i18n/ml.ts` module with English fallbacks so he can correct all of them in a single file without touching components.

Scale (fluid, `clamp()`):

```
hero      clamp(3.5rem, 13vw, 11rem)     Anton
title     clamp(2.25rem, 7vw, 5.5rem)    Anton
subhead   clamp(1.25rem, 2.6vw, 2rem)    Archivo 700
body      clamp(1rem, 1.05vw, 1.125rem)  Geist Sans
label     0.75rem                        Geist Mono, uppercase, +0.14em
```

### 4.3 — Texture

Three layers that make it feel printed and shot, not generated:

1. **Film grain** — a `<canvas>` overlay, full-viewport, `position: fixed`, `pointer-events: none`, `mix-blend-mode: overlay`, opacity `0.045`. Regenerate the noise field at ~12fps, not 60 — real grain is chunky, and this saves the frame budget. Kill it entirely under `prefers-reduced-motion`.
2. **Gate weave** — every 4–7s, translate the whole page wrapper by 0.3–0.6px on X over 120ms and back. Imperceptible individually; collectively it makes the page feel like it's running through a projector.
3. **Halation** — on `--rosso` and `--mustard` elements over 48px, a soft `filter: drop-shadow(0 0 28px color-mix(in oklab, var(--rosso) 35%, transparent))`. Red should feel like it's burning slightly into the black.

### 4.4 — Motifs

Build these as reusable components. They are the visual vocabulary:

- **Five-point star** (`<Star/>`) — mustard, from his poster. Used as separator, bullet, loading indicator, cursor accent.
- **Corner crop marks** — thin `--rule` L-brackets at the corners of cards and frames. Print registration marks.
- **Clip block** — a rounded-left rectangle with a lane-colored 3px left edge and a mono label. The timeline's atom.
- **Slate stripes** — diagonal black/white clapperboard hatching, used on the preloader and section dividers.
- **Timecode** (`<Timecode/>`) — `HH:MM:SS:FF` in Geist Mono, used for scroll position, member count, timestamps.

---

## 5 — ROUTES

```
/                   The scroll film (§6)
/code               "The Code" — the community charter. Public, shareable, its own OG image.
/join               Auth gate → role picker → details → reveal (§7)
/auth/callback      Supabase OAuth handler
/me                 Returning member: their card, their links again, change role once
/admin              Signups table, lane filters, CSV export, flag/remove (admin allowlist only)
/api/invite         POST. Authenticated. Returns the two URLs for the caller's lane.
/api/me             GET. Current member row.
/opengraph-image    Dynamic poster-style OG via next/og
```

---

## 6 — THE SCROLL FILM (the landing page)

Eight sections. Treat it as a **cut sequence**, not a stack of marketing blocks. Each has a name, because each name appears as a clip on the timeline scrubber (§6.2).

### 6.0 — COLD OPEN (preloader)

First visit only — gate with `sessionStorage`.

Full-bleed ink. A clapperboard slate centered, slate-stripe top bar. Mono text types out:

```
PROD.    CREATORS കൂട്ടം
DIR.     GOWTHAM DAS
SCENE    01    TAKE 01
ROLL     KERALA / 2026
```

(Yes — the Malayalam sits inside the slate, in the same mono-ish weight. The first thing anyone sees should tell them where they are.)

Timecode counts `00:00:00:00 → 00:00:01:12`. The slate arm **snaps shut** (a hard 90ms rotation, no easing-out — it should feel like a *clack*). On impact: a 1-frame white flash at 8% opacity, the two slate halves fly apart to become the top and bottom **letterbox bars**, and the hero is already underneath, mid-reveal.

Hard cap: **1.6s**. If fonts/data aren't ready, the hero renders anyway. Never block content on a flourish.

### 6.1 — HERO

Headline, Anton, enormous, three lines, each word revealed by a `clip-path: inset(0 0 100% 0)` wipe-up staggered 55ms — **never a fade**:

> **WE'D RATHER
> SHOW THAN
> TELL.**

(His own words, lifted from his bio. Keep it.)

Sub, Geist Sans, `--chalk-dim`:
> A room for the people who make the frames. Creators who shoot it. Editors who cut it. Kerala, 2026.

Behind the type: **three vertical 9:16 reel cards**, scrolling upward at three different speeds (0.6×, 1.0×, 1.4× scroll), desaturated to 35%, `--ink` vignette. On pointer-near, the nearest card **colorizes and gains halation**. This is his grid, abstracted. **[ASK GOUTHAM]** for 9–12 stills; until then use solid lane-colored panels with crop marks — *do not* use stock photos of generic "content creators."

Two CTAs:
- Primary: `TAKE YOUR PLACE` → `/join`. A rosso block, no border radius above 2px, with corner crop marks that **draw in** on hover (stroke-dashoffset, 240ms).
- Ghost: `READ THE CODE` → `/code`.

Bottom-left, mono: live member count as a **timecode odometer** — digits roll individually like a counter, not a fade-swap.

### 6.2 — THE TIMELINE SCRUBBER (persistent, not a section)

The signature interaction. Fixed to the bottom edge, 56px tall, `--carbon` with a `--rule` top border, `backdrop-filter: blur(12px)`.

It is an NLE timeline. Each section is a **clip block**, width proportional to its scroll length, mono-labelled:

```
│ 01 COLD OPEN │ 02 THE ROOM │ 03 WHO'S INSIDE │ 04 THE CODE │ 05 INSIDE │ 06 ROLL CALL │ 07 JOIN │
```

- A 2px `--rosso` **playhead** tracks scroll position in real time.
- The active clip lifts to full opacity; inactive clips sit at 40%.
- **Click a clip → smooth-scrub to that section.** Real navigation, disguised as an edit tool.
- Hovering a clip shows its timecode above the playhead.
- Collapses on mobile to a 3px progress hairline + the current clip name. Do not try to fit seven clips on a 375px screen.

This replaces the conventional nav bar entirely. There is no header. That is the point.

### 6.3 — THE ROOM (the why)

Section title card wipes in first: a rosso panel sweeps L→R carrying `02 — THE ROOM` in Anton, holds 350ms, then wipes off upward to reveal the content beneath. **Every section gets this treatment.** It's the "cut" that makes the page feel edited.

Content — his actual grievance, stated plainly, alternating lines in `--chalk` and `--rosso`:

> Creators burn out making everything alone.
> Editors get cropped out of the credits.
> Everyone's shooting. Nobody's talking to each other.
>
> **So we made a room.**

Set as large Archivo, left-aligned, one line per scroll-triggered reveal. No illustration. No icon grid. The typography is the design.

### 6.4 — WHO'S INSIDE (the two lanes)

Two tall 9:16 **frames**, side by side on desktop, stacked on mobile. These are not cards — they are film gates.

| | FRAME KOOTAM | CUT KOOTAM |
|---|---|---|
| accent | `--rosso` | `--lumen` |
| label | `LANE 01 · CREATORS` | `LANE 02 · EDITORS` |
| copy | "You shoot it. You style it. You post it. You've never had a room where the other people doing it are in the room." | "You cut it. You grade it. You sound-design it at 2am. Your name belongs in the credits and here it is in the member list." |

Hover (desktop, pointer: fine only):
- Frame tilts ≤4° on a 3D transform tracking cursor position
- A **rack-focus**: the frame snaps from `blur(3px)` to `blur(0)` over 180ms while its border animates from `--rule` to the lane color
- The lane's grain intensity doubles

A third, smaller element below, visually different — a **slate card**, handwritten-feeling, `--mint`:
> **SOMETHING ELSE?**
> Writer, designer, DOP, sound, VFX, photographer, stylist, producer. Tell us what you do and we'll put you where you belong.

### 6.5 — THE CODE (teaser → `/code`)

This section is **the soul of the site** and comes straight from his content. He's publicly called out content stealing. So the community has a charter, and it is a real page.

Teaser shows three of the articles as numbered poster lines with mustard stars:

> **★ 01** — Credit the editor. Every time. In the caption, not the comments.
> **★ 02** — Don't repost someone's cut as your own. We will know. Kerala is small.
> **★ 03** — Show the work in progress. Finished things teach nobody anything.

`READ ALL SEVEN →` links to `/code`.

The full `/code` page: numbered articles, Anton numerals at 180px in `--rosso`, body in Archivo, a Malayalam line at the foot **[ASK GOUTHAM]**. Give it a dedicated OG image — this is the page people will screenshot and share.

### 6.6 — INSIDE (what actually happens)

Four rituals, laid out as **clip blocks on a stacked timeline** — reusing the §6.2 atom so the metaphor compounds:

- `WEEKLY DROP` — everyone posts what they shipped. Nobody scrolls past.
- `THE CUT ROOM` — put up a rough cut, get it torn apart kindly.
- `LOOKING FOR` — creators needing editors, editors needing work. One thread, one format.
- `GEAR & GRIEF` — what you bought, what broke, what you'd never buy again.

Each block expands on scroll-into-view: width animates from 0 to full over 500ms with a slight overshoot, like a clip being trimmed out on a timeline.

### 6.7 — ROLL CALL (social proof, honestly)

Live from Supabase. A wall of member chips — display name, lane-colored left edge, Instagram handle in mono. New joins in the last 24h get a pulsing mustard star.

**Privacy:** show only `display_name` + `instagram_handle`, and only where `show_on_wall = true` (default **true**, with an opt-out checkbox in the join form). Never email.

Below, in mono:
```
MEMBERS 000147    CREATORS 000089    EDITORS 000051    OTHER 000007
```
Odometer-rolled, not faded.

**Empty state matters** — at launch this is zero. Do not show "0 members." Show:
> `ROLL CALL — SCENE 01, TAKE 01. The room is empty. Somebody has to be first.`

### 6.8 — JOIN (the gate)

Full-bleed rosso. Enormous Anton:
> **TAKE
> YOUR
> PLACE.**

One button. One line of mono beneath: `GOOGLE SIGN-IN · 30 SECONDS · NO SPAM, EVER`.

### 6.9 — END CREDITS (footer)

Literal film credits. Centered, mono, scrolling slowly on scroll-into-view:

```
             CREATORS കൂട്ടം

            A COMMUNITY BY
          GOWTHAM DAS THEKKINKATTIL

              FOUNDED IN
                KERALA

               SITE BY
              [YOUR NAME]

        ★  ★  ★  ★  ★  ★  ★
```

Instagram link, contact, `/code` link. Then a crimson marquee ticker across the very bottom:

`KOOTAM ★ KOOTAM ★ KOOTAM ★ KOOTAM ★ ...`

(Single repeated word, mustard stars between. Louder and more memorable than a list of nouns — and it drills the name in.)

Pure CSS transform loop, 40s, duplicated track, `will-change: transform`, paused on hover and under reduced-motion.

---

## 7 — THE JOIN SEQUENCE (the hero feature — get this perfect)

Single route `/join`, four internal steps, URL-reflected (`?step=`) so back/refresh survive. **The site cuts from Poster to Editing Bay here** — the background shifts from rosso/ink to `--carbon`, the timeline scrubber becomes a 4-step progress timeline, and the type scales down. The user should feel they've walked from the poster on the wall into the edit suite.

### Step 1 — SIGN IN
Google OAuth via Supabase. One button. Below it in mono: `We read your name, email and profile photo. Nothing else. We never post anything.`
If already authed with a member row → skip straight to Step 4.

### Step 2 — PICK YOUR LANE
The two 9:16 frames from §6.4, now interactive, plus the `--mint` OTHER slate.

**The selection animation — build this carefully, it's the moment:**

1. On select, the two unchosen options **slide off-frame** (chosen one stays put) — 420ms, `cubic-bezier(.76,0,.24,1)`.
2. The chosen frame **expands to fill the viewport** — a cut to close-up. 520ms.
3. Its lane color **floods the accent layer** of the entire remaining flow. From this moment the whole UI is that lane's color.
4. The timeline progress bar's clip for step 2 fills in that color.

If OTHER is chosen, a text input slides up *inside* the expanded frame, styled as writing on a clapperboard slate — white chalk-ish text on the dark field, mono, with a blinking block cursor. Required, 2–60 chars.

### Step 3 — DETAILS
Short. Every extra field costs you members.

| Field | Required | Notes |
|---|---|---|
| Display name | ✅ | prefilled from Google, editable |
| Instagram handle | ✅ | strip `@` and any URL wrapper; validate `^[a-zA-Z0-9._]{1,30}$` |
| City / district | ✅ | combobox of Kerala districts + "Outside Kerala" |
| What you do | optional | multi-select tags, lane-aware: creators get `reels / fashion / food / travel / comedy / tech`, editors get `premiere / after effects / davinci / capcut / final cut / color / sound / motion` |
| Portfolio or reel link | optional | URL validate |
| Show me on the member wall | ✅ default on | checkbox |
| I've read The Code and I'm in | ✅ | checkbox, links to `/code`, **must be ticked** |

Inputs are Editing Bay: `--graphite` fill, 1px `--rule`, zero border-radius, mono labels floating above, and a lane-colored 2px bottom edge that **wipes in from the left** on focus. No rounded pill inputs.

### Step 4 — THE REVEAL (nail this)

On submit, do **not** show a spinner. Show a **render bar**:

```
RENDERING YOUR PASS ...
[██████████████░░░░░░] 71%    00:00:02:14
```

Mono, lane-colored fill, timecode ticking. It's tied to the real request — if the write is fast, let it finish fast; don't fake a delay beyond ~600ms minimum so the animation reads.

Then a hard cut to black for 1 frame, and:

**`EXPORT COMPLETE.`** — Anton, lane-colored, with mustard stars flicking in around it. Directly beneath, in Anek Malayalam at half the size, `--chalk`:

> **നിങ്ങൾ കൂട്ടത്തിലാണ്.**
> *You're in the kootam.*

**[ASK GOUTHAM]** to confirm that line before launch.

Then the two links arrive as **exported deliverable chips**, staggered 300ms apart, sliding in from the right like files dropping into a bin:

```
┌─ ★ ─────────────────────────────────────┐
│ 01  CREATORS KOOTAM                      │
│     Everyone's here. Announcements land  │
│     in this one. Join it first.          │
│                        [ OPEN WHATSAPP ] │
└──────────────────────────────────────────┘

┌─ ★ ─────────────────────────────────────┐
│ 02  CUT KOOTAM                 [LANE 02] │
│     Your room. Only editors.             │
│                        [ OPEN WHATSAPP ] │
└──────────────────────────────────────────┘
```

(Chip 02 reads `FRAME KOOTAM` for creators. For `other`, chip 02 is replaced by a `--mint` note: *"We're building your room. For now you're in the main kootam — Goutham will reach out."*)

**Sequencing rules:**
- Chip 02 is **visually locked** (dimmed, `--rule` border, a small lock glyph) until chip 01 is clicked. On click of 01, chip 02 unlocks with a lane-color border wipe. This enforces the correct join order — community first, so the announcement group lands — without a single line of nagging copy.
- Both links are fetched from `POST /api/invite` **after** the member row commits. Never pre-rendered.
- Below both: `Links not opening? Make sure WhatsApp is installed on this device.` plus a copy-to-clipboard fallback for each.
- A `SAVE MY PASS` button generates a shareable lane-colored member card PNG (via `next/og`) — his audience will post it to their stories, and that's free distribution. Worth the hour it takes to build.

**Returning users** hitting `/join` or `/me` skip to a condensed version of this screen. Nobody should ever be stuck because they closed the tab.

---

## 8 — AUTH, DATA, AND GATING (TDD this section)

### Stack

```
Next.js 15 (App Router, TypeScript, strict)
Supabase (Postgres + Auth + RLS)
Vercel
Tailwind v4 — tokens from §4.1 wired as theme vars. No default palette usage.
motion (framer-motion) — component transitions
gsap + ScrollTrigger — scroll-linked timelines
lenis — smooth scroll (respect reduced-motion: disable entirely)
zod — all input validation, client AND server
```

No component library. Build the ~12 primitives you need by hand. shadcn defaults would fight §2.1 the whole way.

### Schema

```sql
create type member_role as enum ('creator','editor','other');
create type member_status as enum ('active','flagged','removed');

create table members (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text not null check (char_length(display_name) between 2 and 60),
  avatar_url      text,
  instagram       text not null check (instagram ~ '^[a-zA-Z0-9._]{1,30}$'),
  role            member_role not null,
  role_other_text text,
  city            text not null,
  tags            text[] default '{}',
  portfolio_url   text,
  show_on_wall    boolean not null default true,
  accepted_code   boolean not null default false,
  status          member_status not null default 'active',
  role_changes    smallint not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint other_needs_text check (
    role <> 'other' or (role_other_text is not null and char_length(role_other_text) between 2 and 60)
  ),
  constraint must_accept_code check (accepted_code = true)
);

create table link_reveals (
  id         bigserial primary key,
  member_id  uuid not null references members(id) on delete cascade,
  link_key   text not null,
  revealed_at timestamptz not null default now()
);

create table admins ( email text primary key );

create index members_role_idx on members(role) where status = 'active';
create index members_wall_idx on members(created_at desc) where show_on_wall and status = 'active';
```

### RLS — enabled on every table

- `members`: a user may `select`/`insert`/`update` **only** `user_id = auth.uid()`. No blanket select.
- The member wall reads through a `security definer` view exposing **only** `display_name, instagram, role, created_at` where `show_on_wall and status = 'active'`. Email must be unreachable from the client.
- `link_reveals`: insert-only from the server role.
- `/admin` checks `auth.jwt()->>'email' IN (select email from admins)` **server-side**. Never gate admin on a client-side check.

### `/api/invite`

```
POST  → 1. require session (server-side, not a cookie read)
        2. load caller's member row; 404 if absent
        3. 403 if status <> 'active'
        4. map role → { community: WA_COMMUNITY_URL, lane: WA_<ROLE>_URL }
        5. log to link_reveals
        6. return the two URLs
```

Rate limit: 10 req / 10 min / user. Never accept a role from the request body — read it from the database row. A client that can name its own lane can join any lane.

### Env

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server only
NEXT_PUBLIC_SITE_URL
WA_COMMUNITY_URL                 # server only — never NEXT_PUBLIC_
WA_CREATORS_URL                  # server only
WA_EDITORS_URL                   # server only
WA_OTHER_URL                     # server only; falls back to WA_COMMUNITY_URL
ADMIN_EMAILS                     # comma-separated
```

The brand name is **not** an env var — it's fixed: **Creators Kootam**. Put it, the Malayalam strings, and the three room names in one `config/brand.ts` module that every surface imports (title template, OG image, preloader slate, footer, reveal chips, member pass, admin). One file to correct, zero hardcoded strings in components.

Only the WhatsApp URLs and keys are environment-dependent. `WA_*` are server-only — if any of them ever acquires a `NEXT_PUBLIC_` prefix, that is a security incident, not a config change.

Commit `.env.example` with every key and a one-line comment. Never commit real values.

### Tests (Vitest + Playwright)

Minimum coverage before Phase 3 closes:

1. Unauthenticated `POST /api/invite` → 401
2. Authenticated, no member row → 404
3. Creator row → returns community + creators URL, **never** the editors URL
4. Editor row → returns community + editors URL
5. `role: 'other'` with empty `role_other_text` → DB constraint rejects
6. `accepted_code: false` → rejected
7. Instagram handle regex: accepts `the.gowtham_das`, rejects `https://instagram.com/x`, rejects `a b`
8. Second insert for the same `user_id` → unique violation, handled as "you're already in"
9. Client bundle grep: `WA_` strings appear **nowhere** in `.next/static`
10. Member wall query returns no `email` field for an anonymous client

---

## 9 — ADMIN (`/admin`)

Unglamorous and fast. Editing Bay styling.

- Table: name, handle, lane (colored chip), `role_other_text`, city, tags, joined date, status
- Filter by lane, search by name/handle, sort by date
- **The `other` queue is the important view** — surface those free-text answers prominently. That's how Goutham discovers he needs a photographers' room.
- CSV export
- Flag / remove (sets `status`, never hard-deletes)
- Counts per lane at the top as timecode odometers

---

## 10 — MOTION ENGINEERING

**Rules:**

1. Animate `transform` and `opacity` only. A layout-triggering animation is a bug.
2. Everything scroll-linked goes through one GSAP ScrollTrigger context, cleaned up on route change. Never a raw `scroll` listener.
3. `will-change` is applied on animation start and **removed on completion**. Leaving it on everything is why "animated" sites die on mid-range Android.
4. Section content below the fold mounts via IntersectionObserver with `rootMargin: '200px'`.
5. The grain canvas repaints at 12fps via a throttled RAF — not every frame.
6. Easing vocabulary, three only:
   - `cut` — `cubic-bezier(.85,0,.15,1)`, 90–180ms. Hard, mechanical. Slates, clips, locks.
   - `pan` — `cubic-bezier(.33,1,.68,1)`, 400–620ms. Smooth. Frames, reveals, scroll-to.
   - `settle` — spring, `stiffness 180 / damping 22`. Cards, chips, hovers.
7. Nothing animates longer than 700ms. If it needs longer, it's a sequence of shorter things.

**`prefers-reduced-motion: reduce` — honor it completely:**

- Lenis off. GSAP timelines → immediate final state.
- Grain, gate weave, marquee, odometers: static.
- Preloader skipped entirely.
- Section title cards → instant.
- All reveals → 150ms opacity only.
- **The site must still be beautiful in this mode.** Test it. It's not a degraded fallback, it's the quiet cut.

**Budgets:** Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility. LCP < 2.5s on simulated 4G. No layout shift from the preloader. Test on a real mid-range Android, not just a desktop throttle.

---

## 11 — ACCESSIBILITY & RESPONSIVE

- All text ≥ 4.5:1 on its background. `--rosso` on `--ink` passes for large display type; **check it before using it at body size** — if it fails, use `--chalk` for body and keep rosso for display and accents only.
- The role picker is a real `radiogroup`: arrow-key navigable, `aria-checked`, visible focus ring in `--focus`, 3:1 against the background.
- Never color-only. Every lane carries a text label (`LANE 01 · CREATOR`) alongside its color.
- The timeline scrubber is `nav` + `aria-label="Section navigation"`, each clip a real `<button>`, Tab-reachable.
- Every step change in `/join` announces via `aria-live="polite"`.
- Touch targets ≥ 44px. The reveal chips' buttons especially.
- Breakpoints `375 / 768 / 1024 / 1440 / 1920`. **Design mobile-first** — his audience is on phones watching reels, and most signups will happen on a 390px screen. If the desktop experience is beautiful and the mobile one is an afterthought, the project has failed.

---

## 12 — SEO & SHARING

- `/` and `/code` each get a dynamic `next/og` image: ink field, Anton title, mustard stars, lane-colored rule. Poster, not screenshot.
- Full OG + Twitter card meta. `og:locale` `en_IN`.
- Title template from `config/brand.ts` — e.g. `%s · Creators Kootam`.
- `robots.txt` + `sitemap.ts`. `/admin`, `/me` noindex.
- Member pass PNGs (§7 Step 4) generate at `/api/pass/[id]` with a lane-colored design.

---

## 13 — BUILD ORDER

**Phase 1 — Skeleton.** Next.js + TS + Tailwind v4, tokens from §4.1 wired, fonts loaded, all routes rendering with real type at real scale. No animation yet. **Deploy to Vercel.** Get a live URL in Goutham's hands on day one.

**Phase 2 — Data & auth.** Supabase, schema, RLS, Google OAuth, `/api/invite`, `/join` working end to end with ugly-but-correct UI. Tests from §8 green. This is the part that must actually work.

**Phase 3 — The join sequence.** §7 in full: lane selection, expansion, render bar, reveal chips, lock sequencing, member pass.

**Phase 4 — The scroll film.** §6 top to bottom, including the timeline scrubber, grain, title cards, preloader.

**Phase 5 — Polish & ship.** `design:accessibility-review`, reduced-motion pass, Lighthouse, real-device test, `/admin`, OG images, README with the **[ASK GOUTHAM]** checklist.

---

## 14 — DEFINITION OF DONE

Do not report completion until every line is verified with output you can show:

- [ ] `pnpm build` clean, zero TS errors, zero ESLint errors
- [ ] All §8 tests pass, including the bundle-grep for `WA_` strings
- [ ] Deployed, live URL, Google sign-in works on the deployed domain
- [ ] A creator account never receives the editors link — verified by inspecting the network response, not by reading the code
- [ ] Lighthouse mobile ≥ 90 perf / ≥ 95 a11y, screenshot attached
- [ ] Full flow completed on a real phone
- [ ] `prefers-reduced-motion: reduce` walkthrough — still beautiful, nothing broken
- [ ] Keyboard-only walkthrough start to finish
- [ ] Zero banned hexes, zero `Styrene`/`Tiempos`, zero user-facing `Claude` — grep the repo
- [ ] `.env.example` complete, no secrets committed
- [ ] README lists every **[ASK GOUTHAM]** item still outstanding

---

## 15 — REFERENCE BOARD

Study these for *pattern*, never for copying. Do not clone a layout and do not reproduce anyone's marks.

| Reference | Take exactly this |
|---|---|
| **instagram.com/thegowthamdas** | The primary source. Study the poster post's color relationship (saturated red / mustard star / cream type), the B&W fashion frames, the mint bookstore grade. Everything in §4 derives from here. |
| **a24films.com** | Dark editorial restraint. Big type carrying the page with no decoration. Film presented as object. |
| **letterboxd.com** | How a film-literate community looks without being precious. Member walls, lists, tone. |
| **Premiere Pro / DaVinci Resolve timeline UI** | The Editing Bay half. Clip blocks, playhead, track headers, timecode, the specific grey-on-grey hierarchy. Screenshot one and build from it. |
| **lusion.co, igloo.inc, gsap.com/showcase** | Scroll choreography and sequencing discipline — how motion is *paced*, not how it's decorated. |
| **Motorsport / mid-century film posters** | Composition only: the numeral, the star, the credit block, the border. |

**Copyright guardrail:** his poster riffs motorsport branding. The site must **not** reproduce Ferrari, F1, or any studio's marks, logos, or poster artwork. Build original compositions in that *language*. Same for fonts — Google Fonts and licensed-for-web only.

---

## 16 — WHAT NOT TO DO

- Don't build a light mode.
- Don't add a conventional sticky header. The timeline scrubber is the navigation.
- Don't put WhatsApp links in the client bundle.
- Don't use stock photography of "content creators."
- Don't write hype copy. Write the way he talks: short, flat, confident, slightly dry. No "Unleash your creative potential."
- Don't add features not in this brief — no chat, no feed, no profiles beyond `/me`, no newsletter. The site has one job: get the right person into the right WhatsApp room in under 60 seconds.
- Don't animate for the sake of it. Every motion in §6 and §7 earns its place by being a *cut*, a *reveal*, or a *state change*. If you add one that isn't, remove it.
- Don't ship without testing on a real mid-range Android phone.

---

**One last thing.** This is going out under a real person's name, to a real audience of people who make things for a living and will judge it in four seconds. They will notice if the kerning is lazy. Build it like it's a short film he's putting his name on — because it is.
