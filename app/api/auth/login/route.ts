import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { isDbConfigured } from "@/lib/db";
import { getUserByEmail, toAuthUser } from "@/lib/server/users-repo";
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

/** POST /api/auth/login — verify credentials and start a session. */
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
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid details" }, { status: 422 });
  }
  const { email, password } = parsed.data;

  const row = await getUserByEmail(email);
  // Same response whether the email or password is wrong (no user enumeration).
  if (!row || !(await verifyPassword(password, row.password_hash))) {
    return NextResponse.json(
      { error: "Incorrect email or password." },
      { status: 401 },
    );
  }

  const res = NextResponse.json({ user: toAuthUser(row) });
  res.cookies.set(SESSION_COOKIE, signSession(row.id), sessionCookieOptions);
  return res;
}
