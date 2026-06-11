-- Venturo schema
-- Run this in the Supabase SQL editor (or `supabase db push`) to enable
-- persistence. Safe to run once; uses IF NOT EXISTS where possible.
--
-- NOTE: This creates Venturo-specific tables. If you share a Supabase project
-- with another app, consider a dedicated schema or table prefixes to avoid
-- collisions.

create extension if not exists "pgcrypto";

-- Profiles (mirrors auth.users; one row per user) -----------------------------
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  default_budget text check (default_budget in ('budget','mid-range','luxury')),
  default_travel_style text check (default_travel_style in ('relaxed','balanced','packed')),
  food_preferences text[] default '{}',
  created_at timestamptz not null default now()
);

-- Trips -----------------------------------------------------------------------
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  destination text not null,
  country text,
  start_date date not null,
  end_date date not null,
  budget text not null check (budget in ('budget','mid-range','luxury')),
  travel_pace text not null check (travel_pace in ('relaxed','balanced','packed')),
  interests text[] default '{}',
  food_preferences text[] default '{}',
  created_at timestamptz not null default now()
);
create index if not exists trips_user_id_idx on public.trips(user_id);

-- Neighborhoods (curated reference data) --------------------------------------
create table if not exists public.neighborhoods (
  id text primary key,
  destination text not null,
  name text not null,
  description text,
  best_for text[] default '{}',
  pros text[] default '{}',
  cons text[] default '{}',
  transit_score int,
  attraction_score int,
  food_score int,
  safety_score int,
  affordability_score int,
  final_score int
);
create index if not exists neighborhoods_destination_idx on public.neighborhoods(destination);

-- Places (curated reference data) ---------------------------------------------
create table if not exists public.places (
  id text primary key,
  destination text not null,
  name text not null,
  type text not null,
  category text,
  description text,
  address text,
  latitude double precision,
  longitude double precision,
  price_level int,
  rating numeric(2,1),
  estimated_duration int,
  best_time_to_visit text
);
create index if not exists places_destination_idx on public.places(destination);

-- Itinerary -------------------------------------------------------------------
create table if not exists public.itinerary_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number int not null,
  title text,
  summary text
);

create table if not exists public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  itinerary_day_id uuid not null references public.itinerary_days(id) on delete cascade,
  place_id text references public.places(id),
  start_time text,
  end_time text,
  notes text,
  order_index int not null default 0
);

-- Saved places ----------------------------------------------------------------
create table if not exists public.saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete cascade,
  place_id text not null,
  created_at timestamptz not null default now(),
  unique (trip_id, place_id)
);

-- Row Level Security ----------------------------------------------------------
alter table public.users enable row level security;
alter table public.trips enable row level security;
alter table public.saved_places enable row level security;
alter table public.itinerary_days enable row level security;
alter table public.itinerary_items enable row level security;

-- Reference data is world-readable.
alter table public.neighborhoods enable row level security;
alter table public.places enable row level security;
create policy if not exists "neighborhoods are public"
  on public.neighborhoods for select using (true);
create policy if not exists "places are public"
  on public.places for select using (true);

-- Owners manage their own rows.
create policy if not exists "own profile"
  on public.users for all using (auth.uid() = id) with check (auth.uid() = id);
create policy if not exists "own trips"
  on public.trips for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "own saved places"
  on public.saved_places for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
