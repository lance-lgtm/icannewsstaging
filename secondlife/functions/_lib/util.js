// Small shared utilities. Files under functions/_lib/ are not routed by
// Cloudflare Pages (the leading underscore excludes them) — safe to import
// from route handlers without becoming an accidental public endpoint.

export function newId() {
  return crypto.randomUUID();
}

export function now() {
  return Date.now();
}

export function toHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

export function randomToken() {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}
