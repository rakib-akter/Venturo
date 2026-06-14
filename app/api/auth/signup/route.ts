import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { isDbConfigured } from "@/lib/db";
import { createUser, getUserByEmail } from "@/lib/server/users-repo";
import {
  hashPassword,
  signSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

/** POST /api/auth/signup — create an account and start a session. */
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
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid details", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const { email, password, fullName } = parsed.data;

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 },
    );
  }

  const user = await createUser({
    email,
    passwordHash: await hashPassword(password),
    fullName,
  });

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, signSession(user.id), sessionCookieOptions);
  return res;
}
