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
 *      reservation/js/config.js (APPS_SCRIPT_URL).
 *   4. (Optional, for 24h email reminders) Add a time-driven trigger
 *      that runs `sendReminders` roughly once an hour — see
 *      reservation/README.md for exact steps.
 *
 * Sheet layout (created/migrated automatically by setup()):
 *   Bookings:    BookingID | CreatedAt | Date | Time | Blocks | Name |
 *                Furigana | Phone | Email | Note | Status |
 *                CancelledAt | ReminderSent
 *   ClosedDates: Date | Reason
 *
 * Rows are read by HEADER NAME, not column position — so setup() can
 * safely add a missing column to an older sheet (it just appends it),
 * and nothing downstream breaks even if column order ever differs from
 * BOOKINGS_HEADERS below.
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
  "Email",
  "Note",
  "Status",
  "CancelledAt",
  "ReminderSent",
];
// Columns that must never be auto-converted to real Date/Number values by
// Sheets (Phone is here because Sheets treats an all-digit phone number as
// a number and silently drops its leading "0").
const TEXT_HEADERS = ["CreatedAt", "Date", "Time", "CancelledAt", "Phone"];
const CLOSED_HEADERS = ["Date", "Reason"];

const CLINIC = {
  nameJa: "済生会中央病院　健診センター",
  doctorJa: "リー　啓子　医師",
};

/** Run this once from the Apps Script editor to initialize/migrate the sheet. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let bookings = ss.getSheetByName(BOOKINGS_SHEET);
  if (!bookings) bookings = ss.insertSheet(BOOKINGS_SHEET);
  if (bookings.getLastRow() === 0) {
    bookings.appendRow(BOOKINGS_HEADERS);
    bookings.setFrozenRows(1);
  } else {
    const before = getHeaderMap(bookings);
    const added = BOOKINGS_HEADERS.filter((h) => !(h in before));
    if (added.length > 0) {
      ensureHeaders(bookings, BOOKINGS_HEADERS);
      Logger.log("Added missing column(s) to Bookings: " + added.join(", "));
    }
  }

  // Force these columns to plain text so Sheets never auto-converts a
  // date/time-looking string ("2026-08-13", "15:00") into a real Date
  // value on write — which reads back as garbled ISO timestamps.
  const map = getHeaderMap(bookings);
  const formatRows = Math.max(bookings.getMaxRows() - 1, 1);
  TEXT_HEADERS.forEach((h) => {
    if (map[h]) bookings.getRange(2, map[h], formatRows, 1).setNumberFormat("@");
  });

  // Repair any rows already corrupted by that auto-conversion (e.g. from
  // before this fix, or a manual edit in the Sheet UI).
  const lastRow = bookings.getLastRow();
  if (lastRow >= 2 && map["CreatedAt"] && map["Date"] && map["Time"]) {
    const numCols = bookings.getLastColumn();
    const range = bookings.getRange(2, 1, lastRow - 1, numCols);
    const values = range.getValues();
    const iCreated = map["CreatedAt"] - 1;
    const iDate = map["Date"] - 1;
    const iTime = map["Time"] - 1;
    const iCancelled = map["CancelledAt"] ? map["CancelledAt"] - 1 : -1;
    const iPhone = map["Phone"] ? map["Phone"] - 1 : -1;
    let repaired = 0;
    values.forEach((row) => {
      const fields = [iCreated, iDate, iTime, iCancelled, iPhone];
      const before = JSON.stringify(fields.map((i) => (i >= 0 ? row[i] : null)));
      row[iCreated] = normalizeTimestampCell(row[iCreated]);
      row[iDate] = formatDateCell(row[iDate]);
      row[iTime] = normalizeTimeCell(row[iTime]);
      if (iCancelled >= 0 && row[iCancelled]) row[iCancelled] = normalizeTimestampCell(row[iCancelled]);
      if (iPhone >= 0) row[iPhone] = repairPhoneCell(row[iPhone]);
      const after = JSON.stringify(fields.map((i) => (i >= 0 ? row[i] : null)));
      if (after !== before) repaired++;
    });
    range.setValues(values);
    if (repaired > 0) {
      Logger.log("Repaired " + repaired + " row(s) with auto-converted dates/times/phone numbers.");
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
    if (action === "myBookings") return jsonOut(handleMyBookings(e.parameter.name, e.parameter.phone));
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
  const bookings = readBookings().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      createdAt: b.createdAt,
      date: b.date,
      time: b.time,
      blocks: b.blocks,
      name: b.name,
      kana: b.kana,
      phone: b.phone,
      email: b.email,
      note: b.note,
      status: b.status,
    })),
  };
}

/** Public lookup: patient enters name + phone to see their own upcoming bookings. */
function handleMyBookings(name, phone) {
  const n = normalizeNameForCompare(name);
  const p = normalizePhoneForCompare(phone);
  if (!n || !p) return { error: "missing_fields" };

  const matches = readBookings()
    .filter(
      (b) =>
        b.status === "booked" &&
        normalizeNameForCompare(b.name) === n &&
        normalizePhoneForCompare(b.phone) === p
    )
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .map((b) => ({ date: b.date, time: b.time, blocks: b.blocks, note: b.note }));

  return { bookings: matches };
}

// ---------- Write endpoints ----------

function handleBook(body) {
  const date = String(body.date || "").trim();
  const time = String(body.time || "").trim();
  const name = String(body.name || "").trim().slice(0, 100);
  const kana = String(body.kana || "").trim().slice(0, 100);
  const phone = String(body.phone || "").trim().slice(0, 30);
  const email = String(body.email || "").trim().slice(0, 200);
  const note = String(body.note || "").trim().slice(0, 500);

  if (!name || !phone) return { ok: false, error: "missing_fields" };
  if (email && !isValidEmail(email)) return { ok: false, error: "invalid_email" };
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
    const map = getHeaderMap(sheet);
    const id = Utilities.getUuid();
    const createdAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    appendBookingRow(sheet, map, {
      BookingID: id,
      CreatedAt: createdAt,
      Date: date,
      Time: time,
      Blocks: 1,
      Name: name,
      Furigana: kana,
      Phone: phone,
      Email: email,
      Note: note,
      Status: "booked",
    });
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
  const email = String(body.email || "").trim().slice(0, 200);
  const note = String(body.note || "").trim().slice(0, 500);

  if (!name) return { ok: false, error: "missing_fields" };
  if (email && !isValidEmail(email)) return { ok: false, error: "invalid_email" };
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
    const map = getHeaderMap(sheet);
    const id = Utilities.getUuid();
    const createdAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    appendBookingRow(sheet, map, {
      BookingID: id,
      CreatedAt: createdAt,
      Date: date,
      Time: time,
      Blocks: blocks,
      Name: name,
      Furigana: kana,
      Phone: phone,
      Email: email,
      Note: note,
      Status: "booked",
    });
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
    const map = getHeaderMap(sheet);
    const booking = readBookings().find((b) => b.id === id);
    if (!booking) return { ok: false, error: "not_found" };

    const cancelledAt = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    sheet.getRange(booking._row, map["Status"]).setValue("cancelled");
    if (map["CancelledAt"]) sheet.getRange(booking._row, map["CancelledAt"]).setValue(cancelledAt);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Time-driven entry point (add a trigger for this — see README). Emails
 * anyone with a booking ~24 hours out who has an email on file and
 * hasn't been reminded yet.
 */
function sendReminders() {
  const sheet = getSheet(BOOKINGS_SHEET);
  const map = getHeaderMap(sheet);
  if (!map["Email"] || !map["ReminderSent"]) {
    Logger.log("Email/ReminderSent columns missing — run setup() first.");
    return;
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  let sent = 0;
  readBookings().forEach((b) => {
    if (b.status !== "booked" || !b.email || b.reminderSent === "yes") return;
    const apptAt = new Date(b.date + "T" + b.time + ":00+09:00");
    if (apptAt < windowStart || apptAt > windowEnd) return;
    try {
      sendReminderEmail(b);
      sheet.getRange(b._row, map["ReminderSent"]).setValue("yes");
      sent++;
    } catch (err) {
      Logger.log("Failed to send reminder for booking " + b.id + ": " + err);
    }
  });
  Logger.log("Reminder check complete. Sent " + sent + " email(s).");
}

function sendReminderEmail(b) {
  const d = new Date(b.date + "T00:00:00+09:00");
  const weekdayJa = ["日", "月", "火", "水", "木", "金", "土"][d.getDay()];
  const weekdayEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
  const subject = "【明日のご予約】" + CLINIC.nameJa + " / Appointment Reminder Tomorrow";
  const body = [
    b.name + " 様",
    "",
    "明日、下記のご予約がございます。",
    "日時：" + b.date + "（" + weekdayJa + "）" + b.time + "〜",
    CLINIC.nameJa + "　" + CLINIC.doctorJa,
    "診療開始の10分前までにお越しください。",
    "",
    "---",
    "",
    "Dear " + b.name + ",",
    "",
    "This is a reminder of your appointment tomorrow.",
    "Date & Time: " + b.date + " (" + weekdayEn + ") " + b.time,
    "Saiseikai Chuo Hospital Kenshin Center — Dr. Keiko Lee",
    "Please arrive at least 10 minutes before your appointment.",
  ].join("\n");
  MailApp.sendEmail(b.email, subject, body);
}

// ---------- Shared helpers ----------

/** Maps header name -> 1-indexed column number for the sheet's current header row. */
function getHeaderMap(sheet) {
  const lastCol = sheet.getLastColumn();
  if (lastCol === 0) return {};
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};
  headerRow.forEach((h, i) => {
    if (h) map[String(h)] = i + 1;
  });
  return map;
}

/** Appends any headers missing from the sheet's header row (at the end). */
function ensureHeaders(sheet, headers) {
  const map = getHeaderMap(sheet);
  const missing = headers.filter((h) => !(h in map));
  if (missing.length > 0) {
    const startCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }
  return getHeaderMap(sheet);
}

/** Writes a new row using a {HeaderName: value} object, regardless of column order. */
function appendBookingRow(sheet, map, valuesByHeader) {
  const numCols = sheet.getLastColumn();
  const rowArr = new Array(numCols).fill("");
  Object.keys(valuesByHeader).forEach((h) => {
    if (map[h]) rowArr[map[h] - 1] = valuesByHeader[h];
  });
  sheet.appendRow(rowArr);
}

/** All bookings as objects, read by header name. Includes _row (1-indexed sheet row). */
function readBookings() {
  const sheet = getSheet(BOOKINGS_SHEET);
  const map = getHeaderMap(sheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2 || !map["BookingID"]) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  const out = [];
  values.forEach((row, i) => {
    const id = row[map["BookingID"] - 1];
    if (!id) return;
    out.push({
      _row: i + 2,
      id: id,
      createdAt: map["CreatedAt"] ? normalizeTimestampCell(row[map["CreatedAt"] - 1]) : "",
      date: map["Date"] ? formatDateCell(row[map["Date"] - 1]) : "",
      time: map["Time"] ? normalizeTimeCell(row[map["Time"] - 1]) : "",
      blocks: map["Blocks"] ? Math.max(1, Number(row[map["Blocks"] - 1]) || 1) : 1,
      name: map["Name"] ? row[map["Name"] - 1] : "",
      kana: map["Furigana"] ? row[map["Furigana"] - 1] : "",
      phone: map["Phone"] ? row[map["Phone"] - 1] : "",
      email: map["Email"] ? row[map["Email"] - 1] : "",
      note: map["Note"] ? row[map["Note"] - 1] : "",
      status: map["Status"] ? row[map["Status"] - 1] : "",
      cancelledAt: map["CancelledAt"] ? normalizeTimestampCell(row[map["CancelledAt"] - 1]) : "",
      reminderSent: map["ReminderSent"] ? row[map["ReminderSent"] - 1] : "",
    });
  });
  return out;
}

/** Every 10-minute slot time currently occupied by an active booking on a date. */
function getTakenTimesForDate(dateStr) {
  const taken = new Set();
  readBookings().forEach((b) => {
    if (b.date === dateStr && b.status === "booked") {
      expandSlotTimes(b.time, b.blocks).forEach((t) => taken.add(t));
    }
  });
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

function normalizeTimeCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, TIMEZONE, "HH:mm");
  }
  return String(value);
}

function normalizeTimestampCell(value) {
  if (value instanceof Date) {
    return Utilities.formatDate(value, TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  }
  return String(value);
}

function normalizeNameForCompare(s) {
  return String(s || "")
    .replace(/　/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizePhoneForCompare(s) {
  // Strip a single leading 0 so a number that lost it to Sheets'
  // auto-numeric-conversion still matches ("9012345678" == "09012345678").
  return String(s || "").replace(/\D/g, "").replace(/^0/, "");
}

/**
 * Best-effort repair for a Phone value that lost its leading "0" — either
 * because Sheets auto-converted it to a Number, or because a plain-text
 * reformat already locked that corrupted value in as a string. Matches on
 * shape (exactly 10 digits, nothing else) rather than the cell's current
 * type, since by repair time it may already have been stringified;
 * anything that doesn't look exactly like a zero-less mobile number
 * (already has the 0, has hyphens, wrong length) is left alone rather
 * than guessed at.
 */
function repairPhoneCell(value) {
  const s = String(value == null ? "" : value).trim();
  return /^\d{10}$/.test(s) ? "0" + s : value;
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
