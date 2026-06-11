import { NextResponse } from "next/server";
import { getPlaces, isSupportedDestination } from "@/lib/mock-data";
import type { PlaceType } from "@/lib/types";

/**
 * GET /api/places?destination=paris&type=restaurant
 * Returns curated places for a destination, optionally filtered by type.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");
  const type = searchParams.get("type") as PlaceType | null;

  if (!destination) {
    return NextResponse.json(
      { error: "Missing required query param: destination" },
      { status: 400 },
    );
  }
  if (!isSupportedDestination(destination)) {
    return NextResponse.json(
      { error: `Unsupported destination: ${destination}` },
      { status: 404 },
    );
  }

  let places = getPlaces(destination);
  if (type) places = places.filter((p) => p.type === type);

  return NextResponse.json({ destination, count: places.length, places });
}
