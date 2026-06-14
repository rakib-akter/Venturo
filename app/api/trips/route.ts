import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { listTrips, createTrip } from "@/lib/server/trips-repo";
import { tripPreferencesSchema } from "@/lib/validation";
import type { TripPreferences } from "@/lib/types";

function guard() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Cloud is not configured." }, { status: 503 });
  }
  return null;
}

/** GET /api/trips — the signed-in user's trips. */
export async function GET() {
  const blocked = guard();
  if (blocked) return blocked;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const trips = await listTrips(userId);
  return NextResponse.json({ count: trips.length, trips });
}

/** POST /api/trips — create (or idempotently sync) a trip for the user. */
export async function POST(request: Request) {
  const blocked = guard();
  if (blocked) return blocked;
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: { preferences?: unknown; id?: string; snapshot?: unknown; createdAt?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = tripPreferencesSchema.safeParse(body.preferences ?? body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid preferences", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const trip = await createTrip(userId, parsed.data as TripPreferences, {
    id: typeof body.id === "string" ? body.id : undefined,
    createdAt: typeof body.createdAt === "string" ? body.createdAt : undefined,
    // snapshot is large + already validated upstream; store as-is when present.
    snapshot: body.snapshot as never,
  });
  return NextResponse.json({ trip }, { status: 201 });
}
