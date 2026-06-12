/**
 * Configuration for the worldwide (OpenStreetMap-based) data providers.
 *
 * These endpoints are free and require politeness: a descriptive User-Agent,
 * modest request rates, and caching. Keep queries tight (bounded bbox, capped
 * result counts) so trips generate quickly and we stay within fair-use limits.
 */

export const OSM = {
  /** Geocoding + place search (≤1 req/s fair use; UA required). */
  nominatimBase:
    process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org",
  /** POI queries. A few mirrors exist; the main instance is fine for low volume. */
  overpassBase:
    process.env.OVERPASS_BASE_URL ?? "https://overpass-api.de/api/interpreter",
  /** Identifies our app per the Nominatim usage policy. */
  userAgent:
    process.env.OSM_USER_AGENT ??
    "Venturo/1.0 (travel planner; +https://github.com/rakib-akter/Venturo)",
} as const;

/** Search radius (meters) around a city center when collecting POIs. */
export const POI_RADIUS_M = 6000;

/** Hard caps so an Overpass response can't balloon a trip payload. */
export const LIMITS = {
  attractions: 40,
  food: 60,
  neighborhoods: 12,
} as const;

/** Cache TTLs (ms). Worldwide data changes slowly; cache generously. */
export const CACHE_TTL = {
  geocode: 1000 * 60 * 60 * 24 * 30, // 30 days
  pois: 1000 * 60 * 60 * 24 * 7, // 7 days
  neighborhoods: 1000 * 60 * 60 * 24 * 7,
} as const;

/** Network timeouts (ms). Overpass can be slow under load. */
export const TIMEOUT = {
  nominatim: 12_000,
  overpass: 30_000,
} as const;

/** Attribution required by OpenStreetMap's ODbL license. */
export const OSM_ATTRIBUTION = "© OpenStreetMap contributors (ODbL)";
