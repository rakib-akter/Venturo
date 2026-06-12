import type { Geo, Neighborhood, Place } from "@/lib/types";
import {
  POI_RADIUS_M,
  LIMITS,
  CACHE_TTL,
  OVERPASS_QL_TIMEOUT,
} from "@/lib/providers/config";
import { cached } from "@/lib/providers/cache";
import { runOverpassQuery } from "@/lib/providers/osm/run-query";
import type { OsmElement } from "@/lib/providers/osm/transform";
import { haversineKm } from "@/lib/geo";
import { clamp } from "@/lib/utils";

interface District {
  name: string;
  center: Geo;
}

export interface CityContext {
  districts: District[];
  transit: Geo[];
}

function elementGeo(el: OsmElement): Geo | null {
  if (typeof el.lat === "number" && typeof el.lon === "number")
    return { latitude: el.lat, longitude: el.lon };
  if (el.center) return { latitude: el.center.lat, longitude: el.center.lon };
  return null;
}

/**
 * One Overpass call for named districts + public-transit nodes. Exported so the
 * provider can fetch it in parallel with attractions/food. Degrades to an empty
 * context (single "city centre" zone) when Overpass is unavailable.
 */
export async function fetchContext(center: Geo): Promise<CityContext> {
  const key = `overpass:context:${center.latitude.toFixed(3)},${center.longitude.toFixed(3)}`;
  return cached(key, CACHE_TTL.neighborhoods, async () => {
    const a = `around:${POI_RADIUS_M},${center.latitude},${center.longitude}`;
    const query = `[out:json][timeout:${OVERPASS_QL_TIMEOUT}];(
      node["place"~"^(suburb|neighbourhood|quarter|borough|city_district)$"]["name"](${a});
      node["railway"~"^(station|subway_entrance|tram_stop)$"](${a});
      node["public_transport"="station"](${a});
    );out 400;`;

    // Start on the third mirror so this runs alongside the POI queries without
    // hitting the same endpoint. Throws if all mirrors fail (not cached).
    const elements = await runOverpassQuery(query, 2);

    const districts: District[] = [];
    const transit: Geo[] = [];
    for (const el of elements) {
      const geo = elementGeo(el);
      if (!geo) continue;
      const tags = el.tags ?? {};
      if (tags.place && tags.name) {
        districts.push({ name: tags["name:en"] ?? tags.name, center: geo });
      } else {
        transit.push(geo);
      }
    }
    return { districts, transit };
  });
}

/**
 * Farthest-first clustering: pick up to `k` prominent, well-spread attractions
 * as zone seeds, naming each zone after its anchor landmark.
 */
function clusterZones(attractions: Place[], k: number): District[] {
  if (attractions.length === 0) return [];
  // attractions are already ranked; the first is the strongest anchor.
  const seeds: Place[] = [attractions[0]];
  for (const cand of attractions.slice(1)) {
    if (seeds.length >= k) break;
    const minDist = Math.min(...seeds.map((s) => haversineKm(s.geo, cand.geo)));
    if (minDist >= 0.6) seeds.push(cand); // keep zones meaningfully apart
  }
  return seeds.map((s) => ({ name: `Around ${s.name}`, center: s.geo }));
}

/** Count items within `radiusKm` of a point. */
function densityNear(point: Geo, items: { geo: Geo }[], radiusKm: number): number {
  return items.filter((i) => haversineKm(point, i.geo) <= radiusKm).length;
}

function transitNear(point: Geo, transit: Geo[], radiusKm: number): number {
  return transit.filter((t) => haversineKm(point, t) <= radiusKm).length;
}

/** Translate raw counts into a 0–100 score with diminishing returns. */
function saturate(count: number, soft: number): number {
  return clamp(100 * (1 - Math.exp(-count / soft)), 0, 100);
}

function buildBestFor(n: Omit<Neighborhood, "bestFor" | "pros" | "cons">): string[] {
  const out: string[] = [];
  if (n.foodScore >= 70) out.push("Food lovers");
  if (n.transitScore >= 70) out.push("Easy transit");
  if (n.attractionScore >= 70) out.push("Sightseeing");
  if (n.nightlifeScore >= 70) out.push("Nightlife");
  if (n.affordabilityScore >= 65) out.push("Budget");
  if (n.safetyScore >= 80) out.push("Families");
  return out.slice(0, 3).length ? out.slice(0, 3) : ["Exploring"];
}

function buildProsCons(
  n: Omit<Neighborhood, "pros" | "cons" | "bestFor">,
): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];
  if (n.attractionScore >= 65) pros.push("Close to the sights");
  else cons.push("A ride from the main sights");
  if (n.transitScore >= 65) pros.push("Strong public transit");
  else cons.push("Sparse transit nearby");
  if (n.foodScore >= 65) pros.push("Excellent food scene");
  if (n.affordabilityScore >= 65) pros.push("Good value");
  else cons.push("On the pricier side");
  if (n.nightlifeScore >= 70) cons.push("Can be noisy at night");
  return {
    pros: pros.length ? pros : ["Central and walkable"],
    cons: cons.length ? cons : ["Fewer standout features"],
  };
}

/**
 * Synthesize scored neighborhoods for a worldwide city from OSM districts +
 * POI density + transit. Falls back to a single "City centre" zone when OSM has
 * no named districts in range.
 */
export function synthesizeNeighborhoods(
  center: Geo,
  city: string,
  destination: string,
  attractions: Place[],
  food: Place[],
  ctx: CityContext,
): Neighborhood[] {
  let districts = ctx.districts;
  // No named districts from OSM? Derive zones by clustering around the most
  // prominent attractions so users still get comparable areas.
  if (districts.length < 2) {
    const clustered = clusterZones(attractions, 6);
    districts = clustered.length >= 2 ? clustered : [{ name: `${city} centre`, center }];
  }
  // Keep the districts richest in POIs.
  districts = districts
    .map((d) => ({
      d,
      poi: densityNear(d.center, [...attractions, ...food], 0.9),
    }))
    .sort((a, b) => b.poi - a.poi)
    .slice(0, LIMITS.neighborhoods)
    .map((x) => x.d);

  return districts.map((d, i) => {
    const attractionDensity = densityNear(d.center, attractions, 0.9);
    const foodDensity = densityNear(d.center, food, 0.7);
    const nightlife = food.filter(
      (f) => f.type === "bar" && haversineKm(d.center, f.geo) <= 0.7,
    ).length;
    const transit = transitNear(d.center, ctx.transit, 0.7);
    const kmFromCenter = haversineKm(center, d.center);

    const attractionScore = Math.round(saturate(attractionDensity, 6));
    const foodScore = Math.round(saturate(foodDensity, 8));
    const transitScore = Math.round(saturate(transit, 5));
    const nightlifeScore = Math.round(saturate(nightlife, 5));
    // Central areas: pricier (lower affordability). Outer areas: cheaper, safer.
    const affordabilityScore = Math.round(clamp(45 + kmFromCenter * 12, 30, 88));
    const safetyScore = Math.round(clamp(78 + kmFromCenter * 3 - nightlife * 1.5, 58, 92));
    const priceLevel = clamp(Math.round(4 - affordabilityScore / 33), 1, 4);

    const partial = {
      id: `osm-hood-${destination}-${i}`,
      destination,
      name: d.name,
      description: "",
      transitScore,
      attractionScore,
      foodScore,
      safetyScore,
      affordabilityScore,
      nightlifeScore,
      priceLevel,
      center: d.center,
    };
    const bestFor = buildBestFor(partial);
    const { pros, cons } = buildProsCons(partial);
    return {
      ...partial,
      description: `${d.name} — ${describeVibe(partial)} in ${city}.`,
      bestFor,
      pros,
      cons,
    };
  });
}

function describeVibe(
  n: Pick<Neighborhood, "foodScore" | "nightlifeScore" | "attractionScore" | "affordabilityScore">,
): string {
  if (n.nightlifeScore >= 70) return "a lively, going-out area";
  if (n.foodScore >= 70) return "a food-forward neighbourhood";
  if (n.attractionScore >= 70) return "a sightseeing base close to the action";
  if (n.affordabilityScore >= 70) return "a relaxed, good-value area";
  return "a walkable local area";
}

/** Assign every place to its nearest neighbourhood. */
export function assignNeighborhoods(
  places: Place[],
  neighborhoods: Neighborhood[],
): void {
  if (neighborhoods.length === 0) return;
  for (const p of places) {
    let best = neighborhoods[0];
    let bestKm = Infinity;
    for (const n of neighborhoods) {
      const km = haversineKm(p.geo, n.center);
      if (km < bestKm) {
        bestKm = km;
        best = n;
      }
    }
    p.neighborhoodId = best.id;
  }
}
