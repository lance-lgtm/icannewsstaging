// Dr. Lee Reservation System — staff admin view
(function () {
  "use strict";

  const STORAGE_KEY = "drlee_admin_key";
  const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
  const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.loginCard = document.getElementById("login-card");
    els.listCard = document.getElementById("list-card");
    els.adminKeyInput = document.getElementById("admin-key");
    els.loginBtn = document.getElementById("login-btn");
    els.loginError = document.getElementById("login-error");
    els.refreshBtn = document.getElementById("refresh-btn");
    els.listStatus = document.getElementById("list-status");
    els.bookingsList = document.getElementById("bookings-list");

    els.loginBtn.addEventListener("click", onLogin);
    els.adminKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") onLogin();
    });
    els.refreshBtn.addEventListener("click", () => loadBookings(getKey()));

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
  }

  function showList() {
    els.loginCard.hidden = true;
    els.listCard.hidden = false;
  }

  function backToLogin(message) {
    sessionStorage.removeItem(STORAGE_KEY);
    els.listCard.hidden = true;
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
        renderBookings(res.bookings || []);
      })
      .catch(() => {
        els.listStatus.innerHTML = statusHtml(
          "読み込みに失敗しました。再度お試しください。",
          "Failed to load. Please try again."
        );
      });
  }

  function renderBookings(bookings) {
    els.bookingsList.innerHTML = "";
    if (bookings.length === 0) {
      els.listStatus.innerHTML = statusHtml("予約はありません。", "No bookings yet.");
      return;
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const upcoming = bookings.filter((b) => b.date >= todayIso);
    const list = upcoming.length > 0 ? upcoming : bookings;

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
      time.textContent = b.time;

      const info = document.createElement("div");
      info.className = "booking-info";
      info.innerHTML = `
        <div class="b-name">${escapeHtml(b.name)}</div>
        ${b.kana ? `<div class="b-kana">${escapeHtml(b.kana)}</div>` : ""}
        <div class="b-phone">${escapeHtml(b.phone)}</div>
        ${b.note ? `<div class="b-note">${escapeHtml(b.note)}</div>` : ""}
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

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
})();
