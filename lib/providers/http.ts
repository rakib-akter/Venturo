import { OSM } from "@/lib/providers/config";

/**
 * Polite HTTP helpers for the OSM services: always send our User-Agent, apply a
 * timeout, and retry transient failures with backoff. A global minimum spacing
 * between Nominatim calls keeps us within its ≤1 req/s fair-use policy.
 */

export class ProviderHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ProviderHttpError";
  }
}

async function withTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function requestWithRetry(
  input: string,
  init: RequestInit,
  timeoutMs: number,
  retries = 2,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await withTimeout(input, init, timeoutMs);
      // Retry on rate-limit / transient server errors.
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await sleep(400 * (attempt + 1));
          continue;
        }
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(400 * (attempt + 1));
    }
  }
  throw new ProviderHttpError(
    `Request failed after ${retries + 1} attempts: ${String(lastErr)}`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Nominatim politeness: serialize calls with ≥1.1s spacing -------------
let nominatimChain: Promise<unknown> = Promise.resolve();

export async function getJson<T>(
  url: string,
  opts: { timeoutMs: number; rateLimited?: boolean } = { timeoutMs: 12_000 },
): Promise<T> {
  const run = async () => {
    const res = await requestWithRetry(
      url,
      { headers: { "User-Agent": OSM.userAgent, Accept: "application/json" } },
      opts.timeoutMs,
    );
    if (!res.ok) {
      throw new ProviderHttpError(`GET ${url} → ${res.status}`, res.status);
    }
    return (await res.json()) as T;
  };

  if (opts.rateLimited) {
    const next = nominatimChain.then(async () => {
      const out = await run();
      await sleep(1100);
      return out;
    });
    // Keep the chain alive even if this call rejects.
    nominatimChain = next.catch(() => undefined);
    return next as Promise<T>;
  }
  return run();
}

export async function postJson<T>(
  url: string,
  body: string,
  timeoutMs: number,
  retries = 0,
): Promise<T> {
  const res = await requestWithRetry(
    url,
    {
      method: "POST",
      headers: {
        "User-Agent": OSM.userAgent,
        "Content-Type": "text/plain",
        Accept: "application/json",
      },
      body,
    },
    timeoutMs,
    retries,
  );
  if (!res.ok) {
    throw new ProviderHttpError(`POST ${url} → ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}
