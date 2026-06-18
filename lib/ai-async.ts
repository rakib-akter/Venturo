import type { CityTrip, GeneratedTrip, Trip, TripPreferences } from "@/lib/types";
import {
  assembleTrip,
  buildMultiCityHighlights,
  buildMultiCitySummary,
  makeTripId,
  rankPlaces,
  type GenerateTripError,
} from "@/lib/ai";
import { rankNeighborhoods } from "@/lib/scoring";
import { buildMultiCityItinerary } from "@/lib/itinerary";
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

/**
 * Multi-city trip generation (server-only). Loads each city's data
 * concurrently (curated or live OSM), assembles per-city plans, then
 * stitches them into a single GeneratedTrip with a combined itinerary.
 */
export async function generateMultiCityTripAsync(
  prefs: TripPreferences,
  opts: { userId?: string } = {},
): Promise<GeneratedTrip | GenerateTripError> {
  const legs = prefs.destinations;
  if (!legs || legs.length < 2) return generateTripAsync(prefs, opts);

  try {
    const cityDataResults = await Promise.all(
      legs.map((leg) =>
        loadDestination(
          {
            slug: leg.slug,
            displayCity: leg.displayCity,
            country: leg.country,
            countryCode: leg.countryCode,
            center: leg.center,
          },
          leg.source,
        ),
      ),
    );

    const cityTrips: CityTrip[] = [];
    let startDay = 1;

    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      const data = cityDataResults[i];

      if (data.attractions.length === 0 && data.food.length === 0) {
        return {
          error: `We couldn't find enough places in ${leg.displayCity} to build a trip.`,
        };
      }

      const attractions = rankPlaces(
        data.attractions,
        prefs,
        "attraction",
        data.destination.center,
      );
      const food = rankPlaces(data.food, prefs, "food");
      const neighborhoods = rankNeighborhoods(data.neighborhoods, prefs, attractions);

      cityTrips.push({
        destination: data.destination,
        neighborhoods,
        attractions,
        food,
        nights: leg.nights,
        startDay,
      });
      startDay += leg.nights;
    }

    const itinerary = buildMultiCityItinerary(prefs, cityTrips);
    const allAttractions = cityTrips.flatMap((ct) => ct.attractions);
    const allFood = cityTrips.flatMap((ct) => ct.food);
    const allNeighborhoods = cityTrips.flatMap((ct) => ct.neighborhoods);

    const hasOsm = legs.some((l) => l.source === "osm");

    const trip: Trip = {
      id: makeTripId(),
      userId: opts.userId,
      preferences: prefs,
      createdAt: new Date().toISOString(),
    };

    return {
      trip,
      destination: cityTrips[0].destination,
      summary: buildMultiCitySummary(prefs, legs),
      highlights: buildMultiCityHighlights(cityTrips),
      neighborhoods: allNeighborhoods,
      attractions: allAttractions,
      food: allFood,
      itinerary,
      source: hasOsm ? "osm" : "curated",
      attribution: hasOsm ? "OpenStreetMap contributors (ODbL)" : undefined,
      cityTrips,
    };
  } catch (err) {
    return {
      error: `Couldn't build the multi-city guide: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}
