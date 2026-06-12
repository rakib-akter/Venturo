import type { Geo, Place } from "@/lib/types";
import { clamp } from "@/lib/utils";
import {
  classifyAttraction,
  classifyFood,
  type OsmTags,
} from "@/lib/providers/osm/categories";

/** A node/way/relation from an Overpass `out center` response. */
export interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
}

/** Deterministic 0–1 value from a string (so synthesized fields are stable). */
function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-rose-400 to-amber-500",
  "from-emerald-300 to-teal-500",
  "from-fuchsia-300 to-rose-500",
  "from-cyan-300 to-blue-500",
  "from-lime-300 to-emerald-500",
  "from-orange-300 to-red-500",
  "from-violet-300 to-purple-500",
  "from-yellow-300 to-amber-500",
];

function gradientFor(seed: string): string {
  return GRADIENTS[Math.floor(hash01(seed) * GRADIENTS.length) % GRADIENTS.length];
}

function elementGeo(el: OsmElement): Geo | null {
  if (typeof el.lat === "number" && typeof el.lon === "number") {
    return { latitude: el.lat, longitude: el.lon };
  }
  if (el.center) return { latitude: el.center.lat, longitude: el.center.lon };
  return null;
}

function pickName(tags: OsmTags): string | null {
  return tags["name:en"] ?? tags.name ?? null;
}

function buildAddress(tags: OsmTags): string {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:suburb"] ?? tags["addr:district"],
    tags["addr:city"],
  ].filter(Boolean);
  return parts.join(", ");
}

function isChain(tags: OsmTags): boolean {
  return Boolean(tags.brand || tags["brand:wikidata"]);
}

function isNotable(tags: OsmTags): boolean {
  return Boolean(tags.wikidata || tags.wikipedia || tags.heritage);
}

function popularityFor(tags: OsmTags, seed: string): number {
  let p = 48 + hash01(seed) * 14;
  if (tags.wikidata || tags.wikipedia) p += 26;
  if (tags.heritage) p += 10;
  if (tags.tourism === "museum" || tags.tourism === "attraction") p += 8;
  return Math.round(clamp(p, 38, 97));
}

function uniquenessFor(tags: OsmTags, seed: string): number {
  let u = 66 + hash01(seed + "u") * 12;
  if (isChain(tags)) u -= 38;
  if (tags.amenity === "fast_food" && isChain(tags)) u -= 10;
  if (tags.historic || tags.tourism === "artwork" || tags.heritage) u += 12;
  return Math.round(clamp(u, 20, 95));
}

function trapRiskFor(tags: OsmTags): number {
  let r = 26;
  if (isChain(tags)) r += 30;
  if (tags.amenity === "fast_food") r += 12;
  if (tags.tourism === "attraction" && !isNotable(tags)) r += 10;
  if (isNotable(tags)) r -= 12;
  return Math.round(clamp(r, 5, 85));
}

function ratingFor(tags: OsmTags, seed: string): number {
  let r = 3.9 + hash01(seed + "r") * 0.6;
  if (tags.wikidata) r += 0.25;
  if (tags.heritage) r += 0.15;
  if (isChain(tags)) r -= 0.15;
  return Math.round(clamp(r, 3.6, 4.9) * 10) / 10;
}

function describe(name: string, category: string, city: string, tags: OsmTags): string {
  const bits: string[] = [`${category} in ${city}.`];
  if (tags.cuisine) bits.push(`Serving ${tags.cuisine.replace(/[;_]/g, " ")}.`);
  if (tags.heritage || tags.historic) bits.push("A spot with real heritage.");
  return bits.join(" ");
}

function transform(
  el: OsmElement,
  destination: string,
  city: string,
  kind: "attraction" | "food",
): Place | null {
  const tags = el.tags ?? {};
  const name = pickName(tags);
  const geo = elementGeo(el);
  if (!name || !geo) return null;

  const cls =
    kind === "attraction" ? classifyAttraction(tags) : classifyFood(tags);
  if (!cls) return null;

  const id = `osm-${el.type[0]}${el.id}`;
  return {
    id,
    destination,
    name,
    type: cls.type,
    category: cls.category,
    description: describe(name, cls.category, city, tags),
    address: buildAddress(tags),
    neighborhoodId: "", // assigned during neighborhood clustering
    geo,
    priceLevel: cls.priceLevel,
    rating: ratingFor(tags, id),
    estimatedDuration: cls.duration,
    bestTimeToVisit: cls.bestTime,
    interests: cls.interests,
    foodTags: cls.foodTags,
    touristTrapRisk: trapRiskFor(tags),
    uniqueness: uniquenessFor(tags, id),
    popularity: popularityFor(tags, id),
    openHours: tags.opening_hours,
    imageColor: gradientFor(id),
  };
}

export function transformAttraction(
  el: OsmElement,
  destination: string,
  city: string,
): Place | null {
  return transform(el, destination, city, "attraction");
}

export function transformFood(
  el: OsmElement,
  destination: string,
  city: string,
): Place | null {
  return transform(el, destination, city, "food");
}
