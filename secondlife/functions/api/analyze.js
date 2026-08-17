/* =========================================================================
   TSUGU — /api/analyze (Cloudflare Pages Function)

   Real image recognition, server-side. The browser POSTs a photo here;
   this function calls Claude's vision API with the API key held as a
   Cloudflare secret (never shipped to the client) and returns structured
   JSON that js/app.js renders directly onto the AI Item Card.

   Deploy: connect this repo to a Cloudflare Pages project with
   "secondlife" as the project root, then add an ANTHROPIC_API_KEY secret
   in the Pages project's settings. See secondlife/README.md for the full
   walkthrough. Without that secret configured, this function returns a
   503 and the front-end falls back to its local color/shape heuristic —
   the app still works, just without real recognition.
   ========================================================================= */

const RECOMMENDATION_ACTIONS = ["keep", "sell", "give", "gift", "donate", "recycle", "dispose"];

const PROMPT = `You are the recognition engine for "TSUGU" (つぐ), a Japanese app that helps people decide whether to keep, sell, give away, gift, donate, recycle, or dispose of an item, based on a photo.

Look closely at the attached photo and identify the single main item in it as specifically as possible: exact product/brand if visible (logos, wordmarks, embossing, labels), otherwise your best general identification (e.g. "stainless steel vacuum-insulated tumbler" rather than just "cup").

Respond with ONLY a single JSON object (no markdown fences, no commentary before or after) with exactly this shape:

{
  "titleJa": string,          // e.g. "YETI ランブラー タンブラー"
  "titleEn": string,          // e.g. "YETI Rambler Tumbler"
  "brand": string,            // brand/maker name as printed, or "不明" if not identifiable
  "brandLine": string,        // e.g. "YETI / Insulated Tumbler"
  "colorJa": string,          // color in natural Japanese, e.g. "マットブラック"
  "colorEstimate": boolean,   // true if inferring color from lighting/photo rather than certain
  "sizeLabel": string,        // size/spec summary appropriate to the item type (capacity, clothing size, case diameter, etc.), or "—" if not applicable
  "sizeEstimate": boolean,
  "dimensions": string,       // approximate physical dimensions, e.g. "約26×9×9cm"
  "dimensionsEstimate": boolean,
  "condition": string,        // Japanese condition assessment, e.g. "非常に良い（目立った傷なし）"
  "conditionEn": string,      // same in English
  "estValueText": string,     // estimated Japanese resale value range, e.g. "¥3,000〜¥5,000", or "不明" if you cannot estimate
  "askPriceText": string,     // a reasonable suggested asking price within that range, e.g. "¥4,000"; if recommending GIVE/DONATE, use "無料でお譲りします"
  "descriptionJa": string,    // 2-4 natural Japanese sentences suitable for a secondhand marketplace listing
  "descriptionEn": string,    // same description in English
  "keywords": [string, ...],  // 3-5 short Japanese search keywords
  "full": [[string, string], ...], // [label, value] pairs in Japanese, covering as many of these as you can meaningfully determine: 種類 (type), メーカー (maker), ロゴ (visible logo/markings), モデル (model), シリアル番号 (serial number, or "検出されず"/"該当なし"), 推定年代 (estimated age), 素材 (material), カラー / カラーウェイ (color/colorway), パターン (pattern), スタイル (style), 視認できる傷 (visible damage — describe honestly, or say none visible), 付属品 (visible accessories, or "なし"). Omit a row entirely rather than guessing wildly if you have no basis for it.
  "recommendation": {
    "action": one of "keep" | "sell" | "give" | "gift" | "donate" | "recycle" | "dispose",
    "tagJa": string,   // e.g. "おすすめ · SELL"
    "title": string,   // short Japanese headline, e.g. "売ってみましょう"
    "text": string     // 1-2 Japanese sentences explaining WHY this action, referencing condition/brand/demand
  }
}

Guidance for the recommendation:
- SELL when the brand/condition suggests real resale demand in Japan.
- GIVE when it's still useful but unlikely to sell for much.
- GIFT when it's the kind of personal/meaningful item suited to giving to someone specific.
- DONATE when a charity/community outlet fits better than resale.
- KEEP when it's a well-made or sentimental item worth preserving (craftsmanship, mottainai spirit).
- RECYCLE when it's genuinely at end-of-life but recyclable material.
- DISPOSE only as a last resort for damaged/unusable items with no other path.

Be honest about uncertainty — set colorEstimate/sizeEstimate/dimensionsEstimate to true whenever you are inferring rather than reading a label directly, and use "不明"/"—" rather than inventing precise-sounding numbers you can't support. If you cannot identify the item's brand, say so ("メーカー不明") rather than guessing a brand name.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY is not configured on this deployment." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: "Invalid request body." }, 400);
  }

  const dataUrl = body && body.image;
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return json({ error: "Expected { image: 'data:image/...;base64,...' }." }, 400);
  }

  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!match) {
    return json({ error: "Could not parse image data URL." }, 400);
  }
  const [, mediaType, base64Data] = match;

  // Only the formats the vision API accepts — SVG (used by the in-app
  // sample-photo illustration) is intentionally excluded; that path never
  // reaches this endpoint on the client, but reject defensively here too.
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mediaType)) {
    return json({ error: "Unsupported image type: " + mediaType }, 400);
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: env.ANALYZE_MODEL || "claude-sonnet-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64Data } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch (e) {
    return json({ error: "Could not reach the vision API." }, 502);
  }

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text().catch(() => "");
    return json({ error: "Vision API request failed (" + anthropicRes.status + ").", detail: detail.slice(0, 500) }, 502);
  }

  const data = await anthropicRes.json();
  const textBlock = Array.isArray(data.content) ? data.content.find((b) => b.type === "text") : null;
  if (!textBlock) {
    return json({ error: "No text content in vision API response." }, 502);
  }

  let parsed;
  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text);
  } catch (e) {
    return json({ error: "Could not parse structured output from the model." }, 502);
  }

  if (!parsed || !RECOMMENDATION_ACTIONS.includes(parsed.recommendation && parsed.recommendation.action)) {
    return json({ error: "Model response was missing a valid recommendation action." }, 502);
  }

  return json(parsed, 200);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
