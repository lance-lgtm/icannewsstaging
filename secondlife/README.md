# つぐ TSUGU — Second Life for Your Belongings

A premium, colorful, AI-powered mobile-web prototype for the Japanese
market. Take a photo, let AI describe the item, then decide whether to
**keep it, sell it, give it away, gift it, donate it, recycle it, or
dispose of it** — with a trusted, verified community standing behind
every option except the last.

The design leans on Japanese aesthetics and the idea of **もったいない
(mottainai)**: respect what still has value, avoid unnecessary waste,
and let a possession carry both usefulness and memory into its next
life.

## Try it

Plain HTML/CSS/JS, no build step, no dependencies — same philosophy as
the rest of this repo. Serve the folder and open it on a phone-sized
viewport (it's designed mobile-first, max-width 480px):

```bash
cd secondlife
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. On a real phone, "撮影する" (Take a
Photo) opens the device camera via `<input type="file" capture>`.

## Backend setup (optional)

Two features need a real backend and are **entirely optional** — without
either, the rest of the app still works end-to-end on mock/local data,
and this is what the demo Artifact preview always uses (its sandbox
can't reach any external network):

- **Real AI recognition** — calls Claude's vision API instead of
  guessing the item from color and aspect ratio.
- **Community** — real accounts, follow/accept/reject/remove, and
  messaging between connected users. Needs a database, since "who
  follows whom" and message history have to persist across users and
  devices, not just live in one browser's local storage.

Both are served from the same [Cloudflare Pages](https://pages.cloudflare.com)
project (free tier is enough) as the static site — no separate hosting,
no CORS setup, and an API key that never touches the client.

### 1. Connect the repo to Cloudflare Pages

1. Push this repo to GitHub (already done if you're reading this here).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages →
   Connect to Git**, pick this repo.
3. Set **Root directory** to `secondlife` (leave the build command
   empty — there's no build step). This is what makes Cloudflare pick
   up the static site and everything in `functions/`.

### 2. Turn on real AI recognition

In the project's **Settings → Environment variables**, add a **secret**:
`ANTHROPIC_API_KEY` = your Anthropic API key
([console.anthropic.com](https://console.anthropic.com)). Never commit
this key to the repo. Optionally add `ANALYZE_MODEL` to pick a
different model (defaults to `claude-sonnet-5`).

Each photo recognized is one Claude API call with an image — set a
spending limit on your Anthropic account if this will see public
traffic. [`functions/api/analyze.js`](functions/api/analyze.js) also
rate-limits to 15 requests/10 minutes per IP and caps request size at
~7MB once D1 is bound (step 3) — it fails open (no limit) if D1 isn't
bound yet, so this still works before you set up the database. If the
function isn't deployed, times out, or errors, the app silently falls
back to the local heuristic — check your browser console for `[TSUGU]
real recognition unavailable, using local heuristic:` if recognition
doesn't seem to be using the real model.

### 3. Turn on Community (accounts, follows, messaging)

1. In the Cloudflare dashboard: **Workers & Pages → D1 → Create
   database**. Name it anything (e.g. `tsugu-db`).
2. Load the schema: **D1 → your database → Console**, paste the
   contents of [`schema.sql`](schema.sql), and run it. (Or from the
   CLI: `wrangler d1 execute tsugu-db --remote --file=schema.sql`.)
3. Back in your Pages project: **Settings → Functions → D1 database
   bindings → Add binding**. Variable name **must be** `DB`, bound to
   the database you just created.
4. Redeploy (or just push again) so the new binding takes effect.

Accounts are self-contained — email + password, hashed with PBKDF2,
sessions as bearer tokens in `sessions`. Following a request-based model
throughout (`schema.sql`): every follow starts `pending` until the
other person accepts or rejects it; the followee can later remove an
accepted follower, and the follower can unfollow at any time.
**Messaging is only allowed between two users with an accepted follow
relationship in either direction** — consistent with the app's
trust-first framing rather than open DMs between strangers. Messages
are poll/refresh-based (checked on open and every ~25s), not real-time.

### Local development

To test `functions/` and D1 on your own machine before deploying:

```bash
cd secondlife
npx wrangler d1 execute tsugu-db --local --file=schema.sql
npx wrangler pages dev .
```

This runs a local SQLite-backed D1 (via Miniflare) — no Cloudflare
account or network access needed. `wrangler.toml` in this folder is
only for this local flow; the dashboard-based deploy above binds D1
independently of it (see the comments in that file).

## What's implemented

Every "AI" result is either the real recognition above, or — when
that's not configured — realistic mock data (`js/content.js`) wired
into working interactions (`js/app.js`). It demonstrates the full
experience end to end:

- **Home** — camera-first hero CTA, mottainai tagline, impact stats, and
  feature cards for every entry point in the spec (sell, keep, give,
  hidden value, home inventory, family legacy, marketplace).
- **Camera flow** — real photo capture, interactive AI guidance bubbles
  ("見せてください label", "もう一枚"), a multi-shot thumbnail strip, and
  a staged "AI analyzing" sequence.
- **AI Item Card** — brand, color, size (JP/US), condition, estimated
  value and dimensions at a glance, each estimated field flagged
  "推定", with an expandable panel covering the full attribute list from
  the spec (maker, logo, model, serial number, age, material, pattern,
  damage, accessories, etc.), an AI recommendation banner with reasoning,
  and the full colorful KEEP / SELL / GIVE / GIFT / DONATE / RECYCLE /
  DISPOSE action taxonomy.
- **AI Listing Assistant** — auto-generated title, description, keywords,
  and pricing; bilingual JA/EN toggle; pickup/delivery options including
  a Safe Pickup point.
- **Trusted Community Marketplace** — verification badges (identity,
  phone, community, referral, reputation), a "who can contact me" trust
  setting, a Safe Pickup map with public meeting points, and a live
  example of the scam-warning banner AI would surface on a suspicious
  message.
- **Home Inventory** — category tiles (closet, kitchen, bedroom, living
  room, office, storage, garage, other), natural-language "ask" chips
  ("What can I sell?", "What haven't I used?"), and item tiles color-coded
  by suggested action.
- **Legacy Mode** — a treasured item's story and a visual timeline of who
  it's been passed to, a voice-to-story recorder (uses the Web Speech API
  when available, with a graceful scripted fallback otherwise), and a
  flow for choosing who it goes to next (student, young family,
  collector, someone in need).
- **Profile / accessibility** — Second-Life points, community impact
  counters, achievement badges, a Trusted Helper assignment (for family
  members managing an older user's account), large-text mode, and a
  voice-guidance toggle (reads screen titles aloud via
  `speechSynthesis`).
- **Community** (real accounts, see Backend setup above) — sign up /
  log in, search for people and send a follow request, accept/reject
  incoming requests, remove an existing follower or unfollow someone
  you follow, and message anyone you're connected with. Reachable from
  the Marketplace tab.

## Visual system

- Warm washi-paper background, gold accents for the premium/mottainai
  layer, `Shippori Mincho`-style serif for the wordmark, Japanese system
  font stacks throughout (no external font/CDN dependency).
- Action color taxonomy: KEEP calm green · SELL sophisticated blue ·
  GIVE warm orange · GIFT soft pink · DONATE purple · RECYCLE fresh teal
  · DISPOSE neutral gray.
- Every icon is a hand-authored inline SVG sprite (`index.html`, top of
  `<body>`) — no icon font, no external asset pipeline.

## From prototype to production

Real photo recognition and real accounts/follows/messaging are wired up
(see Backend setup above) — the remaining integration points are
isolated too:

- `ASK_ANSWERS` / inventory data → replace with a persisted, per-user
  home inventory store.
- Marketplace listings and verification badges are still mock data, not
  tied to real accounts → the Community layer (`functions/api/{auth,
  users,follows,messages}`) is the real foundation to build that on;
  listings would need their own table linked to `users.id`.
- The scam-detection banner on the Marketplace screen is illustrative
  — a real version would need a model or ruleset scanning actual
  message content in `functions/api/messages`.
- Legacy Mode's speech-to-story pipeline → send the raw transcript to an
  LLM to produce the polished short story shown on the timeline.

## Not built here

Payments, push notifications, native camera/AR/LiDAR measurement,
phone/identity verification, and real-time messaging (current messaging
is poll/refresh-based by design — see Backend setup) are out of scope
for this prototype.
