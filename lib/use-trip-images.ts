"use client";

import * as React from "react";
import type { GeneratedTrip } from "@/lib/types";

/**
 * Resolves real photos for everything on a results page in a single batched
 * request to /api/images, then hands each card its URL by id. Works the same
 * for curated (offline-generated) and worldwide (OSM) trips — the heavy image
 * lookups always run server-side and are cached there.
 */

export type ImageMap = Record<string, string>;

// Persist across route changes so revisiting a trip doesn't refetch.
const memoryCache: ImageMap = {};

interface BatchItem {
  id: string;
  kind: "place" | "neighborhood" | "destination";
  name: string;
  city: string;
  type?: string;
  category?: string;
  wikidata?: string;
  wikipedia?: string;
}

function buildItems(trip: GeneratedTrip): BatchItem[] {
  const items: BatchItem[] = [];

  // Multi-city: emit one destination item + places + neighborhoods per city.
  if (trip.cityTrips && trip.cityTrips.length >= 2) {
    for (const ct of trip.cityTrips) {
      const city = ct.destination.city;
      items.push({ id: `dest:${ct.destination.slug}`, kind: "destination", name: city, city });
      for (const p of [...ct.attractions, ...ct.food]) {
        items.push({ id: p.id, kind: "place", name: p.name, city, type: p.type, category: p.category, wikidata: p.wikidata, wikipedia: p.wikipedia });
      }
      for (const n of ct.neighborhoods) {
        items.push({ id: n.id, kind: "neighborhood", name: n.name, city });
      }
    }
    return items;
  }

  // Single-city path (unchanged).
  const city = trip.destination.city;
  items.push({ id: `dest:${trip.destination.slug}`, kind: "destination", name: city, city });
  for (const p of [...trip.attractions, ...trip.food]) {
    items.push({ id: p.id, kind: "place", name: p.name, city, type: p.type, category: p.category, wikidata: p.wikidata, wikipedia: p.wikipedia });
  }
  for (const n of trip.neighborhoods) {
    items.push({ id: n.id, kind: "neighborhood", name: n.name, city });
  }
  return items;
}

export function useTripImages(trip: GeneratedTrip | null): ImageMap {
  const [images, setImages] = React.useState<ImageMap>(() => ({ ...memoryCache }));

  React.useEffect(() => {
    if (!trip) return;
    const items = buildItems(trip).filter((it) => !(it.id in memoryCache));
    if (items.length === 0) {
      setImages({ ...memoryCache });
      return;
    }

    let cancelled = false;
    fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => r.json())
      .then((data: { images?: ImageMap }) => {
        if (cancelled) return;
        Object.assign(memoryCache, data.images ?? {});
        setImages({ ...memoryCache });
      })
      .catch(() => {
        /* imagery is best-effort; cards keep their gradient */
      });

    return () => {
      cancelled = true;
    };
  }, [trip]);

  return images;
}
