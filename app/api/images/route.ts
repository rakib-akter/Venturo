import { NextResponse } from "next/server";
import { resolveImages, type ImageRequest } from "@/lib/images";

/** Image lookups hit external APIs; keep them off the critical render path. */
export const maxDuration = 30;

const MAX_ITEMS = 150;
const KINDS = new Set(["place", "neighborhood", "destination"]);

/** Coerce untrusted input into a safe ImageRequest, or null to skip it. */
function parseItem(raw: unknown): ImageRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const kind = typeof r.kind === "string" ? r.kind : null;
  const name = typeof r.name === "string" ? r.name : "";
  if (!id || !kind || !KINDS.has(kind)) return null;
  return {
    id,
    kind: kind as ImageRequest["kind"],
    name: name.slice(0, 120),
    city: typeof r.city === "string" ? r.city.slice(0, 80) : "",
    type: typeof r.type === "string" ? (r.type as ImageRequest["type"]) : undefined,
    category: typeof r.category === "string" ? r.category.slice(0, 80) : undefined,
    wikidata: typeof r.wikidata === "string" ? r.wikidata.slice(0, 24) : undefined,
    wikipedia: typeof r.wikipedia === "string" ? r.wikipedia.slice(0, 160) : undefined,
  };
}

/**
 * POST /api/images
 * Body: { items: ImageRequest[] }. Returns { images: Record<id, url> } with
 * real photos resolved via the hybrid Wikimedia + Pexels + stock pipeline.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawItems = (body as { items?: unknown })?.items;
  if (!Array.isArray(rawItems)) {
    return NextResponse.json({ error: "Expected { items: [] }" }, { status: 422 });
  }

  const items = rawItems
    .slice(0, MAX_ITEMS)
    .map(parseItem)
    .filter((x): x is ImageRequest => x !== null);

  const images = await resolveImages(items);
  return NextResponse.json(
    { images },
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
