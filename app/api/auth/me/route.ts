import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import { getAuthUserById } from "@/lib/server/users-repo";

/** GET /api/auth/me — the current user, or null if not signed in. */
export async function GET() {
  if (!isDbConfigured()) return NextResponse.json({ user: null });
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null });
  const user = await getAuthUserById(userId);
  return NextResponse.json({ user });
}
