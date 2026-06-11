import { NextResponse } from "next/server";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { tripPreferencesSchema } from "@/lib/validation";

const NOT_CONFIGURED = NextResponse.json(
  {
    error:
      "Persistence is not configured. Set Supabase env vars and run supabase/schema.sql to enable saved trips.",
  },
  { status: 503 },
);

/**
 * GET /api/trips?userId=...
 * Lists persisted trips. Requires Supabase to be configured.
 */
export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createServerSupabase()!;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  let query = supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });
  if (userId) query = query.eq("user_id", userId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ count: data.length, trips: data });
}

/**
 * POST /api/trips
 * Persists a trip from validated preferences. Requires Supabase.
 */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;
  const supabase = createServerSupabase()!;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = tripPreferencesSchema.safeParse(
    (body as { preferences?: unknown })?.preferences ?? body,
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const p = parsed.data;

  const { data, error } = await supabase
    .from("trips")
    .insert({
      user_id: (body as { userId?: string })?.userId ?? null,
      destination: p.destination,
      country: p.country ?? null,
      start_date: p.startDate,
      end_date: p.endDate,
      budget: p.budget,
      travel_pace: p.pace,
      interests: p.interests,
      food_preferences: p.foodPreferences,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ trip: data }, { status: 201 });
}
