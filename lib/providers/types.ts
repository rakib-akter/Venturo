import type { Destination, Geo, Neighborhood, Place } from "@/lib/types";

/** Where a destination's data came from. */
export type ProviderSource = "curated" | "osm";

/** A geocoded place returned by destination search. */
export interface GeocodeResult {
  /** Stable slug used as `TripPreferences.destination`. */
  slug: string;
  city: string;
  country: string;
  /** Short admin context, e.g. "Catalonia, Spain". */
  context?: string;
  center: Geo;
  /** [south, west, north, east] when known. */
  bbox?: [number, number, number, number];
  source: ProviderSource;
  /** Present when the slug matches a curated guide. */
  curated: boolean;
}

/** Everything the trip generator needs for one destination. */
export interface DestinationData {
  destination: Destination;
  neighborhoods: Neighborhood[];
  attractions: Place[];
  food: Place[];
  source: ProviderSource;
  /** Attribution line to display (required for OSM/ODbL data). */
  attribution?: string;
}

/**
 * Pluggable source of destination data. Curated reads hand-written content;
 * the OSM provider builds it live from OpenStreetMap for any city on earth.
 */
export interface DestinationProvider {
  readonly source: ProviderSource;
  /** Fetch all data needed to generate a trip for the given destination. */
  load(input: DestinationQuery): Promise<DestinationData>;
}

/** Resolved destination handed to a provider's `load`. */
export interface DestinationQuery {
  slug: string;
  displayCity?: string;
  country?: string;
  center?: Geo;
  bbox?: [number, number, number, number];
}
