/**
 * Pexels category photos — env-gated, exactly like the Resend email layer.
 *
 * With `PEXELS_API_KEY` set (a free key from pexels.com/api), every restaurant,
 * café, bar, and hotel gets a polished, on-theme photo. Without it, callers
 * fall back to the keyless stock set. Server-only.
 */

const ENDPOINT = "https://api.pexels.com/v1/search";

export function pexelsEnabled(): boolean {
  return Boolean(process.env.PEXELS_API_KEY);
}

interface PexelsResponse {
  photos?: Array<{
    src?: { large?: string; landscape?: string; medium?: string };
  }>;
}

/** Stable 0–n index from a string so a given place always picks the same hit. */
function pick(seed: string, n: number): number {
  if (n <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % n;
}

/** Search Pexels for `query`; returns a landscape photo URL or null. */
export async function resolvePexels(
  query: string,
  seed: string,
): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;

  const url =
    `${ENDPOINT}?query=${encodeURIComponent(query)}` +
    `&per_page=12&orientation=landscape`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: { Authorization: key },
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    const data = (await res.json()) as PexelsResponse;
    const photos = data.photos ?? [];
    if (photos.length === 0) return null;
    const src = photos[pick(seed, photos.length)]?.src;
    return src?.landscape ?? src?.large ?? src?.medium ?? null;
  } catch {
    return null;
  }
}
