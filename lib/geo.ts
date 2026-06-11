import type { Geo } from "@/lib/types";

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance between two coordinates, in kilometers. */
export function haversineKm(a: Geo, b: Geo): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Rough walking time in minutes (assumes ~4.8 km/h city pace). */
export function walkMinutes(km: number): number {
  return Math.round((km / 4.8) * 60);
}

/**
 * Realistic point-to-point travel minutes in a dense city: short hops are
 * walked, longer ones assume metro/taxi at a higher effective speed plus a
 * fixed access overhead.
 */
export function travelMinutes(a: Geo, b: Geo): number {
  const km = haversineKm(a, b);
  if (km <= 1.1) return Math.max(3, walkMinutes(km));
  // metro/taxi: ~18 km/h effective + ~6 min to get in/out of the system
  return Math.round((km / 18) * 60) + 6;
}

/** Centroid of a set of coordinates (simple average; fine at city scale). */
export function centroid(points: Geo[]): Geo {
  if (points.length === 0) return { latitude: 0, longitude: 0 };
  const sum = points.reduce(
    (acc, p) => ({
      latitude: acc.latitude + p.latitude,
      longitude: acc.longitude + p.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );
  return {
    latitude: sum.latitude / points.length,
    longitude: sum.longitude / points.length,
  };
}
