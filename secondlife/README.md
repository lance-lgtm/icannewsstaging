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

## Real AI recognition (optional, one-time setup)

Photo recognition can call a real vision model — Claude — instead of
guessing from color and aspect ratio. This is **optional**: without it,
the app still works end-to-end using a local heuristic fallback
(`js/content.js`'s `buildAnalysis`), which is what you get out of the
box and what the demo Artifact preview always uses (its sandbox can't
reach any external network).

**Why this needs a backend at all:** an Anthropic API key must never be
shipped in client-side JavaScript on a static site — anyone can read it
from view-source and run up your bill. So recognition happens in
[`functions/api/analyze.js`](functions/api/analyze.js), a small
serverless function that holds the key server-side.

**To turn it on, deploy via [Cloudflare Pages](https://pages.cloudflare.com)**
(free tier is enough), which serves the static site *and* runs the
function from the same repo — no separate hosting, no CORS setup:

1. Push this repo to GitHub (already done if you're reading this here).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages →
   Connect to Git**, pick this repo.
3. Set **Root directory** to `secondlife` (leave the build command
   empty — there's no build step). This is what makes Cloudflare pick
   up both the static site and `functions/api/analyze.js`.
4. In the project's **Settings → Environment variables**, add a
   **secret**: `ANTHROPIC_API_KEY` = your Anthropic API key
   ([console.anthropic.com](https://console.anthropic.com)). Never
   commit this key to the repo.
5. Optional: add `ANALYZE_MODEL` to pick a different model (defaults to
   `claude-sonnet-5`).
6. Deploy. Every push to this branch redeploys both the site and the
   function automatically.

Each photo recognized is one Claude API call with an image — set a
spending limit on your Anthropic account if this will see public
traffic. If the function isn't deployed, times out, or errors, the app
silently falls back to the local heuristic rather than breaking — check
your browser console for `[TSUGU] real recognition unavailable, using
local heuristic:` if recognition doesn't seem to be using the real
model.

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

Real photo recognition is wired up (see above) — the remaining
integration points are isolated too:

- `ASK_ANSWERS` / inventory data → replace with a persisted, per-user
  home inventory store.
- Marketplace listings, verification badges, and messaging → a real
  backend with identity/phone verification, community affiliation, and
  the scam-detection model that powers the suspicious-message banner.
- Legacy Mode's speech-to-story pipeline → send the raw transcript to an
  LLM to produce the polished short story shown on the timeline.

## Not built here

Payments, push notifications, native camera/AR/LiDAR measurement, and
the real trust/safety backend are out of scope for this static
prototype — they need a server and are called out above as the next
integration step.
