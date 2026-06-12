import { NextResponse } from "next/server";
import { DESTINATIONS } from "@/lib/mock-data";

/**
 * GET /api/destinations
 * Lists the hand-curated destinations. Any other city can still be planned via
 * the worldwide (OpenStreetMap) path — see /api/geocode and /api/generate-trip.
 */
export async function GET() {
  return NextResponse.json({
    count: DESTINATIONS.length,
    destinations: DESTINATIONS.map((d) => ({
      slug: d.slug,
      city: d.city,
      country: d.country,
      tagline: d.tagline,
      idealDays: d.idealDays,
    })),
  });
}
