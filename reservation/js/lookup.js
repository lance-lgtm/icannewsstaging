// Dr. Lee Reservation System — "check my appointment" lookup
(function () {
  "use strict";

  const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];
  const WEEKDAY_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    els.offlineBanner = document.getElementById("offline-banner");
    els.form = document.getElementById("lookup-form");
    els.nameInput = document.getElementById("lookup-name");
    els.phoneInput = document.getElementById("lookup-phone");
    els.lookupError = document.getElementById("lookup-error");
    els.lookupBtn = document.getElementById("lookup-btn");
    els.resultsCard = document.getElementById("results-card");
    els.resultsStatus = document.getElementById("results-status");
    els.resultsList = document.getElementById("results-list");
    els.footerAddress = document.getElementById("footer-address");
    els.footerPhone = document.getElementById("footer-phone");

    applyClinicText();
    els.form.addEventListener("submit", onSubmit);

    if (!isConfigured()) {
      els.offlineBanner.hidden = false;
      els.form.querySelector("button").disabled = true;
    }
  }

  function isConfigured() {
    return (
      CONFIG.APPS_SCRIPT_URL &&
      CONFIG.APPS_SCRIPT_URL.indexOf("PASTE_YOUR_APPS_SCRIPT_URL") === -1 &&
      CONFIG.APPS_SCRIPT_URL.indexOf("http") === 0
    );
  }

  function applyClinicText() {
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

  function apiGet(params) {
    const url = new URL(CONFIG.APPS_SCRIPT_URL);
    Object.keys(params).forEach((k) => url.searchParams.set(k, params[k]));
    return fetch(url.toString(), { method: "GET" }).then((r) => r.json());
  }

  function onSubmit(e) {
    e.preventDefault();
    els.lookupError.hidden = true;

    const name = els.nameInput.value.trim();
    const phone = els.phoneInput.value.trim();
    if (!name || !phone) {
      showError("お名前と電話番号を入力してください。", "Please enter your name and phone number.");
      return;
    }

    els.lookupBtn.disabled = true;
    els.lookupBtn.innerHTML = statusHtml("確認中…", "Checking…");

    apiGet({ action: "myBookings", name, phone })
      .then((res) => {
        if (!res || res.error) throw new Error((res && res.error) || "unknown");
        renderResults(res.bookings || []);
      })
      .catch(() => {
        showError(
          "確認できませんでした。時間をおいて再度お試しください。",
          "Could not check right now. Please try again shortly."
        );
      })
      .finally(() => {
        els.lookupBtn.disabled = false;
        els.lookupBtn.innerHTML = statusHtml("確認する", "Check");
      });
  }

  function showError(ja, en) {
    els.lookupError.hidden = false;
    els.lookupError.innerHTML = statusHtml(ja, en);
  }

  function renderResults(bookings) {
    els.resultsCard.hidden = false;
    els.resultsList.innerHTML = "";

    if (bookings.length === 0) {
      els.resultsStatus.innerHTML = statusHtml(
        "該当するご予約が見つかりませんでした。ご予約時と同じお名前・電話番号でご入力ください。",
        "No matching appointment found. Make sure the name and phone number match exactly what you entered when booking."
      );
      return;
    }

    els.resultsStatus.innerHTML = "";
    bookings.forEach((b) => {
      const d = new Date(b.date + "T00:00:00");
      const row = document.createElement("div");
      row.className = "appointment-row";
      row.innerHTML = `
        <div class="appointment-date">${b.date.slice(5).replace("-", "/")} (${WEEKDAY_JA[d.getDay()]}/${WEEKDAY_EN[d.getDay()]})</div>
        <div class="appointment-time">${formatTimeRange(b.time, b.blocks)}</div>
        ${b.note ? `<div class="appointment-note">${escapeHtml(b.note)}</div>` : ""}
      `;
      els.resultsList.appendChild(row);
    });
  }

  function formatTimeRange(time, blocks) {
    if (!blocks || blocks <= 1) return time;
    const [h, m] = time.split(":").map(Number);
    const endMin = h * 60 + m + blocks * (CONFIG.SLOT_MINUTES || 10);
    const endH = String(Math.floor(endMin / 60)).padStart(2, "0");
    const endM = String(endMin % 60).padStart(2, "0");
    return `${time}–${endH}:${endM}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }
})();
