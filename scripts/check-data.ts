/**
 * Data-integrity check for the curated dataset. Run with:
 *   npx tsx scripts/check-data.ts
 *
 * Verifies referential integrity and that every numeric field is in range, so
 * the scoring engine and map never receive malformed input. Exits non-zero on
 * any violation (usable as a CI gate).
 */
import { NEIGHBORHOODS, PLACES, DESTINATIONS } from "@/lib/mock-data";

const errors: string[] = [];

const destSlugs = new Set(DESTINATIONS.map((d) => d.slug));
const hoodIds = new Set(NEIGHBORHOODS.map((n) => n.id));

function inRange(v: number, lo: number, hi: number) {
  return v >= lo && v <= hi;
}

for (const n of NEIGHBORHOODS) {
  if (!destSlugs.has(n.destination))
    errors.push(`Neighborhood ${n.id}: unknown destination "${n.destination}"`);
  for (const [k, v] of Object.entries({
    transit: n.transitScore,
    attraction: n.attractionScore,
    food: n.foodScore,
    safety: n.safetyScore,
    affordability: n.affordabilityScore,
    nightlife: n.nightlifeScore,
  })) {
    if (!inRange(v, 0, 100)) errors.push(`Neighborhood ${n.id}: ${k}=${v} out of 0–100`);
  }
  if (!inRange(n.priceLevel, 1, 4))
    errors.push(`Neighborhood ${n.id}: priceLevel ${n.priceLevel} out of 1–4`);
}

for (const p of PLACES) {
  if (!destSlugs.has(p.destination))
    errors.push(`Place ${p.id}: unknown destination "${p.destination}"`);
  if (!hoodIds.has(p.neighborhoodId))
    errors.push(`Place ${p.id}: unknown neighborhoodId "${p.neighborhoodId}"`);
  if (!inRange(p.rating, 0, 5)) errors.push(`Place ${p.id}: rating ${p.rating} out of 0–5`);
  if (!inRange(p.priceLevel, 1, 4))
    errors.push(`Place ${p.id}: priceLevel ${p.priceLevel} out of 1–4`);
  if (!inRange(p.geo.latitude, -90, 90) || !inRange(p.geo.longitude, -180, 180))
    errors.push(`Place ${p.id}: coordinates out of range`);
}

const ids = PLACES.map((p) => p.id);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) errors.push(`Duplicate place ids: ${[...new Set(dupes)].join(", ")}`);

if (errors.length) {
  console.error(`✗ ${errors.length} data issue(s):`);
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}

console.log(
  `✓ Data OK — ${DESTINATIONS.length} destinations, ${NEIGHBORHOODS.length} neighborhoods, ${PLACES.length} places.`,
);
