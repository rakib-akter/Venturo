import type { GeocodeResult } from "@/lib/providers/types";

/**
 * A short list of popular worldwide cities surfaced as instant quick-picks in
 * the destination search. Pre-geocoded (center + country code baked in) so
 * selecting one skips the Nominatim round-trip entirely.
 */
export const POPULAR_WORLDWIDE: GeocodeResult[] = [
  { slug: "tokyo", city: "Tokyo", country: "Japan", countryCode: "jp", center: { latitude: 35.6762, longitude: 139.6503 }, source: "osm", curated: false },
  { slug: "new-york", city: "New York", country: "United States", countryCode: "us", center: { latitude: 40.7128, longitude: -74.006 }, source: "osm", curated: false },
  { slug: "lisbon", city: "Lisbon", country: "Portugal", countryCode: "pt", center: { latitude: 38.7223, longitude: -9.1393 }, source: "osm", curated: false },
  { slug: "barcelona", city: "Barcelona", country: "Spain", countryCode: "es", center: { latitude: 41.3874, longitude: 2.1686 }, source: "osm", curated: false },
  { slug: "istanbul", city: "Istanbul", country: "Türkiye", countryCode: "tr", center: { latitude: 41.0082, longitude: 28.9784 }, source: "osm", curated: false },
  { slug: "bangkok", city: "Bangkok", country: "Thailand", countryCode: "th", center: { latitude: 13.7563, longitude: 100.5018 }, source: "osm", curated: false },
  { slug: "mexico-city", city: "Mexico City", country: "Mexico", countryCode: "mx", center: { latitude: 19.4326, longitude: -99.1332 }, source: "osm", curated: false },
  { slug: "prague", city: "Prague", country: "Czechia", countryCode: "cz", center: { latitude: 50.0755, longitude: 14.4378 }, source: "osm", curated: false },
];
