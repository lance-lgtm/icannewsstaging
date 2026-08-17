import { json, errorJson } from "../../_lib/json.js";
import { verifyPassword, normalizeEmail, createSession } from "../../_lib/auth.js";

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

  const user = await env.DB.prepare(
    "SELECT id, email, password_hash, password_salt, display_name FROM users WHERE email = ?"
  ).bind(email).first();

  // Same message whether the email doesn't exist or the password is wrong —
  // don't let this endpoint be used to enumerate registered emails.
  if (!user || !(await verifyPassword(password, user.password_hash, user.password_salt))) {
    return errorJson("メールアドレスまたはパスワードが正しくありません。", 401);
  }

  const token = await createSession(env, user.id);
  return json({ token, user: { id: user.id, email: user.email, displayName: user.display_name } });
}
