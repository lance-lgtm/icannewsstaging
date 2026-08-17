import { json, errorJson } from "../../_lib/json.js";
import { hashPassword, normalizeEmail, isValidEmail, createSession, newId } from "../../_lib/auth.js";
import { now } from "../../_lib/util.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorJson("Invalid request body.", 400);
  }

  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const displayName = String(body.displayName || "").trim().slice(0, 60);

  if (!isValidEmail(email)) return errorJson("有効なメールアドレスを入力してください。", 400);
  if (password.length < 8) return errorJson("パスワードは8文字以上で入力してください。", 400);
  if (!displayName) return errorJson("表示名を入力してください。", 400);

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return errorJson("このメールアドレスは既に登録されています。", 409);

  const { hash, salt } = await hashPassword(password);
  const id = newId();
  await env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, password_salt, display_name, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).bind(id, email, hash, salt, displayName, now()).run();

  const token = await createSession(env, id);
  return json({ token, user: { id, email, displayName } }, 201);
}
