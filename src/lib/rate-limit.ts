// Lightweight in-memory rate limiting + response caching.
//
// NOTE: Vercel serverless instances are ephemeral and not shared, so these
// maps are per-instance, not global. That makes this a best-effort first line
// of defence against bursts and repeated identical queries — good enough for
// launch, but for hard, distributed guarantees move this to Upstash Redis
// (or similar) keyed the same way.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const RATE_LIMIT = 10; // requests
const WINDOW_MS = 60_000; // per minute

export interface RateResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(key: string): RateResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= RATE_LIMIT) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// --- Response cache ---------------------------------------------------------

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const CACHE_MAX_ENTRIES = 500;

export function cacheKey(parts: Record<string, unknown>): string {
  // Stable stringify: sort keys so identical inputs collide.
  return JSON.stringify(parts, Object.keys(parts).sort());
}

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T): void {
  // Evict the oldest entry when full (insertion-ordered Map).
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Best-effort client identifier from proxy headers.
export function clientKey(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
