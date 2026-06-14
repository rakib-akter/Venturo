import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { addSavedPlace, removeSavedPlace } from "@/lib/server/trips-repo";
import { savePlaceSchema } from "@/lib/validation";

async function authed(request: Request) {
  if (!isDbConfigured()) {
    return { error: NextResponse.json({ error: "Cloud is not configured." }, { status: 503 }) };
  }
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
  const parsed = savePlaceSchema.safeParse(body);
  if (!parsed.success) {
    return { error: NextResponse.json({ error: "Invalid body" }, { status: 422 }) };
  }
  return { userId, ...parsed.data };
}

/** POST /api/save-place { tripId, placeId } */
export async function POST(request: Request) {
  const a = await authed(request);
  if ("error" in a) return a.error;
  const ok = await addSavedPlace(a.userId, a.tripId, a.placeId);
  if (!ok) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ saved: true, tripId: a.tripId, placeId: a.placeId }, { status: 201 });
}

/** DELETE /api/save-place { tripId, placeId } */
export async function DELETE(request: Request) {
  const a = await authed(request);
  if ("error" in a) return a.error;
  const ok = await removeSavedPlace(a.userId, a.tripId, a.placeId);
  if (!ok) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  return NextResponse.json({ saved: false, tripId: a.tripId, placeId: a.placeId });
}
