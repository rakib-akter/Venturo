import type { PlaceType } from "@/lib/types";

/**
 * Maps a place's type + editorial category to image-lookup hints:
 *  - `group`   — which keyless stock photo to fall back to,
 *  - `query`   — the Pexels search phrase (category photo),
 *  - `tryWiki` — whether a real Wikimedia landmark photo is worth attempting.
 *
 * Kept deterministic and dependency-free so the same place always resolves to
 * the same imagery across curated (offline) and worldwide (OSM) trips.
 */

export type StockGroup =
  | "restaurant"
  | "cafe"
  | "bar"
  | "hotel"
  | "museum"
  | "park"
  | "landmark"
  | "market"
  | "nightlife"
  | "shopping"
  | "beach"
  | "city";

export interface ImageHints {
  group: StockGroup;
  query: string;
  tryWiki: boolean;
}

function has(haystack: string, ...needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** Derive image hints for a place from its type, category, name, and city. */
export function imageHintsForPlace(
  type: PlaceType,
  category: string,
  name: string,
  city: string,
): ImageHints {
  const c = category.toLowerCase();

  if (type === "cafe" || has(c, "café", "cafe", "coffee", "bakery", "patisserie")) {
    return { group: "cafe", query: `${city} cafe coffee shop interior`, tryWiki: false };
  }
  if (type === "bar" || has(c, "bar", "pub", "wine", "cocktail", "brewery", "taproom")) {
    return { group: "bar", query: `${city} cocktail bar interior`, tryWiki: false };
  }
  if (type === "hotel-zone" || has(c, "hotel", "stay", "lodging")) {
    return { group: "hotel", query: `${city} boutique hotel`, tryWiki: false };
  }
  if (type === "restaurant" || has(c, "restaurant", "bistro", "trattoria", "tavern", "eatery", "diner", "grill")) {
    if (has(c, "street", "market", "stall")) {
      return { group: "market", query: `${city} street food`, tryWiki: false };
    }
    const cuisine = category.replace(/restaurant|bistro|trattoria/i, "").trim();
    return {
      group: "restaurant",
      query: `${cuisine || category} restaurant food plated`,
      tryWiki: false,
    };
  }

  // Attractions — a real, specific photo is usually available.
  if (has(c, "museum")) return { group: "museum", query: `${name} ${city}`, tryWiki: true };
  if (has(c, "gallery", "art")) return { group: "museum", query: `${name} ${city}`, tryWiki: true };
  if (has(c, "park", "garden", "botanic")) return { group: "park", query: `${name} ${city} park`, tryWiki: true };
  if (has(c, "beach", "coast", "seaside")) return { group: "beach", query: `${name} ${city} beach`, tryWiki: true };
  if (has(c, "market", "bazaar")) return { group: "market", query: `${name} ${city} market`, tryWiki: true };
  if (has(c, "shop", "store", "boutique", "mall")) return { group: "shopping", query: `${name} ${city}`, tryWiki: false };
  if (has(c, "club", "nightlife", "live music", "theatre", "theater")) {
    return { group: "nightlife", query: `${name} ${city} nightlife`, tryWiki: true };
  }
  return { group: "landmark", query: `${name} ${city} landmark`, tryWiki: true };
}
