import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validation";
import { isDbConfigured } from "@/lib/db";
import { getUserByEmail, createResetToken } from "@/lib/server/users-repo";
import { makeResetToken, hashToken } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

const TTL_MS = 60 * 60 * 1000; // 1 hour

function baseUrl(request: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return new URL(request.url).origin;
}

/**
 * POST /api/auth/forgot { email }
 * Always returns a generic success (no account enumeration). When an account
 * exists, a single-use reset link is generated and emailed; without an email
 * provider configured we log it and (in dev) return it for testing.
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
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 422 });
  }

  const generic = { ok: true } as Record<string, unknown>;
  const user = await getUserByEmail(parsed.data.email);
  if (!user) return NextResponse.json(generic);

  const token = makeResetToken();
  await createResetToken(user.id, hashToken(token), new Date(Date.now() + TTL_MS));
  const link = `${baseUrl(request)}/reset-password?token=${token}`;

  // Always log server-side so it's recoverable even without an email provider.
  console.log(`[venturo] password reset link for ${user.email}: ${link}`);

  if (isEmailConfigured()) {
    await sendEmail({
      to: user.email,
      subject: "Reset your Venturo password",
      html: `<p>We received a request to reset your Venturo password.</p>
        <p><a href="${link}">Click here to choose a new password</a>. This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>`,
      text: `Reset your Venturo password: ${link} (expires in 1 hour)`,
    });
  } else if (process.env.NODE_ENV !== "production") {
    // No provider in dev — hand the link back so the flow is testable.
    generic.devLink = link;
  }

  return NextResponse.json(generic);
}
