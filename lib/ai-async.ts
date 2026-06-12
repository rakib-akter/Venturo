import type { GeneratedTrip, TripPreferences } from "@/lib/types";
import {
  assembleTrip,
  type GenerateTripError,
} from "@/lib/ai";
import { loadDestination } from "@/lib/providers";

/**
 * Worldwide trip generation (server-only). Resolves the right provider —
 * curated or live OpenStreetMap — loads the data, and assembles the trip.
 *
 * Kept separate from `lib/ai.ts` so the provider/Overpass code never lands in
 * the client bundle; the browser only uses the synchronous curated generator.
 */
export async function generateTripAsync(
  prefs: TripPreferences,
  opts: { userId?: string } = {},
): Promise<GeneratedTrip | GenerateTripError> {
  try {
    const data = await loadDestination(
      {
        slug: prefs.destination,
        displayCity: prefs.displayCity,
        country: prefs.country,
        countryCode: prefs.countryCode,
        center: prefs.center,
      },
      prefs.source,
    );
    if (data.attractions.length === 0 && data.food.length === 0) {
      return {
        error: `We couldn't find enough places in ${prefs.displayCity ?? prefs.destination} to build a trip. Try a larger nearby city.`,
      };
    }
    return assembleTrip(prefs, data, opts);
  } catch (err) {
    return {
      error: `Couldn't build a live guide right now: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}
