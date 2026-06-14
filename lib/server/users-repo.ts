import { query, queryOne } from "@/lib/db";
import type { Budget, FoodPreference, TravelPace } from "@/lib/types";

/** Public-facing user (never includes the password hash). */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  defaultBudget: Budget | null;
  defaultTravelStyle: TravelPace | null;
  foodPreferences: FoodPreference[];
  createdAt: string;
}

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

export { toAuthUser };
