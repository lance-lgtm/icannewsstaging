import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest, newId } from "../../_lib/auth.js";
import { areConnected } from "../../_lib/social.js";
import { now } from "../../_lib/util.js";

const CANNOT_MESSAGE = "メッセージを送るには、お互いにフォローを承認している必要があります。";

// GET /api/messages?with=<userId> — the full thread with one person.
// Opening the thread also marks their messages to me as read.
export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  const url = new URL(request.url);
  const withId = url.searchParams.get("with");
  if (!withId) return errorJson("with (user id) is required.", 400);

  const other = await env.DB.prepare("SELECT id, display_name as displayName FROM users WHERE id = ?")
    .bind(withId).first();
  if (!other) return errorJson("ユーザーが見つかりません。", 404);

  if (!(await areConnected(env, user.id, withId))) {
    return errorJson(CANNOT_MESSAGE, 403);
  }

  const { results } = await env.DB.prepare(
    `SELECT id, sender_id as senderId, recipient_id as recipientId, body, created_at as createdAt
     FROM messages WHERE (sender_id = ?1 AND recipient_id = ?2) OR (sender_id = ?2 AND recipient_id = ?1)
     ORDER BY created_at ASC LIMIT 200`
  ).bind(user.id, withId).all();

  await env.DB.prepare(
    "UPDATE messages SET read_at = ? WHERE sender_id = ? AND recipient_id = ? AND read_at IS NULL"
  ).bind(now(), withId, user.id).run();

  return json({ other: { id: other.id, displayName: other.displayName }, messages: results || [] });
}

// POST /api/messages { recipientId, body } — send a message.
export async function onRequestPost(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorJson("Invalid request body.", 400);
  }

  const recipientId = String(body.recipientId || "");
  const text = String(body.body || "").trim();
  if (!recipientId) return errorJson("recipientId is required.", 400);
  if (recipientId === user.id) return errorJson("自分自身にはメッセージを送れません。", 400);
  if (!text) return errorJson("メッセージを入力してください。", 400);
  if (text.length > 2000) return errorJson("メッセージが長すぎます（2000文字まで）。", 400);

  const recipient = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(recipientId).first();
  if (!recipient) return errorJson("ユーザーが見つかりません。", 404);

  if (!(await areConnected(env, user.id, recipientId))) {
    return errorJson(CANNOT_MESSAGE, 403);
  }

  const id = newId();
  const createdAt = now();
  await env.DB.prepare(
    "INSERT INTO messages (id, sender_id, recipient_id, body, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, user.id, recipientId, text, createdAt).run();

  return json({ id, senderId: user.id, recipientId, body: text, createdAt }, 201);
}
