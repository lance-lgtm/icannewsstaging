// App logic for AI for Intermediates: routing, rendering, progress tracking, a little confetti.
// No build step, no dependencies — same engine pattern as the Beginners course.

const STORAGE_KEY = "ai4i_progress_v1";
const CERT_KEY = "ai4i_certificate_name";

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
  wand: "M7.5 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2zM19 3l.7 1.6L21 5l-1.3.7L19 7l-.7-1.3L17 5l1.3-.7L19 3zM12 8l1.8 4L18 13.8 14 16l-1.8 4L10.5 16l-4-2.2L10.5 12l1.5-4z",
  toolbox: "M3 8h18v10a1 1 0 01-1 1H4a1 1 0 01-1-1V8zM7 8V6a2 2 0 012-2h6a2 2 0 012 2v2M3 13h6m6 0h6",
  briefcase: "M4 8h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM9 8V6a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18",
  gear: "M12 8a4 4 0 100 8 4 4 0 000-8zM19.4 13a7.97 7.97 0 000-2l2.1-1.6-2-3.5-2.5 1a8.1 8.1 0 00-1.7-1L14.9 3h-4l-.4 2.9a8.1 8.1 0 00-1.7 1l-2.5-1-2 3.5L6.4 11a7.97 7.97 0 000 2l-2.1 1.6 2 3.5 2.5-1a8.1 8.1 0 001.7 1l.4 2.9h4l.4-2.9a8.1 8.1 0 001.7-1l2.5 1 2-3.5L19.4 13z",
  magnifier: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35",
  compass: "M12 2a10 10 0 100 20 10 10 0 000-20zM15 9l-2 6-6 2 2-6 6-2z",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  sparkle: "M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2L12 2zM5 15l.9 2.6L8.5 18l-2.6.9L5 21l-.9-2.1L1.5 18l2.6-.4L5 15zm14-2l.8 2.3L22 16l-2.2.7L19 19l-.8-2.3L16 16l2.2-.7L19 13z",
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

// ---------- Confetti (respects reduced motion) ----------

function celebrate() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#ff6b4a", "#ffc93c", "#1fa98d", "#ff9f6e"];
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
        <span>AI for Intermediates</span>
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
      const status = complete ? "Leveled up!" : started ? "In progress" : "Not started";
      const accent = ["accent-coral", "accent-sun", "accent-teal"][i % 3];
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
      <div class="hero-blobs" aria-hidden="true"></div>
      <div class="hero-inner">
        <img src="../assets/logo.png" alt="" class="hero-logo">
        <span class="eyebrow">100% free &middot; no grades, just real skills</span>
        <h1>${COURSE.title}</h1>
        <p class="hero-tagline">${COURSE.tagline}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/level/${COURSE.levels[0].id}">
            ${done > 0 ? "Keep going" : "Let's go"} ${icon("arrow", "cta-arrow")}
          </a>
          ${done === total ? `<a class="btn btn-secondary" href="#/certificate">View your certificate</a>` : ""}
        </div>
        <div class="hero-progress">
          <div class="progress-track large"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span>${pct}% leveled up</span>
        </div>
      </div>
    </section>
    <main class="dashboard">
      <h2 class="section-title">Choose your level</h2>
      <div class="level-grid">${cards}</div>
      <p class="cross-link">New here? <a href="../index.html">Start with AI for Beginners</a> first. ${done === total ? `Ready for more? <a href="../builders/">Try AI for Builders</a> next.` : ""}</p>
    </main>
    ${renderFooter()}
  `;
}

function renderLevel(lvl, progress) {
  const idx = levelIndex(lvl.id);
  const state = progress[lvl.id] || { quizDone: false, quizScore: 0 };
  const next = COURSE.levels[idx + 1];
  const prev = COURSE.levels[idx - 1];

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
      `
          : `
        <div class="cert-locked">
          <div class="cert-locked-icon">${icon("compass")}</div>
          <h1>Your certificate is almost ready</h1>
          <p>Finish all ${total} level challenges to unlock it. You're at ${done}/${total} so far (${pct}%) &mdash; so close!</p>
          <a class="btn btn-primary" href="#/">Back to levels ${icon("arrow", "cta-arrow")}</a>
        </div>
      `
      }
    </main>
    ${renderFooter()}
  `;

  if (complete) {
    if (!sessionStorage.getItem("ai4i_celebrated")) {
      celebrate();
      sessionStorage.setItem("ai4i_celebrated", "1");
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
      <p>Free &amp; open AI course for leveling up at work, in business, or in life. No account, no cost, no data leaves your browser &mdash; progress is saved locally on this device.</p>
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
  sessionStorage.removeItem("ai4i_celebrated");
  location.hash = "";
  render();
});

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
