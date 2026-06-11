import type { Geo } from "@/lib/types";

export interface Projected {
  /** 0–100 horizontal position (% from left). */
  x: number;
  /** 0–100 vertical position (% from top, north-up). */
  y: number;
}

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/** Compute a padded bounding box around a set of coordinates. */
export function computeBounds(points: Geo[], padRatio = 0.15): Bounds {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
  }
  let minLat = Infinity,
    maxLat = -Infinity,
    minLng = Infinity,
    maxLng = -Infinity;
  for (const p of points) {
    minLat = Math.min(minLat, p.latitude);
    maxLat = Math.max(maxLat, p.latitude);
    minLng = Math.min(minLng, p.longitude);
    maxLng = Math.max(maxLng, p.longitude);
  }
  const latPad = Math.max((maxLat - minLat) * padRatio, 0.002);
  const lngPad = Math.max((maxLng - minLng) * padRatio, 0.002);
  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad,
  };
}

/** Project a coordinate into 0–100 x/y space within the given bounds. */
export function project(point: Geo, bounds: Bounds): Projected {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  const x = ((point.longitude - minLng) / (maxLng - minLng)) * 100;
  // invert latitude so north is at the top
  const y = ((maxLat - point.latitude) / (maxLat - minLat)) * 100;
  return {
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  };
}
