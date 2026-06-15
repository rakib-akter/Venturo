import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  createHmac,
  createHash,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

/**
 * Custom email/password auth (server-only). No native deps and no Supabase
 * Auth — passwords are hashed with scrypt (node:crypto) and the session is a
 * compact HMAC-signed token stored in an httpOnly cookie.
 */

const scryptAsync = promisify(scrypt);

export const SESSION_COOKIE = "venturo_session";
const SESSION_TTL_DAYS = 30;

// --- Password hashing -------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const derived = (await scryptAsync(
    password,
    Buffer.from(saltHex, "hex"),
    64,
  )) as Buffer;
  const expected = Buffer.from(hashHex, "hex");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// --- Session tokens (HMAC-signed) ------------------------------------------

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(userId: string): string {
  const exp = Date.now() + SESSION_TTL_DAYS * 86_400_000;
  const payload = b64url(JSON.stringify({ uid: userId, exp }));
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret())
    .update(payload)
    .digest("base64url");
  // constant-time compare of equal-length signatures
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof uid !== "string" || typeof exp !== "number" || exp < Date.now()) {
      return null;
    }
    return uid;
  } catch {
    return null;
  }
}

// --- Password reset tokens --------------------------------------------------

/** A raw, URL-safe reset token (goes in the emailed link, never stored). */
export function makeResetToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 of a token — only the hash is stored in the database. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// --- Cookie helpers ---------------------------------------------------------

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_DAYS * 86_400,
};

/** Read the authenticated user id from the request's session cookie. */
export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
