import type {
  DestinationData,
  DestinationProvider,
  DestinationQuery,
  ProviderSource,
} from "@/lib/providers/types";
import { curatedProvider, isCurated } from "@/lib/providers/curated";
import { osmProvider } from "@/lib/providers/osm";

export type { DestinationData, DestinationQuery, ProviderSource };
export { isCurated };

/**
 * Choose a provider: curated wins for known cities (unless the caller forces
 * OSM via `source`), otherwise the worldwide OpenStreetMap provider.
 */
export function resolveProvider(
  slug: string,
  source?: ProviderSource,
): DestinationProvider {
  if (source === "osm") return osmProvider;
  if (isCurated(slug)) return curatedProvider;
  return osmProvider;
}

/** Load all destination data via the appropriate provider. */
export function loadDestination(
  query: DestinationQuery,
  source?: ProviderSource,
): Promise<DestinationData> {
  return resolveProvider(query.slug, source).load(query);
}
