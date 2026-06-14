import type { Neighborhood, Place } from "@/lib/types";
import { DESTINATIONS } from "@/lib/data/destinations";
import { PARIS_NEIGHBORHOODS, PARIS_PLACES } from "@/lib/data/paris";
import { ROME_NEIGHBORHOODS, ROME_PLACES } from "@/lib/data/rome";
import { MONTREAL_NEIGHBORHOODS, MONTREAL_PLACES } from "@/lib/data/montreal";
import { AMSTERDAM_NEIGHBORHOODS, AMSTERDAM_PLACES } from "@/lib/data/amsterdam";
import { LONDON_NEIGHBORHOODS, LONDON_PLACES } from "@/lib/data/london";
import { BERLIN_NEIGHBORHOODS, BERLIN_PLACES } from "@/lib/data/berlin";
import { MADRID_NEIGHBORHOODS, MADRID_PLACES } from "@/lib/data/madrid";
import { VIENNA_NEIGHBORHOODS, VIENNA_PLACES } from "@/lib/data/vienna";
import { FLORENCE_NEIGHBORHOODS, FLORENCE_PLACES } from "@/lib/data/florence";
import { PUGLIA_NEIGHBORHOODS, PUGLIA_PLACES } from "@/lib/data/puglia";
import { LISBON_NEIGHBORHOODS, LISBON_PLACES } from "@/lib/data/lisbon";
import { PORTO_NEIGHBORHOODS, PORTO_PLACES } from "@/lib/data/porto";
import { PRAGUE_NEIGHBORHOODS, PRAGUE_PLACES } from "@/lib/data/prague";
import { SEVILLE_NEIGHBORHOODS, SEVILLE_PLACES } from "@/lib/data/seville";
import { VENICE_NEIGHBORHOODS, VENICE_PLACES } from "@/lib/data/venice";
import { DUBLIN_NEIGHBORHOODS, DUBLIN_PLACES } from "@/lib/data/dublin";
import { EDINBURGH_NEIGHBORHOODS, EDINBURGH_PLACES } from "@/lib/data/edinburgh";
import { BUDAPEST_NEIGHBORHOODS, BUDAPEST_PLACES } from "@/lib/data/budapest";
import { COPENHAGEN_NEIGHBORHOODS, COPENHAGEN_PLACES } from "@/lib/data/copenhagen";
import { ATHENS_NEIGHBORHOODS, ATHENS_PLACES } from "@/lib/data/athens";
import { NAPLES_NEIGHBORHOODS, NAPLES_PLACES } from "@/lib/data/naples";
import { KRAKOW_NEIGHBORHOODS, KRAKOW_PLACES } from "@/lib/data/krakow";
import { BRUSSELS_NEIGHBORHOODS, BRUSSELS_PLACES } from "@/lib/data/brussels";
import { AMALFI_NEIGHBORHOODS, AMALFI_PLACES } from "@/lib/data/amalfi";

/**
 * The single in-memory data source for the MVP. Aggregates every city's
 * neighborhoods and places and exposes simple, dependency-free query helpers
 * that both the scoring engine and the API routes consume.
 */

export { DESTINATIONS };

export const NEIGHBORHOODS: Neighborhood[] = [
  ...PARIS_NEIGHBORHOODS,
  ...ROME_NEIGHBORHOODS,
  ...MONTREAL_NEIGHBORHOODS,
  ...AMSTERDAM_NEIGHBORHOODS,
  ...LONDON_NEIGHBORHOODS,
  ...BERLIN_NEIGHBORHOODS,
  ...MADRID_NEIGHBORHOODS,
  ...VIENNA_NEIGHBORHOODS,
  ...FLORENCE_NEIGHBORHOODS,
  ...PUGLIA_NEIGHBORHOODS,
  ...LISBON_NEIGHBORHOODS,
  ...PORTO_NEIGHBORHOODS,
  ...PRAGUE_NEIGHBORHOODS,
  ...SEVILLE_NEIGHBORHOODS,
  ...VENICE_NEIGHBORHOODS,
  ...DUBLIN_NEIGHBORHOODS,
  ...EDINBURGH_NEIGHBORHOODS,
  ...BUDAPEST_NEIGHBORHOODS,
  ...COPENHAGEN_NEIGHBORHOODS,
  ...ATHENS_NEIGHBORHOODS,
  ...NAPLES_NEIGHBORHOODS,
  ...KRAKOW_NEIGHBORHOODS,
  ...BRUSSELS_NEIGHBORHOODS,
  ...AMALFI_NEIGHBORHOODS,
];

export const PLACES: Place[] = [
  ...PARIS_PLACES,
  ...ROME_PLACES,
  ...MONTREAL_PLACES,
  ...AMSTERDAM_PLACES,
  ...LONDON_PLACES,
  ...BERLIN_PLACES,
  ...MADRID_PLACES,
  ...VIENNA_PLACES,
  ...FLORENCE_PLACES,
  ...PUGLIA_PLACES,
  ...LISBON_PLACES,
  ...PORTO_PLACES,
  ...PRAGUE_PLACES,
  ...SEVILLE_PLACES,
  ...VENICE_PLACES,
  ...DUBLIN_PLACES,
  ...EDINBURGH_PLACES,
  ...BUDAPEST_PLACES,
  ...COPENHAGEN_PLACES,
  ...ATHENS_PLACES,
  ...NAPLES_PLACES,
  ...KRAKOW_PLACES,
  ...BRUSSELS_PLACES,
  ...AMALFI_PLACES,
];

const PLACE_BY_ID: Record<string, Place> = Object.fromEntries(
  PLACES.map((p) => [p.id, p]),
);

const NEIGHBORHOOD_BY_ID: Record<string, Neighborhood> = Object.fromEntries(
  NEIGHBORHOODS.map((n) => [n.id, n]),
);

export function getNeighborhoods(destination: string): Neighborhood[] {
  return NEIGHBORHOODS.filter((n) => n.destination === destination);
}

export function getPlaces(destination: string): Place[] {
  return PLACES.filter((p) => p.destination === destination);
}

export function getAttractions(destination: string): Place[] {
  return getPlaces(destination).filter((p) => p.type === "attraction");
}

export function getFoodPlaces(destination: string): Place[] {
  const foodTypes = new Set(["restaurant", "cafe", "bar"]);
  return getPlaces(destination).filter((p) => foodTypes.has(p.type));
}

export function getPlaceById(id: string): Place | undefined {
  return PLACE_BY_ID[id];
}

export function getNeighborhoodById(id: string): Neighborhood | undefined {
  return NEIGHBORHOOD_BY_ID[id];
}

/** True when we have curated content for a destination slug. */
export function isSupportedDestination(slug: string): boolean {
  return DESTINATIONS.some((d) => d.slug === slug);
}
