/* =========================================================================
   TSUGU — app logic (view router + interactions)
   No build step, no framework, no backend — matches this repo's philosophy.
   All "AI" output here is mocked from content.js; wire ANALYSIS_RESULT and
   ASK_ANSWERS to a real vision/valuation API to move from prototype to
   production without touching the view layer.
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

  function addCapturedPhoto(url) {
    state.photos.push(url);

    $("#framePreview").src = url;
    $("#framePreview").hidden = false;
    $("#framePlaceholder").hidden = true;

    const thumb = document.createElement("img");
    thumb.src = url;
    $("#thumbStrip").appendChild(thumb);
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
    addCapturedPhoto(SAMPLE_PHOTO);
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
    setTimeout(() => {
      renderItemCard();
      navigate("itemcard");
    }, 420 * steps.length + 500);
  }

  /* ----------------------------- Item card ----------------------------- */

  function renderItemCard() {
    const r = ANALYSIS_RESULT;
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

  const LISTING_LANG = {
    ja: {
      title: "ラルフローレン ウィメンズ ブレザー ネイビー",
      condition: "非常に良い（Very Good）",
      desc: "ラルフローレンのウィメンズ ブレザーです。深みのあるネイビーカラーで、上品なオフィスシーンにもお使いいただけます。目立った傷や汚れはなく、状態は非常に良好です。クローゼットの整理のため出品します。",
    },
    en: {
      title: "Ralph Lauren Women's Blazer — Navy",
      condition: "Very Good",
      desc: "A Ralph Lauren women's blazer in deep navy, suitable for polished office wear. No notable damage or stains — very good condition overall. Listed while tidying up my closet.",
    },
  };

  function prefillListing(action) {
    const actionLabels = { sell: "出品", give: "お譲り", gift: "プレゼント", donate: "寄付" };
    $("#topbarSub").textContent = "AI Listing Assistant · " + (actionLabels[action] || "");
  }

  $(".lang-toggle").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-lang]");
    if (!btn) return;
    $all(".lang-toggle button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const pack = LISTING_LANG[btn.dataset.lang];
    $("#lsTitle").value = pack.title;
    $("#lsCondition").value = pack.condition;
    $("#lsDesc").value = pack.desc;
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
      </div>`).join("") || '<div class="empty-state" style="grid-column:1/-1"><svg class="icon"><use href="#i-box"/></svg>まだアイテムがありません</div>';
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

  /* ----------------------------- Init ----------------------------- */

  loadPrefs();
  resetCamera();
  navigate("home");
})();
