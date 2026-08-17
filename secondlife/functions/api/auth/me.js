import { json, errorJson } from "../../_lib/json.js";
import { getUserFromRequest } from "../../_lib/auth.js";

export async function onRequestGet(context) {
  const user = await getUserFromRequest(context.request, context.env);
  if (!user) return errorJson("ログインが必要です。", 401);
  return json({ user });
}
