"use client";

import * as React from "react";
import type { GeneratedTrip, TripPreferences } from "@/lib/types";

/**
 * Client-side persistence for trips and saved places, backed by localStorage.
 *
 * Because trip generation is fully deterministic, we only need to store the
 * user's preferences (plus an id and any saved place ids). The results pages
 * re-run `generateTrip` from these preferences on demand. This keeps the MVP
 * working with zero backend; the same shape maps cleanly onto Supabase later.
 */

export interface StoredTrip {
  id: string;
  preferences: TripPreferences;
  createdAt: string;
  savedPlaceIds: string[];
  /**
   * Cached generated plan. Curated trips regenerate instantly so this stays
   * empty, but worldwide (OSM) trips persist their snapshot here to avoid
   * re-fetching live data on every visit.
   */
  snapshot?: GeneratedTrip;
}

const KEY = "venturo.trips";
const EVENT = "venturo:trips-changed";

function read(): StoredTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredTrip[]) : [];
  } catch {
    return [];
  }
}

function write(trips: StoredTrip[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(trips));
  window.dispatchEvent(new Event(EVENT));
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `trip_${Date.now().toString(36)}`;
}

// --- Cloud mirroring --------------------------------------------------------
// When signed in, every local change is also written to the cloud (fire and
// forget — failures just leave the trip local). `setCloudEnabled` is toggled by
// the auth provider so anonymous sessions never hit the network.

let cloudEnabled = false;

export function setCloudEnabled(value: boolean): void {
  cloudEnabled = value;
}

function cloudUpsert(trip: StoredTrip): void {
  if (!cloudEnabled) return;
  void fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: trip.id,
      preferences: trip.preferences,
      createdAt: trip.createdAt,
      snapshot: trip.snapshot,
    }),
  }).catch(() => {});
}

function cloudDelete(id: string): void {
  if (!cloudEnabled) return;
  void fetch(`/api/trips/${id}`, { method: "DELETE" }).catch(() => {});
}

function cloudSavePlace(tripId: string, placeId: string, saved: boolean): void {
  if (!cloudEnabled) return;
  void fetch("/api/save-place", {
    method: saved ? "POST" : "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tripId, placeId }),
  }).catch(() => {});
}

/** Clear local trips (called on logout so the next user starts clean). */
export function resetLocalTrips(): void {
  write([]);
}

/**
 * Merge cloud + local on sign-in: pull the user's cloud trips, push any
 * local-only trips (and their saved places) up, then write the union locally.
 */
export async function syncOnLogin(): Promise<void> {
  setCloudEnabled(true);
  let cloud: StoredTrip[] = [];
  try {
    const res = await fetch("/api/trips");
    if (res.ok) cloud = (await res.json()).trips ?? [];
  } catch {
    return; // offline — keep working locally
  }
  const cloudIds = new Set(cloud.map((t) => t.id));
  const local = read();
  const localOnly = local.filter((t) => !cloudIds.has(t.id));

  // Push local-only trips to the cloud so they aren't lost.
  for (const t of localOnly) {
    cloudUpsert(t);
    for (const pid of t.savedPlaceIds) cloudSavePlace(t.id, pid, true);
  }

  write([...cloud, ...localOnly]);
}

export function listTrips(): StoredTrip[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTrip(id: string): StoredTrip | undefined {
  return read().find((t) => t.id === id);
}

/** Create and persist a new trip from preferences; returns its id. */
export function createTrip(preferences: TripPreferences): string {
  const trip: StoredTrip = {
    id: makeId(),
    preferences,
    createdAt: new Date().toISOString(),
    savedPlaceIds: [],
  };
  write([trip, ...read()]);
  cloudUpsert(trip);
  return trip.id;
}

export function deleteTrip(id: string): void {
  write(read().filter((t) => t.id !== id));
  cloudDelete(id);
}

/** Persist a generated plan snapshot against a trip (for worldwide trips). */
export function saveSnapshot(id: string, snapshot: GeneratedTrip): void {
  const trips = read();
  const trip = trips.find((t) => t.id === id);
  if (!trip) return;
  trip.snapshot = snapshot;
  write(trips);
  cloudUpsert(trip);
}

export function toggleSavedPlace(tripId: string, placeId: string): void {
  const trips = read();
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  const saved = !trip.savedPlaceIds.includes(placeId);
  trip.savedPlaceIds = saved
    ? [...trip.savedPlaceIds, placeId]
    : trip.savedPlaceIds.filter((p) => p !== placeId);
  write(trips);
  cloudSavePlace(tripId, placeId, saved);
}

/** Subscribe to trip changes and return the live list (same-tab + cross-tab). */
export function useTrips(): StoredTrip[] {
  const [trips, setTrips] = React.useState<StoredTrip[]>([]);
  React.useEffect(() => {
    const sync = () => setTrips(listTrips());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return trips;
}

/** Subscribe to a single trip by id. */
export function useTrip(id: string | undefined): StoredTrip | undefined {
  const [trip, setTrip] = React.useState<StoredTrip | undefined>(undefined);
  React.useEffect(() => {
    if (!id) return;
    const sync = () => setTrip(getTrip(id));
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);
  return trip;
}
