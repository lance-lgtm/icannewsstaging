// Dr. Lee Reservation System — staff admin view
(function () {
  "use strict";

  const STORAGE_KEY = "drlee_admin_key";
  const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
  const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const els = {};
  let allBookings = [];

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.loginCard = document.getElementById("login-card");
    els.listCard = document.getElementById("list-card");
    els.addBookingCard = document.getElementById("add-booking-card");
    els.adminKeyInput = document.getElementById("admin-key");
    els.loginBtn = document.getElementById("login-btn");
    els.loginError = document.getElementById("login-error");
    els.refreshBtn = document.getElementById("refresh-btn");
    els.filterDate = document.getElementById("filter-date");
    els.filterTodayBtn = document.getElementById("filter-today-btn");
    els.filterClearBtn = document.getElementById("filter-clear-btn");
    els.listStatus = document.getElementById("list-status");
    els.bookingsList = document.getElementById("bookings-list");

    els.addBookingForm = document.getElementById("add-booking-form");
    els.abDate = document.getElementById("ab-date");
    els.abTime = document.getElementById("ab-time");
    els.abBlocks = document.getElementById("ab-blocks");
    els.abName = document.getElementById("ab-name");
    els.abKana = document.getElementById("ab-kana");
    els.abPhone = document.getElementById("ab-phone");
    els.abEmail = document.getElementById("ab-email");
    els.abNote = document.getElementById("ab-note");
    els.addBookingError = document.getElementById("add-booking-error");
    els.addBookingSuccess = document.getElementById("add-booking-success");
    els.addBookingBtn = document.getElementById("add-booking-btn");

    els.patientsCard = document.getElementById("patients-card");
    els.patientSearch = document.getElementById("patient-search");
    els.patientsStatus = document.getElementById("patients-status");
    els.patientsList = document.getElementById("patients-list");

    els.loginBtn.addEventListener("click", onLogin);
    els.adminKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onLogin();
    });
    els.refreshBtn.addEventListener("click", () => {
      loadBookings(getKey());
      loadPatients(getKey());
    });
    els.addBookingForm.addEventListener("submit", onAddBooking);
    els.filterDate.addEventListener("change", () => applyFilter());
    els.filterTodayBtn.addEventListener("click", () => {
      els.filterDate.value = todayIsoJst();
      applyFilter();
    });
    els.filterClearBtn.addEventListener("click", () => {
      els.filterDate.value = "";
      applyFilter();
    });
    els.abDate.addEventListener("change", () => populateTimeOptions());
    els.patientSearch.addEventListener("input", () => renderPatients());

    setDefaultDate();
    populateTimeOptions();

    if (!isConfigured()) {
      els.listStatus.innerHTML = statusHtml(
        "予約システムは準備中です。",
        "Booking system is not configured yet."
      );
      return;
    }

    const savedKey = sessionStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      showList();
      loadBookings(savedKey);
      loadPatients(savedKey);
    }
  }

  function isConfigured() {
    return (
      CONFIG.APPS_SCRIPT_URL &&
      CONFIG.APPS_SCRIPT_URL.indexOf("PASTE_YOUR_APPS_SCRIPT_URL") === -1 &&
      CONFIG.APPS_SCRIPT_URL.indexOf("http") === 0
    );
  }

  function statusHtml(ja, en) {
    return `<span class="jp">${ja}</span><span class="en">${en}</span>`;
  }

  function getKey() {
    return sessionStorage.getItem(STORAGE_KEY) || "";
  }

  function onLogin() {
    const key = els.adminKeyInput.value.trim();
    if (!key) return;
    els.loginError.hidden = true;
    sessionStorage.setItem(STORAGE_KEY, key);
    showList();
    loadBookings(key);
    loadPatients(key);
  }

  function showList() {
    els.loginCard.hidden = true;
    els.listCard.hidden = false;
    els.addBookingCard.hidden = false;
    els.patientsCard.hidden = false;
  }

  function backToLogin(message) {
    sessionStorage.removeItem(STORAGE_KEY);
    els.listCard.hidden = true;
    els.addBookingCard.hidden = true;
    els.patientsCard.hidden = true;
    els.loginCard.hidden = false;
    if (message) {
      els.loginError.hidden = false;
      els.loginError.innerHTML = message;
    }
  }

  function apiGet(params) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
    return fetch(url.toString(), { method: "GET" }).then((r) => r.json());
  }

  function apiPost(payload) {
    return fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).then((r) => r.json());
  }

  // ---------- Bookings list ----------

  function loadBookings(key) {
    els.listStatus.innerHTML = statusHtml("読み込み中…", "Loading…");
    els.bookingsList.innerHTML = "";

    apiGet({ action: "list", key })
      .then((res) => {
        if (res && res.error === "unauthorized") {
          backToLogin(statusHtml("管理者キーが正しくありません。", "Incorrect admin key."));
          return;
        }
        if (!res || res.error) throw new Error((res && res.error) || "unknown");
        els.listStatus.innerHTML = "";
        allBookings = res.bookings || [];
        applyFilter();
      })
      .catch(() => {
        els.listStatus.innerHTML = statusHtml(
          "読み込みに失敗しました。再度お試しください。",
          "Failed to load. Please try again."
        );
      });
  }

  function todayIsoJst() {
    const jstStr = new Date().toLocaleString("en-US", { timeZone: CONFIG.TIMEZONE });
    return toISODate(new Date(jstStr));
  }

  function applyFilter() {
    const filterDate = els.filterDate.value;
    els.filterClearBtn.hidden = !filterDate;

    if (filterDate) {
      const dayBookings = allBookings
        .filter((b) => b.date === filterDate)
        .sort((a, b) => a.time.localeCompare(b.time));
      renderBookings(dayBookings, { filtered: true, date: filterDate });
      return;
    }

    const todayIso = todayIsoJst();
    const upcoming = allBookings.filter((b) => b.date >= todayIso);
    renderBookings(upcoming.length > 0 ? upcoming : allBookings, { filtered: false });
  }

  function renderBookings(bookings, opts) {
    els.bookingsList.innerHTML = "";
    if (bookings.length === 0) {
      if (opts && opts.filtered) {
        const d = new Date(opts.date + "T00:00:00");
        els.listStatus.innerHTML = statusHtml(
          `${opts.date}（${WEEKDAY_JA[d.getDay()]}）の予約はありません。`,
          `No bookings on ${opts.date} (${WEEKDAY_EN[d.getDay()]}).`
        );
      } else {
        els.listStatus.innerHTML = statusHtml("予約はありません。", "No bookings yet.");
      }
      return;
    }
    els.listStatus.innerHTML = "";

    const list = bookings;
    let lastDate = null;
    list.forEach((b) => {
      if (b.date !== lastDate) {
        lastDate = b.date;
        const d = new Date(b.date + "T00:00:00");
        const heading = document.createElement("div");
        heading.className = "booking-day";
        heading.textContent = `${b.date} (${WEEKDAY_JA[d.getDay()]}/${WEEKDAY_EN[d.getDay()]})`;
        els.bookingsList.appendChild(heading);
      }

      const row = document.createElement("div");
      row.className = "booking-row" + (b.status === "cancelled" ? " cancelled" : "");

      const time = document.createElement("div");
      time.className = "booking-time";
      time.textContent = formatTimeRange(b.time, b.blocks);

      const info = document.createElement("div");
      info.className = "booking-info";
      info.innerHTML = `
        <div class="b-name">${escapeHtml(b.name)}</div>
        ${b.kana ? `<div class="b-kana">${escapeHtml(b.kana)}</div>` : ""}
        ${b.phone ? `<div class="b-phone">${escapeHtml(b.phone)}</div>` : ""}
        ${b.note ? `<div class="b-note">${escapeHtml(b.note)}</div>` : ""}
        ${b.blocks > 1 ? `<span class="b-blocks">${statusHtml(`${b.blocks}枠`, `${b.blocks} blocks`)}</span>` : ""}
        ${b.status === "cancelled" ? `<span class="b-status-tag">${statusHtml("キャンセル済み", "Cancelled")}</span>` : ""}
      `;

      row.appendChild(time);
      row.appendChild(info);

      if (b.status === "booked") {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "cancel-btn";
        cancelBtn.innerHTML = statusHtml("キャンセル", "Cancel");
        cancelBtn.addEventListener("click", () => onCancel(b.id, cancelBtn));
        row.appendChild(cancelBtn);
      }

      els.bookingsList.appendChild(row);
    });
  }

  function formatTimeRange(time, blocks) {
    if (!blocks || blocks <= 1) return time;
    const [h, m] = time.split(":").map(Number);
    const endMin = h * 60 + m + blocks * 10;
    const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
    const endM = String(endMin % 60).padStart(2, "0");
    return `${time}–${endH}:${endM}`;
  }

  function onCancel(id, btn) {
    const confirmed = window.confirm(
      "この予約をキャンセルしますか？ / Cancel this booking?"
    );
    if (!confirmed) return;

    btn.disabled = true;
    apiPost({ action: "cancel", key: getKey(), id })
      .then((res) => {
        if (res && res.error === "unauthorized") {
          backToLogin(statusHtml("管理者キーが正しくありません。", "Incorrect admin key."));
          return;
        }
        loadBookings(getKey());
      })
      .catch(() => {
        btn.disabled = false;
        window.alert("キャンセルに失敗しました。 / Failed to cancel.");
      });
  }

  // ---------- Patients ----------

  let allPatients = [];

  function loadPatients(key) {
    apiGet({ action: "patients", key })
      .then((res) => {
        if (!res || res.error) throw new Error((res && res.error) || "unknown");
        allPatients = res.patients || [];
        renderPatients();
      })
      .catch(() => {
        els.patientsStatus.innerHTML = statusHtml(
          "患者一覧の読み込みに失敗しました。",
          "Failed to load patient list."
        );
      });
  }

  function renderPatients() {
    const termRaw = els.patientSearch.value.trim();
    const term = termRaw.toLowerCase();
    const termDigits = termRaw.replace(/\D/g, "");

    const matches = !termRaw
      ? allPatients
      : allPatients.filter((p) => {
          const nameMatch =
            (p.name || "").toLowerCase().includes(term) || (p.kana || "").toLowerCase().includes(term);
          const phoneMatch = termDigits && (p.phone || "").replace(/\D/g, "").includes(termDigits);
          return nameMatch || phoneMatch;
        });

    els.patientsList.innerHTML = "";

    if (allPatients.length === 0) {
      els.patientsStatus.innerHTML = statusHtml("患者データはまだありません。", "No patients yet.");
      return;
    }
    if (matches.length === 0) {
      els.patientsStatus.innerHTML = statusHtml("該当する患者が見つかりません。", "No matching patients.");
      return;
    }
    els.patientsStatus.innerHTML = "";

    matches.slice(0, 50).forEach((p) => {
      const row = document.createElement("div");
      row.className = "booking-row";

      const info = document.createElement("div");
      info.className = "booking-info";
      const nextTag = p.nextDate
        ? `<span class="b-next">${statusHtml(`次回: ${p.nextDate} ${p.nextTime}`, `Next: ${p.nextDate} ${p.nextTime}`)}</span>`
        : p.lastDate
        ? `<div class="b-last">${statusHtml(`前回: ${p.lastDate}`, `Last visit: ${p.lastDate}`)}</div>`
        : "";
      info.innerHTML = `
        <div class="b-name">${escapeHtml(p.name)}</div>
        ${p.kana ? `<div class="b-kana">${escapeHtml(p.kana)}</div>` : ""}
        ${p.phone ? `<div class="b-phone">${escapeHtml(p.phone)}</div>` : ""}
        ${nextTag}
      `;

      const useBtn = document.createElement("button");
      useBtn.type = "button";
      useBtn.className = "use-btn";
      useBtn.innerHTML = statusHtml("次回予約を追加", "Book next appointment");
      useBtn.addEventListener("click", () => fillFromPatient(p));

      row.appendChild(info);
      row.appendChild(useBtn);
      els.patientsList.appendChild(row);
    });

    if (matches.length > 50) {
      const more = document.createElement("p");
      more.className = "filter-summary";
      more.innerHTML = statusHtml(
        `他 ${matches.length - 50} 件。検索して絞り込んでください。`,
        `${matches.length - 50} more — narrow your search to see them.`
      );
      els.patientsList.appendChild(more);
    }
  }

  function fillFromPatient(p) {
    els.abName.value = p.name || "";
    els.abKana.value = p.kana || "";
    els.abPhone.value = p.phone || "";
    els.abEmail.value = p.email || "";
    els.addBookingCard.scrollIntoView({ behavior: "smooth", block: "start" });
    els.abDate.focus();
  }

  // ---------- Add booking / block time ----------

  function populateTimeOptions() {
    els.abTime.innerHTML = "";
    const weekday = els.abDate.value ? new Date(els.abDate.value + "T00:00:00").getDay() : null;
    const sessions = (weekday !== null && CONFIG.SESSIONS_BY_WEEKDAY[weekday]) || [];

    if (sessions.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "この日は休診日です / Clinic closed on this date";
      opt.disabled = true;
      els.abTime.appendChild(opt);
      return;
    }

    sessions.forEach((session) => {
      const group = document.createElement("optgroup");
      group.label = `${session.labelJa} / ${session.labelEn}`;
      generateSessionSlots(session).forEach((time) => {
        const opt = document.createElement("option");
        opt.value = time;
        opt.textContent = time;
        group.appendChild(opt);
      });
      els.abTime.appendChild(group);
    });
  }

  function generateSessionSlots(session) {
    const slots = [];
    const startMin = minutesOf(session.start);
    const endMin = minutesOf(session.end);
    for (let t = startMin; t + CONFIG.SLOT_MINUTES <= endMin; t += CONFIG.SLOT_MINUTES) {
      slots.push(
        String(Math.floor(t / 60)).padStart(2, "0") + ":" + String(t % 60).padStart(2, "0")
      );
    }
    return slots;
  }

  function minutesOf(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function setDefaultDate() {
    const jstStr = new Date().toLocaleString("en-US", { timeZone: CONFIG.TIMEZONE });
    const jstNow = new Date(jstStr);
    const iso = toISODate(jstNow);
    els.abDate.min = iso;
    els.abDate.value = iso;
  }

  function toISODate(d) {
    const y = d.getFullYear(),
      m = String(d.getMonth() + 1).padStart(2, "0"),
      day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function onAddBooking(e) {
    e.preventDefault();
    els.addBookingError.hidden = true;
    els.addBookingSuccess.hidden = true;

    const date = els.abDate.value;
    const time = els.abTime.value;
    const blocks = Number(els.abBlocks.value) || 1;
    const name = els.abName.value.trim();
    const kana = els.abKana.value.trim();
    const phone = els.abPhone.value.trim();
    const email = els.abEmail.value.trim();
    const note = els.abNote.value.trim();

    if (!date || !time || !name) {
      showAddError("日付・時刻・お名前は必須です。", "Date, time, and name are required.");
      return;
    }
    const weekday = new Date(date + "T00:00:00").getDay();
    if (CONFIG.OPEN_WEEKDAYS.indexOf(weekday) === -1) {
      showAddError(
        "診療日は水曜日・金曜日のみです。",
        "The clinic is only open Wednesdays and Fridays."
      );
      return;
    }

    els.addBookingBtn.disabled = true;
    els.addBookingBtn.innerHTML = statusHtml("追加中…", "Adding…");

    apiPost({ action: "adminBook", key: getKey(), date, time, blocks, name, kana, phone, email, note })
      .then((res) => {
        if (res && res.error === "unauthorized") {
          backToLogin(statusHtml("管理者キーが正しくありません。", "Incorrect admin key."));
          return;
        }
        if (!res || !res.ok) {
          const code = (res && res.error) || "unknown";
          if (code === "invalid_email") {
            showAddError(
              "メールアドレスの形式が正しくありません。",
              "That email address doesn't look valid."
            );
          } else if (code === "taken") {
            showAddError(
              "その時間帯はすでに一部または全部が埋まっています。",
              "Some or all of that time range is already booked."
            );
          } else if (code === "closed_date") {
            showAddError(
              "その日付は休診日です。",
              "The clinic is closed on that date."
            );
          } else if (code === "out_of_range") {
            showAddError(
              "選択した枠数が診療時間を超えています。",
              "That duration extends past the end of the session."
            );
          } else {
            showAddError("追加に失敗しました。もう一度お試しください。", "Could not add. Please try again.");
          }
          return;
        }
        els.addBookingSuccess.hidden = false;
        els.addBookingSuccess.innerHTML = statusHtml("追加しました。", "Added.");
        els.addBookingForm.reset();
        setDefaultDate();
        populateTimeOptions();
        loadBookings(getKey());
        loadPatients(getKey());
      })
      .catch(() => {
        showAddError("通信エラーが発生しました。もう一度お試しください。", "A network error occurred. Please try again.");
      })
      .finally(() => {
        els.addBookingBtn.disabled = false;
        els.addBookingBtn.innerHTML = statusHtml("追加する", "Add");
      });
  }

  function showAddError(ja, en) {
    els.addBookingError.hidden = false;
    els.addBookingError.innerHTML = statusHtml(ja, en);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
})();
