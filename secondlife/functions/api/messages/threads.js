import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest } from "../../_lib/auth.js";

// GET /api/messages/threads — the inbox: one row per conversation partner,
// most recent message first, with an unread count per thread.
export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);
  if (!user) return errorJson("ログインが必要です。", 401);

  const { results } = await env.DB.prepare(
    `WITH pairs AS (
       SELECT
         CASE WHEN sender_id = ?1 THEN recipient_id ELSE sender_id END as otherId,
         sender_id as senderId, body, created_at,
         ROW_NUMBER() OVER (
           PARTITION BY CASE WHEN sender_id = ?1 THEN recipient_id ELSE sender_id END
           ORDER BY created_at DESC
         ) as rn
       FROM messages
       WHERE sender_id = ?1 OR recipient_id = ?1
     )
     SELECT p.otherId as userId, u.display_name as displayName, p.body as lastMessage,
       p.created_at as lastAt, p.senderId as lastSenderId,
       (SELECT COUNT(*) FROM messages m2 WHERE m2.sender_id = p.otherId AND m2.recipient_id = ?1 AND m2.read_at IS NULL) as unreadCount
     FROM pairs p JOIN users u ON u.id = p.otherId
     WHERE p.rn = 1
     ORDER BY p.created_at DESC`
  ).bind(user.id).all();

  return json({ threads: results || [] });
}
