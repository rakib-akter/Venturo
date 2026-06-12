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
  return trip.id;
}

export function deleteTrip(id: string): void {
  write(read().filter((t) => t.id !== id));
}

/** Persist a generated plan snapshot against a trip (for worldwide trips). */
export function saveSnapshot(id: string, snapshot: GeneratedTrip): void {
  const trips = read();
  const trip = trips.find((t) => t.id === id);
  if (!trip) return;
  trip.snapshot = snapshot;
  write(trips);
}

export function toggleSavedPlace(tripId: string, placeId: string): void {
  const trips = read();
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.savedPlaceIds = trip.savedPlaceIds.includes(placeId)
    ? trip.savedPlaceIds.filter((p) => p !== placeId)
    : [...trip.savedPlaceIds, placeId];
  write(trips);
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
