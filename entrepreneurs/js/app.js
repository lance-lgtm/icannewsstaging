// App logic for AI for Entrepreneurs: routing, rendering, progress tracking, celebration burst.
// No build step, no dependencies — same engine pattern as the other courses.

const STORAGE_KEY = "ai4e_progress_v1";
const CERT_KEY = "ai4e_certificate_name";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function isLevelComplete(progress, levelId) {
  return !!(progress[levelId] && progress[levelId].quizDone);
}

function courseCompletion(progress) {
  const total = COURSE.levels.length;
  const done = COURSE.levels.filter((m) => isLevelComplete(progress, m.id)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

const ICONS = {
  compass: "M12 2a10 10 0 100 20 10 10 0 000-20zM15 9l-2 6-6 2 2-6 6-2z",
  users: "M8 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 12a3.5 3.5 0 100-7M14 14.5c2.9.4 5 2.8 5 5.5",
  coin: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v10M9 9.5c0-1.4 1.3-2.5 3-2.5s3 .8 3 2c0 3-6 1.5-6 4.5 0 1.2 1.3 2 3 2s3-1.1 3-2.5",
  megaphone: "M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM15 8a4 4 0 010 8M18 5a8 8 0 010 14",
  team: "M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0M10 20a6 6 0 0112 0",
  shield: "M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
};

function icon(name, cls) {
  return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></svg>`;
}

function findLevel(id) {
  return COURSE.levels.find((m) => m.id === id);
}

function levelIndex(id) {
  return COURSE.levels.findIndex((m) => m.id === id);
}

// ---------- Celebration burst (respects reduced motion) ----------

function celebrate() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#146c43", "#d4a017", "#0b4a34", "#e8c468"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  for (let i = 0; i < 28; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.animationDuration = 1.6 + Math.random() * 1 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 3200);
}

// ---------- Rendering ----------

const app = document.getElementById("app");

function render() {
  const hash = location.hash.replace(/^#\/?/, "");
  const progress = loadProgress();

  if (hash.startsWith("level/")) {
    const id = hash.split("/")[1];
    const lvl = findLevel(id);
    if (lvl) return renderLevel(lvl, progress);
  }
  if (hash === "certificate") {
    return renderCertificate(progress);
  }
  return renderDashboard(progress);
}

function renderHeader(progress) {
  const { done, total, pct } = courseCompletion(progress);
  return `
    <header class="site-header">
      <a class="brand" href="#/">
        <img src="../assets/logo.png" alt="" class="brand-icon">
        <span>AI for Entrepreneurs</span>
      </a>
      <div class="header-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${done}/${total} levels</span>
      </div>
    </header>
  `;
}

function renderDashboard(progress) {
  const { done, total, pct } = courseCompletion(progress);
  const cards = COURSE.levels
    .map((m, i) => {
      const complete = isLevelComplete(progress, m.id);
      const started = !!progress[m.id];
      const status = complete ? "Growing!" : started ? "In progress" : "Not started";
      const accent = ["accent-green", "accent-gold", "accent-forest"][i % 3];
      return `
        <a class="level-card ${accent} ${complete ? "is-complete" : ""}" href="#/level/${m.id}">
          <div class="level-card-top">
            <span class="level-icon">${icon(m.icon)}</span>
            <span class="level-badge ${complete ? "badge-complete" : started ? "badge-progress" : ""}">${status}</span>
          </div>
          <span class="level-kicker">Level ${i + 1}</span>
          <h3>${m.title}</h3>
          <p>${m.summary}</p>
          <span class="level-cta">Open level ${icon("arrow", "cta-arrow")}</span>
        </a>
      `;
    })
    .join("");

  app.innerHTML = `
    ${renderHeader(progress)}
    <section class="hero">
      <div class="hero-lines" aria-hidden="true"></div>
      <div class="hero-inner">
        <img src="../assets/logo.png" alt="" class="hero-logo">
        <span class="eyebrow">100% free &middot; turn "someday" into a plan</span>
        <h1>${COURSE.title}</h1>
        <p class="hero-tagline">${COURSE.tagline}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/level/${COURSE.levels[0].id}">
            ${done > 0 ? "Keep growing" : "Start growing"} ${icon("arrow", "cta-arrow")}
          </a>
          ${done === total ? `<a class="btn btn-secondary" href="#/certificate">View your certificate</a>` : ""}
        </div>
        <div class="hero-progress">
          <div class="progress-track large"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span>${pct}% complete</span>
        </div>
      </div>
    </section>
    <main class="dashboard">
      <h2 class="section-title">Choose your level</h2>
      <div class="level-grid">${cards}</div>
      <p class="cross-link">New here? <a href="../index.html">Start with AI for Beginners</a>. Skipped a step? <a href="../creators/">Catch up with AI for Creators</a>. ${done === total ? `Ready to go even further? <a href="../advanced/">Try AI for Advanced</a> next.` : ""}</p>
    </main>
    ${renderFooter()}
  `;
}

function nextCourseLinkHtml() {
  return `Ready to go even further? <a href="../advanced/">Try AI for Advanced</a> next.`;
}

function renderLevel(lvl, progress) {
  const idx = levelIndex(lvl.id);
  const state = progress[lvl.id] || { quizDone: false, quizScore: 0 };
  const next = COURSE.levels[idx + 1];
  const prev = COURSE.levels[idx - 1];
  const { done, total } = courseCompletion(progress);

  const lessonsHtml = lvl.lessons
    .map(
      (l, i) => `
      <article class="lesson" id="lesson-${i}">
        <h3>${i + 1}. ${l.title}</h3>
        <div class="lesson-body">${l.html}</div>
      </article>
    `
    )
    .join("");

  const quizHtml = renderQuiz(lvl, state);

  app.innerHTML = `
    ${renderHeader(progress)}
    <main class="level-page">
      <a class="back-link" href="#/">${icon("arrow", "back-arrow")} All levels</a>
      <div class="level-page-head">
        <span class="level-icon large">${icon(lvl.icon)}</span>
        <div>
          <span class="eyebrow">Level ${idx + 1} of ${COURSE.levels.length}</span>
          <h1>${lvl.title}</h1>
          <p>${lvl.summary}</p>
        </div>
      </div>

      <div class="lessons">${lessonsHtml}</div>

      <section class="quiz-section" id="quiz">
        <h2>Quick Challenge</h2>
        <p class="quiz-lead">Show what you've got — no pressure, retake anytime.</p>
        ${quizHtml}
      </section>

      <nav class="level-nav">
        ${prev ? `<a class="btn btn-secondary" href="#/level/${prev.id}">${icon("arrow", "back-arrow")} ${prev.title}</a>` : `<span></span>`}
        ${
          next
            ? `<a class="btn btn-primary" href="#/level/${next.id}">${next.title} ${icon("arrow", "cta-arrow")}</a>`
            : `<a class="btn btn-primary" href="#/certificate">Get your certificate ${icon("arrow", "cta-arrow")}</a>`
        }
      </nav>
      ${done === total ? `<p class="cross-link module-nav-crosslink">${nextCourseLinkHtml()}</p>` : ""}
    </main>
    ${renderFooter()}
  `;

  attachQuizHandlers(lvl);
}

function renderQuiz(lvl, state) {
  if (state.quizDone) {
    return `
      <div class="quiz-result">
        <div class="quiz-result-icon">${icon("check")}</div>
        <p><strong>Nice! You scored ${state.quizScore}/${lvl.quiz.length}.</strong> Level complete.</p>
        <button class="btn btn-secondary btn-small" data-action="retake">Retake challenge</button>
      </div>
    `;
  }

  const questions = lvl.quiz
    .map(
      (q, qi) => `
      <fieldset class="quiz-question" data-qindex="${qi}">
        <legend>${qi + 1}. ${q.q}</legend>
        <div class="quiz-options">
          ${q.options
            .map(
              (opt, oi) => `
              <label class="quiz-option">
                <input type="radio" name="q${qi}" value="${oi}">
                <span>${opt}</span>
              </label>
            `
            )
            .join("")}
        </div>
      </fieldset>
    `
    )
    .join("");

  return `
    <form class="quiz-form" id="quiz-form">
      ${questions}
      <button type="submit" class="btn btn-primary">Check my answers</button>
      <p class="quiz-hint">Answer honestly &mdash; you can always retake it.</p>
    </form>
  `;
}

function attachQuizHandlers(lvl) {
  const form = document.getElementById("quiz-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const answers = lvl.quiz.map((_, qi) => {
        const checked = form.querySelector(`input[name="q${qi}"]:checked`);
        return checked ? parseInt(checked.value, 10) : null;
      });

      if (answers.some((a) => a === null)) {
        alert("Please answer every question before submitting.");
        return;
      }

      let score = 0;
      lvl.quiz.forEach((q, qi) => {
        const fieldset = form.querySelector(`[data-qindex="${qi}"]`);
        const labels = fieldset.querySelectorAll(".quiz-option");
        const correct = answers[qi] === q.answer;
        if (correct) score++;
        labels.forEach((label, oi) => {
          label.classList.remove("is-correct", "is-incorrect");
          if (oi === q.answer) label.classList.add("is-correct");
          else if (oi === answers[qi]) label.classList.add("is-incorrect");
        });
        let expl = fieldset.querySelector(".quiz-explain");
        if (!expl) {
          expl = document.createElement("p");
          expl.className = "quiz-explain";
          fieldset.appendChild(expl);
        }
        expl.textContent = q.explain;
        fieldset.querySelectorAll("input").forEach((i) => (i.disabled = true));
      });

      const progress = loadProgress();
      const wasComplete = isLevelComplete(progress, lvl.id);
      progress[lvl.id] = progress[lvl.id] || {};
      progress[lvl.id].quizDone = true;
      progress[lvl.id].quizScore = score;
      saveProgress(progress);

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.textContent = `Scored ${score}/${lvl.quiz.length} — see results above`;
      submitBtn.disabled = true;

      if (!wasComplete) {
        celebrate();
        const { done, total } = courseCompletion(progress);
        if (done === total) {
          setTimeout(celebrate, 500);
        }
      }

      updateHeaderProgress();
      showNextCourseLinkIfComplete(progress);
    });
  }

  const retakeBtn = document.querySelector('[data-action="retake"]');
  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      const progress = loadProgress();
      if (progress[lvl.id]) {
        progress[lvl.id].quizDone = false;
      }
      saveProgress(progress);
      render();
      document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
    });
  }
}

function showNextCourseLinkIfComplete(progress) {
  const { done, total } = courseCompletion(progress);
  if (done !== total) return;
  const nav = document.querySelector(".level-nav");
  if (!nav || document.querySelector(".module-nav-crosslink")) return;
  const p = document.createElement("p");
  p.className = "cross-link module-nav-crosslink";
  p.innerHTML = nextCourseLinkHtml();
  nav.insertAdjacentElement("afterend", p);
}

function updateHeaderProgress() {
  const progress = loadProgress();
  const { done, total, pct } = courseCompletion(progress);
  const fill = document.querySelector(".header-progress .progress-fill");
  const label = document.querySelector(".header-progress .progress-label");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${done}/${total} levels`;
}

function renderCertificate(progress) {
  const { done, total, pct } = courseCompletion(progress);
  const complete = done === total;
  const savedName = localStorage.getItem(CERT_KEY) || "";

  app.innerHTML = `
    ${renderHeader(progress)}
    <main class="certificate-page">
      <a class="back-link" href="#/">${icon("arrow", "back-arrow")} All levels</a>
      ${
        complete
          ? `
        <div class="cert-form no-print">
          <label for="cert-name">Your name for the certificate</label>
          <input id="cert-name" type="text" placeholder="e.g. Alex Rivera" value="${savedName.replace(/"/g, "&quot;")}">
          <button class="btn btn-primary" id="print-cert">Print / save as PDF</button>
        </div>
        <div class="certificate" id="certificate">
          <div class="cert-border">
            <span class="cert-eyebrow">Certificate of Completion</span>
            <h1 id="cert-name-display">${savedName || "Your Name"}</h1>
            <p>has successfully completed</p>
            <h2>${COURSE.title}</h2>
            <p class="cert-date">${new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
            <div class="cert-seal"><img src="../assets/logo.png" alt="" class="cert-seal-logo"></div>
            <p class="cert-issuer">Issued by <strong>I CAN + AI</strong></p>
            <p class="cert-cta">Want to go further for your job, business, or personal life?<br>Continue learning at <a href="https://icanjapan.ai/" target="_blank" rel="noopener">icanjapan.ai</a></p>
          </div>
        </div>
        <p class="cross-link no-print">Ready to go even further? <a href="../advanced/">Try AI for Advanced</a> next.</p>
      `
          : `
        <div class="cert-locked">
          <div class="cert-locked-icon">${icon("shield")}</div>
          <h1>Your certificate is almost ready</h1>
          <p>Finish all ${total} level challenges to unlock it. You're at ${done}/${total} so far (${pct}%) &mdash; keep going!</p>
          <a class="btn btn-primary" href="#/">Back to levels ${icon("arrow", "cta-arrow")}</a>
        </div>
      `
      }
    </main>
    ${renderFooter()}
  `;

  if (complete) {
    if (!sessionStorage.getItem("ai4e_celebrated")) {
      celebrate();
      sessionStorage.setItem("ai4e_celebrated", "1");
    }
    const input = document.getElementById("cert-name");
    const display = document.getElementById("cert-name-display");
    input.addEventListener("input", () => {
      display.textContent = input.value.trim() || "Your Name";
      localStorage.setItem(CERT_KEY, input.value);
    });
    document.getElementById("print-cert").addEventListener("click", () => window.print());
  }
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <p>Free &amp; open AI course for entrepreneurs and business owners. No account, no cost, no data leaves your browser &mdash; progress is saved locally on this device.</p>
      <button class="reset-link" type="button" data-action="reset-progress">Reset progress</button>
    </footer>
  `;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest('[data-action="reset-progress"]')) return;
  const ok = confirm("Reset all your progress on this course? This can't be undone.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CERT_KEY);
  sessionStorage.removeItem("ai4e_celebrated");
  location.hash = "";
  render();
});

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
