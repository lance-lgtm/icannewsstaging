import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest } from "../../_lib/auth.js";

// PATCH /api/follows/:id  { action: "accept" } — only the followee can
// accept a pending request.
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorJson("Invalid request body.", 400);
  }
  if (body.action !== "accept") return errorJson("Unsupported action.", 400);

  const row = await env.DB.prepare("SELECT * FROM follows WHERE id = ?").bind(params.id).first();
  if (!row) return errorJson("リクエストが見つかりません。", 404);
  if (row.followee_id !== user.id) return errorJson("このリクエストを承認する権限がありません。", 403);
  if (row.status !== "pending") return json({ id: row.id, status: row.status });

  await env.DB.prepare("UPDATE follows SET status = 'accepted' WHERE id = ?").bind(row.id).run();
  return json({ id: row.id, status: "accepted" });
}

// DELETE /api/follows/:id — meaning depends on which side of the
// relationship the caller is on:
//   - the follower deleting their own row  -> unfollow (any status)
//   - the followee deleting a pending row  -> reject the request
//   - the followee deleting an accepted row -> remove that follower
// All three are the same operation server-side; the language is UI-side.
export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  const row = await env.DB.prepare("SELECT * FROM follows WHERE id = ?").bind(params.id).first();
  if (!row) return json({ ok: true }); // already gone — deletion is idempotent

  if (row.follower_id !== user.id && row.followee_id !== user.id) {
    return errorJson("この操作を行う権限がありません。", 403);
  }

  await env.DB.prepare("DELETE FROM follows WHERE id = ?").bind(row.id).run();
  return json({ ok: true });
}
