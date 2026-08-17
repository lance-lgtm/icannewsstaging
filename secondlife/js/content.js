/* =========================================================================
   TSUGU — mock content
   Stands in for a real computer-vision / valuation backend. Real signal
   extracted client-side from the user's own photo (dominant color, aspect
   ratio) selects and colors one of the ITEM_PROFILES below via
   buildAnalysis() — see detectPhoto() in app.js. Swap buildAnalysis() for a
   real vision/valuation API call (see README) to go from prototype to
   production; a client-side API key is never safe to ship in a static site,
   so that call belongs behind a small backend, not in this file.
   ========================================================================= */

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
const ITEM_PROFILES = {
  tall: [
    {
      key: "blazer_rl", brand: "Ralph Lauren",
      nameTemplate: "Ralph Lauren ウィメンズ ブレザー",
      brandLine: "Ralph Lauren / Women's Blazer",
      quick: [
        { label: "ブランド", value: "Ralph Lauren", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "Japan 11 / US 8–10", icon: "i-type", estimate: true },
        { label: "状態", value: "非常に良い", icon: "i-check-circle" },
        { label: "推定価値", value: "¥8,000〜¥12,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "約 64 × 46 cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "ブレザー・ジャケット"], ["メーカー", "Ralph Lauren（ラルフローレン）"],
        ["ロゴ", "左胸にポニーロゴの刺繍あり"], ["モデル", "テーラードブレザー（推定 2015〜2019年頃）"],
        ["シリアル番号", "検出されず"], ["推定年代", "約5〜10年（推定）"], ["素材", "ウール混紡（推定）"],
        ["カラー / カラーウェイ", "{{COLOR}} / 無地"], ["パターン", "無地"], ["スタイル", "テーラード・オフィスカジュアル"],
        ["ラベルサイズ", "US 8"], ["推定日本サイズ", "Japan 11 (M)"], ["フィット", "レギュラーフィット"],
        ["視認できる傷", "目立った傷や汚れは見られません"], ["付属品", "予備ボタン1個（内ポケット）"],
        ["推定寸法", "着丈 約64cm / 身幅 約46cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", title: "売ってみましょう",
        text: "このジャケットは状態が良く、日本国内でもリセール需要のあるブランドです。同様のアイテムはおよそ¥8,000〜¥12,000で取引されています。" },
      sizeLabel: "Japan 11 / US 8–10", dimensions: "約 64 × 46 cm",
      condition: "非常に良い（Very Good）", conditionEn: "Very Good",
      descriptionJa: "Ralph Laurenのウィメンズ ブレザーです。深みのある{{COLOR}}カラーで、上品なオフィスシーンにもお使いいただけます。目立った傷や汚れはなく、状態は非常に良好です。クローゼットの整理のため出品します。",
      descriptionEn: "A Ralph Lauren women's blazer. No notable damage or stains — very good condition overall. Listed while tidying up my closet.",
      titleEn: "Ralph Lauren Women's Blazer",
      estValueText: "¥8,000〜¥12,000", askPriceText: "¥9,800",
      keywords: ["ラルフローレン", "ブレザー", "レディース", "Mサイズ"],
    },
    {
      key: "coat_muji", brand: "無印良品",
      nameTemplate: "無印良品 ウールブレンドコート",
      brandLine: "無印良品 / Wool Blend Coat",
      quick: [
        { label: "ブランド", value: "無印良品", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "Japan L / US M", icon: "i-type", estimate: true },
        { label: "状態", value: "良い", icon: "i-check-circle" },
        { label: "推定価値", value: "¥1,500〜¥3,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "約 95 × 54 cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "コート・アウター"], ["メーカー", "無印良品"], ["ロゴ", "目立つロゴなし（シンプルデザイン）"],
        ["モデル", "ウールブレンド チェスターコート"], ["シリアル番号", "該当なし"], ["推定年代", "約3〜5年（推定）"],
        ["素材", "ウール30% ・ ポリエステル70%（推定）"], ["カラー / カラーウェイ", "{{COLOR}} / 無地"],
        ["パターン", "無地"], ["スタイル", "カジュアル・アウター"], ["ラベルサイズ", "L"],
        ["推定日本サイズ", "Japan L"], ["フィット", "ゆったりめ"], ["視認できる傷", "袖口に軽い毛羽立ちあり"],
        ["付属品", "なし"], ["推定寸法", "着丈 約95cm / 身幅 約54cm"],
      ],
      recommendation: { action: "give", tagJa: "おすすめ · GIVE", title: "譲ってみましょう",
        text: "このコートは高いリセール価値はありませんが、まだ十分に暖かく着られる状態です。近くで必要としている方がすぐに見つかりそうです。" },
      sizeLabel: "Japan L / US M", dimensions: "約 95 × 54 cm",
      condition: "良い（袖口に軽い毛羽立ちあり）", conditionEn: "Good (light wear at cuffs)",
      descriptionJa: "無印良品のウールブレンドコートです。{{COLOR}}で合わせやすく、防寒性も十分です。袖口に軽い毛羽立ちがありますが、普段使いには問題ありません。サイズが合わなくなったため出品します。",
      descriptionEn: "A MUJI wool-blend coat. Some light wear at the cuffs but still warm and usable day-to-day. Listed because it no longer fits.",
      titleEn: "MUJI Wool Blend Coat",
      estValueText: "¥1,500〜¥3,000", askPriceText: "無料でお譲りします",
      keywords: ["無印良品", "コート", "アウター", "Lサイズ"],
    },
  ],
  wide: [
    {
      key: "teapot_nambu", brand: "岩鋳（南部鉄器）",
      nameTemplate: "南部鉄器 急須",
      brandLine: "岩鋳 / Nambu Cast Iron Teapot",
      quick: [
        { label: "ブランド", value: "岩鋳（南部鉄器）", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "容量 約0.6L", icon: "i-type", estimate: true },
        { label: "状態", value: "良好（使用感あり）", icon: "i-check-circle" },
        { label: "推定価値", value: "¥6,000〜¥10,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "幅16×奥行12×高さ11cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "急須（鉄瓶）"], ["メーカー", "岩鋳（盛岡）"], ["ロゴ", "底面に「岩鋳」の刻印"],
        ["モデル", "伝統工芸 南部鉄器"], ["シリアル番号", "該当なし"], ["推定年代", "10年以上（推定）"],
        ["素材", "鋳鉄"], ["カラー / カラーウェイ", "{{COLOR}} / アラレ紋"], ["パターン", "アラレ紋"],
        ["スタイル", "和食器・伝統工芸"], ["視認できる傷", "内部にわずかな使用感、外側は良好"], ["付属品", "なし"],
        ["推定寸法", "幅16×奥行12×高さ11cm"],
      ],
      recommendation: { action: "keep", tagJa: "おすすめ · KEEP", title: "大切に使い続けましょう",
        text: "南部鉄器は長く使うほど味わいが増す伝統工芸品です。修理や手入れをしながら、これからも使い続けられます。" },
      sizeLabel: "容量 約0.6L", dimensions: "幅16×奥行12×高さ11cm",
      condition: "良好（使用感あり）", conditionEn: "Good (shows some use)",
      descriptionJa: "岩鋳の南部鉄器 急須です。使用感はありますが、内部の状態は良好で、これからも長くお使いいただけます。{{COLOR}}の落ち着いた佇まいで、大切に手入れをすれば一生ものです。",
      descriptionEn: "A Nambu cast-iron teapot by Iwachu. Shows some wear but is in good working condition — the kind of craftsmanship built to last with proper care.",
      titleEn: "Nambu Cast Iron Teapot (Iwachu)",
      estValueText: "¥6,000〜¥10,000", askPriceText: "¥7,500",
      keywords: ["南部鉄器", "急須", "伝統工芸", "岩鋳"],
    },
    {
      key: "table_wood", brand: "カリモク家具",
      nameTemplate: "カリモク家具 木製サイドテーブル",
      brandLine: "カリモク家具 / Wooden Side Table",
      quick: [
        { label: "ブランド", value: "カリモク家具", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "1人用サイズ", icon: "i-type", estimate: true },
        { label: "状態", value: "非常に良い", icon: "i-check-circle" },
        { label: "推定価値", value: "¥5,000〜¥9,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "幅45×奥行45×高さ40cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "サイドテーブル"], ["メーカー", "カリモク家具"], ["ロゴ", "底面に刻印あり"],
        ["モデル", "無垢材 丸型サイドテーブル"], ["シリアル番号", "該当なし"], ["推定年代", "約5〜8年（推定）"],
        ["素材", "天然木（オーク材、推定）"], ["カラー / カラーウェイ", "{{COLOR}} / 木目"], ["パターン", "無地（木目調）"],
        ["スタイル", "北欧テイスト"], ["視認できる傷", "天板に小さな輪染みが1箇所"], ["付属品", "なし"],
        ["推定寸法", "幅45×奥行45×高さ40cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", title: "売ってみましょう",
        text: "人気の家具ブランドで、コンパクトなサイドテーブルは需要があります。天板の小さな輪染み以外は状態良好です。" },
      sizeLabel: "1人用サイズ", dimensions: "幅45×奥行45×高さ40cm",
      condition: "非常に良い（天板に小さな輪染み1箇所）", conditionEn: "Very Good (one small ring mark on top)",
      descriptionJa: "カリモク家具の木製サイドテーブルです。{{COLOR}}の木目が美しく、天板に小さな輪染みが1箇所ありますが、全体的に状態は良好です。引っ越しのため出品します。",
      descriptionEn: "A Karimoku wooden side table. One small water ring mark on the top, otherwise in good condition. Listed due to moving.",
      titleEn: "Karimoku Wooden Side Table",
      estValueText: "¥5,000〜¥9,000", askPriceText: "¥6,500",
      keywords: ["カリモク", "サイドテーブル", "木製家具", "北欧"],
    },
  ],
  square: [
    {
      key: "camera_vintage", brand: "Canon",
      nameTemplate: "Canon フィルムカメラ（ヴィンテージ）",
      brandLine: "Canon / Vintage Film Camera",
      quick: [
        { label: "ブランド", value: "Canon", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "35mmフィルム対応", icon: "i-type", estimate: true },
        { label: "状態", value: "動作品（現状渡し）", icon: "i-check-circle" },
        { label: "推定価値", value: "¥12,000〜¥22,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "約14×9×6cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "フィルムカメラ"], ["メーカー", "Canon（キヤノン）"], ["ロゴ", "前面にCanonロゴあり"],
        ["モデル", "AE-1相当（推定・ヴィンテージ機）"], ["シリアル番号", "底面に刻印あり（判読一部不可）"],
        ["推定年代", "40年以上（ヴィンテージ）"], ["素材", "メタルボディ"], ["カラー / カラーウェイ", "{{COLOR}} / シルバー差し"],
        ["パターン", "無地"], ["スタイル", "クラシック・ヴィンテージ"], ["視認できる傷", "上部に小さな擦り傷、光学系は良好"],
        ["付属品", "純正ストラップ付き"], ["推定寸法", "約14×9×6cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", title: "売ってみましょう",
        text: "ヴィンテージフィルムカメラは近年人気が高まっており、状態の良い個体は高値で取引されることがあります。底面の刻印から年代をさらに絞り込めるかもしれません。" },
      sizeLabel: "35mmフィルム対応", dimensions: "約14×9×6cm",
      condition: "動作品（現状渡し）", conditionEn: "Working (sold as-is)",
      descriptionJa: "Canonのヴィンテージフィルムカメラです。{{COLOR}}のクラシックなデザインで、動作確認済みです。上部に小さな擦り傷がありますが、撮影には支障ありません。純正ストラップ付きです。",
      descriptionEn: "A vintage Canon film camera in working condition. A small scratch on top, but nothing that affects shooting. Comes with the original strap.",
      titleEn: "Canon Vintage Film Camera",
      estValueText: "¥12,000〜¥22,000", askPriceText: "¥16,000",
      keywords: ["Canon", "フィルムカメラ", "ヴィンテージ", "カメラ"],
    },
    {
      key: "watch_seiko", brand: "SEIKO",
      nameTemplate: "SEIKO 機械式腕時計",
      brandLine: "SEIKO / Mechanical Watch",
      quick: [
        { label: "ブランド", value: "SEIKO", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}文字盤", icon: "i-sparkle" },
        { label: "サイズ", value: "ケース径 約38mm", icon: "i-type", estimate: true },
        { label: "状態", value: "良好（作動確認済み）", icon: "i-check-circle" },
        { label: "推定価値", value: "¥15,000〜¥30,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "約38×38×11mm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "腕時計（機械式）"], ["メーカー", "SEIKO（セイコー）"], ["ロゴ", "文字盤にSEIKOロゴあり"],
        ["モデル", "5番台キャリバー搭載（推定）"], ["シリアル番号", "ケース裏に刻印あり"], ["推定年代", "20〜30年（推定）"],
        ["素材", "ステンレススチール"], ["カラー / カラーウェイ", "{{COLOR}}文字盤"], ["パターン", "無地文字盤"],
        ["スタイル", "クラシック・ドレスウォッチ"], ["視認できる傷", "ベルトに使用感、風防は良好"],
        ["付属品", "なし（純正ベルトなし）"], ["推定寸法", "ケース径約38mm × 厚み11mm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", title: "隠れた価値があるかもしれません",
        text: "機械式のSEIKO腕時計は国内外で根強い人気があります。ケース裏のシリアルから型番を特定できれば、さらに価値がわかるかもしれません。" },
      sizeLabel: "ケース径 約38mm", dimensions: "約38×38×11mm",
      condition: "良好（作動確認済み）", conditionEn: "Good (confirmed working)",
      descriptionJa: "SEIKOの機械式腕時計です。{{COLOR}}の文字盤がクラシックな印象で、動作確認済みです。ベルトには使用感がありますが、風防やムーブメントの状態は良好です。",
      descriptionEn: "A SEIKO mechanical watch, confirmed working. The strap shows some wear, but the crystal and movement are in good condition.",
      titleEn: "SEIKO Mechanical Watch",
      estValueText: "¥15,000〜¥30,000", askPriceText: "¥20,000",
      keywords: ["SEIKO", "腕時計", "機械式", "ヴィンテージ"],
    },
    {
      key: "bag_coach", brand: "COACH",
      nameTemplate: "COACH レザートートバッグ",
      brandLine: "COACH / Leather Tote Bag",
      quick: [
        { label: "ブランド", value: "COACH", icon: "i-tag" },
        { label: "カラー", value: "{{COLOR}}", icon: "i-sparkle" },
        { label: "サイズ", value: "Aサイズ相当", icon: "i-type", estimate: true },
        { label: "状態", value: "良い", icon: "i-check-circle" },
        { label: "推定価値", value: "¥7,000〜¥13,000", icon: "i-sparkle", estimate: true, span2: true },
        { label: "寸法", value: "幅34×高さ28×マチ12cm", icon: "i-box", estimate: true, span2: true },
      ],
      full: [
        ["種類", "トートバッグ"], ["メーカー", "COACH（コーチ）"], ["ロゴ", "前面にCOACHロゴプレートあり"],
        ["モデル", "レザートート（推定）"], ["シリアル番号", "内側タグに記載あり"], ["推定年代", "約5〜10年（推定）"],
        ["素材", "本革（牛革）"], ["カラー / カラーウェイ", "{{COLOR}}"], ["パターン", "無地"],
        ["スタイル", "カジュアル・きれいめ"], ["視認できる傷", "底面の四隅に軽いスレあり"], ["付属品", "なし"],
        ["推定寸法", "幅34×高さ28×マチ12cm"],
      ],
      recommendation: { action: "sell", tagJa: "おすすめ · SELL", title: "売ってみましょう",
        text: "COACHは日本でもリセール需要が高いブランドです。底面の軽いスレ以外は状態が良く、実用性の高いサイズです。" },
      sizeLabel: "Aサイズ相当", dimensions: "幅34×高さ28×マチ12cm",
      condition: "良い（底面四隅に軽いスレあり）", conditionEn: "Good (light wear at base corners)",
      descriptionJa: "COACHのレザートートバッグです。{{COLOR}}で普段使いしやすいサイズです。底面の四隅に軽いスレがありますが、それ以外は状態良好です。",
      descriptionEn: "A COACH leather tote bag, an everyday-friendly size. Light wear at the base corners, otherwise in good condition.",
      titleEn: "COACH Leather Tote Bag",
      estValueText: "¥7,000〜¥13,000", askPriceText: "¥9,500",
      keywords: ["COACH", "トートバッグ", "本革", "レディース"],
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
function buildAnalysis(bucket, colorName) {
  const p = pickProfile(bucket);
  const titleJa = fillColor(p.nameTemplate, colorName);
  return {
    key: p.key,
    name: titleJa,
    brandLine: p.brandLine,
    quick: p.quick.map((q) => ({ ...q, value: fillColor(q.value, colorName) })),
    full: p.full.map(([k, v]) => [k, fillColor(v, colorName)]),
    recommendation: p.recommendation,
    brand: p.brand,
    sizeLabel: p.sizeLabel,
    dimensions: p.dimensions,
    condition: p.condition,
    conditionEn: p.conditionEn,
    titleJa,
    titleEn: p.titleEn,
    descriptionJa: fillColor(p.descriptionJa, colorName),
    descriptionEn: p.descriptionEn,
    estValueText: p.estValueText,
    askPriceText: p.askPriceText,
    keywords: p.keywords,
  };
}

const OTHER_RECOMMENDATIONS = {
  give: {
    tagJa: "おすすめ · GIVE",
    title: "譲ってみましょう",
    text: "このアイテムは高いリセール価値はありませんが、まだ十分に使えます。近くで必要としている方がすぐに見つかるはずです。",
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

const CATEGORIES = [
  { id: "closet", name: "クローゼット", icon: "i-closet", tone: "fc-tone-give", count: 24 },
  { id: "kitchen", name: "キッチン", icon: "i-kitchen", tone: "fc-tone-sell", count: 12 },
  { id: "bedroom", name: "寝室", icon: "i-bed", tone: "fc-tone-donate", count: 8 },
  { id: "living", name: "リビング", icon: "i-sofa", tone: "fc-tone-keep", count: 15 },
  { id: "office", name: "書斎", icon: "i-book", tone: "fc-tone-gold", count: 10 },
  { id: "storage", name: "収納", icon: "i-archive", tone: "fc-tone-recycle", count: 19 },
  { id: "garage", name: "ガレージ", icon: "i-garage", tone: "fc-tone-sell", count: 6 },
  { id: "other", name: "その他", icon: "i-dots", tone: "fc-tone-give", count: 3 },
];

const CATEGORY_ITEMS = {
  closet: [
    { name: "ネイビーブレザー", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "冬用コート", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "シルクスカーフ", action: "gift", gradient: ["#e08aa8", "#eba7c1"] },
    { name: "革のベルト", action: "give", gradient: ["#e08a3f", "#eda666"] },
    { name: "着物（訪問着）", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "スニーカー", action: "donate", gradient: ["#8a6ab0", "#a486c9"] },
  ],
  kitchen: [
    { name: "土鍋", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "使っていないミキサー", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "来客用食器セット", action: "give", gradient: ["#e08a3f", "#eda666"] },
  ],
  bedroom: [
    { name: "アンティーク時計", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "羽毛布団（予備）", action: "donate", gradient: ["#8a6ab0", "#a486c9"] },
  ],
  living: [
    { name: "レコードプレイヤー", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
    { name: "フィルムカメラ", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "本棚", action: "give", gradient: ["#e08a3f", "#eda666"] },
  ],
  office: [
    { name: "腕時計（機械式）", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
    { name: "万年筆コレクション", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
  ],
  storage: [
    { name: "古い雑誌の山", action: "recycle", gradient: ["#3ba39a", "#5cbcb3"] },
    { name: "使わない工具", action: "give", gradient: ["#e08a3f", "#eda666"] },
    { name: "壊れた家電", action: "dispose", gradient: ["#7c7a74", "#9c9a92"] },
  ],
  garage: [
    { name: "自転車（子供用）", action: "gift", gradient: ["#e08aa8", "#eba7c1"] },
    { name: "キャンプ用品", action: "sell", gradient: ["#35618c", "#4a7aa8"] },
  ],
  other: [
    { name: "サクソフォン", action: "keep", gradient: ["#4c9a6a", "#68b586"] },
  ],
};

const ACTION_ICON = {
  keep: "i-heart", sell: "i-tag", give: "i-give", gift: "i-gift",
  donate: "i-donate", recycle: "i-recycle", dispose: "i-trash",
};
const ACTION_LABEL_JA = {
  keep: "残す", sell: "売る", give: "譲る", gift: "贈る",
  donate: "寄付", recycle: "リサイクル", dispose: "処分",
};

const MARKET_LISTINGS = [
  {
    title: "ラルフローレン ブレザー ネイビー", price: "¥9,800", meta: "0.8km · 出品者: 美咲さん",
    icon: "i-tag", tone: "sell", badges: [["本人確認済み", ""], ["評価 4.9", "gold"]],
  },
  {
    title: "木製ダイニングチェア 2脚", price: "無料でお譲りします", meta: "1.2km · 出品者: 健一さん",
    icon: "i-give", tone: "give", badges: [["コミュニティ確認済み", "blue"]],
  },
  {
    title: "サクソフォン（ヴィンテージ）", price: "物語つきで贈ります", meta: "レガシー・アイテム · 田中さん",
    icon: "i-scroll", tone: "donate", badges: [["本人確認済み", ""], ["紹介制", "blue"]],
  },
  {
    title: "冬物コート寄付します", price: "寄付", meta: "1.9km · チャリティ経由",
    icon: "i-donate", tone: "donate", badges: [["慈善団体連携", "gold"]],
  },
];
