import type {
  Destination,
  GeneratedTrip,
  Neighborhood,
  Place,
  Trip,
  TripPreferences,
} from "@/lib/types";
import {
  getAttractions,
  getFoodPlaces,
  getNeighborhoods,
  isSupportedDestination,
} from "@/lib/mock-data";
import { getDestination } from "@/lib/data/destinations";
import {
  rankNeighborhoods,
  scoreAttraction,
  scoreRestaurant,
} from "@/lib/scoring";
import { buildItinerary } from "@/lib/itinerary";
import { optionLabel } from "@/lib/constants";
import { tripDayCount } from "@/lib/utils";
import { loadDestination } from "@/lib/providers";
import type { DestinationData } from "@/lib/providers/types";

/**
 * The "AI" layer. Deterministic, rule-based trip generation that composes the
 * scoring engine and itinerary builder, then writes human-readable copy
 * (summary, highlights, per-place rationale). Swappable for a real model later
 * behind this same `generateTrip` signature.
 */

function rankPlaces(
  places: Place[],
  prefs: TripPreferences,
  kind: "attraction" | "food",
): Place[] {
  const scoreFn = kind === "attraction" ? scoreAttraction : scoreRestaurant;
  return places
    .map((p) => ({
      place: { ...p, whyItFits: explainFit(p, prefs, kind) },
      score: scoreFn(p, prefs).score,
    }))
    .sort((a, b) => b.score - a.score)
    .map((s) => s.place);
}

/** One-sentence, preference-aware rationale shown on each place card. */
function explainFit(
  place: Place,
  prefs: TripPreferences,
  kind: "attraction" | "food",
): string {
  const matchedInterests = place.interests.filter((i) =>
    prefs.interests.includes(i),
  );
  const matchedFood = (place.foodTags ?? []).filter((t) =>
    prefs.foodPreferences.includes(t),
  );

  if (kind === "food") {
    if (matchedFood.length > 0) {
      return `Right up your alley for ${matchedFood
        .map((t) => optionLabel(t).toLowerCase())
        .join(" & ")}, and a genuine local pick — not a tourist trap.`;
    }
    if (place.uniqueness >= 82) {
      return "A distinctive, locally loved spot that rewards the detour.";
    }
    return "A reliable, well-rated choice that fits your budget.";
  }

  if (matchedInterests.length > 0) {
    return `Hits your interest in ${matchedInterests
      .map((i) => optionLabel(i).toLowerCase())
      .join(" & ")} and ranks among the city's must-sees.`;
  }
  return "A high-impact landmark worth working into your route.";
}

function buildSummary(
  prefs: TripPreferences,
  cityName: string,
  topHoodName: string | undefined,
): string {
  const days = tripDayCount(prefs.startDate, prefs.endDate);
  const interestText =
    prefs.interests.length > 0
      ? prefs.interests.map((i) => optionLabel(i).toLowerCase()).join(", ")
      : "a bit of everything";
  const pace = optionLabel(prefs.pace).toLowerCase();
  const stay = topHoodName ? ` We'd base you in ${topHoodName}.` : "";
  return `A ${days}-day ${pace} trip to ${cityName} built around ${interestText}, on a ${optionLabel(
    prefs.budget,
  ).toLowerCase()} budget for ${prefs.travelers} ${
    prefs.travelers === 1 ? "traveler" : "travelers"
  }.${stay}`;
}

function buildHighlights(
  attractions: Place[],
  food: Place[],
  topHoodName: string | undefined,
): string[] {
  const highlights: string[] = [];
  if (topHoodName) highlights.push(`Stay in ${topHoodName} for the best balance of access and vibe`);
  if (attractions[0]) highlights.push(`Don't miss ${attractions[0].name}`);
  if (food[0]) highlights.push(`Eat at ${food[0].name}`);
  const hiddenGem = food.find((f) => f.touristTrapRisk <= 12);
  if (hiddenGem) highlights.push(`Local gem: ${hiddenGem.name}`);
  return highlights;
}

export interface GenerateTripError {
  error: string;
}

/**
 * Shared assembly: score + rank raw destination data, build the itinerary, and
 * write the human-readable copy. Used by both the curated (sync) and worldwide
 * (async) generators so they produce identical output shapes.
 */
function assembleTrip(
  prefs: TripPreferences,
  data: {
    destination: Destination;
    neighborhoods: Neighborhood[];
    attractions: Place[];
    food: Place[];
    source?: "curated" | "osm";
    attribution?: string;
  },
  opts: { userId?: string },
): GeneratedTrip {
  const attractions = rankPlaces(data.attractions, prefs, "attraction");
  const food = rankPlaces(data.food, prefs, "food");
  const neighborhoods = rankNeighborhoods(
    data.neighborhoods,
    prefs,
    attractions,
  );

  const itinerary = buildItinerary(prefs, attractions, food);
  const topHoodName = neighborhoods[0]?.name;

  const trip: Trip = {
    id: makeTripId(),
    userId: opts.userId,
    preferences: prefs,
    createdAt: new Date().toISOString(),
  };

  return {
    trip,
    destination: data.destination,
    summary: buildSummary(prefs, data.destination.city, topHoodName),
    highlights: buildHighlights(attractions, food, topHoodName),
    neighborhoods,
    attractions,
    food,
    itinerary,
    source: data.source,
    attribution: data.attribution,
  };
}

/**
 * Synchronous generation for curated cities (instant, offline). Returns an
 * error for non-curated destinations — use `generateTripAsync` for those.
 */
export function generateTrip(
  prefs: TripPreferences,
  opts: { userId?: string } = {},
): GeneratedTrip | GenerateTripError {
  if (!isSupportedDestination(prefs.destination)) {
    return {
      error: `"${prefs.destination}" isn't a curated guide. Generate it from live data instead.`,
    };
  }
  const destination = getDestination(prefs.destination)!;
  return assembleTrip(
    prefs,
    {
      destination,
      neighborhoods: getNeighborhoods(prefs.destination),
      attractions: getAttractions(prefs.destination),
      food: getFoodPlaces(prefs.destination),
      source: "curated",
    },
    opts,
  );
}

/**
 * Worldwide generation. Resolves the right provider (curated or live OSM),
 * loads the data, and assembles the trip. Works for any geocoded city.
 */
export async function generateTripAsync(
  prefs: TripPreferences,
  opts: { userId?: string } = {},
): Promise<GeneratedTrip | GenerateTripError> {
  try {
    const data: DestinationData = await loadDestination(
      {
        slug: prefs.destination,
        displayCity: prefs.displayCity,
        country: prefs.country,
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
      error: `Couldn't build a live guide right now: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

function makeTripId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `trip_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
