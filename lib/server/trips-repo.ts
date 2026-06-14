import { query, queryOne } from "@/lib/db";
import type { GeneratedTrip, TripPreferences } from "@/lib/types";

/**
 * Cloud trips repository (server-only). Every operation is scoped to a userId,
 * so a user can only ever read or change their own trips. The row shape mirrors
 * the client `StoredTrip` so the two stores stay interchangeable.
 */

export interface CloudTrip {
  id: string;
  preferences: TripPreferences;
  createdAt: string;
  savedPlaceIds: string[];
  snapshot?: GeneratedTrip;
}

interface TripRow {
  id: string;
  preferences: TripPreferences;
  snapshot: GeneratedTrip | null;
  created_at: string;
  saved_place_ids: string[];
}

const SELECT = `
  select t.id, t.preferences, t.snapshot, t.created_at,
    coalesce(array_agg(sp.place_id) filter (where sp.place_id is not null), '{}') as saved_place_ids
  from venturo.trips t
  left join venturo.saved_places sp on sp.trip_id = t.id
`;

function toCloudTrip(r: TripRow): CloudTrip {
  return {
    id: r.id,
    preferences: r.preferences,
    createdAt: r.created_at,
    savedPlaceIds: r.saved_place_ids ?? [],
    snapshot: r.snapshot ?? undefined,
  };
}

export async function listTrips(userId: string): Promise<CloudTrip[]> {
  const res = await query<TripRow>(
    `${SELECT} where t.user_id = $1 group by t.id order by t.created_at desc`,
    [userId],
  );
  return res.rows.map(toCloudTrip);
}

export async function getTrip(
  userId: string,
  tripId: string,
): Promise<CloudTrip | null> {
  const row = await queryOne<TripRow>(
    `${SELECT} where t.user_id = $1 and t.id = $2 group by t.id`,
    [userId, tripId],
  );
  return row ? toCloudTrip(row) : null;
}

export async function createTrip(
  userId: string,
  preferences: TripPreferences,
  opts: { id?: string; snapshot?: GeneratedTrip; createdAt?: string } = {},
): Promise<CloudTrip> {
  const row = await queryOne<{ id: string; created_at: string }>(
    `insert into venturo.trips (id, user_id, preferences, snapshot, created_at)
     values (coalesce($1, gen_random_uuid()), $2, $3, $4, coalesce($5, now()))
     on conflict (id) do nothing
     returning id, created_at`,
    [
      opts.id ?? null,
      userId,
      JSON.stringify(preferences),
      opts.snapshot ? JSON.stringify(opts.snapshot) : null,
      opts.createdAt ?? null,
    ],
  );
  // If the id already existed (idempotent sync), fetch the existing trip.
  if (!row) {
    const existing = opts.id ? await getTrip(userId, opts.id) : null;
    if (existing) return existing;
  }
  return {
    id: row!.id,
    preferences,
    createdAt: row!.created_at,
    savedPlaceIds: [],
    snapshot: opts.snapshot,
  };
}

export async function deleteTrip(userId: string, tripId: string): Promise<boolean> {
  const res = await query(
    "delete from venturo.trips where user_id = $1 and id = $2",
    [userId, tripId],
  );
  return (res.rowCount ?? 0) > 0;
}

export async function saveSnapshot(
  userId: string,
  tripId: string,
  snapshot: GeneratedTrip,
): Promise<void> {
  await query(
    "update venturo.trips set snapshot = $3 where user_id = $1 and id = $2",
    [userId, tripId, JSON.stringify(snapshot)],
  );
}

/** Ensure a trip belongs to the user before touching its saved places. */
async function ownsTrip(userId: string, tripId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    "select id from venturo.trips where user_id = $1 and id = $2",
    [userId, tripId],
  );
  return Boolean(row);
}

export async function addSavedPlace(
  userId: string,
  tripId: string,
  placeId: string,
): Promise<boolean> {
  if (!(await ownsTrip(userId, tripId))) return false;
  await query(
    `insert into venturo.saved_places (trip_id, place_id) values ($1, $2)
     on conflict (trip_id, place_id) do nothing`,
    [tripId, placeId],
  );
  return true;
}

export async function removeSavedPlace(
  userId: string,
  tripId: string,
  placeId: string,
): Promise<boolean> {
  if (!(await ownsTrip(userId, tripId))) return false;
  await query(
    "delete from venturo.saved_places where trip_id = $1 and place_id = $2",
    [tripId, placeId],
  );
  return true;
}
