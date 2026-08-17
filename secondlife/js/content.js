/* =========================================================================
   TSUGU — mock content
   Stands in for a real computer-vision / valuation backend. Every field an
   AI would normally infer is written here so the front-end can be wired up
   and demoed end-to-end. Swap ANALYSIS_RESULT generation for a real API
   call (see README) to go from prototype to production.
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

// The canonical example item from the product spec (Ralph Lauren blazer).
const ANALYSIS_RESULT = {
  name: "Ralph Lauren ウィメンズ ブレザー",
  brandLine: "Ralph Lauren / Women's Blazer",
  quick: [
    { label: "ブランド", value: "Ralph Lauren", icon: "i-tag" },
    { label: "カラー", value: "ディープネイビー", icon: "i-sparkle", estimate: false },
    { label: "サイズ", value: "Japan 11 / US 8–10", icon: "i-type", estimate: true },
    { label: "状態", value: "非常に良い", icon: "i-check-circle" },
    { label: "推定価値", value: "¥8,000〜¥12,000", icon: "i-sparkle", estimate: true, span2: true },
    { label: "寸法", value: "約 64 × 46 cm", icon: "i-box", estimate: true, span2: true },
  ],
  full: [
    ["種類", "ブレザー・ジャケット"],
    ["メーカー", "Ralph Lauren（ラルフローレン）"],
    ["ロゴ", "左胸にポニーロゴの刺繍あり"],
    ["モデル", "テーラードブレザー（推定 2015〜2019年頃）"],
    ["シリアル番号", "検出されず"],
    ["推定年代", "約5〜10年（推定）"],
    ["素材", "ウール混紡（推定）"],
    ["カラー / カラーウェイ", "ディープネイビー / 無地"],
    ["パターン", "無地"],
    ["スタイル", "テーラード・オフィスカジュアル"],
    ["ラベルサイズ", "US 8"],
    ["推定日本サイズ", "Japan 11 (M)"],
    ["フィット", "レギュラーフィット"],
    ["視認できる傷", "目立った傷や汚れは見られません"],
    ["付属品", "予備ボタン1個（内ポケット）"],
    ["推定寸法", "着丈 約64cm / 身幅 約46cm"],
  ],
  recommendation: {
    action: "sell",
    tagJa: "おすすめ · SELL",
    title: "売ってみましょう",
    text: "このジャケットは状態が良く、日本国内でもリセール需要のあるブランドです。同様のアイテムはおよそ¥8,000〜¥12,000で取引されています。",
  },
};

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
