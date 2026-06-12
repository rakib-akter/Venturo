import { OSM, TIMEOUT } from "@/lib/providers/config";
import { postJson } from "@/lib/providers/http";
import type { OsmElement } from "@/lib/providers/osm/transform";

interface OverpassResponse {
  elements?: OsmElement[];
  remark?: string;
}

/**
 * Run an Overpass query, trying mirrors in a rotated order. The `offset` lets
 * concurrent queries start on *different* mirrors so we never fire several
 * parallel requests at the same endpoint (which triggers throttling/timeouts).
 *
 * Throws if every mirror fails, so failed lookups are never cached.
 */
export async function runOverpassQuery(
  query: string,
  offset = 0,
): Promise<OsmElement[]> {
  const mirrors = OSM.overpassMirrors;
  let lastErr: unknown;
  for (let i = 0; i < mirrors.length; i++) {
    const endpoint = mirrors[(offset + i) % mirrors.length];
    try {
      const res = await postJson<OverpassResponse>(
        endpoint,
        query,
        TIMEOUT.overpass,
        0,
      );
      // A server-side timeout returns HTTP 200 with empty elements + a remark.
      if ((!res.elements || res.elements.length === 0) && res.remark) {
        throw new Error(`Overpass remark: ${res.remark}`);
      }
      return res.elements ?? [];
    } catch (err) {
      lastErr = err; // busy/slow/rate-limited mirror — rotate to the next
    }
  }
  throw lastErr ?? new Error("All Overpass mirrors failed");
}
