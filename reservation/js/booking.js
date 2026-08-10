// Dr. Lee Reservation System — patient booking flow
(function () {
  "use strict";

  const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
  const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const state = {
    closedDates: new Set(),
    selectedDate: null, // "YYYY-MM-DD"
    selectedTime: null, // "HH:MM"
    takenTimes: new Set(),
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.offlineBanner = document.getElementById("offline-banner");
    els.dateStatus = document.getElementById("date-status");
    els.dateList = document.getElementById("date-list");
    els.stepDate = document.getElementById("step-date");
    els.stepTime = document.getElementById("step-time");
    els.stepForm = document.getElementById("step-form");
    els.stepConfirm = document.getElementById("step-confirm");
    els.selectedDateLabel = document.getElementById("selected-date-label");
    els.slotStatus = document.getElementById("slot-status");
    els.slotsAm = document.getElementById("slots-am");
    els.slotsPm = document.getElementById("slots-pm");
    els.selectionSummary = document.getElementById("selection-summary");
    els.form = document.getElementById("booking-form");
    els.formError = document.getElementById("form-error");
    els.submitBtn = document.getElementById("submit-btn");
    els.confirmDetails = document.getElementById("confirm-details");
    els.bookAnotherBtn = document.getElementById("book-another-btn");
    els.footerAddress = document.getElementById("footer-address");
    els.footerPhone = document.getElementById("footer-phone");
    els.calendarGoogleBtn = document.getElementById("calendar-google-btn");
    els.calendarIcsBtn = document.getElementById("calendar-ics-btn");

    applyClinicText();

    document.querySelectorAll('[data-action="back-to-date"]').forEach((btn) =>
      btn.addEventListener("click", () => goToStep(1))
    );
    document.querySelectorAll('[data-action="back-to-time"]').forEach((btn) =>
      btn.addEventListener("click", () => goToStep(2))
    );
    els.form.addEventListener("submit", onSubmit);
    els.bookAnotherBtn.addEventListener("click", resetToStart);

    if (!isConfigured()) {
      els.offlineBanner.hidden = false;
      els.dateStatus.innerHTML = statusHtml(
        "予約システムは準備中です。",
        "Booking system is not configured yet."
      );
      return;
    }

    loadDates();
  }

  function isConfigured() {
    return (
      CONFIG.APPS_SCRIPT_URL &&
      CONFIG.APPS_SCRIPT_URL.indexOf("PASTE_YOUR_APPS_SCRIPT_URL") === -1 &&
      CONFIG.APPS_SCRIPT_URL.indexOf("http") === 0
    );
  }

  function applyClinicText() {
    document.title = `ご予約 / Book an Appointment — ${CONFIG.CLINIC.doctorEn}`;
    if (CONFIG.CLINIC.addressJa || CONFIG.CLINIC.addressEn) {
      els.footerAddress.textContent = CONFIG.CLINIC.addressJa;
    }
    if (CONFIG.CLINIC.phone) {
      els.footerPhone.textContent = CONFIG.CLINIC.phone;
    }
  }

  function statusHtml(ja, en) {
    return `<span class="jp">${ja}</span><span class="en">${en}</span>`;
  }

  // ---------- Time helpers (all date math done in JST wall-clock time) ----------

  function jstNow() {
    const str = new Date().toLocaleString("en-US", { timeZone: CONFIG.TIMEZONE });
    return new Date(str);
  }

  function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function minutesOfDay(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function generateSessionSlots(session) {
    const slots = [];
    const startMin = minutesOfDay(session.start);
    const endMin = minutesOfDay(session.end);
    for (let t = startMin; t + CONFIG.SLOT_MINUTES <= endMin; t += CONFIG.SLOT_MINUTES) {
      const h = String(Math.floor(t / 60)).padStart(2, "0");
      const m = String(t % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
    return slots;
  }

  function generateUpcomingDates() {
    const dates = [];
    const now = jstNow();
    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalDays = CONFIG.WEEKS_AHEAD * 7;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(cursor);
      d.setDate(cursor.getDate() + i);
      if (CONFIG.OPEN_WEEKDAYS.includes(d.getDay())) {
        dates.push(d);
      }
    }
    return dates;
  }

  // ---------- API ----------

  function apiGet(params) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
    return fetch(url.toString(), { method: "GET" }).then((r) => r.json());
  }

  function apiPost(payload) {
    // text/plain avoids a CORS preflight against the Apps Script endpoint.
    return fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }

  // ---------- Step 1: dates ----------

  function loadDates() {
    apiGet({ action: "closedDates" })
      .then((res) => {
        state.closedDates = new Set((res && res.closedDates) || []);
        renderDates();
      })
      .catch(() => {
        // Backend unreachable — still let patients pick a date; the
        // per-date availability check will surface the real error.
        renderDates();
        els.dateStatus.innerHTML = "";
      });
  }

  function renderDates() {
    const dates = generateUpcomingDates().filter((d) => !state.closedDates.has(toISODate(d)));
    els.dateList.innerHTML = "";
    els.dateStatus.innerHTML = "";

    if (dates.length === 0) {
      els.dateStatus.innerHTML = statusHtml(
        "現在ご予約可能な日付がありません。",
        "No available dates right now."
      );
      return;
    }

    dates.forEach((d) => {
      const iso = toISODate(d);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "date-chip";
      chip.setAttribute("role", "option");
      chip.dataset.date = iso;
      chip.innerHTML = `
        <span class="weekday">${WEEKDAY_JA[d.getDay()]} / ${WEEKDAY_EN[d.getDay()]}</span>
        <span class="daynum">${d.getMonth() + 1}/${d.getDate()}</span>
      `;
      chip.addEventListener("click", () => selectDate(iso, d));
      els.dateList.appendChild(chip);
    });
  }

  function selectDate(iso, dateObj) {
    state.selectedDate = iso;
    state.selectedTime = null;

    document
      .querySelectorAll(".date-chip")
      .forEach((c) => c.classList.toggle("selected", c.dataset.date === iso));

    const d = dateObj || new Date(iso + "T00:00:00");
    els.selectedDateLabel.innerHTML = statusHtml(
      `選択した日付：${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）`,
      `Selected date: ${WEEKDAY_EN[d.getDay()]}, ${d.getMonth() + 1}/${d.getDate()}`
    );

    goToStep(2);
    loadSlots(iso);
  }

  // ---------- Step 2: time slots ----------

  function loadSlots(iso) {
    els.slotStatus.innerHTML = statusHtml("空き状況を確認中…", "Checking availability…");
    els.slotStatus.classList.remove("error");
    els.slotsAm.innerHTML = "";
    els.slotsPm.innerHTML = "";

    apiGet({ action: "slots", date: iso })
      .then((res) => {
        if (res && res.error) throw new Error(res.error);
        state.takenTimes = new Set((res && res.taken) || []);
        els.slotStatus.innerHTML = "";
        renderSlots(iso);
      })
      .catch(() => {
        els.slotStatus.classList.add("error");
        els.slotStatus.innerHTML = statusHtml(
          "空き状況を取得できませんでした。時間をおいて再度お試しください。",
          "Could not load availability. Please try again shortly."
        );
      });
  }

  function renderSlots(iso) {
    const now = jstNow();
    const isToday = toISODate(now) === iso;
    const nowMin = now.getHours() * 60 + now.getMinutes();

    CONFIG.SESSIONS.forEach((session) => {
      const container = session.id === "am" ? els.slotsAm : els.slotsPm;
      container.innerHTML = "";
      generateSessionSlots(session).forEach((time) => {
        const taken = state.takenTimes.has(time);
        const past = isToday && minutesOfDay(time) <= nowMin;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slot-btn" + (taken || past ? " taken" : "");
        btn.textContent = time;
        btn.disabled = taken || past;
        if (!taken && !past) {
          btn.addEventListener("click", () => selectSlot(time));
        }
        container.appendChild(btn);
      });
    });
  }

  function selectSlot(time) {
    state.selectedTime = time;
    document
      .querySelectorAll(".slot-btn")
      .forEach((b) => b.classList.toggle("selected", b.textContent === time && !b.disabled));

    const d = new Date(state.selectedDate + "T00:00:00");
    els.selectionSummary.innerHTML = statusHtml(
      `${d.getMonth() + 1}月${d.getDate()}日（${WEEKDAY_JA[d.getDay()]}）　${time}〜`,
      `${WEEKDAY_EN[d.getDay()]}, ${d.getMonth() + 1}/${d.getDate()} at ${time}`
    );

    goToStep(3);
  }

  // ---------- Step 3: form ----------

  function onSubmit(e) {
    e.preventDefault();
    els.formError.hidden = true;

    const name = document.getElementById("patient-name").value.trim();
    const kana = document.getElementById("patient-kana").value.trim();
    const phone = document.getElementById("patient-phone").value.trim();
    const email = document.getElementById("patient-email").value.trim();
    const note = document.getElementById("patient-note").value.trim();

    if (!name || !phone) {
      showFormError(
        "お名前と電話番号は必須です。",
        "Name and phone number are required."
      );
      return;
    }

    els.submitBtn.disabled = true;
    els.submitBtn.innerHTML = statusHtml("送信中…", "Submitting…");

    apiPost({
      action: "book",
      date: state.selectedDate,
      time: state.selectedTime,
      name,
      kana,
      phone,
      email,
      note,
    })
      .then((res) => {
        if (!res || !res.ok) {
          const code = (res && res.error) || "unknown";
          if (code === "taken") {
            showFormError(
              "申し訳ございません。この時間は直前に埋まってしまいました。時間を選び直してください。",
              "Sorry, that time was just booked by someone else. Please choose another slot."
            );
            loadSlots(state.selectedDate);
            goToStep(2);
          } else if (code === "invalid_email") {
            showFormError(
              "メールアドレスの形式が正しくありません。",
              "That email address doesn't look valid."
            );
          } else {
            showFormError(
              "予約の送信に失敗しました。もう一度お試しください。",
              "Could not submit the booking. Please try again."
            );
          }
          return;
        }
        showConfirmation({ name, phone, note });
      })
      .catch(() => {
        showFormError(
          "通信エラーが発生しました。もう一度お試しください。",
          "A network error occurred. Please try again."
        );
      })
      .finally(() => {
        els.submitBtn.disabled = false;
        els.submitBtn.innerHTML = statusHtml("この内容で予約する", "Confirm Booking");
      });
  }

  function showFormError(ja, en) {
    els.formError.hidden = false;
    els.formError.innerHTML = statusHtml(ja, en);
  }

  function showConfirmation(details) {
    const d = new Date(state.selectedDate + "T00:00:00");
    els.confirmDetails.innerHTML = `
      <dt>${statusHtml("日時", "Date &amp; Time")}</dt>
      <dd>${d.getMonth() + 1}/${d.getDate()} (${WEEKDAY_JA[d.getDay()]}/${WEEKDAY_EN[d.getDay()]}) ${state.selectedTime}</dd>
      <dt>${statusHtml("お名前", "Name")}</dt>
      <dd>${escapeHtml(details.name)}</dd>
      <dt>${statusHtml("電話番号", "Phone")}</dt>
      <dd>${escapeHtml(details.phone)}</dd>
    `;
    setCalendarLinks(state.selectedDate, state.selectedTime);
    goToStep(4);
  }

  let icsBlobUrl = null;

  function setCalendarLinks(dateStr, timeStr) {
    const start = new Date(dateStr + "T" + timeStr + ":00+09:00");
    const end = new Date(start.getTime() + CONFIG.SLOT_MINUTES * 60 * 1000);
    const title = `${CONFIG.CLINIC.doctorJa} 予約 / Appointment — ${CONFIG.CLINIC.doctorEn}`;
    const location = CONFIG.CLINIC.addressJa || CONFIG.CLINIC.addressEn || "";
    const description =
      `${CONFIG.CLINIC.nameJa} / ${CONFIG.CLINIC.nameEn}\n` +
      "診療開始の10分前までにお越しください。 / Please arrive 10 minutes early.";

    const startIcs = toIcsUtc(start);
    const endIcs = toIcsUtc(end);

    const gcalParams = new URLSearchParams({
      action: "TEMPLATE",
      text: title,
      dates: `${startIcs}/${endIcs}`,
      details: description,
      location: location,
    });
    els.calendarGoogleBtn.href = `https://calendar.google.com/calendar/render?${gcalParams.toString()}`;

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Dr. Lee Reservation System//JP",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@lee-clinic-reservation`,
      `DTSTAMP:${toIcsUtc(new Date())}`,
      `DTSTART:${startIcs}`,
      `DTEND:${endIcs}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText(location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    if (icsBlobUrl) URL.revokeObjectURL(icsBlobUrl);
    icsBlobUrl = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    els.calendarIcsBtn.href = icsBlobUrl;
  }

  function toIcsUtc(d) {
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function escapeIcsText(str) {
    return String(str || "")
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function resetToStart() {
    els.form.reset();
    state.selectedDate = null;
    state.selectedTime = null;
    goToStep(1);
    loadDates();
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- Step navigation ----------

  function goToStep(n) {
    [els.stepDate, els.stepTime, els.stepForm, els.stepConfirm].forEach((el, i) => {
      el.hidden = i !== n - 1;
    });
    [1, 2, 3, 4].forEach((i) => {
      const dot = document.getElementById(`progress-${i}`);
      dot.classList.toggle("active", i === n);
      dot.classList.toggle("done", i < n);
    });
    els.stepDate.closest("main").scrollTo?.({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
})();
