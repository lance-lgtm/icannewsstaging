// Messaging is gated on an accepted follow relationship in *either*
// direction — consistent with the app's trust-first framing (verified
// community, "who can contact me" settings) rather than open DMs between
// strangers.
export async function areConnected(env, userIdA, userIdB) {
  const row = await env.DB.prepare(
    `SELECT 1 FROM follows
     WHERE status = 'accepted'
       AND ((follower_id = ?1 AND followee_id = ?2) OR (follower_id = ?2 AND followee_id = ?1))
     LIMIT 1`
  ).bind(userIdA, userIdB).first();
  return !!row;
}
