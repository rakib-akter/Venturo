import type {
  DestinationData,
  DestinationProvider,
  DestinationQuery,
} from "@/lib/providers/types";
import {
  getAttractions,
  getFoodPlaces,
  getNeighborhoods,
  isSupportedDestination,
} from "@/lib/mock-data";
import { getDestination } from "@/lib/data/destinations";

/**
 * Serves the hand-curated destinations (Paris, Rome, Montréal, …). Fully
 * offline and instant — the premium tier of the hybrid model.
 */
export const curatedProvider: DestinationProvider = {
  source: "curated",
  async load({ slug }: DestinationQuery): Promise<DestinationData> {
    const destination = getDestination(slug);
    if (!destination || !isSupportedDestination(slug)) {
      throw new Error(`No curated guide for "${slug}".`);
    }
    return {
      destination,
      neighborhoods: getNeighborhoods(slug),
      attractions: getAttractions(slug),
      food: getFoodPlaces(slug),
      source: "curated",
    };
  },
};

export function isCurated(slug: string): boolean {
  return isSupportedDestination(slug);
}
