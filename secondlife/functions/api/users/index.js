import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest } from "../../_lib/auth.js";

// GET /api/users?query=... — search people to follow. Requires auth so the
// user directory isn't scrapeable anonymously. Each result carries the
// caller's current relationship to that user, so the UI can show the right
// button (follow / requested / accept / following).
export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  const url = new URL(request.url);
  const q = (url.searchParams.get("query") || "").trim();
  if (!q) return json({ users: [] });

  const { results } = await env.DB.prepare(
    "SELECT id, display_name as displayName FROM users WHERE id != ?1 AND display_name LIKE ?2 ORDER BY display_name LIMIT 20"
  ).bind(user.id, `%${q}%`).all();

  if (!results || results.length === 0) return json({ users: [] });

  const ids = results.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const { results: relRows } = await env.DB.prepare(
    `SELECT follower_id as followerId, followee_id as followeeId, status FROM follows
     WHERE (follower_id = ? AND followee_id IN (${placeholders}))
        OR (followee_id = ? AND follower_id IN (${placeholders}))`
  ).bind(user.id, ...ids, user.id, ...ids).all();

  const relMap = new Map();
  for (const row of relRows) {
    if (row.status !== "accepted") continue;
    relMap.set(row.followerId === user.id ? row.followeeId : row.followerId, "accepted");
  }
  for (const row of relRows) {
    const otherId = row.followerId === user.id ? row.followeeId : row.followerId;
    if (relMap.get(otherId) === "accepted" || row.status !== "pending") continue;
    relMap.set(otherId, row.followerId === user.id ? "pending_outgoing" : "pending_incoming");
  }

  const users = results.map((r) => ({
    id: r.id,
    displayName: r.displayName,
    relationship: relMap.get(r.id) || "none",
  }));

  return json({ users });
}
