import { newId, now, toHex, fromHex, randomToken } from "./util.js";

const PBKDF2_ITERATIONS = 100000; // native WebCrypto, fast even on Workers' CPU budget
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function derive(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, keyMaterial, 256
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return { hash: toHex(hash), salt: toHex(salt) };
}

export async function verifyPassword(password, hashHex, saltHex) {
  const hash = await derive(password, fromHex(saltHex));
  // Not constant-time, but this app has no higher-value target behind the
  // password than the account itself — acceptable trade-off for an edge
  // runtime without a dedicated constant-time compare primitive.
  return toHex(hash) === hashHex;
}

export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createSession(env, userId) {
  const token = randomToken();
  const created = now();
  await env.DB.prepare(
    "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)"
  ).bind(token, userId, created, created + SESSION_TTL_MS).run();
  return token;
}

export async function deleteSession(env, token) {
  await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
}

// Resolves the caller's account from a `Authorization: Bearer <token>`
// header, or null if missing/invalid/expired. Route handlers are
// responsible for turning a null into a 401 — this never throws.
export async function getUserFromRequest(request, env) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return null;

  const row = await env.DB.prepare(
    `SELECT u.id as id, u.email as email, u.display_name as displayName, s.expires_at as expiresAt
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  ).bind(token).first();

  if (!row || row.expiresAt < now()) return null;
  return { id: row.id, email: row.email, displayName: row.displayName };
}

export function publicUser(row) {
  return { id: row.id, displayName: row.displayName || row.display_name };
}

export { newId };
