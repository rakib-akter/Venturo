import type { StockGroup } from "@/lib/images/keywords";

/**
 * Keyless fallback imagery. A small set of bundled, openly-licensed category
 * photos lives in /public/img/stock; we pick one deterministically so a place
 * always shows the same on-theme image even with no Pexels key and no network.
 *
 * Returning `null` for an empty group lets the card fall back to its gradient.
 */

const STOCK: Record<StockGroup, string[]> = {
  restaurant: ["restaurant.jpg"],
  cafe: ["cafe.jpg"],
  bar: ["bar.jpg"],
  hotel: ["hotel.jpg"],
  museum: ["museum.jpg"],
  park: ["park.jpg"],
  landmark: ["landmark.jpg"],
  market: ["market.jpg"],
  nightlife: ["nightlife.jpg"],
  shopping: ["shopping.jpg"],
  beach: ["beach.jpg"],
  city: ["city.jpg"],
};

function pick(seed: string, n: number): number {
  if (n <= 0) return 0;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % n;
}

/** A bundled, keyless stock photo path for a category group, or null. */
export function resolveStock(group: StockGroup, seed: string): string | null {
  const files = STOCK[group];
  if (!files || files.length === 0) return null;
  return `/img/stock/${files[pick(seed, files.length)]}`;
}
