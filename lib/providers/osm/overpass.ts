import type { Geo, Place } from "@/lib/types";
import {
  POI_RADIUS_M,
  LIMITS,
  CACHE_TTL,
  OVERPASS_QL_TIMEOUT,
} from "@/lib/providers/config";
import { cached } from "@/lib/providers/cache";
import { runOverpassQuery } from "@/lib/providers/osm/run-query";
import {
  transformAttraction,
  transformFood,
} from "@/lib/providers/osm/transform";

function around(center: Geo): string {
  return `around:${POI_RADIUS_M},${center.latitude},${center.longitude}`;
}

// Node-only for speed and reliability: querying ways/relations forces slow
// geometry resolution that times out on public Overpass instances. We lose a
// few polygon-only parks/museums but gain consistent sub-10s responses.
function attractionQuery(center: Geo): string {
  const a = around(center);
  return `[out:json][timeout:${OVERPASS_QL_TIMEOUT}];(
    node["tourism"~"^(attraction|museum|gallery|artwork|viewpoint|theme_park|zoo|aquarium)$"]["name"](${a});
    node["historic"~"^(monument|memorial|castle|fort|ruins|archaeological_site|city_gate)$"]["name"](${a});
    node["leisure"~"^(park|garden)$"]["name"](${a});
    node["amenity"="place_of_worship"]["name"]["wikidata"](${a});
  );out 400;`;
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
    const els = await runOverpassQuery(attractionQuery(center), 0);
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
    const els = await runOverpassQuery(foodQuery(center), 1);
    return els
      .map((el) => transformFood(el, destination, city))
      .filter((p): p is Place => p !== null);
  });
  return rankAndCap(places, LIMITS.food);
}
