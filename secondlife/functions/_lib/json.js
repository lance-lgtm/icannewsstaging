export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function errorJson(message, status = 400, extra) {
  return json({ error: message, ...(extra || {}) }, status);
}
