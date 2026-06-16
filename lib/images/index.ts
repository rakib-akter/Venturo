import type { PlaceType } from "@/lib/types";
import { cached } from "@/lib/providers/cache";
import { imageHintsForPlace, type StockGroup } from "@/lib/images/keywords";
import { resolveWikimedia } from "@/lib/images/wikimedia";
import { resolvePexels } from "@/lib/images/pexels";
import { resolveStock } from "@/lib/images/stock";

/**
 * Server-side image orchestration. Resolves a real photo for each requested
 * place / neighbourhood / destination using the hybrid strategy:
 *
 *   landmarks  → Wikimedia (keyless, a real specific photo)
 *   everything → Pexels by category (env-gated) → keyless bundled stock
 *
 * Results are cached aggressively (imagery changes rarely) and resolved in
 * bounded-concurrency batches so a results page costs one API round-trip.
 */

const TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
const CONCURRENCY = 6;

export interface ImageRequest {
  id: string;
  kind: "place" | "neighborhood" | "destination";
  name: string;
  city: string;
  type?: PlaceType;
  category?: string;
  wikidata?: string;
  wikipedia?: string;
}

async function tryChain(
  opts: {
    tryWiki: boolean;
    wikidata?: string;
    wikipedia?: string;
    /** Exact article title to try (accurate, safe on a miss). */
    title?: string;
    /** Full-text search — only reliable for cities/areas. */
    searchQuery?: string;
    /** Pexels query phrase. */
    pexelsQuery: string;
    group: StockGroup;
    seed: string;
  },
): Promise<string | null> {
  const { tryWiki, wikidata, wikipedia, title, searchQuery, pexelsQuery, group, seed } =
    opts;

  if (tryWiki) {
    const wiki = await resolveWikimedia({ wikidata, wikipedia, title, searchQuery });
    if (wiki) return wiki;
  } else if (wikidata || wikipedia) {
    const wiki = await resolveWikimedia({ wikidata, wikipedia });
    if (wiki) return wiki;
  }

  const pexels = await resolvePexels(pexelsQuery, seed);
  if (pexels) return pexels;

  return resolveStock(group, seed);
}

async function resolveOne(req: ImageRequest): Promise<string | null> {
  if (req.kind === "place") {
    const hints = imageHintsForPlace(
      req.type ?? "attraction",
      req.category ?? "",
      req.name,
      req.city,
    );
    return tryChain({
      tryWiki: hints.tryWiki,
      wikidata: req.wikidata,
      wikipedia: req.wikipedia,
      // Exact-title lookup only for notable attractions; named eateries skip it.
      title: hints.tryWiki ? req.name : undefined,
      pexelsQuery: hints.query,
      group: hints.group,
      seed: req.id,
    });
  }

  // Whole-city hero: the city article (exact title) has a recognisable lead image.
  if (req.kind === "destination") {
    return tryChain({
      tryWiki: true,
      title: req.name,
      searchQuery: `${req.name} skyline cityscape`,
      pexelsQuery: `${req.name} skyline cityscape`,
      group: "city",
      seed: req.id,
    });
  }

  // Neighbourhood: try its article, then a city-area search.
  return tryChain({
    tryWiki: true,
    title: req.name,
    searchQuery: `${req.name} ${req.city}`,
    pexelsQuery: `${req.city} ${req.name} street`,
    group: "city",
    seed: req.id,
  });
}

/** Resolve one image with caching keyed by identity + lookup hints. */
function resolveCached(req: ImageRequest): Promise<string | null> {
  const key = `img:${req.kind}:${req.id}:${req.wikidata ?? ""}:${req.wikipedia ?? ""}`;
  return cached(key, TTL, () => resolveOne(req));
}

/** Resolve a batch of image requests → a map of id → url (misses omitted). */
export async function resolveImages(
  requests: ImageRequest[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (let i = 0; i < requests.length; i += CONCURRENCY) {
    const slice = requests.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      slice.map(async (req) => [req.id, await resolveCached(req)] as const),
    );
    for (const [id, url] of results) {
      if (url) out[id] = url;
    }
  }
  return out;
}
