import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getTrip, deleteTrip } from "@/lib/server/trips-repo";

async function requireUser() {
  if (!isDbConfigured()) {
    return { error: NextResponse.json({ error: "Cloud is not configured." }, { status: 503 }) };
  }
  const userId = await getSessionUserId();
  if (!userId) {
    return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  return { userId };
}

/** GET /api/trips/[id] — a single trip belonging to the user. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const trip = await getTrip(auth.userId, id);
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ trip });
}

/** DELETE /api/trips/[id] */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const ok = await deleteTrip(auth.userId, id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: id });
}
