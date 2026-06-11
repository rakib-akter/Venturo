import { NextResponse } from "next/server";
import {
  getAttractions,
  getNeighborhoods,
  isSupportedDestination,
} from "@/lib/mock-data";
import { rankNeighborhoods } from "@/lib/scoring";
import { tripPreferencesSchema } from "@/lib/validation";
import type { TripPreferences } from "@/lib/types";

/**
 * GET /api/neighborhoods?destination=paris
 * Returns curated neighborhoods. If trip preferences are supplied as query
 * params (budget, pace, hotelPriorities...), the list is scored and ranked.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");

  if (!destination) {
    return NextResponse.json(
      { error: "Missing required query param: destination" },
      { status: 400 },
    );
  }
  if (!isSupportedDestination(destination)) {
    return NextResponse.json(
      { error: `Unsupported destination: ${destination}` },
      { status: 404 },
    );
  }

  const hoods = getNeighborhoods(destination);

  // Optional ranking when enough preference context is provided.
  const maybePrefs = tripPreferencesSchema.safeParse({
    destination,
    startDate: searchParams.get("startDate") ?? "2025-01-01",
    endDate: searchParams.get("endDate") ?? "2025-01-03",
    travelers: Number(searchParams.get("travelers") ?? 2),
    budget: searchParams.get("budget") ?? "mid-range",
    pace: searchParams.get("pace") ?? "balanced",
    interests: searchParams.getAll("interests"),
    foodPreferences: searchParams.getAll("foodPreferences"),
    hotelPriorities: searchParams.getAll("hotelPriorities"),
  });

  const ranked = maybePrefs.success
    ? rankNeighborhoods(
        hoods,
        maybePrefs.data as TripPreferences,
        getAttractions(destination),
      )
    : hoods;

  return NextResponse.json({
    destination,
    count: ranked.length,
    ranked: maybePrefs.success,
    neighborhoods: ranked,
  });
}
