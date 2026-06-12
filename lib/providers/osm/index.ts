import type { Destination } from "@/lib/types";
import type {
  DestinationData,
  DestinationProvider,
  DestinationQuery,
} from "@/lib/providers/types";
import { OSM_ATTRIBUTION } from "@/lib/providers/config";
import { flagEmoji } from "@/lib/utils";
import { fetchAttractions, fetchFood } from "@/lib/providers/osm/overpass";
import {
  fetchContext,
  synthesizeNeighborhoods,
  assignNeighborhoods,
  type CityContext,
} from "@/lib/providers/osm/neighborhoods";

const GRADIENTS = [
  "from-sky-500/30 via-indigo-500/20 to-rose-400/20",
  "from-amber-500/30 via-orange-500/20 to-rose-500/20",
  "from-emerald-500/30 via-teal-500/20 to-sky-500/20",
  "from-fuchsia-500/25 via-purple-500/20 to-sky-500/20",
  "from-rose-500/25 via-amber-500/20 to-emerald-500/20",
];

function hashIndex(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % mod;
}

function synthesizeDestination(
  q: DestinationQuery,
  attractionCount: number,
  foodCount: number,
): Destination {
  const city = q.displayCity ?? q.slug;
  return {
    slug: q.slug,
    city,
    country: q.country ?? "",
    tagline: `${attractionCount} sights and ${foodCount} food spots, mapped for you`,
    description: `A live guide to ${city}, built from open map data. Explore top sights, neighbourhoods, and where locals eat.`,
    center: q.center!,
    idealDays: [2, 4],
    heroColor: GRADIENTS[hashIndex(city, GRADIENTS.length)],
    emoji: flagEmoji(q.countryCode),
  };
}

/**
 * Worldwide provider: builds a full destination from OpenStreetMap for any
 * geocoded city. Requires `center` (supplied by the geocoder).
 */
export const osmProvider: DestinationProvider = {
  source: "osm",
  async load(q: DestinationQuery): Promise<DestinationData> {
    if (!q.center) {
      throw new Error("OSM provider requires a geocoded center.");
    }
    const city = q.displayCity ?? q.slug;

    // All three Overpass queries are independent — run them together so total
    // latency is one round-trip, not three. Context degrades gracefully.
    const [attractions, food, ctx] = await Promise.all([
      fetchAttractions(q.center, q.slug, city),
      fetchFood(q.center, q.slug, city),
      fetchContext(q.center).catch<CityContext>(() => ({
        districts: [],
        transit: [],
      })),
    ]);
    const neighborhoods = synthesizeNeighborhoods(
      q.center,
      city,
      q.slug,
      attractions,
      food,
      ctx,
    );
    assignNeighborhoods([...attractions, ...food], neighborhoods);

    return {
      destination: synthesizeDestination(q, attractions.length, food.length),
      neighborhoods,
      attractions,
      food,
      source: "osm",
      attribution: OSM_ATTRIBUTION,
    };
  },
};
