// Dr. Lee Reservation System — configuration
//
// After you deploy the Google Apps Script backend (see
// reservation/README.md), paste the Web App URL below. Everything else
// works out of the box.
const CONFIG = {
  // Example: "https://script.google.com/macros/s/AKfycb.../exec"
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyHDYUh_wEDUCZHy0dzJObCA_gPuLhml8L_S1-DCMSX_yyZRZxpQbGp8okYEQC78Dzm/exec",

  CLINIC: {
    nameJa: "済生会中央病院　健診センター",
    nameEn: "Saiseikai Chuo Hospital Kenshin Center",
    doctorJa: "リー　啓子　医師",
    doctorEn: "Dr. Keiko Lee",
    addressJa: "〒108-0073 東京都港区三田１丁目４−17",
    addressEn: "1-4-17 Mita, Minato-ku, Tokyo 108-0073",
    phone: "03-3451-8211",
  },

  // Clinic is open Wednesdays (3) and Fridays (5) only.
  OPEN_WEEKDAYS: [3, 5],

  // Two sessions, 10-minute slots, last slot leaves room to finish by the
  // session end time (e.g. last morning slot is 12:50–13:00).
  SESSIONS: [
    { id: "am", labelJa: "午前", labelEn: "Morning", start: "10:00", end: "13:00" },
    { id: "pm", labelJa: "午後", labelEn: "Afternoon", start: "14:00", end: "17:00" },
  ],
  SLOT_MINUTES: 10,

  // How many weeks of upcoming Wed/Fri dates to offer.
  WEEKS_AHEAD: 8,

  TIMEZONE: "Asia/Tokyo",
};
