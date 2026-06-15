-- Venturo schema (cloud persistence + custom email/password auth).
-- Isolated in its own `venturo` schema so it never collides with the shared
-- job-app (IronTrack) tables in `public`. Safe to run repeatedly.

create schema if not exists venturo;

-- Users: custom auth (password hashed with scrypt in the app layer).
create table if not exists venturo.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,            -- stored lowercased
  password_hash text not null,
  full_name text,
  default_budget text,
  default_travel_style text,
  food_preferences text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Trips: the whole TripPreferences is stored as JSON; worldwide (OSM) trips
-- also cache their generated plan snapshot so it survives across devices.
-- `id` is text so client-generated ids (uuid, or any stable string) sync as-is.
create table if not exists venturo.trips (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references venturo.users(id) on delete cascade,
  preferences jsonb not null,
  snapshot jsonb,
  created_at timestamptz not null default now()
);
create index if not exists trips_user_id_idx on venturo.trips(user_id);

-- Password reset tokens. We store only the SHA-256 hash of the token; the raw
-- token lives only in the emailed link. Single-use and short-lived.
create table if not exists venturo.password_reset_tokens (
  token_hash text primary key,
  user_id uuid not null references venturo.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists prt_user_id_idx on venturo.password_reset_tokens(user_id);

-- Saved places, scoped to a trip (and therefore a user via the FK).
create table if not exists venturo.saved_places (
  id uuid primary key default gen_random_uuid(),
  trip_id text not null references venturo.trips(id) on delete cascade,
  place_id text not null,
  created_at timestamptz not null default now(),
  unique (trip_id, place_id)
);
create index if not exists saved_places_trip_id_idx on venturo.saved_places(trip_id);
