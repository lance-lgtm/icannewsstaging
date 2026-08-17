import { now } from "./util.js";

// Fixed-window request counter backed by D1. Not perfectly atomic under
// heavy concurrency (D1 has no native increment-and-check primitive), but
// good enough to blunt abuse without standing up a Durable Object just for
// this one endpoint. `key` should already identify the caller (IP, user id).
export async function checkRateLimit(env, key, { limit, windowMs }) {
  const nowMs = now();
  const windowStart = Math.floor(nowMs / windowMs) * windowMs;
  const bucketKey = key + ":" + windowStart;

  const row = await env.DB.prepare("SELECT count FROM rate_limits WHERE bucket_key = ?")
    .bind(bucketKey).first();

  if (row && row.count >= limit) {
    return { allowed: false };
  }

  await env.DB.prepare(
    `INSERT INTO rate_limits (bucket_key, window_start, count) VALUES (?, ?, 1)
     ON CONFLICT(bucket_key) DO UPDATE SET count = count + 1`
  ).bind(bucketKey, windowStart).run();

  // Opportunistic, best-effort cleanup of old windows — no cron needed.
  if (Math.random() < 0.05) {
    env.DB.prepare("DELETE FROM rate_limits WHERE window_start < ?")
      .bind(windowStart - windowMs * 4).run().catch(() => {});
  }

  return { allowed: true };
}
