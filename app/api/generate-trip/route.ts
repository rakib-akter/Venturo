import { NextResponse } from "next/server";
import { tripPreferencesSchema } from "@/lib/validation";
import { generateTripAsync } from "@/lib/ai";
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

  const result = await generateTripAsync(parsed.data as TripPreferences);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json(result);
}
