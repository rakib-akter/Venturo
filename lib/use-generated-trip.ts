"use client";

import * as React from "react";
import type { GeneratedTrip } from "@/lib/types";
import { generateTrip } from "@/lib/ai";
import { isSupportedDestination } from "@/lib/mock-data";
import { saveSnapshot, type StoredTrip } from "@/lib/trip-store";

export type GeneratedTripState =
  | { status: "loading" }
  | { status: "ready"; trip: GeneratedTrip }
  | { status: "error"; error: string };

/**
 * Resolve the generated plan for a stored trip:
 *  - a persisted snapshot (worldwide trips) is returned immediately;
 *  - curated cities generate synchronously, offline;
 *  - other cities are fetched from /api/generate-trip (live OSM) and cached.
 */
export function useGeneratedTrip(
  stored: StoredTrip | undefined,
): GeneratedTripState {
  // Anything we can resolve without the network, computed synchronously.
  const immediate = React.useMemo<GeneratedTripState | null>(() => {
    if (!stored) return null;
    if (stored.snapshot) return { status: "ready", trip: stored.snapshot };
    const prefs = stored.preferences;
    const curated =
      prefs.source !== "osm" && isSupportedDestination(prefs.destination);
    if (curated) {
      const r = generateTrip(prefs);
      return "error" in r
        ? { status: "error", error: r.error }
        : { status: "ready", trip: r };
    }
    return null; // requires a live fetch
  }, [stored]);

  const [asyncState, setAsyncState] = React.useState<GeneratedTripState | null>(
    null,
  );

  React.useEffect(() => {
    if (immediate || !stored) return; // nothing to fetch
    let cancelled = false;
    fetch("/api/generate-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stored.preferences),
    })
      .then((r) => r.json())
      .then((data: GeneratedTrip & { error?: string }) => {
        if (cancelled) return;
        if (data.error) {
          setAsyncState({ status: "error", error: data.error });
        } else {
          saveSnapshot(stored.id, data);
          setAsyncState({ status: "ready", trip: data });
        }
      })
      .catch(() => {
        if (!cancelled)
          setAsyncState({
            status: "error",
            error: "Couldn't reach the trip service. Check your connection.",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [immediate, stored]);

  return immediate ?? asyncState ?? { status: "loading" };
}
