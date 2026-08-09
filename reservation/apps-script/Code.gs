/**
 * Dr. Lee Reservation System — Google Apps Script backend.
 *
 * Setup: see reservation/README.md. Short version —
 *   1. Create a Google Sheet, open Extensions > Apps Script, paste this
 *      file in as Code.gs.
 *   2. Run the `setup` function once (Run menu) to create the sheets and
 *      generate an admin key. Approve the permission prompts.
 *   3. Deploy > New deployment > Web app. Execute as "Me", access
 *      "Anyone". Copy the resulting /exec URL into
 *      reservation/js/config.js (APPS_SCRIPT_URL) and
 *      reservation/js/admin.js is fine as-is (it asks for the key at
 *      runtime, nothing to paste there).
 *
 * Sheet layout (created automatically by setup()):
 *   Bookings:    BookingID | CreatedAt | Date | Time | Blocks | Name |
 *                Furigana | Phone | Note | Status | CancelledAt
 *   ClosedDates: Date | Reason
 *
 * "Blocks" is how many consecutive 10-minute slots a booking occupies
 * (1 = 10 min, 2 = 20 min, 3 = 30 min). Patients booking online always
 * get Blocks = 1; staff can create longer bookings (or pure time blocks
 * with no real patient) from the admin page for visits that need more
 * than one slot.
 *
 * Keep SESSIONS / SLOT_MINUTES / OPEN_WEEKDAYS below in sync with
 * reservation/js/config.js if the clinic's hours ever change.
 */

const SESSIONS = [
  { id: "am", start: "10:00", end: "13:00" },
  { id: "pm", start: "14:00", end: "17:00" },
];
const SLOT_MINUTES = 10;
const MAX_BLOCKS = 6; // staff can reserve up to 6 x 10min = 60 min at once
const OPEN_WEEKDAYS = [3, 5]; // Wed, Fri
const TIMEZONE = "Asia/Tokyo";

const BOOKINGS_SHEET = "Bookings";
const CLOSED_SHEET = "ClosedDates";
const BOOKINGS_HEADERS = [
  "BookingID",
  "CreatedAt",
  "Date",
  "Time",
  "Blocks",
  "Name",
  "Furigana",
  "Phone",
  "Note",
  "Status",
  "CancelledAt",
];
const CLOSED_HEADERS = ["Date", "Reason"];

/** Run this once from the Apps Script editor to initialize the sheet. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let bookings = ss.getSheetByName(BOOKINGS_SHEET);
  if (!bookings) bookings = ss.insertSheet(BOOKINGS_SHEET);
  if (bookings.getLastRow() === 0) {
    bookings.appendRow(BOOKINGS_HEADERS);
    bookings.setFrozenRows(1);
  } else {
    const headerRow = bookings.getRange(1, 1, 1, bookings.getLastColumn()).getValues()[0];
    if (headerRow.indexOf("Blocks") === -1) {
      Logger.log(
        "This sheet predates the 'Blocks' column (multi-slot bookings). " +
        "Insert a new column called 'Blocks' between 'Time' and 'Name', " +
        "then fill existing rows with 1. See reservation/README.md."
      );
    }
  }

  let closed = ss.getSheetByName(CLOSED_SHEET);
  if (!closed) closed = ss.insertSheet(CLOSED_SHEET);
  if (closed.getLastRow() === 0) {
    closed.appendRow(CLOSED_HEADERS);
    closed.setFrozenRows(1);
  }

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("ADMIN_KEY")) {
    const key = Utilities.getUuid().replace(/-/g, "").slice(0, 16);
    props.setProperty("ADMIN_KEY", key);
    Logger.log("Generated admin key (staff will use this to view/cancel bookings): " + key);
  } else {
    Logger.log("Admin key already set. Check Project Settings > Script Properties if you need it again.");
  }

  Logger.log("Setup complete. Deploy this project as a Web App to get your APPS_SCRIPT_URL.");
}

function doGet(e) {
  const action = e.parameter.action;
  try {
    if (action === "slots") return jsonOut(handleSlots(e.parameter.date));
    if (action === "closedDates") return jsonOut(handleClosedDates());
    if (action === "list") return jsonOut(handleList(e.parameter.key));
    return jsonOut({ error: "unknown_action" });
  } catch (err) {
    return jsonOut({ error: "server_error", message: String(err) });
  }
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: "bad_request" });
  }

  try {
    if (body.action === "book") return jsonOut(handleBook(body));
    if (body.action === "adminBook") return jsonOut(handleAdminBook(body));
    if (body.action === "cancel") return jsonOut(handleCancel(body));
    return jsonOut({ ok: false, error: "unknown_action" });
  } catch (err) {
    return jsonOut({ ok: false, error: "server_error", message: String(err) });
  }
}

// ---------- Read endpoints ----------

function handleSlots(dateStr) {
  if (!isValidDateFormat(dateStr)) return { error: "invalid_date" };
  const taken = getTakenTimesForDate(dateStr);
  return { date: dateStr, taken: Array.from(taken) };
}

function handleClosedDates() {
  const sheet = getSheet(CLOSED_SHEET);
  const rows = sheet.getDataRange().getValues();
  const dates = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0]) dates.push(formatDateCell(rows[i][0]));
  }
  return { closedDates: dates };
}

function handleList(key) {
  if (!isAdmin(key)) return { error: "unauthorized" };
  const sheet = getSheet(BOOKINGS_SHEET);
  const rows = sheet.getDataRange().getValues();
  const bookings = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;
    bookings.push({
      id: row[0],
      createdAt: row[1],
      date: row[2],
      time: row[3],
      blocks: Number(row[4]) || 1,
      name: row[5],
      kana: row[6],
      phone: row[7],
      note: row[8],
      status: row[9],
    });
  }
  bookings.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return { bookings: bookings };
}

// ---------- Write endpoints ----------

function handleBook(body) {
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const name = String(body.name || "").trim().slice(0, 100);
  const kana = String(body.kana || "").trim().slice(0, 100);
  const phone = String(body.phone || "").trim().slice(0, 30);
  const note = String(body.note || "").trim().slice(0, 500);

  if (!name || !phone) return { ok: false, error: "missing_fields" };
  if (!isValidDateFormat(date)) return { ok: false, error: "invalid_date" };
  if (!isClinicOpenDate(date)) return { ok: false, error: "closed_date" };
  if (!isValidSlotTime(time)) return { ok: false, error: "invalid_time" };
  if (isPastDateTime(date, time)) return { ok: false, error: "past" };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const taken = getTakenTimesForDate(date);
    if (taken.has(time)) return { ok: false, error: "taken" };

    const sheet = getSheet(BOOKINGS_SHEET);
    const id = Utilities.getUuid();
    const createdAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([id, createdAt, date, time, 1, name, kana, phone, note, "booked", ""]);
    return { ok: true, bookingId: id };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Staff-only: reserve one or more consecutive 10-minute slots at once.
 * Used for patients who need a longer visit (e.g. 3 blocks = 30 min), or
 * to simply block off time with no real patient (name can be a label
 * like "Blocked - staff meeting").
 */
function handleAdminBook(body) {
  if (!isAdmin(body.key)) return { ok: false, error: "unauthorized" };

  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const blocks = Math.min(MAX_BLOCKS, Math.max(1, Math.round(Number(body.blocks)) || 1));
  const name = String(body.name || "").trim().slice(0, 100);
  const kana = String(body.kana || "").trim().slice(0, 100);
  const phone = String(body.phone || "").trim().slice(0, 30);
  const note = String(body.note || "").trim().slice(0, 500);

  if (!name) return { ok: false, error: "missing_fields" };
  if (!isValidDateFormat(date)) return { ok: false, error: "invalid_date" };
  if (!isClinicOpenDate(date)) return { ok: false, error: "closed_date" };

  const requestedTimes = expandSlotTimes(time, blocks);
  for (const t of requestedTimes) {
    if (!isValidSlotTime(t)) return { ok: false, error: "out_of_range" };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const taken = getTakenTimesForDate(date);
    for (const t of requestedTimes) {
      if (taken.has(t)) return { ok: false, error: "taken" };
    }

    const sheet = getSheet(BOOKINGS_SHEET);
    const id = Utilities.getUuid();
    const createdAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([id, createdAt, date, time, blocks, name, kana, phone, note, "booked", ""]);
    return { ok: true, bookingId: id };
  } finally {
    lock.releaseLock();
  }
}

function handleCancel(body) {
  if (!isAdmin(body.key)) return { ok: false, error: "unauthorized" };
  const id = String(body.id || "");
  if (!id) return { ok: false, error: "missing_id" };

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const sheet = getSheet(BOOKINGS_SHEET);
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) {
        const cancelledAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
        sheet.getRange(i + 1, 10).setValue("cancelled"); // Status column
        sheet.getRange(i + 1, 11).setValue(cancelledAt); // CancelledAt column
        return { ok: true };
      }
    }
    return { ok: false, error: "not_found" };
  } finally {
    lock.releaseLock();
  }
}

// ---------- Shared helpers ----------

/** Every 10-minute slot time currently occupied by an active booking on a date. */
function getTakenTimesForDate(dateStr) {
  const sheet = getSheet(BOOKINGS_SHEET);
  const rows = sheet.getDataRange().getValues();
  const taken = new Set();
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row[2] === dateStr && row[9] === "booked") {
      const blocks = Math.max(1, Number(row[4]) || 1);
      expandSlotTimes(row[3], blocks).forEach((t) => taken.add(t));
    }
  }
  return taken;
}

/** Given a start time and a block count, list every 10-minute slot it covers. */
function expandSlotTimes(startTime, blocks) {
  const out = [];
  let m = toMinutes(startTime);
  for (let i = 0; i < blocks; i++) {
    out.push(pad2(Math.floor(m / 60)) + ":" + pad2(m % 60));
    m += SLOT_MINUTES;
  }
  return out;
}

// ---------- Validation helpers ----------

function isValidDateFormat(dateStr) {
  return typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function isClinicOpenDate(dateStr) {
  const weekday = new Date(dateStr + "T00:00:00+09:00").getDay();
  if (OPEN_WEEKDAYS.indexOf(weekday) === -1) return false;

  const closed = handleClosedDates().closedDates;
  return closed.indexOf(dateStr) === -1;
}

function isValidSlotTime(timeStr) {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  for (const session of SESSIONS) {
    const slots = generateSessionSlots(session);
    if (slots.indexOf(timeStr) !== -1) return true;
  }
  return false;
}

function generateSessionSlots(session) {
  const slots = [];
  const startMin = toMinutes(session.start);
  const endMin = toMinutes(session.end);
  for (let t = startMin; t + SLOT_MINUTES <= endMin; t += SLOT_MINUTES) {
    const h = Math.floor(t / 60);
    const m = t % 60;
    slots.push(pad2(h) + ":" + pad2(m));
  }
  return slots;
}

function toMinutes(hhmm) {
  const parts = hhmm.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function isPastDateTime(dateStr, timeStr) {
  const nowStr = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm");
  const candidate = dateStr + " " + timeStr;
  return candidate < nowStr;
}

function formatDateCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, TIMEZONE, "yyyy-MM-dd");
  }
  return String(value);
}

function isAdmin(key) {
  const adminKey = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  return !!adminKey && key === adminKey;
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Sheet not found: " + name + ". Run setup() first.");
  return sheet;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
