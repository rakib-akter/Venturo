import { NextResponse } from "next/server";
import { tripPreferencesSchema } from "@/lib/validation";
import { generateTrip } from "@/lib/ai";
import type { TripPreferences } from "@/lib/types";

/**
 * POST /api/generate-trip
 * Body: TripPreferences. Returns a fully scored GeneratedTrip.
 * Stateless — runs the scoring engine over the curated dataset.
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

  const result = generateTrip(parsed.data as TripPreferences);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json(result);
}
