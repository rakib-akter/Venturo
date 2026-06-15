import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validation";
import { isDbConfigured } from "@/lib/db";
import {
  consumeResetToken,
  setPassword,
  getAuthUserById,
} from "@/lib/server/users-repo";
import {
  hashToken,
  hashPassword,
  signSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

/**
 * POST /api/auth/reset { token, password }
 * Consumes a valid reset token, sets the new password, and signs the user in.
 */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Cloud is not configured." }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a password of at least 8 characters." },
      { status: 422 },
    );
  }

  const userId = await consumeResetToken(hashToken(parsed.data.token));
  if (!userId) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  await setPassword(userId, await hashPassword(parsed.data.password));
  const user = await getAuthUserById(userId);

  const res = NextResponse.json({ user });
  res.cookies.set(SESSION_COOKIE, signSession(userId), sessionCookieOptions);
  return res;
}
