const KNOWN_PLATFORMS = ["Windows", "macOS", "Linux", "ChromeOS", "iOS/iPadOS", "Android"];

export function detectPlatform({
  userAgentDataPlatform = globalThis.navigator?.userAgentData?.platform ?? "",
  platform = globalThis.navigator?.platform ?? "",
  userAgent = globalThis.navigator?.userAgent ?? "",
} = {}) {
  const source = `${userAgentDataPlatform} ${platform} ${userAgent}`.toLowerCase();

  if (/iphone|ipad|ipod/.test(source) || (source.includes("mac") && source.includes("mobile"))) return "iOS/iPadOS";
  if (source.includes("android")) return "Android";
  if (/cros|chrome os/.test(source)) return "ChromeOS";
  if (source.includes("windows") || source.includes("win32") || source.includes("win64")) return "Windows";
  if (source.includes("mac")) return "macOS";
  if (/linux|x11/.test(source)) return "Linux";
  return "Other";
}

export function trackUsageEvent(eventType, variant = "") {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;

  const payload = JSON.stringify({
    eventType,
    platform: detectPlatform(),
    variant,
  });

  try {
    if (typeof navigator.sendBeacon === "function") {
      const queued = navigator.sendBeacon("/api/usage", new Blob([payload], { type: "application/json" }));
      if (queued) return;
    }

    void fetch("/api/usage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    });
  } catch {
    // Usage counting is best-effort and must never interrupt STL generation.
  }
}

export { KNOWN_PLATFORMS };
