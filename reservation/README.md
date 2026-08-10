# Dr. Lee Reservation System / リー医師 予約システム

A bilingual (Japanese / English), mobile-first appointment booking page for
**Dr. Keiko Lee (リー啓子医師)** at the **Saiseikai Chuo Hospital Kenshin
Center (済生会中央病院 健診センター)**.

- Clinic days: **Wednesdays & Fridays**
- Hours: **10:00–13:00** and **14:00–17:00**, in **10-minute** slots
- Pink color theme, designed for phones first
- No login for patients — pick a date, pick a time, fill in a short form
- A lightweight, key-protected staff page (`admin.html`) to view and cancel bookings

It's plain HTML/CSS/JS (same style as the rest of this repo, no build
step) plus a small **Google Apps Script** backend that uses a Google
Sheet as the database. This is what makes it a *real* shared booking
system — two patients on two different phones will see each other's
bookings and can't double-book the same slot — while still being free to
run and easy for clinic staff to inspect (it's just a spreadsheet).

## How it fits together

```
reservation/index.html   → patient booking page
reservation/admin.html   → staff view (list + cancel bookings)
reservation/js/config.js → clinic name, hours, and the Apps Script URL
reservation/apps-script/Code.gs → paste into Google Apps Script (the backend)
```

The frontend talks to your deployed Apps Script Web App over `fetch()`.
The Web App reads/writes a "Bookings" sheet and a "ClosedDates" sheet
(for holidays or days Dr. Lee is unavailable).

## One-time setup (about 10 minutes)

1. **Create a Google Sheet.** Go to [sheets.new](https://sheets.new) and
   name it something like "Dr. Lee Bookings".
2. **Open the script editor.** Extensions → Apps Script.
3. **Paste the backend code.** Delete the default `Code.gs` contents and
   paste in everything from `reservation/apps-script/Code.gs` in this
   repo.
4. **Run `setup` once.** In the Apps Script editor, choose the `setup`
   function from the dropdown next to "Run" and click Run. Approve the
   permission prompts (it's your own script acting on your own sheet).
   - This creates the `Bookings` and `ClosedDates` sheets with headers.
   - It also generates an **admin key** and prints it to the execution
     log (View → Logs, or Ctrl/Cmd+Enter). Copy this key somewhere safe
     — front-desk staff will type it into `admin.html` to view bookings.
     You can find it again later under Project Settings → Script
     Properties.
5. **Deploy as a Web App.** Deploy → New deployment → select type
   "Web app".
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy, then copy the **Web app URL** (ends in `/exec`).
6. **Paste the URL into the site.** Open `reservation/js/config.js` and
   set:
   ```js
   APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```
7. **Host the `reservation/` folder** the same way the rest of this repo
   is hosted (GitHub Pages / Netlify / Vercel — no build step needed).
   Patients use `reservation/index.html`; staff use
   `reservation/admin.html`.

That's it — no server to run or maintain. If the clinic's Google
Workspace admin ever needs to redeploy, choose "Manage deployments" →
edit the existing deployment rather than creating a new one, so the URL
in `config.js` keeps working.

### Updating the backend later

If you edit `Code.gs` after the initial deploy (e.g. to add a field),
use Deploy → Manage deployments → pencil icon → "New version" so the
existing `/exec` URL picks up the change without you having to update
`config.js` again.

### Updating the frontend later

`index.html` and `admin.html` load `css/*.css` and `js/*.js` with a
`?v=2` query string. Browsers and CDNs cache those files separately
from the page itself, so a visitor who loaded the site before a
JS/CSS-only change can end up with fresh HTML but a stale cached
script underneath it (new markup shows up, but nothing responds to
it). Bump the number (`?v=3`, `?v=4`, ...) in both HTML files whenever
you change a `.css` or `.js` file, so returning visitors are forced to
fetch the new version.

## Managing holidays / days off

Open the Google Sheet and add rows to the **ClosedDates** tab (Date in
`YYYY-MM-DD` format, plus an optional reason note). Any Wednesday or
Friday listed there is automatically hidden from patients and rejected
by the backend even if someone has the page open already.

## Staff view

`reservation/admin.html` asks for the admin key generated during setup,
then lists all upcoming bookings grouped by date with a **Cancel**
button for each. The key is only kept in the browser tab's session
storage (cleared when the tab closes) — it is not a full authentication
system, so don't share the admin URL or key outside clinic staff. For
anything beyond quick front-desk lookups, staff can also open the Google
Sheet directly.

### Adding a booking or blocking off time

The same staff page has an **Add Booking / Block Time** form for cases
the online patient flow can't handle on its own:

- A patient needs a longer visit — 20 or 30 minutes (2 or 3 consecutive
  10-minute blocks) instead of the usual single slot.
- Staff just want to hold a chunk of time with no real patient (e.g. a
  break or a meeting) — put a label like "Blocked - staff meeting" in
  the Name field and leave phone blank.

Pick the date, start time, and duration (1–3 blocks), fill in a name,
and submit. All of the covered 10-minute slots are reserved together as
one entry — patients booking online will see every one of them as
unavailable, and cancelling it from the list below frees all of them at
once.

## Design notes

- **Bilingual by default**: every label shows Japanese first with
  English underneath, rather than a language toggle — meant to be
  understandable at a glance either way.
- **Big tap targets, 10-minute grid**: time slots render as a button
  grid (Morning 10:00–13:00, Afternoon 14:00–17:00), already-booked or
  past slots are greyed out and disabled.
- **Timezone**: all date/time logic (both frontend and backend) is
  pinned to `Asia/Tokyo`, so it behaves correctly even if a visitor's
  phone is set to a different timezone.
- **Double-booking prevention**: the Apps Script backend uses
  `LockService` to serialize booking writes, so two people submitting
  the same slot at the same instant can't both succeed — the second one
  gets a clear "someone just booked that time" message and is sent back
  to pick another slot.
- **Logo placeholder**: `index.html` has a simple pink SVG placeholder
  in the header, marked with a `LOGO PLACEHOLDER` comment — swap it for
  an `<img>` tag once the Lee Medical Clinic logo is ready.
- **Clinic address/phone**: currently placeholders in
  `reservation/js/config.js` (`CLINIC.addressJa` / `addressEn` /
  `phone`) — fill in when available.

## Local preview

Since there's no backend configured by default, opening `index.html`
directly will show a "booking system is being set up" banner instead of
the date picker — that's expected until `APPS_SCRIPT_URL` is set. To
preview the layout, serve the folder locally:

```bash
cd reservation
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. Once `APPS_SCRIPT_URL` is filled in,
the full booking flow (and `admin.html`) works from any static host,
local or deployed.
