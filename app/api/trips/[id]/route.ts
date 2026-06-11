import { NextResponse } from "next/server";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * GET /api/trips/[id]
 * Fetches a single persisted trip and its saved places. Requires Supabase.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Persistence is not configured." },
      { status: 503 },
    );
  }
  const { id } = await params;
  const supabase = createServerSupabase()!;

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.code === "PGRST116" ? 404 : 500 },
    );
  }

  const { data: saved } = await supabase
    .from("saved_places")
    .select("place_id")
    .eq("trip_id", id);

  return NextResponse.json({
    trip,
    savedPlaceIds: (saved ?? []).map((s) => s.place_id),
  });
}

/**
 * DELETE /api/trips/[id]
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Persistence is not configured." },
      { status: 503 },
    );
  }
  const { id } = await params;
  const supabase = createServerSupabase()!;

  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: id });
}
