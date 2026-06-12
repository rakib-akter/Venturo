import type { GeocodeResult } from "@/lib/providers/types";
import { OSM, CACHE_TTL, TIMEOUT } from "@/lib/providers/config";
import { getJson } from "@/lib/providers/http";
import { cached } from "@/lib/providers/cache";
import { getDestination } from "@/lib/data/destinations";
import { slugify } from "@/lib/utils";

/** Raw Nominatim jsonv2 result (subset we use). */
interface NominatimResult {
  place_id: number;
  osm_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  type: string;
  /** jsonv2 calls this `category` (older `format=json` calls it `class`). */
  category?: string;
  class?: string;
  addresstype?: string;
  boundingbox?: [string, string, string, string]; // [south, north, west, east]
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    region?: string;
    country?: string;
    country_code?: string;
  };
}

function cityName(r: NominatimResult): string {
  const a = r.address ?? {};
  return (
    a.city ?? a.town ?? a.village ?? a.municipality ?? r.name ?? r.display_name
  );
}

/** Convert Nominatim's [s, n, w, e] strings to our [south, west, north, east]. */
function toBbox(
  bb?: [string, string, string, string],
): [number, number, number, number] | undefined {
  if (!bb) return undefined;
  const [s, n, w, e] = bb.map(Number);
  return [s, w, n, e];
}

/**
 * A curated guide "wins" only when both the slug and the country match, so
 * "Paris, Texas" doesn't get routed to the curated Paris, France guide.
 */
function resolveCurated(slug: string, country: string): boolean {
  const dest = getDestination(slug);
  if (!dest) return false;
  return dest.country.toLowerCase() === country.toLowerCase();
}

function normalize(r: NominatimResult): GeocodeResult | null {
  const city = cityName(r);
  if (!city) return null;
  const country = r.address?.country ?? "";
  const slug = slugify(city);
  if (!slug) return null;

  const curated = resolveCurated(slug, country);
  const contextParts = [r.address?.state ?? r.address?.region, country].filter(
    Boolean,
  ) as string[];

  return {
    slug,
    city,
    country,
    context: contextParts.join(", ") || undefined,
    center: { latitude: Number(r.lat), longitude: Number(r.lon) },
    bbox: toBbox(r.boundingbox),
    source: curated ? "curated" : "osm",
    curated,
  };
}

/** De-duplicate by slug+country, keeping the first (highest-ranked) hit. */
function dedupe(results: GeocodeResult[]): GeocodeResult[] {
  const seen = new Set<string>();
  const out: GeocodeResult[] = [];
  for (const r of results) {
    const key = `${r.slug}|${r.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

/**
 * Search for cities/towns matching a free-text query (for autocomplete).
 * Restricted to populated places so users get destinations, not streets.
 */
export async function searchCities(
  query: string,
  limit = 6,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const key = `nominatim:search:${q.toLowerCase()}:${limit}`;
  return cached(key, CACHE_TTL.geocode, async () => {
    const url =
      `${OSM.nominatimBase}/search?format=jsonv2&addressdetails=1` +
      `&accept-language=en&featureType=settlement` +
      `&limit=${limit * 2}&q=${encodeURIComponent(q)}`;
    const raw = await getJson<NominatimResult[]>(url, {
      timeoutMs: TIMEOUT.nominatim,
      rateLimited: true,
    });
    const placeLike = new Set(["place", "boundary"]);
    const mapped = raw
      .filter((r) => placeLike.has(r.category ?? r.class ?? ""))
      .map(normalize)
      .filter((r): r is GeocodeResult => r !== null);
    return dedupe(mapped).slice(0, limit);
  });
}

/** Geocode a single best-match city (used when a stored trip lacks a center). */
export async function geocodeCity(
  query: string,
): Promise<GeocodeResult | null> {
  const results = await searchCities(query, 1);
  return results[0] ?? null;
}
