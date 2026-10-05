/**
 * Fixed-window rate limiter for public route handlers.
 *
 * Backed by an in-process `Map`, so it protects a single server instance.
 *
 * Serverless platforms (Vercel functions) give each instance its own heap, so
 * this is a **best-effort** filter against casual abuse, not a distributed
 * quota. It is deliberately paired with the cheap bot defences in
 * `POST /api/contact` — honeypot field, minimum fill time and Zod validation —
 * which are instance-independent. Swap in a shared store (Upstash Redis, Vercel
 * Firewall, or a `rate_limits` table) if the site ever needs hard quotas.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Drop stale buckets periodically so the Map cannot grow without bound. */
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitOptions {
  /** Maximum requests allowed inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  /** Seconds until the current window resets. */
  retryAfter: number;
}

/**
 * Consume one unit of quota for `key`.
 *
 * Returns `success: false` once the window is exhausted, along with the number
 * of seconds the caller should wait before retrying.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now: number = Date.now(),
): RateLimitResult {
  sweep(now);

  const bucket = buckets.get(key);
  const retryAfter = bucket
    ? Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
    : 0;

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return { success: false, limit, remaining: 0, retryAfter };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: 0,
  };
}

/** Test seam: forget all buckets. */
export function resetRateLimits() {
  buckets.clear();
}