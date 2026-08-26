const ALLOWED_EVENTS = new Set(["online_open", "stl_export"]);
const ALLOWED_PLATFORMS = new Set(["Windows", "macOS", "Linux", "ChromeOS", "iOS/iPadOS", "Android", "Other"]);
const ALLOWED_VARIANTS = new Set(["", "quarter-scale", "full-scale"]);

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function recordUsage(request, env) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return jsonResponse({ error: "Cross-origin request refused." }, 403);
  if (!env.DB) return jsonResponse({ error: "Usage counter unavailable." }, 503);

  let payload;
  try {
    if (Number(request.headers.get("content-length") || 0) > 2048) throw new Error("Payload too large");
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid usage event." }, 400);
  }

  const eventType = String(payload?.eventType || "");
  const platform = String(payload?.platform || "Other");
  const variant = String(payload?.variant || "");
  if (!ALLOWED_EVENTS.has(eventType) || !ALLOWED_PLATFORMS.has(platform) || !ALLOWED_VARIANTS.has(variant)) {
    return jsonResponse({ error: "Unsupported usage event." }, 400);
  }
  if (eventType === "online_open" && variant !== "") return jsonResponse({ error: "Unsupported usage variant." }, 400);

  const now = new Date().toISOString();
  await env.DB.prepare(`
    INSERT INTO usage_counts (event_type, platform, variant, event_date, count, updated_at)
    VALUES (?, ?, ?, ?, 1, ?)
    ON CONFLICT(event_type, platform, variant, event_date)
    DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
  `).bind(eventType, platform, variant, now.slice(0, 10), now).run();

  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/usage") {
      if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);
      return recordUsage(request, env);
    }

    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
