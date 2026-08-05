// App logic: routing, rendering, progress tracking. No build step, no dependencies.

const STORAGE_KEY = "ai4b_progress_v1";
const CERT_KEY = "ai4b_certificate_name";

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

function isModuleComplete(progress, moduleId) {
  return !!(progress[moduleId] && progress[moduleId].quizDone);
}

function courseCompletion(progress) {
  const total = COURSE.modules.length;
  const done = COURSE.modules.filter((m) => isModuleComplete(progress, m.id)).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

const ICONS = {
  sparkles: "M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2L12 2zM5 15l.9 2.6L8.5 18l-2.6.9L5 21l-.9-2.1L1.5 18l2.6-.4L5 15zm14-2l.8 2.3L22 16l-2.2.7L19 19l-.8-2.3L16 16l2.2-.7L19 13z",
  brain: "M9 2a3 3 0 00-3 3v.2A3.5 3.5 0 004 8.5a3.5 3.5 0 001.3 2.7A3.5 3.5 0 004 14a3.5 3.5 0 003.5 3.5H8a3 3 0 003 3V2H9zm6 0a3 3 0 00-3 0v18.5a3 3 0 003-3 3.5 3.5 0 003.5-3.5 3.5 3.5 0 00-1.3-2.7A3.5 3.5 0 0020 8.5 3.5 3.5 0 0016.8 5.2 3 3 0 0015 2z",
  chat: "M4 4h16a1 1 0 011 1v11a1 1 0 01-1 1H8l-4 4V6a1 1 0 011-1z",
  wand: "M7.5 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM19 3l.7 1.6L21 5l-1.3.7L19 7l-.7-1.3L17 5l1.3-.7L19 3zM12 8l1.8 4L18 13.8 14 16l-1.8 4L10.5 16l-4-2.2L10.5 12l1.5-4z",
  calendar: "M7 2v2M17 2v2M3 8h18M4 6h16a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z",
  shield: "M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
};

function icon(name, cls) {
  return `<svg class="icon ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[name]}"/></svg>`;
}

function findModule(id) {
  return COURSE.modules.find((m) => m.id === id);
}

function moduleIndex(id) {
  return COURSE.modules.findIndex((m) => m.id === id);
}

// ---------- Rendering ----------

const app = document.getElementById("app");

function render() {
  const hash = location.hash.replace(/^#\/?/, "");
  const progress = loadProgress();

  if (hash.startsWith("module/")) {
    const id = hash.split("/")[1];
    const mod = findModule(id);
    if (mod) return renderModule(mod, progress);
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
        <img src="assets/logo.png" alt="" class="brand-icon">
        <span>AI for Beginners</span>
      </a>
      <div class="header-progress">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
        <span class="progress-label">${done}/${total} modules</span>
      </div>
    </header>
  `;
}

function renderDashboard(progress) {
  const { done, total, pct } = courseCompletion(progress);
  const cards = COURSE.modules
    .map((m, i) => {
      const complete = isModuleComplete(progress, m.id);
      const started = !!progress[m.id];
      const status = complete ? "Completed" : started ? "In progress" : "Not started";
      return `
        <a class="module-card ${complete ? "is-complete" : ""}" href="#/module/${m.id}">
          <div class="module-card-top">
            <span class="module-icon">${icon(m.icon)}</span>
            <span class="module-badge ${complete ? "badge-complete" : started ? "badge-progress" : ""}">${status}</span>
          </div>
          <h3>${i + 1}. ${m.title}</h3>
          <p>${m.summary}</p>
          <span class="module-cta">Open module ${icon("arrow", "cta-arrow")}</span>
        </a>
      `;
    })
    .join("");

  app.innerHTML = `
    ${renderHeader(progress)}
    <section class="hero">
      <div class="hero-inner">
        <img src="assets/logo.png" alt="" class="hero-logo">
        <span class="eyebrow">100% free &middot; everyone starts somewhere</span>
        <h1>${COURSE.title}</h1>
        <p class="hero-tagline">${COURSE.tagline}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/module/${COURSE.modules[0].id}">
            ${done > 0 ? "Continue learning" : "Start learning"} ${icon("arrow", "cta-arrow")}
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
      <h2 class="section-title">Course modules</h2>
      <div class="module-grid">${cards}</div>
      <p class="cross-link">Finished the basics? <a href="intermediate/">Try AI for Intermediates</a> next.</p>
    </main>
    ${renderFooter()}
  `;
}

function renderModule(mod, progress) {
  const idx = moduleIndex(mod.id);
  const state = progress[mod.id] || { lessonsRead: [], quizDone: false, quizScore: 0 };
  const next = COURSE.modules[idx + 1];
  const prev = COURSE.modules[idx - 1];

  const lessonsHtml = mod.lessons
    .map(
      (l, i) => `
      <article class="lesson" id="lesson-${i}">
        <h3>${i + 1}. ${l.title}</h3>
        <div class="lesson-body">${l.html}</div>
      </article>
    `
    )
    .join("");

  const quizHtml = renderQuiz(mod, state);

  app.innerHTML = `
    ${renderHeader(progress)}
    <main class="module-page">
      <a class="back-link" href="#/">${icon("arrow", "back-arrow")} All modules</a>
      <div class="module-page-head">
        <span class="module-icon large">${icon(mod.icon)}</span>
        <div>
          <span class="eyebrow">Module ${idx + 1} of ${COURSE.modules.length}</span>
          <h1>${mod.title}</h1>
          <p>${mod.summary}</p>
        </div>
      </div>

      <div class="lessons">${lessonsHtml}</div>

      <section class="quiz-section" id="quiz">
        <h2>Check your understanding</h2>
        ${quizHtml}
      </section>

      <nav class="module-nav">
        ${prev ? `<a class="btn btn-secondary" href="#/module/${prev.id}">${icon("arrow", "back-arrow")} ${prev.title}</a>` : `<span></span>`}
        ${
          next
            ? `<a class="btn btn-primary" href="#/module/${next.id}">${next.title} ${icon("arrow", "cta-arrow")}</a>`
            : `<a class="btn btn-primary" href="#/certificate">Get your certificate ${icon("arrow", "cta-arrow")}</a>`
        }
      </nav>
    </main>
    ${renderFooter()}
  `;

  attachQuizHandlers(mod);
}

function renderQuiz(mod, state) {
  if (state.quizDone) {
    return `
      <div class="quiz-result">
        <div class="quiz-result-icon">${icon("check")}</div>
        <p><strong>Quiz complete!</strong> You scored ${state.quizScore}/${mod.quiz.length}.</p>
        <button class="btn btn-secondary btn-small" data-action="retake">Retake quiz</button>
      </div>
    `;
  }

  const questions = mod.quiz
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
      <button type="submit" class="btn btn-primary">Submit answers</button>
      <p class="quiz-hint">Answer honestly &mdash; you can always retake it.</p>
    </form>
  `;
}

function attachQuizHandlers(mod) {
  const form = document.getElementById("quiz-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const answers = mod.quiz.map((_, qi) => {
        const checked = form.querySelector(`input[name="q${qi}"]:checked`);
        return checked ? parseInt(checked.value, 10) : null;
      });

      if (answers.some((a) => a === null)) {
        alert("Please answer every question before submitting.");
        return;
      }

      let score = 0;
      mod.quiz.forEach((q, qi) => {
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
      progress[mod.id] = progress[mod.id] || {};
      progress[mod.id].quizDone = true;
      progress[mod.id].quizScore = score;
      saveProgress(progress);

      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.textContent = `Scored ${score}/${mod.quiz.length} — see results above`;
      submitBtn.disabled = true;

      updateHeaderProgress();
    });
  }

  const retakeBtn = document.querySelector('[data-action="retake"]');
  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      const progress = loadProgress();
      if (progress[mod.id]) {
        progress[mod.id].quizDone = false;
      }
      saveProgress(progress);
      render();
      document.getElementById("quiz").scrollIntoView({ behavior: "smooth" });
    });
  }
}

function updateHeaderProgress() {
  const progress = loadProgress();
  const { done, total, pct } = courseCompletion(progress);
  const fill = document.querySelector(".header-progress .progress-fill");
  const label = document.querySelector(".header-progress .progress-label");
  if (fill) fill.style.width = pct + "%";
  if (label) label.textContent = `${done}/${total} modules`;
}

function renderCertificate(progress) {
  const { done, total, pct } = courseCompletion(progress);
  const complete = done === total;
  const savedName = localStorage.getItem(CERT_KEY) || "";

  app.innerHTML = `
    ${renderHeader(progress)}
    <main class="certificate-page">
      <a class="back-link" href="#/">${icon("arrow", "back-arrow")} All modules</a>
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
            <div class="cert-seal"><img src="assets/logo.png" alt="" class="cert-seal-logo"></div>
            <p class="cert-issuer">Issued by <strong>I CAN + AI</strong></p>
            <p class="cert-cta">Want to go further for your job, business, or personal life?<br>Continue learning at <a href="https://icanjapan.ai/" target="_blank" rel="noopener">icanjapan.ai</a></p>
          </div>
        </div>
      `
          : `
        <div class="cert-locked">
          <div class="cert-locked-icon">${icon("shield")}</div>
          <h1>Your certificate is almost ready</h1>
          <p>Complete all ${total} module quizzes to unlock your certificate. You've finished ${done}/${total} so far (${pct}%).</p>
          <a class="btn btn-primary" href="#/">Back to modules ${icon("arrow", "cta-arrow")}</a>
        </div>
      `
      }
    </main>
    ${renderFooter()}
  `;

  if (complete) {
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
      <p>Free &amp; open AI literacy course for beginners. No account, no cost, no data leaves your browser &mdash; progress is saved locally on this device.</p>
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
  location.hash = "";
  render();
});

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
