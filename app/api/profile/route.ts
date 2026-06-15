import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { updateUserProfile } from "@/lib/server/users-repo";
import { profileUpdateSchema } from "@/lib/validation";

/** POST /api/profile — update the signed-in user's default preferences. */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Cloud is not configured." }, { status: 503 });
  }
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 422 });
  }

  const user = await updateUserProfile(userId, parsed.data);
  return NextResponse.json({ user });
}
