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

## What's implemented

This is a front-end prototype: every "AI" result is realistic mock data
(`js/content.js`) wired into working interactions (`js/app.js`), not a
live vision/valuation backend. It demonstrates the full experience end
to end:

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

To turn this into a real product, the integration points are isolated:

- `ANALYSIS_RESULT` in `js/content.js` → replace with a real photo →
  vision-model call (item identification, brand/logo/serial detection,
  condition grading, size/measurement estimation, valuation).
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
