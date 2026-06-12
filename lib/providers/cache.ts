/**
 * A tiny in-memory TTL cache shared across requests in a server process.
 *
 * Worldwide lookups (geocode, POIs) are expensive and rate-limited, so we cache
 * aggressively. This is process-local — good enough for a single server and
 * dev; a production deployment can layer Supabase/Redis behind the same API.
 */

interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

/**
 * Get-or-load helper: returns the cached value, otherwise runs `loader`, caches
 * the result, and returns it. Concurrent callers for the same key share one
 * in-flight promise (request coalescing).
 */
const inflight = new Map<string, Promise<unknown>>();

export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;

  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = (async () => {
    try {
      const value = await loader();
      cacheSet(key, value, ttlMs);
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

/** Test/maintenance helper. */
export function cacheClear(): void {
  store.clear();
  inflight.clear();
}
