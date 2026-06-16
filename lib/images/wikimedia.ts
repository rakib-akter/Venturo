import { getJson } from "@/lib/providers/http";

/**
 * Keyless real-photo lookups from Wikimedia / Wikipedia. These APIs are free,
 * require no key, and return openly-licensed imagery — a perfect fit for the
 * app's no-API-key ethos and its existing OSM (ODbL) data.
 *
 * Server-only. All calls are short, retried, and wrapped so a miss returns
 * `null` rather than throwing (imagery is best-effort, never trip-blocking).
 */

const COMMONS_FILEPATH = "https://commons.wikimedia.org/wiki/Special:FilePath";

/** Build a sized thumbnail URL for a Commons file name (handles redirects). */
function commonsThumb(fileName: string, width = 800): string {
  const clean = fileName.replace(/^File:/i, "").replace(/ /g, "_");
  return `${COMMONS_FILEPATH}/${encodeURIComponent(clean)}?width=${width}`;
}

interface WikidataEntities {
  entities?: Record<
    string,
    {
      claims?: {
        P18?: Array<{ mainsnak?: { datavalue?: { value?: string } } }>;
      };
    }
  >;
}

/** P18 (image) claim for a Wikidata Q-id → a Commons thumbnail URL. */
async function fromWikidata(qid: string): Promise<string | null> {
  const url =
    `https://www.wikidata.org/w/api.php?action=wbgetentities` +
    `&ids=${encodeURIComponent(qid)}&props=claims&format=json`;
  try {
    const data = await getJson<WikidataEntities>(url, { timeoutMs: 8000 });
    const file =
      data.entities?.[qid]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    return file ? commonsThumb(file) : null;
  } catch {
    return null;
  }
}

interface WikiQuery {
  query?: {
    pages?: Record<string, { thumbnail?: { source?: string } }>;
  };
}

function firstThumb(data: WikiQuery): string | null {
  const pages = data.query?.pages;
  if (!pages) return null;
  for (const key of Object.keys(pages)) {
    const src = pages[key]?.thumbnail?.source;
    if (src) return src;
  }
  return null;
}

/** Look up an exact article title on a given Wikipedia → lead image thumbnail. */
async function fromTitle(title: string, lang = "en"): Promise<string | null> {
  if (!title) return null;
  const url =
    `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageimages` +
    `&piprop=thumbnail&pithumbsize=800&redirects=1&format=json` +
    `&titles=${encodeURIComponent(title)}`;
  try {
    return firstThumb(await getJson<WikiQuery>(url, { timeoutMs: 8000 }));
  } catch {
    return null;
  }
}

/** A "lang:Title" Wikipedia tag → that article's lead image thumbnail. */
async function fromWikipediaTag(tag: string): Promise<string | null> {
  const [lang, ...rest] = tag.split(":");
  const title = rest.join(":");
  return fromTitle(title, lang || "en");
}

/** Full-text search English Wikipedia and take the top hit's lead image. */
async function fromWikipediaSearch(query: string): Promise<string | null> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&gsrnamespace=0` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=800&format=json`;
  try {
    return firstThumb(await getJson<WikiQuery>(url, { timeoutMs: 8000 }));
  } catch {
    return null;
  }
}

/**
 * Best-effort real photo for a notable place. Resolution order, most precise
 * first:
 *   1. Wikidata Q-id  (exact, from OSM tags)
 *   2. Wikipedia tag  (exact "lang:Title", from OSM tags)
 *   3. exact article title (e.g. "Eiffel Tower") — accurate and safe: an
 *      unknown name simply misses rather than matching the wrong article
 *   4. full-text search — last resort, only used for cities/areas where it's
 *      reliable (callers pass `searchQuery` selectively)
 *
 * Returns `null` when nothing is found, so callers can fall back to stock.
 */
export async function resolveWikimedia(opts: {
  wikidata?: string;
  wikipedia?: string;
  title?: string;
  searchQuery?: string;
}): Promise<string | null> {
  if (opts.wikidata) {
    const hit = await fromWikidata(opts.wikidata);
    if (hit) return hit;
  }
  if (opts.wikipedia) {
    const hit = await fromWikipediaTag(opts.wikipedia);
    if (hit) return hit;
  }
  if (opts.title) {
    const hit = await fromTitle(opts.title);
    if (hit) return hit;
  }
  if (opts.searchQuery) {
    return fromWikipediaSearch(opts.searchQuery);
  }
  return null;
}
