/**
 * Minimal in-memory rate limiter.
 *
 * Used to throttle login attempts against /admin so a brute-force script
 * can't hammer the credentials endpoint. It's a fixed-window counter keyed
 * by an identifier (normally the client IP + username).
 *
 * NOTE: this state lives in the Node.js process memory. It works well for
 * a single-instance deployment (e.g. one server, one Docker container). If
 * this app is ever scaled horizontally across multiple instances, replace
 * this with a shared store such as Upstash Redis (`@upstash/ratelimit`) so
 * all instances share the same counters.
 */

interface WindowEntry {
  count: number;
  expiresAt: number;
}

const store = new Map<string, WindowEntry>();

// Periodically sweep expired entries so the Map doesn't grow forever.
const SWEEP_INTERVAL_MS = 60_000;
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt <= now) store.delete(key);
    }
  }, SWEEP_INTERVAL_MS).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Checks and increments the counter for `identifier`.
 *
 * @param identifier Unique key for the caller (e.g. `login:{ip}:{username}`).
 * @param limit Max allowed attempts within the window.
 * @param windowMs Window duration in milliseconds.
 */
export function rateLimit(
  identifier: string,
  limit = 5,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.expiresAt <= now) {
    store.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.expiresAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.expiresAt,
  };
}

/** Extracts a best-effort client IP from standard proxy headers. */
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headers.get("x-real-ip") ?? "unknown";
}
