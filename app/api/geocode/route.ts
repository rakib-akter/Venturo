import { NextResponse } from "next/server";
import { searchCities } from "@/lib/providers/osm/nominatim";

/**
 * GET /api/geocode?q=barcelona
 * Worldwide city autocomplete via OpenStreetMap/Nominatim. Returns geocoded
 * candidates, flagging which ones have a curated Venturo guide.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ query: q, results: [] });
  }

  try {
    const results = await searchCities(q, 6);
    return NextResponse.json(
      { query: q, results },
      { headers: { "Cache-Control": "public, max-age=86400" } },
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Geocoding is temporarily unavailable.", detail: String(err) },
      { status: 502 },
    );
  }
}
