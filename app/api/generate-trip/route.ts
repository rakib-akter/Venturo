import { NextResponse } from "next/server";
import { tripPreferencesSchema } from "@/lib/validation";
import { generateTripAsync, generateMultiCityTripAsync } from "@/lib/ai-async";
import type { TripPreferences } from "@/lib/types";

/** Live OSM lookups can take a while on a cold cache. */
export const maxDuration = 60;

/**
 * POST /api/generate-trip
 * Body: TripPreferences. Returns a fully scored GeneratedTrip.
 * Curated cities resolve instantly; worldwide cities are built live from
 * OpenStreetMap (and cached server-side).
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = tripPreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const prefs = parsed.data as TripPreferences;
  const isMultiCity = (prefs.destinations?.length ?? 0) >= 2;
  const result = isMultiCity
    ? await generateMultiCityTripAsync(prefs)
    : await generateTripAsync(prefs);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(result);
}
