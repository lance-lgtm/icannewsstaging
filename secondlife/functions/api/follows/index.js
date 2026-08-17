import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest, newId } from "../../_lib/auth.js";
import { now } from "../../_lib/util.js";

const LIST_QUERIES = {
  // People I follow who accepted.
  following: `SELECT f.id as id, u.id as userId, u.display_name as displayName, f.created_at as createdAt
              FROM follows f JOIN users u ON u.id = f.followee_id
              WHERE f.follower_id = ? AND f.status = 'accepted' ORDER BY f.created_at DESC`,
  // People who follow me and I've accepted.
  followers: `SELECT f.id as id, u.id as userId, u.display_name as displayName, f.created_at as createdAt
              FROM follows f JOIN users u ON u.id = f.follower_id
              WHERE f.followee_id = ? AND f.status = 'accepted' ORDER BY f.created_at DESC`,
  // Incoming requests waiting on my accept/reject.
  pending: `SELECT f.id as id, u.id as userId, u.display_name as displayName, f.created_at as createdAt
            FROM follows f JOIN users u ON u.id = f.follower_id
            WHERE f.followee_id = ? AND f.status = 'pending' ORDER BY f.created_at DESC`,
  // Requests I've sent that haven't been accepted yet.
  pending_outgoing: `SELECT f.id as id, u.id as userId, u.display_name as displayName, f.created_at as createdAt
                     FROM follows f JOIN users u ON u.id = f.followee_id
                     WHERE f.follower_id = ? AND f.status = 'pending' ORDER BY f.created_at DESC`,
};

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "following";
  const query = LIST_QUERIES[type];
  if (!query) return errorJson("Unknown type. Use following, followers, pending, or pending_outgoing.", 400);

  const { results } = await env.DB.prepare(query).bind(user.id).all();
  return json({ items: results || [] });
}

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

  const followeeId = String(body.followeeId || "");
  if (!followeeId) return errorJson("followeeId is required.", 400);
  if (followeeId === user.id) return errorJson("自分自身をフォローすることはできません。", 400);

  const target = await env.DB.prepare("SELECT id FROM users WHERE id = ?").bind(followeeId).first();
  if (!target) return errorJson("ユーザーが見つかりません。", 404);

  const existing = await env.DB.prepare(
    "SELECT id, status FROM follows WHERE follower_id = ? AND followee_id = ?"
  ).bind(user.id, followeeId).first();
  if (existing) return json({ id: existing.id, status: existing.status }, 200);

  const id = newId();
  await env.DB.prepare(
    "INSERT INTO follows (id, follower_id, followee_id, status, created_at) VALUES (?, ?, ?, 'pending', ?)"
  ).bind(id, user.id, followeeId, now()).run();

  return json({ id, status: "pending" }, 201);
}
