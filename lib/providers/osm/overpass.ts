import type { Geo, Place } from "@/lib/types";
import {
  OSM,
  POI_RADIUS_M,
  LIMITS,
  CACHE_TTL,
  TIMEOUT,
  OVERPASS_QL_TIMEOUT,
} from "@/lib/providers/config";
import { postJson } from "@/lib/providers/http";
import { cached } from "@/lib/providers/cache";
import {
  transformAttraction,
  transformFood,
  type OsmElement,
} from "@/lib/providers/osm/transform";

interface OverpassResponse {
  elements: OsmElement[];
}

function around(center: Geo): string {
  return `around:${POI_RADIUS_M},${center.latitude},${center.longitude}`;
}

// Attractions can be polygons (parks, museums), so we include ways — but we
// deliberately skip relations, which force slow geometry recursion in Overpass
// and were causing server-side timeouts in dense city centres.
function attractionQuery(center: Geo): string {
  const a = around(center);
  return `[out:json][timeout:${OVERPASS_QL_TIMEOUT}];(
    node["tourism"~"^(attraction|museum|gallery|artwork|viewpoint|theme_park|zoo|aquarium)$"]["name"](${a});
    way["tourism"~"^(attraction|museum|gallery|theme_park|zoo|aquarium)$"]["name"](${a});
    node["historic"~"^(monument|memorial|castle|fort|ruins|archaeological_site|city_gate)$"]["name"](${a});
    way["historic"~"^(castle|fort|ruins|archaeological_site)$"]["name"](${a});
    way["leisure"~"^(park|garden)$"]["name"](${a});
    node["amenity"="place_of_worship"]["name"]["wikidata"](${a});
  );out center 400;`;
}

// Food venues are overwhelmingly nodes; querying only nodes keeps Overpass fast
// even in dense city centres.
function foodQuery(center: Geo): string {
  const a = around(center);
  return `[out:json][timeout:${OVERPASS_QL_TIMEOUT}];(
    node["amenity"~"^(restaurant|cafe|bar|pub|biergarten|ice_cream|fast_food)$"]["name"](${a});
    node["shop"="bakery"]["name"](${a});
  );out 400;`;
}

async function runOverpass(query: string): Promise<OsmElement[]> {
  let lastErr: unknown;
  // The mirror loop is our redundancy, so each POST itself does not retry.
  for (const endpoint of OSM.overpassMirrors) {
    try {
      const res = await postJson<OverpassResponse>(
        endpoint,
        query,
        TIMEOUT.overpass,
        0,
      );
      return res.elements ?? [];
    } catch (err) {
      lastErr = err; // busy/rate-limited/slow mirror — try the next one
    }
  }
  throw lastErr ?? new Error("All Overpass mirrors failed");
}

/** Drop duplicate POIs (node+way for the same place) by lowercased name. */
function dedupeByName(places: Place[]): Place[] {
  const best = new Map<string, Place>();
  for (const p of places) {
    const key = p.name.trim().toLowerCase();
    const existing = best.get(key);
    if (!existing || score(p) > score(existing)) best.set(key, p);
  }
  return [...best.values()];
}

/**
 * Category importance so marquee sights (museums, landmarks, parks) outrank
 * minor POIs like public art when we cap the list. Food types return 0 (their
 * ranking is purely popularity + uniqueness).
 */
function categoryImportance(p: Place): number {
  const c = p.category.toLowerCase();
  if (/(museum|gallery)/.test(c)) return 28;
  if (/(castle|fort|monument|ruins|archaeolog|cathedral|basilica)/.test(c)) return 22;
  if (/(park|garden)/.test(c)) return 16;
  if (/(viewpoint|attraction|landmark|site)/.test(c)) return 12;
  if (/(worship|church|temple|mosque|synagogue)/.test(c)) return 12;
  if (/(public art|memorial)/.test(c)) return -14;
  return 0;
}

function score(p: Place): number {
  return p.popularity + p.uniqueness + categoryImportance(p);
}

function rankAndCap(places: Place[], limit: number): Place[] {
  return dedupeByName(places)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

/** Fetch attractions for a city center, transformed + ranked + capped. */
export async function fetchAttractions(
  center: Geo,
  destination: string,
  city: string,
): Promise<Place[]> {
  const key = `overpass:attractions:${center.latitude.toFixed(3)},${center.longitude.toFixed(3)}`;
  const places = await cached(key, CACHE_TTL.pois, async () => {
    const els = await runOverpass(attractionQuery(center));
    return els
      .map((el) => transformAttraction(el, destination, city))
      .filter((p): p is Place => p !== null);
  });
  return rankAndCap(places, LIMITS.attractions);
}

/** Fetch food & drink for a city center, transformed + ranked + capped. */
export async function fetchFood(
  center: Geo,
  destination: string,
  city: string,
): Promise<Place[]> {
  const key = `overpass:food:${center.latitude.toFixed(3)},${center.longitude.toFixed(3)}`;
  const places = await cached(key, CACHE_TTL.pois, async () => {
    const els = await runOverpass(foodQuery(center));
    return els
      .map((el) => transformFood(el, destination, city))
      .filter((p): p is Place => p !== null);
  });
  return rankAndCap(places, LIMITS.food);
}
