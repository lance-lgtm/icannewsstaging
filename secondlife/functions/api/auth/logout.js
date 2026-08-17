import { json } from "../../_lib/json.js";
import { deleteSession } from "../../_lib/auth.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (token) await deleteSession(env, token);
  return json({ ok: true });
}
