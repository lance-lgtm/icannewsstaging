/* =========================================================================
   TSUGU — app logic (view router + interactions)
   No build step, no framework — a static frontend, optionally backed by
   one serverless function (functions/api/analyze.js) for real recognition.

   analyzePhoto() sends the captured photo to that backend, which calls
   Claude's vision API server-side and returns structured JSON. If no
   backend is deployed, the request fails, or times out, it degrades to
   content.js's local color/aspect-ratio heuristic (buildAnalysis) instead
   of breaking — see secondlife/README.md for how to deploy the real thing.
   ========================================================================= */

(function () {
  "use strict";

  const state = {
    photos: [],
    guidanceIndex: 0,
    currentAction: null,
    points: 1240,
    itemsPassed: 18,
    earned: 32400,
    session: null, // { token, user: { id, email, displayName } } once logged in
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ----------------------------- Router ----------------------------- */

  function navigate(viewId) {
    $all(".view").forEach((v) => v.classList.remove("active"));
    const view = $("#view-" + viewId);
    if (!view) return;
    view.classList.add("active");

    const topbar = $("#topbar");
    const back = view.getAttribute("data-back");
    topbar.classList.toggle("has-back", !!back);
    $("#backBtn").dataset.target = back || "";

    const title = view.getAttribute("data-title");
    if (title) $("#topbarTitle").textContent = title;
    $("#topbarSub").textContent = view.getAttribute("data-sub") || "";

    $all(".tab-btn").forEach((t) => t.classList.toggle("active", t.dataset.nav === viewId));

    $("#views").scrollTop = 0;
    window.scrollTo(0, 0);

    if (state.voiceGuide && "speechSynthesis" in window && title) {
      speakGuide(title);
    }
  }

  $("#backBtn").addEventListener("click", () => {
    const target = $("#backBtn").dataset.target;
    if (target) navigate(target);
  });

  $all("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.nav;
      if (target === "camera") resetCamera();
      navigate(target);
    });
  });

  $("#fabCamera").addEventListener("click", () => {
    resetCamera();
    navigate("camera");
  });
  $("#btnTakePhoto").addEventListener("click", () => {
    resetCamera();
    navigate("camera");
  });

  /* ----------------------------- Toast ----------------------------- */

  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function speakGuide(text) {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ja-JP";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech synthesis unavailable — silently degrade */ }
  }

  /* ----------------------------- Points ----------------------------- */

  function addPoints(n) {
    state.points += n;
    $all("#pointsCount").forEach((el) => (el.textContent = state.points.toLocaleString("ja-JP")));
    const profileNum = $("#view-profile .impact-card .ic-num");
    if (profileNum) profileNum.textContent = state.points.toLocaleString("ja-JP") + "pt";
  }

  /* ----------------------------- Camera flow ----------------------------- */

  const cameraInput = $("#cameraInput");
  const btnShoot = $("#btnShoot");
  const btnSkipMore = $("#btnSkipMore");
  const btnSamplePhoto = $("#btnSamplePhoto");

  function resetCamera() {
    state.photos = [];
    state.guidanceIndex = 0;
    $("#thumbStrip").innerHTML = "";
    $("#framePreview").hidden = true;
    $("#framePlaceholder").hidden = false;
    btnSkipMore.hidden = true;
    btnShoot.innerHTML = '<svg class="icon" style="width:18px;height:18px"><use href="#i-camera"/></svg>撮影する';
    setGuidance(0);
  }

  function setGuidance(i) {
    const step = GUIDANCE_STEPS[Math.min(i, GUIDANCE_STEPS.length - 1)];
    $("#guidanceText").innerHTML = step.ja + '<span class="en">' + step.en + "</span>";
  }

  function addCapturedPhoto(url, opts) {
    state.photos.push(url);
    // Kick off recognition on the photo itself now, so it's ready by the
    // time the analyzing animation finishes. Overwriting on every capture
    // means the most recent photo (the one shown on the item card) is what
    // gets recognized.
    state.pendingAnalysis = (opts && opts.skipBackend)
      ? prepareImage(url).then(localFallbackAnalysis)
      : analyzePhoto(url);

    $("#framePreview").src = url;
    $("#framePreview").hidden = false;
    $("#framePlaceholder").hidden = true;

    const thumb = document.createElement("img");
    thumb.src = url;
    $("#thumbStrip").appendChild(thumb);
  }

  const FALLBACK_DETECTION = { colorName: "ナチュラルカラー", bucket: "square" };
  const ANALYZE_ENDPOINT = "/api/analyze"; // Cloudflare Pages Function — see functions/api/analyze.js
  const ANALYZE_TIMEOUT_MS = 15000;
  const MAX_IMAGE_DIM = 1024;

  // Loads the photo once and produces everything downstream needs from it:
  // a resized/compressed JPEG (for sending to the recognition backend) plus
  // the local color/aspect-ratio heuristic (used as a fallback, and for the
  // sample-photo path which is an SVG illustration, not a real photo).
  // Never rejects — any failure resolves to null and callers fall back.
  function prepareImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        try {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          const ratio = w ? h / w : 1;
          const bucket = ratio >= 1.15 ? "tall" : ratio <= 0.85 ? "wide" : "square";

          const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(w, h));
          const cw = Math.max(1, Math.round(w * scale));
          const ch = Math.max(1, Math.round(h * scale));
          const canvas = document.createElement("canvas");
          canvas.width = cw;
          canvas.height = ch;
          canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);

          const sampleSize = 24;
          const sample = document.createElement("canvas");
          sample.width = sampleSize;
          sample.height = sampleSize;
          const sctx = sample.getContext("2d");
          sctx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const data = sctx.getImageData(0, 0, sampleSize, sampleSize).data;
          let r = 0, g = 0, b = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
          const color = nearestColor([r / n, g / n, b / n]);

          resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), colorName: color.name, bucket });
        } catch (e) {
          // Canvas pixel access can be blocked in some sandboxed contexts —
          // resolve null rather than hanging; callers fall back gracefully.
          resolve(null);
        }
      };
      img.src = url;
    });
  }

  function localFallbackAnalysis(prepared) {
    const d = prepared || FALLBACK_DETECTION;
    return { ...buildAnalysis(d.bucket, d.colorName), source: "local" };
  }

  // Sends the photo to the real vision-recognition backend (see
  // functions/api/analyze.js). If no backend is deployed yet, the network
  // fails, the request times out, or the model's response doesn't parse,
  // this degrades to the local color/aspect-ratio heuristic instead of
  // breaking the flow — the app always produces *a* result.
  async function analyzePhoto(url) {
    const prepared = await prepareImage(url);
    if (!prepared) return localFallbackAnalysis(null);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);
      let res;
      try {
        res = await fetch(ANALYZE_ENDPOINT, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ image: prepared.dataUrl }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) throw new Error("analyze endpoint returned " + res.status);
      const analysis = analysisFromBackendJson(await res.json());
      if (!analysis) throw new Error("malformed analyze response");
      return analysis;
    } catch (e) {
      console.warn("[TSUGU] real recognition unavailable, using local heuristic:", e && e.message);
      return localFallbackAnalysis(prepared);
    }
  }

  const RECOMMENDATION_ACTIONS = ["keep", "sell", "give", "gift", "donate", "recycle", "dispose"];

  // Normalizes the backend's JSON into exactly the shape buildAnalysis()
  // produces, so renderItemCard()/prefillListing() don't need to know or
  // care which source the analysis came from. Defends against a malformed
  // or partial model response with sane fallbacks per field.
  function analysisFromBackendJson(json) {
    if (!json || typeof json !== "object" || !json.recommendation) return null;
    const action = RECOMMENDATION_ACTIONS.includes(json.recommendation.action)
      ? json.recommendation.action : "sell";
    try {
      return {
        source: "backend",
        name: String(json.titleJa || "認識されたアイテム"),
        brandLine: String(json.brandLine || ""),
        quick: [
          { label: "ブランド", value: String(json.brand || "不明"), icon: "i-tag" },
          { label: "カラー", value: String(json.colorJa || "—"), icon: "i-sparkle", estimate: !!json.colorEstimate },
          { label: "サイズ", value: String(json.sizeLabel || "—"), icon: "i-type", estimate: json.sizeEstimate !== false },
          { label: "状態", value: String(json.condition || "—"), icon: "i-check-circle" },
          { label: "推定価値", value: String(json.estValueText || "不明"), icon: "i-sparkle", estimate: true, span2: true },
          { label: "寸法", value: String(json.dimensions || "—"), icon: "i-box", estimate: json.dimensionsEstimate !== false, span2: true },
        ],
        full: Array.isArray(json.full) ? json.full.filter((row) => Array.isArray(row) && row.length === 2) : [],
        recommendation: {
          action,
          tagJa: json.recommendation.tagJa || ("おすすめ · " + action.toUpperCase()),
          title: json.recommendation.title || "",
          text: json.recommendation.text || "",
        },
        brand: String(json.brand || "不明"),
        sizeLabel: String(json.sizeLabel || "—"),
        dimensions: String(json.dimensions || "—"),
        condition: String(json.condition || "—"),
        conditionEn: String(json.conditionEn || json.condition || ""),
        titleJa: String(json.titleJa || "認識されたアイテム"),
        titleEn: String(json.titleEn || json.titleJa || "Recognized Item"),
        descriptionJa: String(json.descriptionJa || ""),
        descriptionEn: String(json.descriptionEn || ""),
        estValueText: String(json.estValueText || "不明"),
        askPriceText: String(json.askPriceText || "—"),
        keywords: Array.isArray(json.keywords) ? json.keywords.slice(0, 8).map(String) : [],
      };
    } catch (e) {
      return null;
    }
  }

  btnShoot.addEventListener("click", () => {
    // On platforms where the OS camera/file picker can't be reached (e.g. a
    // sandboxed preview with no camera permission), .click() is a silent
    // no-op — the sample-photo button below is the guaranteed fallback.
    try {
      cameraInput.click();
    } catch (e) {
      toast("カメラを開けませんでした。「サンプル写真で試す」をお使いください。");
    }
  });

  btnSamplePhoto.addEventListener("click", () => {
    // The sample photo is an illustration (SVG), not a real photograph, so
    // it's never sent to the vision backend — go straight to the local
    // heuristic, which is all an illustration can meaningfully drive anyway.
    addCapturedPhoto(SAMPLE_PHOTO, { skipBackend: true });
    startAnalysis();
  });

  cameraInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addCapturedPhoto(url);

    state.guidanceIndex = Math.min(state.guidanceIndex + 1, GUIDANCE_STEPS.length - 1);
    setGuidance(state.guidanceIndex);

    btnShoot.innerHTML = '<svg class="icon" style="width:18px;height:18px"><use href="#i-camera"/></svg>もう一枚撮る';
    if (state.photos.length >= 1) {
      btnSkipMore.hidden = false;
      btnSkipMore.textContent = "この内容で解析する";
    }
    if (state.guidanceIndex >= GUIDANCE_STEPS.length - 1) {
      // AI has run out of follow-up guidance — move straight to analysis.
      setTimeout(startAnalysis, 500);
    }
    cameraInput.value = "";
  });

  btnSkipMore.addEventListener("click", startAnalysis);

  function startAnalysis() {
    if (state.photos.length === 0) {
      toast("まず写真を撮影してください");
      return;
    }
    navigate("analyzing");
    const steps = $all(".analyzing-step");
    steps.forEach((s) => s.classList.remove("done"));
    steps.forEach((s, i) => {
      setTimeout(() => s.classList.add("done"), 420 * (i + 1));
    });

    // A real vision-API round trip can run longer than the fixed step
    // animation — once the steps finish, let the user know we're still
    // waiting rather than leaving the screen looking stalled.
    const statusEl = $("#analyzingStatus");
    const waitMsgTimer = setTimeout(() => {
      if (statusEl) statusEl.textContent = "もう少しお待ちください…";
    }, 420 * steps.length + 1800);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 420 * steps.length + 500));
    const fallback = () => localFallbackAnalysis(null);
    const analysis = (state.pendingAnalysis || Promise.resolve(fallback())).catch(fallback);

    Promise.all([analysis, minDelay]).then(([result]) => {
      clearTimeout(waitMsgTimer);
      if (statusEl) statusEl.textContent = "AIが写真を確認しています…";
      renderItemCard(result);
      navigate("itemcard");
    });
  }

  /* ----------------------------- Item card ----------------------------- */

  function renderItemCard(analysis) {
    const r = analysis || localFallbackAnalysis(null);
    state.currentAnalysis = r;
    const heroImg = $("#itemHeroImg");
    const lastPhoto = state.photos[state.photos.length - 1];
    if (lastPhoto) {
      heroImg.src = lastPhoto;
      heroImg.hidden = false;
    } else {
      heroImg.hidden = true;
    }
    $("#itemName").textContent = r.name;
    $("#itemBrandLine").textContent = r.brandLine;

    // Make it visually unmistakable when this result is the local
    // color/shape guess (no backend reachable) vs. real AI recognition —
    // the two must never look identical, or a demo guess reads as a broken
    // real answer.
    const isLocal = r.source === "local";
    $("#sourceBadge").classList.toggle("local-guess", isLocal);
    $("#sourceBadgeText").textContent = isLocal ? "簡易判定（デモ）・Local Guess (Demo)" : "AI推定・AI Estimate";
    if (isLocal && !state.localGuessNoticeShown) {
      state.localGuessNoticeShown = true;
      toast("実際のAI認識ではなく簡易判定です（バックエンド未設定）");
    }

    const grid = $("#itemDetailGrid");
    grid.innerHTML = r.quick.map((q) => `
      <div class="detail-cell${q.span2 ? " span2" : ""}">
        <div class="dc-label"><svg class="icon" style="width:12px;height:12px"><use href="#${q.icon}"/></svg>${q.label}${q.estimate ? '<span class="estimate-flag">推定</span>' : ""}</div>
        <div class="dc-value">${q.value}</div>
      </div>`).join("");

    const dl = $("#detailFullList");
    dl.innerHTML = r.full.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("");
    $("#detailFull").classList.remove("open");
    $("#detailExpandBtn").classList.remove("open");

    const reco = r.recommendation;
    const banner = $("#recoBanner");
    banner.className = "reco-banner"; // reset tone classes
    banner.style.background = `var(--${reco.action}-bg)`;
    $("#recoIcon").style.background = "rgba(255,255,255,0.55)";
    $("#recoIcon").style.color = `var(--${reco.action})`;
    $("#recoIcon").innerHTML = `<svg class="icon"><use href="#${ACTION_ICON[reco.action]}"/></svg>`;
    $("#recoTag").textContent = reco.tagJa;
    $("#recoTag").style.color = `var(--${reco.action})`;
    $("#recoTitle").textContent = reco.title;
    $("#recoText").textContent = reco.text;

    $all(".action-btn").forEach((b) => b.classList.remove("selected"));
    state.currentAction = null;
  }

  $("#detailExpandBtn").addEventListener("click", () => {
    $("#detailExpandBtn").classList.toggle("open");
    $("#detailFull").classList.toggle("open");
  });

  $("#actionGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".action-btn");
    if (!btn) return;
    const action = btn.dataset.action;
    $all(".action-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.currentAction = action;

    if (action === "keep") {
      addPoints(5);
      toast("保管リストに追加しました（+5pt）");
      setTimeout(() => navigate("home"), 700);
    } else if (["sell", "give", "gift", "donate"].includes(action)) {
      if (action === "give") toast(OTHER_RECOMMENDATIONS.give.text);
      setTimeout(() => {
        prefillListing(action);
        navigate("listing");
      }, action === "give" ? 900 : 250);
    } else if (action === "recycle") {
      toast("お住まいの自治体のリサイクル区分をご案内します");
    } else if (action === "dispose") {
      toast("ごみ集積所の出し方をご案内します（自治体ルールに従ってください）");
    }
  });

  /* ----------------------------- Listing assistant ----------------------------- */

  function prefillListing(action) {
    const actionLabels = { sell: "出品", give: "お譲り", gift: "プレゼント", donate: "寄付" };
    $("#topbarSub").textContent = "AI Listing Assistant · " + (actionLabels[action] || "");

    const a = state.currentAnalysis;
    if (!a) return;
    $("#lsTitle").value = a.titleJa;
    $("#lsBrand").value = a.brand;
    $("#lsSize").value = a.sizeLabel;
    $("#lsCondition").value = a.condition;
    $("#lsDim").value = a.dimensions;
    $("#lsDesc").value = a.descriptionJa;
    $("#lsEstValue").value = a.estValueText;
    $("#lsAsk").value = a.askPriceText;
    $("#lsKeywords").innerHTML = a.keywords.map((k) => `<span class="chip">${k}</span>`).join("");
    $all(".lang-toggle button").forEach((b) => b.classList.toggle("active", b.dataset.lang === "ja"));
  }

  $(".lang-toggle").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-lang]");
    if (!btn) return;
    $all(".lang-toggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const a = state.currentAnalysis;
    if (!a) return;
    const isEn = btn.dataset.lang === "en";
    $("#lsTitle").value = isEn ? a.titleEn : a.titleJa;
    $("#lsCondition").value = isEn ? a.conditionEn : a.condition;
    $("#lsDesc").value = isEn ? a.descriptionEn : a.descriptionJa;
  });

  $("#btnPublishListing").addEventListener("click", () => {
    addPoints(50);
    state.itemsPassed += 1;
    navigate("listing-success");
  });

  /* ----------------------------- Inventory ----------------------------- */

  function renderCategoryGrid() {
    $("#categoryGrid").innerHTML = CATEGORIES.map((c) => `
      <button class="category-tile" data-cat="${c.id}" style="background:var(--card)">
        <div class="ct-icon ${c.tone}"><svg class="icon"><use href="#${c.icon}"/></svg></div>
        <div><div class="ct-name">${c.name}</div><div class="ct-count">${c.count}点</div></div>
      </button>`).join("");
  }
  renderCategoryGrid();

  $("#categoryGrid").addEventListener("click", (e) => {
    const tile = e.target.closest(".category-tile");
    if (!tile) return;
    const cat = CATEGORIES.find((c) => c.id === tile.dataset.cat);
    const items = CATEGORY_ITEMS[cat.id] || [];
    $("#view-inventory-category").setAttribute("data-title", cat.name);
    $("#categoryItemGrid").innerHTML = items.map((it) => `
      <div class="item-tile" style="background:linear-gradient(135deg, ${it.gradient[0]}, ${it.gradient[1]})">
        <div class="it-icon"><svg class="icon" style="width:16px;height:16px;stroke:#fff"><use href="#${ACTION_ICON[it.action]}"/></svg></div>
        <div class="it-dot" style="background:var(--${it.action})"></div>
        <div class="it-name">${it.name}</div>
      </div>`).join("") || '<div class="empty-state" style="grid-column:1/-1"><svg class="mascot mascot-md" style="margin:0 auto 10px"><use href="#i-mascot"/></svg>まだアイテムがありません</div>';
    navigate("inventory-category");
  });

  $(".ask-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".ask-chip");
    if (!chip) return;
    $all(".ask-chip").forEach((c) => c.style.background = "");
    const answer = ASK_ANSWERS[chip.dataset.ask];
    $("#askAnswerText").textContent = answer;
    $("#askAnswer").classList.add("show");
  });

  /* ----------------------------- Marketplace ----------------------------- */

  function renderMarketList() {
    $("#marketList").innerHTML = MARKET_LISTINGS.map((l) => `
      <div class="listing-row">
        <div class="lr-thumb" style="background:var(--${l.tone}-bg);color:var(--${l.tone})">
          <svg class="icon"><use href="#${l.icon}"/></svg>
        </div>
        <div class="lr-body">
          <div class="lr-title">${l.title}</div>
          <div class="lr-price">${l.price}</div>
          <div class="lr-meta">${l.meta}</div>
          <div class="badge-row">
            ${l.badges.map(([label, tone]) => `<span class="verify-badge ${tone}"><svg class="icon"><use href="#i-check-circle"/></svg>${label}</span>`).join("")}
          </div>
        </div>
      </div>`).join("");
  }
  renderMarketList();

  $("#btnTrustSettings").addEventListener("click", () => navigate("trust-settings"));
  $("#btnSaveTrust").addEventListener("click", () => {
    toast("連絡設定を保存しました");
    navigate("marketplace");
  });

  /* ----------------------------- Legacy mode ----------------------------- */

  let recognizing = false;
  let recognizer = null;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  $("#btnMic").addEventListener("click", () => {
    const micBtn = $("#btnMic");
    const textarea = $("#legacyStoryText");

    if (SpeechRecognition) {
      if (recognizing) {
        recognizer && recognizer.stop();
        return;
      }
      recognizer = new SpeechRecognition();
      recognizer.lang = "ja-JP";
      recognizer.interimResults = true;
      recognizer.onstart = () => { recognizing = true; micBtn.classList.add("recording"); };
      recognizer.onresult = (ev) => {
        let text = "";
        for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
        textarea.value = text;
      };
      recognizer.onerror = () => { recognizing = false; micBtn.classList.remove("recording"); };
      recognizer.onend = () => {
        recognizing = false;
        micBtn.classList.remove("recording");
        if (textarea.value.trim()) toast("音声を物語に変換しました");
      };
      recognizer.start();
    } else {
      // Graceful fallback when SpeechRecognition isn't supported.
      micBtn.classList.add("recording");
      toast("録音中…（このブラウザでは音声認識が利用できないため、例文を表示します）");
      setTimeout(() => {
        micBtn.classList.remove("recording");
        textarea.value = "このサクソフォンは1978年に東京で買いました。40年近く吹き続けました。これからも音楽を続けてくれる若い人に渡したいです。";
        toast("音声を物語に変換しました");
      }, 2200);
    }
  });

  /* ----------------------------- Accessibility / settings ----------------------------- */

  function loadPrefs() {
    try {
      const largeText = localStorage.getItem("tsugu_largeText") === "1";
      const voiceGuide = localStorage.getItem("tsugu_voiceGuide") === "1";
      const helperMode = localStorage.getItem("tsugu_helperMode") === "1";
      $("#toggleLargeText").checked = largeText;
      $("#toggleVoiceGuide").checked = voiceGuide;
      $("#toggleHelperMode").checked = helperMode;
      document.documentElement.classList.toggle("large-text", largeText);
      state.voiceGuide = voiceGuide;
    } catch (e) { /* localStorage unavailable (private mode etc.) — use defaults */ }
  }

  $("#toggleLargeText").addEventListener("change", (e) => {
    document.documentElement.classList.toggle("large-text", e.target.checked);
    try { localStorage.setItem("tsugu_largeText", e.target.checked ? "1" : "0"); } catch (err) {}
  });

  $("#toggleVoiceGuide").addEventListener("change", (e) => {
    state.voiceGuide = e.target.checked;
    try { localStorage.setItem("tsugu_voiceGuide", e.target.checked ? "1" : "0"); } catch (err) {}
    if (e.target.checked) speakGuide("音声ガイドをオンにしました");
  });

  $("#toggleHelperMode").addEventListener("change", (e) => {
    try { localStorage.setItem("tsugu_helperMode", e.target.checked ? "1" : "0"); } catch (err) {}
    toast(e.target.checked ? "ファミリー・ヘルパーモードをオンにしました" : "ファミリー・ヘルパーモードをオフにしました");
  });

  /* ----------------------------- Community: session + API ----------------------------- */

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function loadSession() {
    try {
      const raw = localStorage.getItem("tsugu_session");
      if (raw) state.session = JSON.parse(raw);
    } catch (e) { /* localStorage unavailable — stay logged out */ }
  }

  function saveSession(session) {
    state.session = session;
    try {
      if (session) localStorage.setItem("tsugu_session", JSON.stringify(session));
      else localStorage.removeItem("tsugu_session");
    } catch (e) {}
  }

  // Thin fetch wrapper: attaches the session token, normalizes errors to a
  // Japanese message (from the API's { error } body, or a network-failure
  // message — most likely because this is running somewhere, like the
  // Artifact preview sandbox, that can't reach a deployed backend at all),
  // and signs the user out on an expired/invalid session.
  async function apiFetch(path, options) {
    const opts = Object.assign({}, options);
    opts.headers = Object.assign({ "content-type": "application/json" }, options && options.headers);
    if (state.session && state.session.token) {
      opts.headers.authorization = "Bearer " + state.session.token;
    }

    let res;
    try {
      res = await fetch(path, opts);
    } catch (e) {
      throw new Error("コミュニティ機能を利用するには、実際にデプロイされたサイトが必要です。");
    }

    let data = null;
    try { data = await res.json(); } catch (e) {}

    if (res.status === 401 && state.session) {
      saveSession(null);
      stopPolling();
      updateCommunityUI();
      toast("セッションが切れました。再度ログインしてください。");
      navigate("auth");
    }

    if (!res.ok) throw new Error((data && data.error) || ("エラーが発生しました（" + res.status + "）"));
    return data;
  }

  function formatRelativeTime(ms) {
    const min = Math.floor((Date.now() - ms) / 60000);
    if (min < 1) return "たった今";
    if (min < 60) return min + "分前";
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + "時間前";
    const day = Math.floor(hr / 24);
    if (day < 7) return day + "日前";
    return new Date(ms).toLocaleDateString("ja-JP");
  }

  function formatTime(ms) {
    return new Date(ms).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  }

  /* ----------------------------- Community: auth ----------------------------- */

  function updateCommunityUI() {
    const loggedIn = !!(state.session && state.session.user);
    $("#communityLoggedOut").hidden = loggedIn;
    $("#communityLoggedIn").hidden = !loggedIn;
    if (loggedIn) {
      $("#communityUserName").textContent = state.session.user.displayName;
      refreshCommunityStats();
    }
  }

  async function refreshCommunityStats() {
    try {
      const [following, followers, pending] = await Promise.all([
        apiFetch("/api/follows?type=following"),
        apiFetch("/api/follows?type=followers"),
        apiFetch("/api/follows?type=pending"),
      ]);
      $("#statFollowing").textContent = following.items.length;
      $("#statFollowers").textContent = followers.items.length;
      $("#statPending").textContent = pending.items.length;
    } catch (e) { /* the marketplace still works even if this quietly fails */ }
  }

  $all("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $all("[data-auth-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.dataset.authTab;
      $("#loginForm").hidden = mode !== "login";
      $("#signupForm").hidden = mode !== "signup";
    });
  });

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#loginError").hidden = true;
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: $("#loginEmail").value, password: $("#loginPassword").value }),
      });
      saveSession(data);
      updateCommunityUI();
      startPolling();
      toast("ログインしました");
      navigate("marketplace");
    } catch (err) {
      $("#loginError").textContent = err.message;
      $("#loginError").hidden = false;
    }
  });

  $("#signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#signupError").hidden = true;
    try {
      const data = await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          displayName: $("#signupName").value,
          email: $("#signupEmail").value,
          password: $("#signupPassword").value,
        }),
      });
      saveSession(data);
      updateCommunityUI();
      startPolling();
      toast("アカウントを作成しました");
      navigate("marketplace");
    } catch (err) {
      $("#signupError").textContent = err.message;
      $("#signupError").hidden = false;
    }
  });

  $("#btnLogout").addEventListener("click", async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); } catch (e) {}
    saveSession(null);
    stopPolling();
    updateCommunityUI();
    toast("ログアウトしました");
  });

  /* ----------------------------- Community: find people ----------------------------- */

  function relationshipButton(u) {
    if (u.relationship === "accepted") return '<button class="btn btn-outline" disabled>フォロー中</button>';
    if (u.relationship === "pending_outgoing") return '<button class="btn btn-outline" disabled>リクエスト済み</button>';
    if (u.relationship === "pending_incoming") return '<button class="btn btn-outline" data-goto-pending="1">リクエストを確認</button>';
    return `<button class="btn btn-gold" data-follow-user="${u.id}">フォロー</button>`;
  }

  function renderFindPeopleResults(users) {
    $("#findPeopleResults").innerHTML = users.map((u) => `
      <div class="person-row">
        <div class="person-avatar">${escapeHtml(u.displayName.slice(0, 1))}</div>
        <div class="person-body person-name">${escapeHtml(u.displayName)}</div>
        <div class="person-actions">${relationshipButton(u)}</div>
      </div>`).join("") || '<div class="empty-state">見つかりませんでした</div>';
  }

  let findPeopleTimer = null;
  $("#findPeopleQuery").addEventListener("input", () => {
    clearTimeout(findPeopleTimer);
    findPeopleTimer = setTimeout(runFindPeopleSearch, 350);
  });

  async function runFindPeopleSearch() {
    const q = $("#findPeopleQuery").value.trim();
    if (!q) { $("#findPeopleResults").innerHTML = ""; return; }
    try {
      const data = await apiFetch("/api/users?query=" + encodeURIComponent(q));
      renderFindPeopleResults(data.users);
    } catch (e) { toast(e.message); }
  }

  $("#findPeopleResults").addEventListener("click", async (e) => {
    const followBtn = e.target.closest("[data-follow-user]");
    const gotoPending = e.target.closest("[data-goto-pending]");
    if (followBtn) {
      try {
        await apiFetch("/api/follows", { method: "POST", body: JSON.stringify({ followeeId: followBtn.dataset.followUser }) });
        toast("フォローリクエストを送信しました");
        runFindPeopleSearch();
      } catch (err) { toast(err.message); }
    } else if (gotoPending) {
      openFollowersTab("pending");
    }
  });

  /* ----------------------------- Community: followers / following / requests ----------------------------- */

  let followersTab = "followers";

  function openFollowersTab(tab) {
    followersTab = tab;
    $all("#followersTabs [data-follow-tab]").forEach((b) => b.classList.toggle("active", b.dataset.followTab === tab));
    navigate("followers");
    loadFollowersTab();
  }

  $all(".community-stat").forEach((btn) => {
    btn.addEventListener("click", () => openFollowersTab(btn.dataset.tab));
  });

  $all("#followersTabs [data-follow-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $all("#followersTabs [data-follow-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      followersTab = btn.dataset.followTab;
      loadFollowersTab();
    });
  });

  async function loadFollowersTab() {
    try {
      const data = await apiFetch("/api/follows?type=" + followersTab);
      renderFollowersList(data.items);
    } catch (e) { toast(e.message); }
  }

  function renderFollowersList(items) {
    if (!items.length) {
      $("#followersList").innerHTML = '<div class="empty-state">まだありません</div>';
      return;
    }
    $("#followersList").innerHTML = items.map((it) => {
      let actions;
      if (followersTab === "pending") {
        actions = `<button class="btn btn-gold" data-accept="${it.id}">承認</button><button class="btn btn-outline" data-reject="${it.id}">拒否</button>`;
      } else if (followersTab === "followers") {
        actions = `<button class="btn btn-outline" data-message-user="${it.userId}">メッセージ</button><button class="btn btn-ghost" data-remove="${it.id}">削除</button>`;
      } else {
        actions = `<button class="btn btn-outline" data-message-user="${it.userId}">メッセージ</button><button class="btn btn-ghost" data-unfollow="${it.id}">解除</button>`;
      }
      return `<div class="person-row">
        <div class="person-avatar">${escapeHtml(it.displayName.slice(0, 1))}</div>
        <div class="person-body person-name">${escapeHtml(it.displayName)}</div>
        <div class="person-actions">${actions}</div>
      </div>`;
    }).join("");
  }

  $("#followersList").addEventListener("click", async (e) => {
    const accept = e.target.closest("[data-accept]");
    const reject = e.target.closest("[data-reject]");
    const remove = e.target.closest("[data-remove]");
    const unfollow = e.target.closest("[data-unfollow]");
    const messageBtn = e.target.closest("[data-message-user]");
    try {
      if (accept) {
        await apiFetch("/api/follows/" + accept.dataset.accept, { method: "PATCH", body: JSON.stringify({ action: "accept" }) });
        toast("承認しました");
        loadFollowersTab();
        refreshCommunityStats();
      } else if (reject) {
        await apiFetch("/api/follows/" + reject.dataset.reject, { method: "DELETE" });
        toast("拒否しました");
        loadFollowersTab();
        refreshCommunityStats();
      } else if (remove) {
        await apiFetch("/api/follows/" + remove.dataset.remove, { method: "DELETE" });
        toast("フォロワーを削除しました");
        loadFollowersTab();
        refreshCommunityStats();
      } else if (unfollow) {
        await apiFetch("/api/follows/" + unfollow.dataset.unfollow, { method: "DELETE" });
        toast("フォローを解除しました");
        loadFollowersTab();
        refreshCommunityStats();
      } else if (messageBtn) {
        openThread(messageBtn.dataset.messageUser);
      }
    } catch (err) { toast(err.message); }
  });

  /* ----------------------------- Community: messages ----------------------------- */

  async function loadInbox() {
    try {
      const data = await apiFetch("/api/messages/threads");
      renderInbox(data.threads);
    } catch (e) { toast(e.message); }
  }

  function renderInbox(threads) {
    if (!threads.length) {
      $("#inboxList").innerHTML = '<div class="empty-state">まだメッセージがありません</div>';
      return;
    }
    $("#inboxList").innerHTML = threads.map((t) => `
      <div class="person-row inbox-row${t.unreadCount > 0 ? " unread" : ""}" data-thread-user="${t.userId}">
        <div class="person-avatar">${escapeHtml(t.displayName.slice(0, 1))}</div>
        <div class="person-body">
          <div class="person-name">${escapeHtml(t.displayName)}</div>
          <div class="inbox-preview">${escapeHtml(t.lastMessage)}</div>
        </div>
        <div class="inbox-meta">
          <div class="inbox-time">${formatRelativeTime(t.lastAt)}</div>
          ${t.unreadCount > 0 ? `<div class="inbox-unread-badge">${t.unreadCount}</div>` : ""}
        </div>
      </div>`).join("");
  }

  $("#inboxList").addEventListener("click", (e) => {
    const row = e.target.closest("[data-thread-user]");
    if (row) openThread(row.dataset.threadUser);
  });

  let currentThreadUserId = null;

  async function openThread(userId) {
    currentThreadUserId = userId;
    navigate("message-thread");
    await loadThread();
  }

  async function loadThread() {
    try {
      const data = await apiFetch("/api/messages?with=" + encodeURIComponent(currentThreadUserId));
      $("#topbarTitle").textContent = data.other.displayName;
      renderThread(data.messages);
    } catch (e) {
      toast(e.message);
      navigate("messages-inbox");
    }
  }

  function renderThread(messages) {
    const myId = state.session && state.session.user && state.session.user.id;
    $("#threadMessages").innerHTML = messages.map((m) => `
      <div class="msg-bubble ${m.senderId === myId ? "mine" : "theirs"}">
        ${escapeHtml(m.body)}<span class="msg-time">${formatTime(m.createdAt)}</span>
      </div>`).join("") || '<div class="empty-state">まだメッセージがありません。最初のメッセージを送りましょう。</div>';
    window.scrollTo(0, document.body.scrollHeight);
  }

  async function sendThreadMessage() {
    const input = $("#threadInput");
    const text = input.value.trim();
    if (!text || !currentThreadUserId) return;
    input.value = "";
    try {
      await apiFetch("/api/messages", { method: "POST", body: JSON.stringify({ recipientId: currentThreadUserId, body: text }) });
      await loadThread();
    } catch (e) { toast(e.message); }
  }

  $("#btnSendMessage").addEventListener("click", sendThreadMessage);
  $("#threadInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); sendThreadMessage(); }
  });

  // Poll/refresh-based messaging: check for new messages and unread counts
  // periodically rather than holding a live connection open.
  let pollTimer = null;
  function startPolling() {
    stopPolling();
    pollTimer = setInterval(async () => {
      if (!state.session) return;
      try {
        const data = await apiFetch("/api/messages/threads");
        const totalUnread = data.threads.reduce((sum, t) => sum + t.unreadCount, 0);
        $("#inboxUnreadDot").hidden = totalUnread === 0;
        if ($("#view-messages-inbox").classList.contains("active")) renderInbox(data.threads);
        if ($("#view-message-thread").classList.contains("active") && currentThreadUserId) loadThread();
      } catch (e) { /* polling failures stay silent — no toast spam */ }
    }, 25000);
  }
  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  // These two views load their data on navigation, not just on click, so
  // they're also correct when reached via the back button.
  $all('[data-nav="find-people"]').forEach((el) => el.addEventListener("click", () => { $("#findPeopleQuery").value = ""; $("#findPeopleResults").innerHTML = ""; }));
  $all('[data-nav="messages-inbox"]').forEach((el) => el.addEventListener("click", loadInbox));

  /* ----------------------------- Init ----------------------------- */

  loadPrefs();
  loadSession();
  updateCommunityUI();
  if (state.session) startPolling();
  resetCamera();
  navigate("home");
})();
