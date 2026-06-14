import type { GeocodeResult } from "@/lib/providers/types";

/**
 * A short list of popular worldwide cities surfaced as instant quick-picks in
 * the destination search. Pre-geocoded (center + country code baked in) so
 * selecting one skips the Nominatim round-trip entirely.
 */
export const POPULAR_WORLDWIDE: GeocodeResult[] = [
  { slug: "tokyo", city: "Tokyo", country: "Japan", countryCode: "jp", center: { latitude: 35.6762, longitude: 139.6503 }, source: "osm", curated: false },
  { slug: "new-york", city: "New York", country: "United States", countryCode: "us", center: { latitude: 40.7128, longitude: -74.006 }, source: "osm", curated: false },
  { slug: "barcelona", city: "Barcelona", country: "Spain", countryCode: "es", center: { latitude: 41.3874, longitude: 2.1686 }, source: "osm", curated: false },
  { slug: "istanbul", city: "Istanbul", country: "Türkiye", countryCode: "tr", center: { latitude: 41.0082, longitude: 28.9784 }, source: "osm", curated: false },
  { slug: "bangkok", city: "Bangkok", country: "Thailand", countryCode: "th", center: { latitude: 13.7563, longitude: 100.5018 }, source: "osm", curated: false },
  { slug: "mexico-city", city: "Mexico City", country: "Mexico", countryCode: "mx", center: { latitude: 19.4326, longitude: -99.1332 }, source: "osm", curated: false },
  { slug: "seoul", city: "Seoul", country: "South Korea", countryCode: "kr", center: { latitude: 37.5665, longitude: 126.978 }, source: "osm", curated: false },
  { slug: "marrakech", city: "Marrakech", country: "Morocco", countryCode: "ma", center: { latitude: 31.6295, longitude: -7.9811 }, source: "osm", curated: false },
  { slug: "kyoto", city: "Kyoto", country: "Japan", countryCode: "jp", center: { latitude: 35.0116, longitude: 135.7681 }, source: "osm", curated: false },
  { slug: "buenos-aires", city: "Buenos Aires", country: "Argentina", countryCode: "ar", center: { latitude: -34.6037, longitude: -58.3816 }, source: "osm", curated: false },
  { slug: "cape-town", city: "Cape Town", country: "South Africa", countryCode: "za", center: { latitude: -33.9249, longitude: 18.4241 }, source: "osm", curated: false },
  { slug: "singapore", city: "Singapore", country: "Singapore", countryCode: "sg", center: { latitude: 1.3521, longitude: 103.8198 }, source: "osm", curated: false },
];
