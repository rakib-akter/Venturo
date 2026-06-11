import type {
  Budget,
  HotelPriority,
  Neighborhood,
  Place,
  TripPreferences,
} from "@/lib/types";
import { clamp } from "@/lib/utils";
import { centroid, haversineKm } from "@/lib/geo";

/**
 * Venturo scoring engine.
 *
 * Pure, deterministic functions that turn raw places/neighborhoods + a user's
 * trip preferences into 0–100 scores with transparent sub-score breakdowns.
 * No randomness, no network — the same inputs always rank the same way.
 */

export interface ScoreFactor {
  label: string;
  /** Normalized contribution 0–100 (before weighting). */
  value: number;
  /** Weight applied to this factor (0–1). */
  weight: number;
}

export interface ScoreResult {
  score: number; // 0–100 weighted total
  factors: ScoreFactor[];
}

function weightedTotal(factors: ScoreFactor[]): number {
  const total = factors.reduce((sum, f) => sum + f.value * f.weight, 0);
  return Math.round(clamp(total, 0, 100));
}

/** Map a budget to a target price level (1–4). */
export function budgetToPriceLevel(budget: Budget): number {
  switch (budget) {
    case "budget":
      return 1.5;
    case "mid-range":
      return 2.5;
    case "luxury":
      return 3.5;
  }
}

/** 0–100 closeness between an item's price level and the budget target. */
function priceMatch(priceLevel: number, budget: Budget): number {
  const target = budgetToPriceLevel(budget);
  const diff = Math.abs(priceLevel - target);
  return clamp(100 - diff * 32, 0, 100);
}

// ---------------------------------------------------------------------------
// Neighborhoods
//   30% attraction accessibility · 25% transit · 15% food density
//   15% safety/walkability · 10% affordability · 5% nightlife/vibe
// ---------------------------------------------------------------------------

export function scoreNeighborhood(
  hood: Neighborhood,
  prefs: TripPreferences,
  attractions: Place[],
): ScoreResult {
  // Accessibility: how close the neighborhood sits to the cluster of top sights.
  const attractionCenter = centroid(attractions.map((a) => a.geo));
  const kmToAttractions =
    attractions.length > 0 ? haversineKm(hood.center, attractionCenter) : 2;
  // Within ~0.5km is excellent; ~4km+ is poor.
  const accessibility = clamp(100 - (kmToAttractions - 0.5) * 22, 0, 100);

  // Vibe match blends nightlife score with how much the traveler cares about it.
  const wantsNightlife = prefs.interests.includes("nightlife") ? 1 : 0.45;
  const vibe = clamp(hood.nightlifeScore * wantsNightlife, 0, 100);

  const base: ScoreFactor[] = [
    { label: "Attraction access", value: accessibility, weight: 0.3 },
    { label: "Transit", value: hood.transitScore, weight: 0.25 },
    { label: "Food & cafés", value: hood.foodScore, weight: 0.15 },
    { label: "Safety & walkability", value: hood.safetyScore, weight: 0.15 },
    { label: "Affordability", value: hood.affordabilityScore, weight: 0.1 },
    { label: "Nightlife & vibe", value: vibe, weight: 0.05 },
  ];

  let score = weightedTotal(base);

  // Nudge by the traveler's explicit hotel priorities (bounded ±8 total).
  score = Math.round(
    clamp(score + hotelPriorityBonus(hood, prefs.hotelPriorities), 0, 100),
  );

  return { score, factors: base };
}

/** Small bonus/penalty (capped) reflecting a traveler's hotel priorities. */
function hotelPriorityBonus(
  hood: Neighborhood,
  priorities: HotelPriority[],
): number {
  if (priorities.length === 0) return 0;
  const map: Record<HotelPriority, number> = {
    metro: hood.transitScore,
    nightlife: hood.nightlifeScore,
    safety: hood.safetyScore,
    attractions: hood.attractionScore,
    cheap: hood.affordabilityScore,
    luxury: 100 - hood.affordabilityScore, // upscale areas score "low affordability"
  };
  const avg =
    priorities.reduce((sum, p) => sum + map[p], 0) / priorities.length;
  // Center on 70 so strong matches add, weak ones subtract, capped to ±8.
  return clamp((avg - 70) * 0.27, -8, 8);
}

// ---------------------------------------------------------------------------
// Attractions
//   popularity · interest match · uniqueness · time-need · (hotel distance)
// ---------------------------------------------------------------------------

export function scoreAttraction(
  place: Place,
  prefs: TripPreferences,
): ScoreResult {
  const interestMatch = interestOverlap(place.interests, prefs.interests);

  // Packed travelers tolerate longer visits; relaxed travelers prefer shorter.
  const durationFit = paceDurationFit(place.estimatedDuration, prefs.pace);

  const factors: ScoreFactor[] = [
    { label: "Matches your interests", value: interestMatch, weight: 0.34 },
    { label: "Must-see popularity", value: place.popularity, weight: 0.22 },
    { label: "Local & unique", value: place.uniqueness, weight: 0.22 },
    { label: "Fits your pace", value: durationFit, weight: 0.12 },
    {
      label: "Not a tourist trap",
      value: 100 - place.touristTrapRisk,
      weight: 0.1,
    },
  ];

  return { score: weightedTotal(factors), factors };
}

// ---------------------------------------------------------------------------
// Restaurants / cafés
//   cuisine match · rating · price match · uniqueness · trap penalty
// ---------------------------------------------------------------------------

export function scoreRestaurant(
  place: Place,
  prefs: TripPreferences,
): ScoreResult {
  const cuisine = foodOverlap(place, prefs);
  const ratingValue = clamp((place.rating / 5) * 100, 0, 100);
  const price = priceMatch(place.priceLevel, prefs.budget);

  const factors: ScoreFactor[] = [
    { label: "Matches your food taste", value: cuisine, weight: 0.32 },
    { label: "Highly rated", value: ratingValue, weight: 0.22 },
    { label: "Local & unique", value: place.uniqueness, weight: 0.18 },
    { label: "Fits your budget", value: price, weight: 0.16 },
    {
      label: "Avoids tourist traps",
      value: 100 - place.touristTrapRisk,
      weight: 0.12,
    },
  ];

  return { score: weightedTotal(factors), factors };
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function interestOverlap(
  itemInterests: string[],
  userInterests: string[],
): number {
  if (userInterests.length === 0) return 60;
  const overlap = itemInterests.filter((i) => userInterests.includes(i)).length;
  if (overlap === 0) return 35;
  // First match counts most, additional matches add diminishing returns.
  return clamp(60 + overlap * 18, 0, 100);
}

function foodOverlap(place: Place, prefs: TripPreferences): number {
  const tags = place.foodTags ?? [];
  if (prefs.foodPreferences.length === 0) {
    return prefs.interests.includes("food") ? 75 : 60;
  }
  const overlap = tags.filter((t) =>
    prefs.foodPreferences.includes(t),
  ).length;
  if (overlap === 0) return 42;
  return clamp(62 + overlap * 16, 0, 100);
}

function paceDurationFit(durationMin: number, pace: TripPreferences["pace"]): number {
  // Sweet-spot visit length per pace; score falls off as we deviate.
  const ideal = pace === "relaxed" ? 75 : pace === "balanced" ? 110 : 150;
  const diff = Math.abs(durationMin - ideal);
  return clamp(100 - diff * 0.4, 30, 100);
}

/** Attach the computed finalScore to each neighborhood and sort, best first. */
export function rankNeighborhoods(
  hoods: Neighborhood[],
  prefs: TripPreferences,
  attractions: Place[],
): Neighborhood[] {
  return hoods
    .map((h) => ({
      ...h,
      finalScore: scoreNeighborhood(h, prefs, attractions).score,
    }))
    .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
}
