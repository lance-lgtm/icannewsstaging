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
    lang: "ja",
  };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ----------------------------- I18N ----------------------------- */

  // Dot-path lookup into I18N[state.lang] (js/content.js), falling back to
  // Japanese and finally the raw key so a missing translation never renders
  // as blank text.
  function t(key) {
    const dig = (dict) => key.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
    return dig(I18N[state.lang]) ?? dig(I18N.ja) ?? key;
  }

  function loadLang() {
    try {
      const saved = localStorage.getItem("tsugu_lang");
      if (saved === "en" || saved === "ja") state.lang = saved;
    } catch (e) { /* localStorage unavailable — default to ja */ }
  }

  function setLanguage(lang) {
    if (lang !== "ja" && lang !== "en") return;
    state.lang = lang;
    try { localStorage.setItem("tsugu_lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    applyI18n();
    $all("[data-ui-lang]").forEach((b) => b.classList.toggle("active", b.dataset.uiLang === lang));

    // Re-render whatever dynamic content is currently on screen, so the
    // toggle takes effect immediately instead of only on next navigation.
    if (state.currentAnalysis) renderItemCard(state.currentAnalysis);
    renderCategoryGrid();
    renderMarketList();
    updateCommunityUI();
    if ($("#view-followers").classList.contains("active")) loadFollowersTab();
    if ($("#view-messages-inbox").classList.contains("active")) loadInbox();
    if ($("#view-message-thread").classList.contains("active")) loadThread();
    if ($("#askAnswer").classList.contains("show")) {
      const activeChip = $(".ask-chip[data-active-ask]");
      if (activeChip) $("#askAnswerText").textContent = (state.lang === "en" ? ASK_ANSWERS_EN : ASK_ANSWERS)[activeChip.dataset.activeAsk];
    }

    const activeView = $(".view.active");
    if (activeView) {
      const title = state.lang === "en" ? (activeView.getAttribute("data-title-en") || activeView.getAttribute("data-title")) : activeView.getAttribute("data-title");
      const sub = state.lang === "en" ? (activeView.getAttribute("data-sub-en") || activeView.getAttribute("data-sub")) : activeView.getAttribute("data-sub");
      if (title) $("#topbarTitle").textContent = title;
      $("#topbarSub").textContent = sub || "";
    }
  }

  function applyI18n() {
    $all("[data-i18n]").forEach((el) => {
      if (el.dataset.i18nHtml !== undefined) el.innerHTML = t(el.dataset.i18n);
      else el.textContent = t(el.dataset.i18n);
    });
    $all("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    $all("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  }

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

    const title = state.lang === "en" ? (view.getAttribute("data-title-en") || view.getAttribute("data-title")) : view.getAttribute("data-title");
    const sub = state.lang === "en" ? (view.getAttribute("data-sub-en") || view.getAttribute("data-sub")) : view.getAttribute("data-sub");
    if (title) $("#topbarTitle").textContent = title;
    $("#topbarSub").textContent = sub || "";

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
      u.lang = state.lang === "en" ? "en-US" : "ja-JP";
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch (e) { /* speech synthesis unavailable — silently degrade */ }
  }

  /* ----------------------------- Points ----------------------------- */

  function addPoints(n) {
    state.points += n;
    const locale = state.lang === "en" ? "en-US" : "ja-JP";
    $all("#pointsCount").forEach((el) => (el.textContent = state.points.toLocaleString(locale)));
    const profileNum = $("#view-profile .impact-card .ic-num");
    if (profileNum) profileNum.textContent = state.points.toLocaleString(locale) + "pt";
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
    btnShoot.innerHTML = '<svg class="icon" style="width:18px;height:18px"><use href="#i-camera"/></svg>' + t("camera.shoot");
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

  const FALLBACK_DETECTION = { colorName: "ナチュラルカラー", colorNameEn: "Natural", bucket: "square" };
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

          resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.85), colorName: color.name, colorNameEn: color.en, bucket });
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
    return { ...buildAnalysis(d.bucket, d.colorName, d.colorNameEn), source: "local" };
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
  const FULL_LABEL_KEYS = ["type", "maker", "logo", "model", "serial", "age", "material", "colorway", "pattern", "style", "labelSize", "estJapanSize", "fit", "damage", "accessories", "estDimensions"];

  // Normalizes the backend's JSON into exactly the shape buildAnalysis()
  // produces, so renderItemCard()/prefillListing() don't need to know or
  // care which source the analysis came from. Defends against a malformed
  // or partial model response with sane fallbacks per field.
  function analysisFromBackendJson(json) {
    if (!json || typeof json !== "object" || !json.recommendation) return null;
    const action = RECOMMENDATION_ACTIONS.includes(json.recommendation.action)
      ? json.recommendation.action : "sell";
    try {
      const s = (v, fallback) => String(v !== undefined && v !== null && v !== "" ? v : fallback);
      return {
        source: "backend",
        name: s(json.titleJa, "認識されたアイテム"),
        brandLine: s(json.brandLine, ""),
        quick: [
          { labelKey: "field.brand", value: s(json.brand, "不明"), valueEn: s(json.brandEn, json.brand || "Unknown"), icon: "i-tag" },
          { labelKey: "field.color", value: s(json.colorJa, "—"), valueEn: s(json.colorEn, json.colorJa || "—"), icon: "i-sparkle", estimate: !!json.colorEstimate },
          { labelKey: "field.size", value: s(json.sizeLabel, "—"), valueEn: s(json.sizeLabelEn, json.sizeLabel || "—"), icon: "i-type", estimate: json.sizeEstimate !== false },
          { labelKey: "field.condition", value: s(json.condition, "—"), valueEn: s(json.conditionEn, json.condition || "—"), icon: "i-check-circle" },
          { labelKey: "field.estValue", value: s(json.estValueText, "不明"), valueEn: s(json.estValueTextEn, json.estValueText || "Unknown"), icon: "i-sparkle", estimate: true, span2: true },
          { labelKey: "field.dimensions", value: s(json.dimensions, "—"), valueEn: s(json.dimensionsEn, json.dimensions || "—"), icon: "i-box", estimate: json.dimensionsEstimate !== false, span2: true },
        ],
        full: Array.isArray(json.full)
          ? json.full.filter((row) => Array.isArray(row) && row.length >= 2 && FULL_LABEL_KEYS.includes(row[0]))
            .map((row) => ["full." + row[0], String(row[1]), String(row[2] !== undefined ? row[2] : row[1])])
          : [],
        recommendation: {
          action,
          tagJa: json.recommendation.tagJa || ("おすすめ · " + action.toUpperCase()),
          tagEn: json.recommendation.tagEn || ("Recommended · " + action.toUpperCase()),
          title: json.recommendation.title || "",
          titleEn: json.recommendation.titleEn || json.recommendation.title || "",
          text: json.recommendation.text || "",
          textEn: json.recommendation.textEn || json.recommendation.text || "",
        },
        brand: s(json.brand, "不明"),
        brandEn: s(json.brandEn, json.brand || "Unknown"),
        sizeLabel: s(json.sizeLabel, "—"),
        sizeLabelEn: s(json.sizeLabelEn, json.sizeLabel || "—"),
        dimensions: s(json.dimensions, "—"),
        dimensionsEn: s(json.dimensionsEn, json.dimensions || "—"),
        condition: s(json.condition, "—"),
        conditionEn: s(json.conditionEn, json.condition || ""),
        titleJa: s(json.titleJa, "認識されたアイテム"),
        titleEn: s(json.titleEn, json.titleJa || "Recognized Item"),
        descriptionJa: s(json.descriptionJa, ""),
        descriptionEn: s(json.descriptionEn, ""),
        estValueText: s(json.estValueText, "不明"),
        estValueTextEn: s(json.estValueTextEn, json.estValueText || "Unknown"),
        askPriceText: s(json.askPriceText, "—"),
        keywords: Array.isArray(json.keywords) ? json.keywords.slice(0, 8).map(String) : [],
        keywordsEn: Array.isArray(json.keywordsEn) ? json.keywordsEn.slice(0, 8).map(String) : (Array.isArray(json.keywords) ? json.keywords.slice(0, 8).map(String) : []),
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
      toast(t("toast.cameraUnavailable"));
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

    btnShoot.innerHTML = '<svg class="icon" style="width:18px;height:18px"><use href="#i-camera"/></svg>' + t("camera.shootAgain");
    if (state.photos.length >= 1) {
      btnSkipMore.hidden = false;
      btnSkipMore.textContent = t("camera.skipMore");
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
      toast(t("toast.takePhotoFirst"));
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
      if (statusEl) statusEl.textContent = t("analyzing.waitMore");
    }, 420 * steps.length + 1800);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 420 * steps.length + 500));
    const fallback = () => localFallbackAnalysis(null);
    const analysis = (state.pendingAnalysis || Promise.resolve(fallback())).catch(fallback);

    Promise.all([analysis, minDelay]).then(([result]) => {
      clearTimeout(waitMsgTimer);
      if (statusEl) statusEl.textContent = t("analyzing.status");
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
    const isEn = state.lang === "en";
    $("#itemName").textContent = isEn ? r.titleEn || r.name : r.name;
    $("#itemBrandLine").textContent = r.brandLine;

    // Make it visually unmistakable when this result is the local
    // color/shape guess (no backend reachable) vs. real AI recognition —
    // the two must never look identical, or a demo guess reads as a broken
    // real answer.
    const isLocal = r.source === "local";
    $("#sourceBadge").classList.toggle("local-guess", isLocal);
    $("#sourceBadgeText").textContent = isLocal ? t("item.badgeLocal") : t("item.badgeAi");
    if (isLocal && !state.localGuessNoticeShown) {
      state.localGuessNoticeShown = true;
      toast(t("toast.localGuessNotice"));
    }

    const grid = $("#itemDetailGrid");
    grid.innerHTML = r.quick.map((q) => `
      <div class="detail-cell${q.span2 ? " span2" : ""}">
        <div class="dc-label"><svg class="icon" style="width:12px;height:12px"><use href="#${q.icon}"/></svg>${t(q.labelKey)}${q.estimate ? `<span class="estimate-flag">${t("item.estimateFlag")}</span>` : ""}</div>
        <div class="dc-value">${isEn ? q.valueEn : q.value}</div>
      </div>`).join("");

    const dl = $("#detailFullList");
    dl.innerHTML = r.full.map(([labelKey, v, vEn]) => `<dt>${t(labelKey)}</dt><dd>${isEn ? vEn : v}</dd>`).join("");
    $("#detailFull").classList.remove("open");
    $("#detailExpandBtn").classList.remove("open");

    const reco = r.recommendation;
    const banner = $("#recoBanner");
    banner.className = "reco-banner"; // reset tone classes
    banner.style.background = `var(--${reco.action}-bg)`;
    $("#recoIcon").style.background = "rgba(255,255,255,0.55)";
    $("#recoIcon").style.color = `var(--${reco.action})`;
    $("#recoIcon").innerHTML = `<svg class="icon"><use href="#${ACTION_ICON[reco.action]}"/></svg>`;
    $("#recoTag").textContent = isEn ? reco.tagEn : reco.tagJa;
    $("#recoTag").style.color = `var(--${reco.action})`;
    $("#recoTitle").textContent = isEn ? reco.titleEn : reco.title;
    $("#recoText").textContent = isEn ? reco.textEn : reco.text;

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
      toast(t("toast.addedToKeep"));
      setTimeout(() => navigate("home"), 700);
    } else if (["sell", "give", "gift", "donate"].includes(action)) {
      if (action === "give") toast(state.lang === "en" ? OTHER_RECOMMENDATIONS.give.textEn : OTHER_RECOMMENDATIONS.give.text);
      setTimeout(() => {
        prefillListing(action);
        navigate("listing");
      }, action === "give" ? 900 : 250);
    } else if (action === "recycle") {
      toast(t("toast.recycleGuide"));
    } else if (action === "dispose") {
      toast(t("toast.disposeGuide"));
    }
  });

  /* ----------------------------- Listing assistant ----------------------------- */

  function prefillListing(action) {
    $("#topbarSub").textContent = t("listing.sub") + " · " + t("action." + action);

    const a = state.currentAnalysis;
    if (!a) return;
    // The listing's own JA/EN content toggle starts matching whatever the
    // UI language currently is — a natural default — but stays independent
    // from here on (you might browse in English yet still draft a Japanese
    // listing, or vice versa).
    const startEn = state.lang === "en";
    $("#lsTitle").value = startEn ? a.titleEn : a.titleJa;
    $("#lsBrand").value = startEn ? (a.brandEn || a.brand) : a.brand;
    $("#lsSize").value = startEn ? (a.sizeLabelEn || a.sizeLabel) : a.sizeLabel;
    $("#lsCondition").value = startEn ? a.conditionEn : a.condition;
    $("#lsDim").value = startEn ? (a.dimensionsEn || a.dimensions) : a.dimensions;
    $("#lsDesc").value = startEn ? a.descriptionEn : a.descriptionJa;
    $("#lsEstValue").value = startEn ? (a.estValueTextEn || a.estValueText) : a.estValueText;
    $("#lsAsk").value = a.askPriceText;
    const kw = startEn ? (a.keywordsEn && a.keywordsEn.length ? a.keywordsEn : a.keywords) : a.keywords;
    $("#lsKeywords").innerHTML = kw.map((k) => `<span class="chip">${k}</span>`).join("");
    $all(".lang-toggle button").forEach((b) => b.classList.toggle("active", b.dataset.lang === (startEn ? "en" : "ja")));
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

  function formatItemCount(n) {
    return state.lang === "en" ? n + " items" : n + "点";
  }

  function renderCategoryGrid() {
    const isEn = state.lang === "en";
    $("#categoryGrid").innerHTML = CATEGORIES.map((c) => `
      <button class="category-tile" data-cat="${c.id}" style="background:var(--card)">
        <div class="ct-icon ${c.tone}"><svg class="icon"><use href="#${c.icon}"/></svg></div>
        <div><div class="ct-name">${isEn ? c.nameEn : c.name}</div><div class="ct-count">${formatItemCount(c.count)}</div></div>
      </button>`).join("");
  }
  renderCategoryGrid();

  $("#categoryGrid").addEventListener("click", (e) => {
    const tile = e.target.closest(".category-tile");
    if (!tile) return;
    const cat = CATEGORIES.find((c) => c.id === tile.dataset.cat);
    const items = CATEGORY_ITEMS[cat.id] || [];
    const isEn = state.lang === "en";
    $("#view-inventory-category").setAttribute("data-title", cat.name);
    $("#view-inventory-category").setAttribute("data-title-en", cat.nameEn);
    $("#categoryItemGrid").innerHTML = items.map((it) => `
      <div class="item-tile" style="background:linear-gradient(135deg, ${it.gradient[0]}, ${it.gradient[1]})">
        <div class="it-icon"><svg class="icon" style="width:16px;height:16px;stroke:#fff"><use href="#${ACTION_ICON[it.action]}"/></svg></div>
        <div class="it-dot" style="background:var(--${it.action})"></div>
        <div class="it-name">${isEn ? it.nameEn : it.name}</div>
      </div>`).join("") || `<div class="empty-state" style="grid-column:1/-1"><svg class="mascot mascot-md" style="margin:0 auto 10px"><use href="#i-mascot"/></svg>${t("inventory.empty")}</div>`;
    navigate("inventory-category");
  });

  $(".ask-chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".ask-chip");
    if (!chip) return;
    $all(".ask-chip").forEach((c) => c.style.background = "");
    $all(".ask-chip").forEach((c) => delete c.dataset.activeAsk);
    chip.dataset.activeAsk = chip.dataset.ask;
    const answer = (state.lang === "en" ? ASK_ANSWERS_EN : ASK_ANSWERS)[chip.dataset.ask];
    $("#askAnswerText").textContent = answer;
    $("#askAnswer").classList.add("show");
  });

  /* ----------------------------- Marketplace ----------------------------- */

  function renderMarketList() {
    const isEn = state.lang === "en";
    $("#marketList").innerHTML = MARKET_LISTINGS.map((l) => `
      <div class="listing-row">
        <div class="lr-thumb" style="background:var(--${l.tone}-bg);color:var(--${l.tone})">
          <svg class="icon"><use href="#${l.icon}"/></svg>
        </div>
        <div class="lr-body">
          <div class="lr-title">${isEn ? l.titleEn : l.title}</div>
          <div class="lr-price">${isEn ? l.priceEn : l.price}</div>
          <div class="lr-meta">${isEn ? l.metaEn : l.meta}</div>
          <div class="badge-row">
            ${l.badges.map(([labelJa, labelEn, tone]) => `<span class="verify-badge ${tone}"><svg class="icon"><use href="#i-check-circle"/></svg>${isEn ? labelEn : labelJa}</span>`).join("")}
          </div>
        </div>
      </div>`).join("");
  }
  renderMarketList();

  $("#btnTrustSettings").addEventListener("click", () => navigate("trust-settings"));
  $("#btnSaveTrust").addEventListener("click", () => {
    toast(t("toast.trustSaved"));
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
      recognizer.lang = state.lang === "en" ? "en-US" : "ja-JP";
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
        if (textarea.value.trim()) toast(t("toast.voiceToStory"));
      };
      recognizer.start();
    } else {
      // Graceful fallback when SpeechRecognition isn't supported.
      micBtn.classList.add("recording");
      toast(t("toast.recordingFallback"));
      setTimeout(() => {
        micBtn.classList.remove("recording");
        textarea.value = state.lang === "en"
          ? "I bought this saxophone in Tokyo in 1978. I played it for almost 40 years. I would like it to go to a young person who will continue playing music."
          : "このサクソフォンは1978年に東京で買いました。40年近く吹き続けました。これからも音楽を続けてくれる若い人に渡したいです。";
        toast(t("toast.voiceToStory"));
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
    if (e.target.checked) speakGuide(t("toast.voiceGuideOn"));
  });

  $("#toggleHelperMode").addEventListener("change", (e) => {
    try { localStorage.setItem("tsugu_helperMode", e.target.checked ? "1" : "0"); } catch (err) {}
    toast(e.target.checked ? t("toast.helperOn") : t("toast.helperOff"));
  });

  $all("[data-ui-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.uiLang));
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
      throw new Error(t("toast.networkUnavailable"));
    }

    let data = null;
    try { data = await res.json(); } catch (e) {}

    if (res.status === 401 && state.session) {
      saveSession(null);
      stopPolling();
      updateCommunityUI();
      toast(t("toast.sessionExpired"));
      navigate("auth");
    }

    if (!res.ok) throw new Error((data && data.error) || (t("toast.genericError") + "（" + res.status + "）"));
    return data;
  }

  function formatRelativeTime(ms) {
    const min = Math.floor((Date.now() - ms) / 60000);
    if (min < 1) return t("time.justNow");
    if (min < 60) return min + t("time.minAgo");
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + t("time.hourAgo");
    const day = Math.floor(hr / 24);
    if (day < 7) return day + t("time.dayAgo");
    return new Date(ms).toLocaleDateString(state.lang === "en" ? "en-US" : "ja-JP");
  }

  function formatTime(ms) {
    return new Date(ms).toLocaleTimeString(state.lang === "en" ? "en-US" : "ja-JP", { hour: "2-digit", minute: "2-digit" });
  }

  /* ----------------------------- Community: auth ----------------------------- */

  function updateCommunityUI() {
    const loggedIn = !!(state.session && state.session.user);
    $("#communityLoggedOut").hidden = loggedIn;
    $("#communityLoggedIn").hidden = !loggedIn;
    if (loggedIn) {
      $("#btnLogout").textContent = t("market.logout") + "（" + state.session.user.displayName + "）";
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
      toast(t("toast.loggedIn"));
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
      toast(t("toast.accountCreated"));
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
    toast(t("toast.loggedOut"));
  });

  /* ----------------------------- Community: find people ----------------------------- */

  function relationshipButton(u) {
    if (u.relationship === "accepted") return `<button class="btn btn-outline" disabled>${t("people.following")}</button>`;
    if (u.relationship === "pending_outgoing") return `<button class="btn btn-outline" disabled>${t("people.requested")}</button>`;
    if (u.relationship === "pending_incoming") return `<button class="btn btn-outline" data-goto-pending="1">${t("people.checkRequest")}</button>`;
    return `<button class="btn btn-gold" data-follow-user="${u.id}">${t("people.follow")}</button>`;
  }

  function renderFindPeopleResults(users) {
    $("#findPeopleResults").innerHTML = users.map((u) => `
      <div class="person-row">
        <div class="person-avatar">${escapeHtml(u.displayName.slice(0, 1))}</div>
        <div class="person-body person-name">${escapeHtml(u.displayName)}</div>
        <div class="person-actions">${relationshipButton(u)}</div>
      </div>`).join("") || `<div class="empty-state">${t("people.noResults")}</div>`;
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
        toast(t("toast.followRequestSent"));
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
      $("#followersList").innerHTML = `<div class="empty-state">${t("followers.empty")}</div>`;
      return;
    }
    $("#followersList").innerHTML = items.map((it) => {
      let actions;
      if (followersTab === "pending") {
        actions = `<button class="btn btn-gold" data-accept="${it.id}">${t("followers.accept")}</button><button class="btn btn-outline" data-reject="${it.id}">${t("followers.reject")}</button>`;
      } else if (followersTab === "followers") {
        actions = `<button class="btn btn-outline" data-message-user="${it.userId}">${t("followers.message")}</button><button class="btn btn-ghost" data-remove="${it.id}">${t("followers.remove")}</button>`;
      } else {
        actions = `<button class="btn btn-outline" data-message-user="${it.userId}">${t("followers.message")}</button><button class="btn btn-ghost" data-unfollow="${it.id}">${t("followers.unfollow")}</button>`;
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
        toast(t("toast.accepted"));
        loadFollowersTab();
        refreshCommunityStats();
      } else if (reject) {
        await apiFetch("/api/follows/" + reject.dataset.reject, { method: "DELETE" });
        toast(t("toast.rejected"));
        loadFollowersTab();
        refreshCommunityStats();
      } else if (remove) {
        await apiFetch("/api/follows/" + remove.dataset.remove, { method: "DELETE" });
        toast(t("toast.followerRemoved"));
        loadFollowersTab();
        refreshCommunityStats();
      } else if (unfollow) {
        await apiFetch("/api/follows/" + unfollow.dataset.unfollow, { method: "DELETE" });
        toast(t("toast.unfollowed"));
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
      $("#inboxList").innerHTML = `<div class="empty-state">${t("messages.emptyInbox")}</div>`;
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
      </div>`).join("") || `<div class="empty-state">${t("messages.emptyThread")}</div>`;
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

  loadLang();
  document.documentElement.lang = state.lang;
  applyI18n();
  $all("[data-ui-lang]").forEach((b) => b.classList.toggle("active", b.dataset.uiLang === state.lang));
  loadPrefs();
  loadSession();
  updateCommunityUI();
  if (state.session) startPolling();
  resetCamera();
  renderCategoryGrid();
  renderMarketList();
  navigate("home");
})();
