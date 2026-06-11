import { NextResponse } from "next/server";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { savePlaceSchema } from "@/lib/validation";

function notConfigured() {
  return NextResponse.json(
    { error: "Persistence is not configured." },
    { status: 503 },
  );
}

async function parseBody(request: Request) {
  try {
    return savePlaceSchema.safeParse(await request.json());
  } catch {
    return null;
  }
}

/**
 * POST /api/save-place  { tripId, placeId }
 * Saves a place to a trip (idempotent via unique constraint).
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return notConfigured();
  const parsed = await parseBody(request);
  if (!parsed || !parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }
  const supabase = createServerSupabase()!;
  const { tripId, placeId } = parsed.data;

  const { error } = await supabase
    .from("saved_places")
    .upsert(
      { trip_id: tripId, place_id: placeId },
      { onConflict: "trip_id,place_id" },
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: true, tripId, placeId }, { status: 201 });
}

/**
 * DELETE /api/save-place  { tripId, placeId }
 * Removes a saved place from a trip.
 */
export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) return notConfigured();
  const parsed = await parseBody(request);
  if (!parsed || !parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }
  const supabase = createServerSupabase()!;
  const { tripId, placeId } = parsed.data;

  const { error } = await supabase
    .from("saved_places")
    .delete()
    .eq("trip_id", tripId)
    .eq("place_id", placeId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: false, tripId, placeId });
}
