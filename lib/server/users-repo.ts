import { query, queryOne } from "@/lib/db";
import type { Budget, FoodPreference, PublicUser, TravelPace } from "@/lib/types";

/** Public-facing user (never includes the password hash). */
export type AuthUser = PublicUser;

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  default_budget: string | null;
  default_travel_style: string | null;
  food_preferences: string[];
  created_at: string;
}

function toAuthUser(r: UserRow): AuthUser {
  return {
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    defaultBudget: (r.default_budget as Budget) ?? null,
    defaultTravelStyle: (r.default_travel_style as TravelPace) ?? null,
    foodPreferences: (r.food_preferences ?? []) as FoodPreference[],
    createdAt: r.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  return queryOne<UserRow>("select * from venturo.users where email = $1", [
    email.toLowerCase(),
  ]);
}

export async function getAuthUserById(id: string): Promise<AuthUser | null> {
  const row = await queryOne<UserRow>(
    "select * from venturo.users where id = $1",
    [id],
  );
  return row ? toAuthUser(row) : null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  fullName?: string;
}): Promise<AuthUser> {
  const row = await queryOne<UserRow>(
    `insert into venturo.users (email, password_hash, full_name)
     values ($1, $2, $3) returning *`,
    [input.email.toLowerCase(), input.passwordHash, input.fullName ?? null],
  );
  return toAuthUser(row!);
}

export async function updateUserProfile(
  id: string,
  patch: {
    fullName?: string;
    defaultBudget?: Budget;
    defaultTravelStyle?: TravelPace;
    foodPreferences?: FoodPreference[];
  },
): Promise<AuthUser | null> {
  const row = await queryOne<UserRow>(
    `update venturo.users set
        full_name = coalesce($2, full_name),
        default_budget = coalesce($3, default_budget),
        default_travel_style = coalesce($4, default_travel_style),
        food_preferences = coalesce($5, food_preferences)
     where id = $1 returning *`,
    [
      id,
      patch.fullName ?? null,
      patch.defaultBudget ?? null,
      patch.defaultTravelStyle ?? null,
      patch.foodPreferences ?? null,
    ],
  );
  return row ? toAuthUser(row) : null;
}

export async function setPassword(
  userId: string,
  passwordHash: string,
): Promise<void> {
  await query("update venturo.users set password_hash = $2 where id = $1", [
    userId,
    passwordHash,
  ]);
}

// --- Password reset tokens --------------------------------------------------

export async function createResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  // Invalidate any outstanding tokens, then store the new one.
  await query("delete from venturo.password_reset_tokens where user_id = $1", [
    userId,
  ]);
  await query(
    `insert into venturo.password_reset_tokens (token_hash, user_id, expires_at)
     values ($1, $2, $3)`,
    [tokenHash, userId, expiresAt.toISOString()],
  );
}

/** Returns the userId for a valid, unexpired token, then consumes it. */
export async function consumeResetToken(
  tokenHash: string,
): Promise<string | null> {
  const row = await queryOne<{ user_id: string }>(
    `delete from venturo.password_reset_tokens
     where token_hash = $1 and expires_at > now()
     returning user_id`,
    [tokenHash],
  );
  return row?.user_id ?? null;
}

export { toAuthUser };
