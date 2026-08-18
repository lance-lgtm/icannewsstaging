/* =========================================================================
   TSUGU — mock content & local recognition fallback

   Real recognition lives in functions/api/analyze.js (a Cloudflare Pages
   Function that calls Claude's vision API server-side). buildAnalysis()
   below is the *fallback* used when that backend isn't deployed, is
   unreachable, or times out — it picks and colors one of the ITEM_PROFILES
   using only client-side signal (dominant color, aspect ratio), so the app
   never breaks even without the backend configured. See
   secondlife/README.md for deploying the real thing.
   ========================================================================= */

// ---------------------------------------------------------------------------
// I18N — UI chrome strings for the Japanese/English toggle (Profile →
// 表示言語 / Display Language). Dot-path keys, looked up via t(key) in
// app.js. Content strings that are inherently bilingual by design (the
// listing draft's own JA/EN toggle, item recognition results) are handled
// separately — see ITEM_PROFILES below and js/app.js's prefillListing().
// ---------------------------------------------------------------------------

const I18N = {
  ja: {
    common: { back: "戻る", save: "保存する", cancel: "キャンセル" },
    nav: { home: "ホーム", inventory: "持ち物", market: "マーケット", profile: "マイページ", takePhoto: "写真を撮る" },
    home: {
      tagline: "あなたの持ち物に、次の人生を。",
      ctaLabel: "写真を撮る",
      impactPoints: "セカンドライフポイント",
      impactPassed: "次の人へ渡した物",
      impactEarned: "これまでの収益",
      impactWaste: "廃棄削減の推定量",
      sectionLabel: "できること",
      cardSellTitle: "売れるものは？", cardSellSub: "売却できるアイテムを見つける",
      cardKeepTitle: "残すべきものは？", cardKeepSub: "本当に大切なものを見極める",
      cardGiveTitle: "譲る・贈る", cardGiveSub: "誰かに譲る準備をする",
      cardValueTitle: "隠れた価値を発見", cardValueSub: "写真を撮ってAIに聞いてみる",
      cardInventoryTitle: "マイ・ホームインベントリ", cardInventorySub: "持ち物を写真で整理",
      cardLegacyTitle: "ファミリー・レガシー", cardLegacySub: "想い出を次の世代へ",
      cardMarketTitle: "コミュニティ・マーケットプレイス", cardMarketSub: "信頼できる人たちとつながる",
    },
    camera: {
      title: "写真を撮る", sub: "写真を撮影",
      skipMore: "スキップして解析", shoot: "撮影する", shootAgain: "もう一枚撮る",
      samplePhoto: "サンプル写真で試す（カメラが使えない場合）",
    },
    analyzing: {
      title: "AI解析中", sub: "解析中",
      status: "AIが写真を確認しています…", waitMore: "もう少しお待ちください…",
      step0: "アイテムの種類を判定中", step1: "ブランド・メーカーを照合中",
      step2: "状態とサイズを推定中", step3: "市場価値を算出中",
    },
    item: {
      title: "AIアイテムカード", sub: "AIアイテムカード",
      badgeAi: "AI推定・AI Estimate", badgeLocal: "簡易判定（デモ）・Local Guess (Demo)",
      expandDetails: "AI分析の詳細をすべて見る", chooseNextLife: "次の人生をえらぶ",
      estimateFlag: "推定", disposeLabel: "DISPOSE — 処分する（最終手段）",
    },
    action: {
      keep: "残す", sell: "売る", give: "譲る", gift: "贈る",
      donate: "寄付", recycle: "リサイクル", dispose: "処分",
    },
    field: { brand: "ブランド", color: "カラー", size: "サイズ", condition: "状態", estValue: "推定価値", dimensions: "寸法" },
    full: {
      type: "種類", maker: "メーカー", logo: "ロゴ", model: "モデル", serial: "シリアル番号",
      age: "推定年代", material: "素材", colorway: "カラー / カラーウェイ", pattern: "パターン",
      style: "スタイル", labelSize: "ラベルサイズ", estJapanSize: "推定日本サイズ", fit: "フィット",
      damage: "視認できる傷", accessories: "付属品", estDimensions: "推定寸法",
    },
    listing: {
      title: "出品アシスタント", sub: "AI出品アシスタント",
      langJa: "日本語", langEn: "English",
      fieldTitle: "商品名 / Title", fieldBrand: "ブランド", fieldSize: "サイズ", fieldCondition: "状態",
      fieldDim: "寸法（目安）", fieldDesc: "説明文 / Description", fieldKeywords: "キーワード",
      fieldEstPrice: "AI推定価格", fieldAskPrice: "出品価格", fieldDelivery: "受け渡し方法",
      optSafePickup: "セーフ・ピックアップ地点", optConvenience: "コンビニ受け渡し",
      optCourier: "宅配便で発送", optConcierge: "管理人による受け渡し（コンシェルジュ）",
      publish: "この内容で出品する",
    },
    success: {
      title: "出品完了", heading: "出品が完了しました！",
      body: "コミュニティのメンバーに公開されました。<br>連絡があり次第お知らせします。",
      points: "+50 pt 獲得しました", viewListing: "出品を見る", backHome: "ホームに戻る",
    },
    inventory: {
      title: "ホームインベントリ",
      askSell: "売れるものは？", askGive: "譲れるものは？", askValue: "価値があるものは？",
      askUnused: "使っていないものは？", askKeep: "保管すべきものは？", askEarn: "いくら稼げる？",
      byCategory: "カテゴリー別", empty: "まだアイテムがありません",
    },
    market: {
      title: "コミュニティ・マーケットプレイス", sub: "信頼できる、匿名ではない場所",
      nearbyListings: "近くの出品", community: "コミュニティ",
      communityIntro: "ログインすると、他のユーザーをフォローしたり、メッセージを送ったりできます。",
      loginSignup: "ログイン / 新規登録",
      statFollowing: "フォロー中", statFollowers: "フォロワー", statPending: "リクエスト",
      findPeople: "ユーザーを探す", messages: "メッセージ", logout: "ログアウト",
      safetySection: "安全のためのしくみ", warnHead: "このメッセージには注意が必要です。",
      warnItem1: "プラットフォーム外での送金を求めています", warnItem2: "「今すぐ決めてください」と急かしています",
      warnItem3: "銀行口座情報を尋ねています", report: "報告する", block: "ブロック",
      safePickup: "セーフ・ピックアップ", pickupConvenience: "コンビニ前・待ち合わせ場所",
      pickupConcierge: "マンション管理人による受け渡し", pickupCourier: "配送・宅配便",
      trustBtn: "連絡できる相手を設定する",
    },
    trust: {
      title: "連絡できる相手", sub: "誰が連絡できますか？",
      intro: "とくにご高齢の方は、知らない人と直接やり取りしなくて済むよう、連絡できる相手をあらかじめ絞り込むことができます。",
      verified: "本人確認済みのユーザーのみ", community: "自分のコミュニティのメンバー",
      referred: "知人からの紹介がある人", rated: "評価の高いユーザーのみ",
      charity: "慈善団体のみ", family: "家族・友人のみ", save: "保存する",
    },
    auth: {
      title: "ログイン", sub: "コミュニティ",
      login: "ログイン", signup: "新規登録", email: "メールアドレス", password: "パスワード",
      displayName: "表示名", passwordMin: "パスワード（8文字以上）", createAccount: "アカウントを作成",
    },
    people: {
      title: "ユーザーを探す", sub: "ユーザーを探す",
      searchPlaceholder: "表示名で検索", follow: "フォロー", requested: "リクエスト済み",
      following: "フォロー中", checkRequest: "リクエストを確認", noResults: "見つかりませんでした",
    },
    followers: {
      title: "フォロワー",
      tabFollowers: "フォロワー", tabFollowing: "フォロー中", tabPending: "リクエスト",
      accept: "承認", reject: "拒否", message: "メッセージ", remove: "削除", unfollow: "解除",
      empty: "まだありません",
    },
    messages: {
      title: "メッセージ", sub: "メッセージ",
      inputPlaceholder: "メッセージを入力", send: "送信",
      emptyInbox: "まだメッセージがありません",
      emptyThread: "まだメッセージがありません。最初のメッセージを送りましょう。",
    },
    legacy: {
      title: "ファミリー・レガシー", sub: "ファミリー・レガシー",
      journey: "このアイテムの旅", speakPrompt: "物語を話してください",
      speakSub: "つぐみがあなたの言葉を短い物語にまとめます", storyPlaceholder: "ここに物語が表示されます…",
      chooseRecipient: "次の人へ贈る相手をえらぶ",
      recipientStudent: "学生・新しく趣味を始める人", recipientFamily: "若い家族",
      recipientCollector: "コレクター", recipientNeed: "本当に必要としている人",
      giveNext: "次の人生へ贈る",
    },
    profile: {
      title: "マイページ", sub: "プロフィールと設定",
      verified: "本人確認済み", phoneVerified: "電話確認済み", ratingLabel: "評価",
      achievementBadges: "achievement バッジ",
      badge1: "はじめての一歩", badge2: "もったいない博士", badge3: "コミュニティの星", badge4: "レガシーの語り部",
      trustedHelper: "信頼できる代理人（Trusted Helper）",
      helperSub: "出品の確認・連絡対応・受け渡し手配を代行できます", addHelper: "代理人を追加・編集する",
      accessibility: "アクセシビリティ",
      largeText: "文字を大きくする", largeTextSub: "文字サイズを拡大します",
      voiceGuide: "音声ガイド", voiceGuideSub: "画面のタイトルを読み上げます",
      helperMode: "ファミリー・ヘルパーモード", helperModeSub: "信頼できる代理人が代わりに操作できます",
      phoneSupport: "日本語サポートに電話する", phoneSupportSub: "平日 9:00〜18:00 / 0120-XXX-XXX",
      language: "表示言語",
    },
    toast: {
      cameraUnavailable: "カメラを開けませんでした。「サンプル写真で試す」をお使いください。",
      takePhotoFirst: "まず写真を撮影してください",
      localGuessNotice: "実際のAI認識ではなく簡易判定です（バックエンド未設定）",
      addedToKeep: "保管リストに追加しました（+5pt）",
      recycleGuide: "お住まいの自治体のリサイクル区分をご案内します",
      disposeGuide: "ごみ集積所の出し方をご案内します（自治体ルールに従ってください）",
      trustSaved: "連絡設定を保存しました",
      voiceToStory: "音声を物語に変換しました",
      recordingFallback: "録音中…（このブラウザでは音声認識が利用できないため、例文を表示します）",
      helperOn: "ファミリー・ヘルパーモードをオンにしました",
      helperOff: "ファミリー・ヘルパーモードをオフにしました",
      sessionExpired: "セッションが切れました。再度ログインしてください。",
      loggedIn: "ログインしました",
      accountCreated: "アカウントを作成しました",
      loggedOut: "ログアウトしました",
      followRequestSent: "フォローリクエストを送信しました",
      accepted: "承認しました",
      rejected: "拒否しました",
      followerRemoved: "フォロワーを削除しました",
      unfollowed: "フォローを解除しました",
      networkUnavailable: "コミュニティ機能を利用するには、実際にデプロイされたサイトが必要です。",
      genericError: "エラーが発生しました",
      voiceGuideOn: "音声ガイドをオンにしました",
    },
    time: { justNow: "たった今", minAgo: "分前", hourAgo: "時間前", dayAgo: "日前" },
  },

  en: {
    common: { back: "Back", save: "Save", cancel: "Cancel" },
    nav: { home: "Home", inventory: "My Items", market: "Market", profile: "My Page", takePhoto: "Take a Photo" },
    home: {
      tagline: "Give your belongings a second life.",
      ctaLabel: "Take a Photo",
      impactPoints: "Second-Life Points",
      impactPassed: "Items passed forward",
      impactEarned: "Earned so far",
      impactWaste: "Estimated waste avoided",
      sectionLabel: "What you can do",
      cardSellTitle: "What can I sell?", cardSellSub: "Find items with resale value",
      cardKeepTitle: "What should I keep?", cardKeepSub: "Decide what's worth holding onto",
      cardGiveTitle: "Give or gift", cardGiveSub: "Get ready to pass something on",
      cardValueTitle: "Find hidden value", cardValueSub: "Snap a photo and ask the AI",
      cardInventoryTitle: "My Home Inventory", cardInventorySub: "Organize everything by photo",
      cardLegacyTitle: "Family Legacy", cardLegacySub: "Pass memories to the next generation",
      cardMarketTitle: "Community Marketplace", cardMarketSub: "Connect with people you can trust",
    },
    camera: {
      title: "Take a Photo", sub: "Take a photo",
      skipMore: "Skip and analyze", shoot: "Take Photo", shootAgain: "Take Another",
      samplePhoto: "Try a sample photo (if camera isn't available)",
    },
    analyzing: {
      title: "Analyzing", sub: "Analyzing",
      status: "AI is examining your photo…", waitMore: "Just a little longer…",
      step0: "Identifying item type", step1: "Matching brand & maker",
      step2: "Estimating condition & size", step3: "Calculating market value",
    },
    item: {
      title: "AI Item Card", sub: "AI Item Card",
      badgeAi: "AI Estimate", badgeLocal: "Local Guess (Demo)",
      expandDetails: "See full AI analysis", chooseNextLife: "Choose its next life",
      estimateFlag: "Est.", disposeLabel: "DISPOSE — last resort",
    },
    action: {
      keep: "Keep", sell: "Sell", give: "Give", gift: "Gift",
      donate: "Donate", recycle: "Recycle", dispose: "Dispose",
    },
    field: { brand: "Brand", color: "Color", size: "Size", condition: "Condition", estValue: "Est. Value", dimensions: "Dimensions" },
    full: {
      type: "Type", maker: "Maker", logo: "Logo", model: "Model", serial: "Serial Number",
      age: "Estimated Age", material: "Material", colorway: "Color / Colorway", pattern: "Pattern",
      style: "Style", labelSize: "Label Size", estJapanSize: "Estimated Japan Size", fit: "Fit",
      damage: "Visible Damage", accessories: "Accessories", estDimensions: "Estimated Dimensions",
    },
    listing: {
      title: "Listing Assistant", sub: "AI Listing Assistant",
      langJa: "日本語", langEn: "English",
      fieldTitle: "Title", fieldBrand: "Brand", fieldSize: "Size", fieldCondition: "Condition",
      fieldDim: "Dimensions (approx.)", fieldDesc: "Description", fieldKeywords: "Keywords",
      fieldEstPrice: "AI Estimated Price", fieldAskPrice: "Asking Price", fieldDelivery: "Pickup & Delivery",
      optSafePickup: "Safe Pickup point", optConvenience: "Convenience store handoff",
      optCourier: "Ship by courier", optConcierge: "Concierge handoff",
      publish: "Publish this listing",
    },
    success: {
      title: "Listing Published", heading: "Your listing is live!",
      body: "Shared with the community.<br>We'll let you know when someone reaches out.",
      points: "+50 pt earned", viewListing: "View listing", backHome: "Back to Home",
    },
    inventory: {
      title: "Home Inventory",
      askSell: "What can I sell?", askGive: "What could I give away?", askValue: "What might be valuable?",
      askUnused: "What haven't I used?", askKeep: "What should I keep?", askEarn: "How much could I make?",
      byCategory: "By Category", empty: "No items here yet",
    },
    market: {
      title: "Community Marketplace", sub: "Trusted, not anonymous",
      nearbyListings: "Nearby Listings", community: "Community",
      communityIntro: "Log in to follow other users and send messages.",
      loginSignup: "Log in / Sign up",
      statFollowing: "Following", statFollowers: "Followers", statPending: "Requests",
      findPeople: "Find People", messages: "Messages", logout: "Log out",
      safetySection: "Staying Safe", warnHead: "This message may be suspicious.",
      warnItem1: "Asking for payment outside the platform", warnItem2: "Pressuring you to decide right now",
      warnItem3: "Asking for your bank account details", report: "Report", block: "Block",
      safePickup: "Safe Pickup", pickupConvenience: "Meet outside a convenience store",
      pickupConcierge: "Handoff via building concierge", pickupCourier: "Courier delivery",
      trustBtn: "Set who can contact me",
    },
    trust: {
      title: "Who Can Contact Me", sub: "Who can contact me?",
      intro: "Especially useful for older users — limit who can reach you so you never have to deal directly with a stranger.",
      verified: "Verified users only", community: "Members of my community",
      referred: "People referred by someone I know", rated: "Highly rated users only",
      charity: "Charities only", family: "Friends & family only", save: "Save",
    },
    auth: {
      title: "Log In", sub: "Community",
      login: "Log In", signup: "Sign Up", email: "Email", password: "Password",
      displayName: "Display Name", passwordMin: "Password (8+ characters)", createAccount: "Create Account",
    },
    people: {
      title: "Find People", sub: "Find People",
      searchPlaceholder: "Search by name", follow: "Follow", requested: "Requested",
      following: "Following", checkRequest: "Check request", noResults: "No results found",
    },
    followers: {
      title: "Followers",
      tabFollowers: "Followers", tabFollowing: "Following", tabPending: "Requests",
      accept: "Accept", reject: "Reject", message: "Message", remove: "Remove", unfollow: "Unfollow",
      empty: "Nothing here yet",
    },
    messages: {
      title: "Messages", sub: "Messages",
      inputPlaceholder: "Type a message", send: "Send",
      emptyInbox: "No messages yet",
      emptyThread: "No messages yet. Say hello!",
    },
    legacy: {
      title: "Family Legacy", sub: "Family Legacy",
      journey: "This Item's Journey", speakPrompt: "Tell its story",
      speakSub: "Tsugumi will turn your words into a short story", storyPlaceholder: "Your story will appear here…",
      chooseRecipient: "Choose who receives it next",
      recipientStudent: "A student or someone starting a new hobby", recipientFamily: "A young family",
      recipientCollector: "A collector", recipientNeed: "Someone who truly needs it",
      giveNext: "Pass it to its next life",
    },
    profile: {
      title: "My Page", sub: "Profile & Settings",
      verified: "ID Verified", phoneVerified: "Phone Verified", ratingLabel: "Rating",
      achievementBadges: "Achievement Badges",
      badge1: "First Step", badge2: "Mottainai Master", badge3: "Community Star", badge4: "Legacy Storyteller",
      trustedHelper: "Trusted Helper",
      helperSub: "Can review listings, handle messages, and arrange handoffs on your behalf", addHelper: "Add or edit a helper",
      accessibility: "Accessibility",
      largeText: "Larger Text", largeTextSub: "Increases text size throughout the app",
      voiceGuide: "Voice Guidance", voiceGuideSub: "Reads screen titles aloud",
      helperMode: "Family Helper Mode", helperModeSub: "Let a trusted helper manage on your behalf",
      phoneSupport: "Call Support", phoneSupportSub: "Weekdays 9:00–18:00 / 0120-XXX-XXX",
      language: "Display Language",
    },
    toast: {
      cameraUnavailable: "Couldn't open the camera. Try the sample photo option instead.",
      takePhotoFirst: "Please take a photo first",
      localGuessNotice: "This is a simplified guess, not real AI recognition (no backend configured)",
      addedToKeep: "Added to your keep list (+5pt)",
      recycleGuide: "We'll show your local recycling category",
      disposeGuide: "We'll show you how to dispose of it (follow your local rules)",
      trustSaved: "Contact settings saved",
      voiceToStory: "Turned your voice into a story",
      recordingFallback: "Recording… (this browser doesn't support speech recognition, showing a sample instead)",
      helperOn: "Family Helper Mode turned on",
      helperOff: "Family Helper Mode turned off",
      sessionExpired: "Your session expired. Please log in again.",
      loggedIn: "Logged in",
      accountCreated: "Account created",
      loggedOut: "Logged out",
      followRequestSent: "Follow request sent",
      accepted: "Accepted",
      rejected: "Rejected",
      followerRemoved: "Follower removed",
      unfollowed: "Unfollowed",
      networkUnavailable: "Community features need the site to be actually deployed — this preview can't reach a backend.",
      genericError: "Something went wrong",
      voiceGuideOn: "Voice guidance turned on",
    },
    time: { justNow: "Just now", minAgo: "m ago", hourAgo: "h ago", dayAgo: "d ago" },
  },
};

const GUIDANCE_STEPS = [
  { ja: "対象物を枠の中に収めて撮影してください。", en: "Fit the item inside the frame and take a photo." },
  { ja: "いいですね。次はブランドのラベルを見せてください。", en: "Great. Now show me the label." },
  { ja: "メーカーの刻印を見つけました。もう少し近づいて撮ってください。", en: "I found a maker's mark. Take a closer photo." },
  { ja: "側面も撮影していただくと、奥行きを推定できます。", en: "Please photograph the side so I can estimate the depth." },
];

// Illustrated stand-in used by "サンプル写真で試す", for previews/browsers
// where the OS camera picker isn't reachable (e.g. a sandboxed iframe).
const SAMPLE_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%233a332a'/%3E%3Cstop offset='1' stop-color='%23a9803b'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23bg)'/%3E%3Cpath d='M200 55 L200 78' stroke='%23e9dcc0' stroke-width='4' stroke-linecap='round'/%3E%3Cpath d='M150 100 L200 62 L250 100' stroke='%23e9dcc0' stroke-width='5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M118 112 L162 94 L200 122 L238 94 L282 112 L292 262 Q292 322 260 342 L260 424 Q200 445 140 424 L140 342 Q108 322 108 262 Z' fill='%231f3350'/%3E%3Cpath d='M162 94 L200 195 L200 122 Z' fill='%2316283f'/%3E%3Cpath d='M238 94 L200 195 L200 122 Z' fill='%2316283f'/%3E%3Ccircle cx='200' cy='232' r='6' fill='%23c9a15a'/%3E%3Ccircle cx='200' cy='262' r='6' fill='%23c9a15a'/%3E%3Ccircle cx='200' cy='292' r='6' fill='%23c9a15a'/%3E%3C/svg%3E";

const ANALYZING_MESSAGES = [
  "アイテムの種類を判定中",
  "ブランド・メーカーを照合中",
  "状態とサイズを推定中",
  "市場価値を算出中",
];

// ---------------------------------------------------------------------------
// Recognition: real signal extracted from the user's own photo (dominant
// color via canvas pixel sampling, category guessed from aspect ratio) picks
// one of the profiles below instead of always returning the same mock item.
// See detectPhoto() / buildAnalysis() in app.js for how these are combined.
// ---------------------------------------------------------------------------

const COLOR_PALETTE = [
  { name: "ディープネイビー", en: "Deep Navy", rgb: [27, 42, 66] },
  { name: "ブラック", en: "Black", rgb: [30, 28, 26] },
  { name: "ホワイト", en: "White", rgb: [245, 242, 235] },
  { name: "アイボリー", en: "Ivory", rgb: [240, 234, 214] },
  { name: "ベージュ", en: "Beige", rgb: [222, 202, 170] },
  { name: "ブラウン", en: "Brown", rgb: [110, 78, 55] },
  { name: "キャメル", en: "Camel", rgb: [178, 132, 80] },
  { name: "グレー", en: "Gray", rgb: [140, 138, 132] },
  { name: "チャコールグレー", en: "Charcoal Gray", rgb: [70, 68, 66] },
  { name: "レッド", en: "Red", rgb: [176, 42, 42] },
  { name: "ボルドー", en: "Bordeaux", rgb: [95, 32, 40] },
  { name: "ブルー", en: "Blue", rgb: [53, 97, 140] },
  { name: "ライトブルー", en: "Light Blue", rgb: [150, 190, 215] },
  { name: "グリーン", en: "Green", rgb: [70, 110, 80] },
  { name: "オリーブ", en: "Olive", rgb: [104, 110, 66] },
  { name: "イエロー", en: "Yellow", rgb: [212, 180, 70] },
  { name: "ゴールド", en: "Gold", rgb: [190, 150, 90] },
  { name: "ピンク", en: "Pink", rgb: [220, 160, 180] },
  { name: "パープル", en: "Purple", rgb: [110, 80, 130] },
  { name: "シルバー", en: "Silver", rgb: [190, 190, 190] },
];

function nearestColor(rgb) {
  let best = COLOR_PALETTE[0];
  let bestDist = Infinity;
  for (const c of COLOR_PALETTE) {
    const dist = (rgb[0] - c.rgb[0]) ** 2 + (rgb[1] - c.rgb[1]) ** 2 + (rgb[2] - c.rgb[2]) ** 2;
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best;
}

// Buckets keyed by photo aspect ratio (tall/portrait, wide/landscape, square-ish).
// Each `quick`/`full` row carries a labelKey (looked up via t() in app.js,
// e.g. "field.brand" / "full.type") plus a JA value and an EN value, so the
// item card can render fully in either language — for both the local
// heuristic here and a future English-aware backend response.
const ITEM_PROFILES = {
  tall: [
    {
      key: "blazer_rl", brand: "Ralph Lauren", brandEn: "Ralph Lauren",
      nameTemplate: "Ralph Lauren ウィメンズ ブレザー",
      brandLine: "Ralph Lauren / Women's Blazer",
      quick: [
        { labelKey: "field.brand", value: "Ralph Lauren", valueEn: "Ralph Lauren", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "Japan 11 / US 8–10", valueEn: "Japan 11 / US 8–10", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "非常に良い", valueEn: "Very Good", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥8,000〜¥12,000", valueEn: "¥8,000–¥12,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "約 64 × 46 cm", valueEn: "Approx. 64 × 46 cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "ブレザー・ジャケット", "Blazer / Jacket"], ["full.maker", "Ralph Lauren（ラルフローレン）", "Ralph Lauren"],
        ["full.logo", "左胸にポニーロゴの刺繍あり", "Embroidered pony logo on left chest"], ["full.model", "テーラードブレザー（推定 2015〜2019年頃）", "Tailored blazer (est. 2015–2019)"],
        ["full.serial", "検出されず", "Not detected"], ["full.age", "約5〜10年（推定）", "About 5–10 years (estimated)"], ["full.material", "ウール混紡（推定）", "Wool blend (estimated)"],
        ["full.colorway", "{{COLOR}} / 無地", "{{COLOR}} / Solid"], ["full.pattern", "無地", "Solid"], ["full.style", "テーラード・オフィスカジュアル", "Tailored, office-casual"],
        ["full.labelSize", "US 8", "US 8"], ["full.estJapanSize", "Japan 11 (M)", "Japan 11 (M)"], ["full.fit", "レギュラーフィット", "Regular fit"],
        ["full.damage", "目立った傷や汚れは見られません", "No notable damage or stains"], ["full.accessories", "予備ボタン1個（内ポケット）", "One spare button (inner pocket)"],
        ["full.estDimensions", "着丈 約64cm / 身幅 約46cm", "Length approx. 64cm / Chest approx. 46cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", tagEn: "Recommended · SELL", title: "売ってみましょう", titleEn: "Consider selling it",
        text: "このジャケットは状態が良く、日本国内でもリセール需要のあるブランドです。同様のアイテムはおよそ¥8,000〜¥12,000で取引されています。",
        textEn: "This jacket is in great condition and the brand has resale demand in Japan. Similar items typically sell for ¥8,000–¥12,000." },
      sizeLabel: "Japan 11 / US 8–10", sizeLabelEn: "Japan 11 / US 8–10",
      dimensions: "約 64 × 46 cm", dimensionsEn: "Approx. 64 × 46 cm",
      condition: "非常に良い（Very Good）", conditionEn: "Very Good",
      descriptionJa: "Ralph Laurenのウィメンズ ブレザーです。深みのある{{COLOR}}カラーで、上品なオフィスシーンにもお使いいただけます。目立った傷や汚れはなく、状態は非常に良好です。クローゼットの整理のため出品します。",
      descriptionEn: "A Ralph Lauren women's blazer. No notable damage or stains — very good condition overall. Listed while tidying up my closet.",
      titleEn: "Ralph Lauren Women's Blazer",
      estValueText: "¥8,000〜¥12,000", estValueTextEn: "¥8,000–¥12,000", askPriceText: "¥9,800",
      keywords: ["ラルフローレン", "ブレザー", "レディース", "Mサイズ"],
      keywordsEn: ["Ralph Lauren", "Blazer", "Women's", "Size M"],
    },
    {
      key: "coat_muji", brand: "無印良品", brandEn: "MUJI",
      nameTemplate: "無印良品 ウールブレンドコート",
      brandLine: "無印良品 / Wool Blend Coat",
      quick: [
        { labelKey: "field.brand", value: "無印良品", valueEn: "MUJI", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "Japan L / US M", valueEn: "Japan L / US M", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "良い", valueEn: "Good", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥1,500〜¥3,000", valueEn: "¥1,500–¥3,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "約 95 × 54 cm", valueEn: "Approx. 95 × 54 cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "コート・アウター", "Coat / Outerwear"], ["full.maker", "無印良品", "MUJI"], ["full.logo", "目立つロゴなし（シンプルデザイン）", "No visible logo (minimal design)"],
        ["full.model", "ウールブレンド チェスターコート", "Wool-blend Chester coat"], ["full.serial", "該当なし", "Not applicable"], ["full.age", "約3〜5年（推定）", "About 3–5 years (estimated)"],
        ["full.material", "ウール30% ・ ポリエステル70%（推定）", "30% wool / 70% polyester (estimated)"], ["full.colorway", "{{COLOR}} / 無地", "{{COLOR}} / Solid"],
        ["full.pattern", "無地", "Solid"], ["full.style", "カジュアル・アウター", "Casual outerwear"], ["full.labelSize", "L", "L"],
        ["full.estJapanSize", "Japan L", "Japan L"], ["full.fit", "ゆったりめ", "Relaxed fit"], ["full.damage", "袖口に軽い毛羽立ちあり", "Slight pilling at the cuffs"],
        ["full.accessories", "なし", "None"], ["full.estDimensions", "着丈 約95cm / 身幅 約54cm", "Length approx. 95cm / Chest approx. 54cm"],
      ],
      recommendation: { action: "give", tagJa: "おすすめ · GIVE", tagEn: "Recommended · GIVE", title: "譲ってみましょう", titleEn: "Consider giving it away",
        text: "このコートは高いリセール価値はありませんが、まだ十分に暖かく着られる状態です。近くで必要としている方がすぐに見つかりそうです。",
        textEn: "This coat won't fetch a high resale price, but it's still warm and wearable. Someone nearby is likely to need it soon." },
      sizeLabel: "Japan L / US M", sizeLabelEn: "Japan L / US M",
      dimensions: "約 95 × 54 cm", dimensionsEn: "Approx. 95 × 54 cm",
      condition: "良い（袖口に軽い毛羽立ちあり）", conditionEn: "Good (light wear at cuffs)",
      descriptionJa: "無印良品のウールブレンドコートです。{{COLOR}}で合わせやすく、防寒性も十分です。袖口に軽い毛羽立ちがありますが、普段使いには問題ありません。サイズが合わなくなったため出品します。",
      descriptionEn: "A MUJI wool-blend coat. Some light wear at the cuffs but still warm and usable day-to-day. Listed because it no longer fits.",
      titleEn: "MUJI Wool Blend Coat",
      estValueText: "¥1,500〜¥3,000", estValueTextEn: "¥1,500–¥3,000", askPriceText: "無料でお譲りします",
      keywords: ["無印良品", "コート", "アウター", "Lサイズ"],
      keywordsEn: ["MUJI", "Coat", "Outerwear", "Size L"],
    },
  ],
  wide: [
    {
      key: "teapot_nambu", brand: "岩鋳（南部鉄器）", brandEn: "Iwachu (Nambu Cast Iron)",
      nameTemplate: "南部鉄器 急須",
      brandLine: "岩鋳 / Nambu Cast Iron Teapot",
      quick: [
        { labelKey: "field.brand", value: "岩鋳（南部鉄器）", valueEn: "Iwachu (Nambu Cast Iron)", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "容量 約0.6L", valueEn: "Capacity approx. 0.6L", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "良好（使用感あり）", valueEn: "Good (shows some use)", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥6,000〜¥10,000", valueEn: "¥6,000–¥10,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "幅16×奥行12×高さ11cm", valueEn: "16 × 12 × 11 cm (W×D×H)", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "急須（鉄瓶）", "Teapot (cast iron kettle)"], ["full.maker", "岩鋳（盛岡）", "Iwachu (Morioka)"], ["full.logo", "底面に「岩鋳」の刻印", "“Iwachu” stamped on the base"],
        ["full.model", "伝統工芸 南部鉄器", "Traditional Nambu cast ironware"], ["full.serial", "該当なし", "Not applicable"], ["full.age", "10年以上（推定）", "10+ years (estimated)"],
        ["full.material", "鋳鉄", "Cast iron"], ["full.colorway", "{{COLOR}} / アラレ紋", "{{COLOR}} / Arare (hail) pattern"], ["full.pattern", "アラレ紋", "Arare (hail) pattern"],
        ["full.style", "和食器・伝統工芸", "Japanese tableware, traditional craft"], ["full.damage", "内部にわずかな使用感、外側は良好", "Slight wear inside, exterior in good shape"], ["full.accessories", "なし", "None"],
        ["full.estDimensions", "幅16×奥行12×高さ11cm", "16 × 12 × 11 cm (W×D×H)"],
      ],
      recommendation: { action: "keep", tagJa: "おすすめ · KEEP", tagEn: "Recommended · KEEP", title: "大切に使い続けましょう", titleEn: "Worth keeping and using",
        text: "南部鉄器は長く使うほど味わいが増す伝統工芸品です。修理や手入れをしながら、これからも使い続けられます。",
        textEn: "Nambu ironware is a traditional craft that only gets better with age. With some care and occasional repair, you can keep using it for years." },
      sizeLabel: "容量 約0.6L", sizeLabelEn: "Capacity approx. 0.6L",
      dimensions: "幅16×奥行12×高さ11cm", dimensionsEn: "16 × 12 × 11 cm (W×D×H)",
      condition: "良好（使用感あり）", conditionEn: "Good (shows some use)",
      descriptionJa: "岩鋳の南部鉄器 急須です。使用感はありますが、内部の状態は良好で、これからも長くお使いいただけます。{{COLOR}}の落ち着いた佇まいで、大切に手入れをすれば一生ものです。",
      descriptionEn: "A Nambu cast-iron teapot by Iwachu. Shows some wear but is in good working condition — the kind of craftsmanship built to last with proper care.",
      titleEn: "Nambu Cast Iron Teapot (Iwachu)",
      estValueText: "¥6,000〜¥10,000", estValueTextEn: "¥6,000–¥10,000", askPriceText: "¥7,500",
      keywords: ["南部鉄器", "急須", "伝統工芸", "岩鋳"],
      keywordsEn: ["Nambu ironware", "Teapot", "Traditional craft", "Iwachu"],
    },
    {
      key: "table_wood", brand: "カリモク家具", brandEn: "Karimoku Furniture",
      nameTemplate: "カリモク家具 木製サイドテーブル",
      brandLine: "カリモク家具 / Wooden Side Table",
      quick: [
        { labelKey: "field.brand", value: "カリモク家具", valueEn: "Karimoku Furniture", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "1人用サイズ", valueEn: "Single-person size", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "非常に良い", valueEn: "Very Good", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥5,000〜¥9,000", valueEn: "¥5,000–¥9,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "幅45×奥行45×高さ40cm", valueEn: "45 × 45 × 40 cm (W×D×H)", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "サイドテーブル", "Side table"], ["full.maker", "カリモク家具", "Karimoku Furniture"], ["full.logo", "底面に刻印あり", "Stamped on the underside"],
        ["full.model", "無垢材 丸型サイドテーブル", "Solid wood round side table"], ["full.serial", "該当なし", "Not applicable"], ["full.age", "約5〜8年（推定）", "About 5–8 years (estimated)"],
        ["full.material", "天然木（オーク材、推定）", "Solid wood (oak, estimated)"], ["full.colorway", "{{COLOR}} / 木目", "{{COLOR}} / Wood grain"], ["full.pattern", "無地（木目調）", "Solid (wood grain)"],
        ["full.style", "北欧テイスト", "Scandinavian style"], ["full.damage", "天板に小さな輪染みが1箇所", "One small ring mark on the tabletop"], ["full.accessories", "なし", "None"],
        ["full.estDimensions", "幅45×奥行45×高さ40cm", "45 × 45 × 40 cm (W×D×H)"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", tagEn: "Recommended · SELL", title: "売ってみましょう", titleEn: "Consider selling it",
        text: "人気の家具ブランドで、コンパクトなサイドテーブルは需要があります。天板の小さな輪染み以外は状態良好です。",
        textEn: "This is a popular furniture brand, and compact side tables are in demand. Aside from the small ring mark on top, it's in good condition." },
      sizeLabel: "1人用サイズ", sizeLabelEn: "Single-person size",
      dimensions: "幅45×奥行45×高さ40cm", dimensionsEn: "45 × 45 × 40 cm (W×D×H)",
      condition: "非常に良い（天板に小さな輪染み1箇所）", conditionEn: "Very Good (one small ring mark on top)",
      descriptionJa: "カリモク家具の木製サイドテーブルです。{{COLOR}}の木目が美しく、天板に小さな輪染みが1箇所ありますが、全体的に状態は良好です。引っ越しのため出品します。",
      descriptionEn: "A Karimoku wooden side table. One small water ring mark on the top, otherwise in good condition. Listed due to moving.",
      titleEn: "Karimoku Wooden Side Table",
      estValueText: "¥5,000〜¥9,000", estValueTextEn: "¥5,000–¥9,000", askPriceText: "¥6,500",
      keywords: ["カリモク", "サイドテーブル", "木製家具", "北欧"],
      keywordsEn: ["Karimoku", "Side table", "Wood furniture", "Scandinavian"],
    },
  ],
  square: [
    {
      key: "camera_vintage", brand: "Canon", brandEn: "Canon",
      nameTemplate: "Canon フィルムカメラ（ヴィンテージ）",
      brandLine: "Canon / Vintage Film Camera",
      quick: [
        { labelKey: "field.brand", value: "Canon", valueEn: "Canon", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "35mmフィルム対応", valueEn: "35mm film format", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "動作品（現状渡し）", valueEn: "Working (sold as-is)", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥12,000〜¥22,000", valueEn: "¥12,000–¥22,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "約14×9×6cm", valueEn: "Approx. 14 × 9 × 6 cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "フィルムカメラ", "Film camera"], ["full.maker", "Canon（キヤノン）", "Canon"], ["full.logo", "前面にCanonロゴあり", "Canon logo on the front"],
        ["full.model", "AE-1相当（推定・ヴィンテージ機）", "AE-1-equivalent (estimated, vintage)"], ["full.serial", "底面に刻印あり（判読一部不可）", "Stamped on the base (partly illegible)"],
        ["full.age", "40年以上（ヴィンテージ）", "40+ years (vintage)"], ["full.material", "メタルボディ", "Metal body"], ["full.colorway", "{{COLOR}} / シルバー差し", "{{COLOR}} with silver accents"],
        ["full.pattern", "無地", "Solid"], ["full.style", "クラシック・ヴィンテージ", "Classic, vintage"], ["full.damage", "上部に小さな擦り傷、光学系は良好", "Small scratch on top, optics in good shape"],
        ["full.accessories", "純正ストラップ付き", "Comes with original strap"], ["full.estDimensions", "約14×9×6cm", "Approx. 14 × 9 × 6 cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", tagEn: "Recommended · SELL", title: "売ってみましょう", titleEn: "Consider selling it",
        text: "ヴィンテージフィルムカメラは近年人気が高まっており、状態の良い個体は高値で取引されることがあります。底面の刻印から年代をさらに絞り込めるかもしれません。",
        textEn: "Vintage film cameras have grown more popular recently, and well-kept ones can fetch good prices. The serial number on the base may help narrow down the exact era." },
      sizeLabel: "35mmフィルム対応", sizeLabelEn: "35mm film format",
      dimensions: "約14×9×6cm", dimensionsEn: "Approx. 14 × 9 × 6 cm",
      condition: "動作品（現状渡し）", conditionEn: "Working (sold as-is)",
      descriptionJa: "Canonのヴィンテージフィルムカメラです。{{COLOR}}のクラシックなデザインで、動作確認済みです。上部に小さな擦り傷がありますが、撮影には支障ありません。純正ストラップ付きです。",
      descriptionEn: "A vintage Canon film camera in working condition. A small scratch on top, but nothing that affects shooting. Comes with the original strap.",
      titleEn: "Canon Vintage Film Camera",
      estValueText: "¥12,000〜¥22,000", estValueTextEn: "¥12,000–¥22,000", askPriceText: "¥16,000",
      keywords: ["Canon", "フィルムカメラ", "ヴィンテージ", "カメラ"],
      keywordsEn: ["Canon", "Film camera", "Vintage", "Camera"],
    },
    {
      key: "watch_seiko", brand: "SEIKO", brandEn: "SEIKO",
      nameTemplate: "SEIKO 機械式腕時計",
      brandLine: "SEIKO / Mechanical Watch",
      quick: [
        { labelKey: "field.brand", value: "SEIKO", valueEn: "SEIKO", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}文字盤", valueEn: "{{COLOR}} dial", icon: "i-sparkle" },
        { labelKey: "field.size", value: "ケース径 約38mm", valueEn: "Case approx. 38mm", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "良好（作動確認済み）", valueEn: "Good (confirmed working)", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥15,000〜¥30,000", valueEn: "¥15,000–¥30,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "約38×38×11mm", valueEn: "Approx. 38 × 38 × 11 mm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "腕時計（機械式）", "Watch (mechanical)"], ["full.maker", "SEIKO（セイコー）", "SEIKO"], ["full.logo", "文字盤にSEIKOロゴあり", "SEIKO logo on the dial"],
        ["full.model", "5番台キャリバー搭載（推定）", "5-series caliber (estimated)"], ["full.serial", "ケース裏に刻印あり", "Stamped on the case back"], ["full.age", "20〜30年（推定）", "20–30 years (estimated)"],
        ["full.material", "ステンレススチール", "Stainless steel"], ["full.colorway", "{{COLOR}}文字盤", "{{COLOR}} dial"], ["full.pattern", "無地文字盤", "Plain dial"],
        ["full.style", "クラシック・ドレスウォッチ", "Classic dress watch"], ["full.damage", "ベルトに使用感、風防は良好", "Wear on the strap, crystal in good shape"],
        ["full.accessories", "なし（純正ベルトなし）", "None (no original strap)"], ["full.estDimensions", "ケース径約38mm × 厚み11mm", "Case approx. 38mm × 11mm thick"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", tagEn: "Recommended · SELL", title: "隠れた価値があるかもしれません", titleEn: "This may be worth more than you think",
        text: "機械式のSEIKO腕時計は国内外で根強い人気があります。ケース裏のシリアルから型番を特定できれば、さらに価値がわかるかもしれません。",
        textEn: "Mechanical SEIKO watches have a loyal following at home and abroad. Identifying the exact model from the case-back serial could reveal even more value." },
      sizeLabel: "ケース径 約38mm", sizeLabelEn: "Case approx. 38mm",
      dimensions: "約38×38×11mm", dimensionsEn: "Approx. 38 × 38 × 11 mm",
      condition: "良好（作動確認済み）", conditionEn: "Good (confirmed working)",
      descriptionJa: "SEIKOの機械式腕時計です。{{COLOR}}の文字盤がクラシックな印象で、動作確認済みです。ベルトには使用感がありますが、風防やムーブメントの状態は良好です。",
      descriptionEn: "A SEIKO mechanical watch, confirmed working. The strap shows some wear, but the crystal and movement are in good condition.",
      titleEn: "SEIKO Mechanical Watch",
      estValueText: "¥15,000〜¥30,000", estValueTextEn: "¥15,000–¥30,000", askPriceText: "¥20,000",
      keywords: ["SEIKO", "腕時計", "機械式", "ヴィンテージ"],
      keywordsEn: ["SEIKO", "Watch", "Mechanical", "Vintage"],
    },
    {
      key: "bag_coach", brand: "COACH", brandEn: "COACH",
      nameTemplate: "COACH レザートートバッグ",
      brandLine: "COACH / Leather Tote Bag",
      quick: [
        { labelKey: "field.brand", value: "COACH", valueEn: "COACH", icon: "i-tag" },
        { labelKey: "field.color", value: "{{COLOR}}", valueEn: "{{COLOR}}", icon: "i-sparkle" },
        { labelKey: "field.size", value: "Aサイズ相当", valueEn: "A4-size equivalent", icon: "i-type", estimate: true },
        { labelKey: "field.condition", value: "良い", valueEn: "Good", icon: "i-check-circle" },
        { labelKey: "field.estValue", value: "¥7,000〜¥13,000", valueEn: "¥7,000–¥13,000", icon: "i-sparkle", estimate: true, span2: true },
        { labelKey: "field.dimensions", value: "幅34×高さ28×マチ12cm", valueEn: "34 × 28 × 12 cm (W×H×D)", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["full.type", "トートバッグ", "Tote bag"], ["full.maker", "COACH（コーチ）", "COACH"], ["full.logo", "前面にCOACHロゴプレートあり", "COACH logo plate on the front"],
        ["full.model", "レザートート（推定）", "Leather tote (estimated)"], ["full.serial", "内側タグに記載あり", "Listed on an interior tag"], ["full.age", "約5〜10年（推定）", "About 5–10 years (estimated)"],
        ["full.material", "本革（牛革）", "Genuine leather (cowhide)"], ["full.colorway", "{{COLOR}}", "{{COLOR}}"], ["full.pattern", "無地", "Solid"],
        ["full.style", "カジュアル・きれいめ", "Casual, polished"], ["full.damage", "底面の四隅に軽いスレあり", "Light wear at the base corners"], ["full.accessories", "なし", "None"],
        ["full.estDimensions", "幅34×高さ28×マチ12cm", "34 × 28 × 12 cm (W×H×D)"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", tagEn: "Recommended · SELL", title: "売ってみましょう", titleEn: "Consider selling it",
        text: "COACHは日本でもリセール需要が高いブランドです。底面の軽いスレ以外は状態が良く、実用性の高いサイズです。",
        textEn: "COACH has strong resale demand in Japan. Aside from light wear at the base corners, it's in good condition and a practical everyday size." },
      sizeLabel: "Aサイズ相当", sizeLabelEn: "A4-size equivalent",
      dimensions: "幅34×高さ28×マチ12cm", dimensionsEn: "34 × 28 × 12 cm (W×H×D)",
      condition: "良い（底面四隅に軽いスレあり）", conditionEn: "Good (light wear at base corners)",
      descriptionJa: "COACHのレザートートバッグです。{{COLOR}}で普段使いしやすいサイズです。底面の四隅に軽いスレがありますが、それ以外は状態良好です。",
      descriptionEn: "A COACH leather tote bag, an everyday-friendly size. Light wear at the base corners, otherwise in good condition.",
      titleEn: "COACH Leather Tote Bag",
      estValueText: "¥7,000〜¥13,000", estValueTextEn: "¥7,000–¥13,000", askPriceText: "¥9,500",
      keywords: ["COACH", "トートバッグ", "本革", "レディース"],
      keywordsEn: ["COACH", "Tote bag", "Leather", "Women's"],
    },
  ],
};

function fillColor(str, colorName) {
  return str.split("{{COLOR}}").join(colorName);
}

function pickProfile(bucket) {
  const list = ITEM_PROFILES[bucket] || ITEM_PROFILES.square;
  return list[Math.floor(Math.random() * list.length)];
}

// Combines a chosen profile with the color actually detected from the
// user's photo, producing the same shape the item-card renderer expects.
// `lang` picks which color name (ja/en) fills the {{COLOR}} placeholders —
// the rest of the shape (both quick/full label keys and ja+en values) is
// always returned so the UI can re-render in either language without a
// re-analysis.
function buildAnalysis(bucket, colorName, colorNameEn) {
  const p = pickProfile(bucket);
  const cEn = colorNameEn || colorName;
  const titleJa = fillColor(p.nameTemplate, colorName);
  return {
    key: p.key,
    name: titleJa,
    brandLine: p.brandLine,
    quick: p.quick.map((q) => ({ ...q, value: fillColor(q.value, colorName), valueEn: fillColor(q.valueEn, cEn) })),
    full: p.full.map(([labelKey, v, vEn]) => [labelKey, fillColor(v, colorName), fillColor(vEn, cEn)]),
    recommendation: p.recommendation,
    brand: p.brand,
    brandEn: p.brandEn,
    sizeLabel: p.sizeLabel,
    sizeLabelEn: p.sizeLabelEn,
    dimensions: p.dimensions,
    dimensionsEn: p.dimensionsEn,
    condition: p.condition,
    conditionEn: p.conditionEn,
    titleJa,
    titleEn: p.titleEn,
    descriptionJa: fillColor(p.descriptionJa, colorName),
    descriptionEn: p.descriptionEn,
    estValueText: p.estValueText,
    estValueTextEn: p.estValueTextEn,
    askPriceText: p.askPriceText,
    keywords: p.keywords,
    keywordsEn: p.keywordsEn,
  };
}

const OTHER_RECOMMENDATIONS = {
  give: {
    tagJa: "おすすめ · GIVE", tagEn: "Recommended · GIVE",
    title: "譲ってみましょう", titleEn: "Consider giving it away",
    text: "このアイテムは高いリセール価値はありませんが、まだ十分に使えます。近くで必要としている方がすぐに見つかるはずです。",
    textEn: "This item won't fetch a high resale price, but it's still perfectly usable. Someone nearby is likely to need it soon.",
  },
};

const ASK_ANSWERS = {
  sell: "クローゼットの中に、リセール需要のあるアイテムが3点あります。合計でおよそ¥14,000〜¥21,000が見込めそうです。",
  give: "1年以上使われていないアイテムが5点あります。近くのコミュニティでちょうど必要としている方がいるかもしれません。",
  value: "書斎にある腕時計と、リビングのカメラに、想定より高い価値がある可能性があります。詳しく見てみましょう。",
  unused: "過去12か月、一度も使われていないアイテムが7点見つかりました。",
  keep: "思い出の品や毎日使っているものなど、9点は「残す」のがおすすめです。",
  earn: "すべての出品候補を売却できた場合、合計でおよそ¥26,000〜¥38,000の収益が見込めます。",
};

const ASK_ANSWERS_EN = {
  sell: "Your closet has 3 items with resale demand — together they could fetch roughly ¥14,000–¥21,000.",
  give: "5 items haven't been used in over a year. Someone in your nearby community might need exactly one of them.",
  value: "The watch in your office and the camera in your living room may be worth more than expected. Worth a closer look.",
  unused: "7 items haven't been used at all in the past 12 months.",
  keep: "9 items — sentimental pieces and things you use daily — are worth holding onto.",
  earn: "If every sellable item found a buyer, you could earn roughly ¥26,000–¥38,000 in total.",
};

const CATEGORIES = [
  { id: "closet", name: "クローゼット", nameEn: "Closet", icon: "i-closet", tone: "fc-tone-give", count: 24 },
  { id: "kitchen", name: "キッチン", nameEn: "Kitchen", icon: "i-kitchen", tone: "fc-tone-sell", count: 12 },
  { id: "bedroom", name: "寝室", nameEn: "Bedroom", icon: "i-bed", tone: "fc-tone-donate", count: 8 },
  { id: "living", name: "リビング", nameEn: "Living Room", icon: "i-sofa", tone: "fc-tone-keep", count: 15 },
  { id: "office", name: "書斎", nameEn: "Office", icon: "i-book", tone: "fc-tone-gold", count: 10 },
  { id: "storage", name: "収納", nameEn: "Storage", icon: "i-archive", tone: "fc-tone-recycle", count: 19 },
  { id: "garage", name: "ガレージ", nameEn: "Garage", icon: "i-garage", tone: "fc-tone-sell", count: 6 },
  { id: "other", name: "その他", nameEn: "Other", icon: "i-dots", tone: "fc-tone-give", count: 3 },
];

const CATEGORY_ITEMS = {
  closet: [
    { name: "ネイビーブレザー", nameEn: "Navy Blazer", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "冬用コート", nameEn: "Winter Coat", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "シルクスカーフ", nameEn: "Silk Scarf", action: "gift", gradient: ["#e08aa8", "#eba7c1"] },
    { name: "革のベルト", nameEn: "Leather Belt", action: "give", gradient: ["#e08a3f", "#eda666"] },
    { name: "着物（訪問着）", nameEn: "Kimono (Houmongi)", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "スニーカー", nameEn: "Sneakers", action: "donate", gradient: ["#8a6ab0", "#a486c9"] },
  ],
  kitchen: [
    { name: "土鍋", nameEn: "Clay Pot (Donabe)", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "使っていないミキサー", nameEn: "Unused Blender", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "来客用食器セット", nameEn: "Guest Tableware Set", action: "give", gradient: ["#e08a3f", "#eda666"] },
  ],
  bedroom: [
    { name: "アンティーク時計", nameEn: "Antique Clock", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "羽毛布団（予備）", nameEn: "Spare Down Comforter", action: "donate", gradient: ["#8a6ab0", "#a486c9"] },
  ],
  living: [
    { name: "レコードプレイヤー", nameEn: "Record Player", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "フィルムカメラ", nameEn: "Film Camera", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "本棚", nameEn: "Bookshelf", action: "give", gradient: ["#e08a3f", "#eda666"] },
  ],
  office: [
    { name: "腕時計（機械式）", nameEn: "Mechanical Watch", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "万年筆コレクション", nameEn: "Fountain Pen Collection", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
  ],
  storage: [
    { name: "古い雑誌の山", nameEn: "Stack of Old Magazines", action: "recycle", gradient: ["#3ba39a", "#5cbcb3"] },
    { name: "使わない工具", nameEn: "Unused Tools", action: "give", gradient: ["#e08a3f", "#eda666"] },
    { name: "壊れた家電", nameEn: "Broken Appliance", action: "dispose", gradient: ["#7c7a74", "#9c9a92"] },
  ],
  garage: [
    { name: "自転車（子供用）", nameEn: "Kids' Bicycle", action: "gift", gradient: ["#e08aa8", "#eba7c1"] },
    { name: "キャンプ用品", nameEn: "Camping Gear", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
  ],
  other: [
    { name: "サクソフォン", nameEn: "Saxophone", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
  ],
};

const ACTION_ICON = {
  keep: "i-heart", sell: "i-tag", give: "i-give", gift: "i-gift",
  donate: "i-donate", recycle: "i-recycle", dispose: "i-trash",
};

const MARKET_LISTINGS = [
  {
    title: "ラルフローレン ブレザー ネイビー", titleEn: "Ralph Lauren Blazer, Navy",
    price: "¥9,800", priceEn: "¥9,800",
    meta: "0.8km · 出品者: 美咲さん", metaEn: "0.8km · Seller: Misaki",
    icon: "i-tag", tone: "sell", badges: [["本人確認済み", "ID Verified", ""], ["評価 4.9", "Rating 4.9", "gold"]],
  },
  {
    title: "木製ダイニングチェア 2脚", titleEn: "Wooden Dining Chairs (Set of 2)",
    price: "無料でお譲りします", priceEn: "Free to a good home",
    meta: "1.2km · 出品者: 健一さん", metaEn: "1.2km · Seller: Kenichi",
    icon: "i-give", tone: "give", badges: [["コミュニティ確認済み", "Community Verified", "blue"]],
  },
  {
    title: "サクソフォン（ヴィンテージ）", titleEn: "Saxophone (Vintage)",
    price: "物語つきで贈ります", priceEn: "Given with its story",
    meta: "レガシー・アイテム · 田中さん", metaEn: "Legacy item · Tanaka",
    icon: "i-scroll", tone: "donate", badges: [["本人確認済み", "ID Verified", ""], ["紹介制", "By referral", "blue"]],
  },
  {
    title: "冬物コート寄付します", titleEn: "Winter Coat, Donating",
    price: "寄付", priceEn: "Donation",
    meta: "1.9km · チャリティ経由", metaEn: "1.9km · Via charity partner",
    icon: "i-donate", tone: "donate", badges: [["慈善団体連携", "Charity Partner", "gold"]],
  },
];
