/**
 * Offline checks for the OSM transform/classification heuristics.
 * Run with: npx tsx scripts/check-osm.ts
 *
 * No network — feeds synthetic OSM elements through the same classifier and
 * transform used in production and asserts the derived fields are sane.
 */
import { classifyAttraction, classifyFood } from "@/lib/providers/osm/categories";
import {
  transformAttraction,
  transformFood,
  type OsmElement,
} from "@/lib/providers/osm/transform";

let failures = 0;
function check(name: string, cond: boolean) {
  if (!cond) {
    failures++;
    console.error(`  ✗ ${name}`);
  } else {
    console.log(`  ✓ ${name}`);
  }
}

// --- classification ---------------------------------------------------------
const museum = classifyAttraction({ tourism: "museum" });
check("museum → attraction type", museum?.type === "attraction");
check("museum → museums interest", !!museum?.interests.includes("museums"));

const park = classifyAttraction({ leisure: "park" });
check("park → nature interest", !!park?.interests.includes("nature"));

const cafe = classifyFood({ amenity: "cafe" });
check("cafe → cafe type", cafe?.type === "cafe");
check("cafe → cafe-culture tag", !!cafe?.foodTags?.includes("cafe-culture"));

const italian = classifyFood({ amenity: "restaurant", cuisine: "italian" });
check("cuisine refines category", italian?.category.includes("Italian") ?? false);

const halal = classifyFood({ amenity: "restaurant", "diet:halal": "yes" });
check("halal diet tag detected", !!halal?.foodTags?.includes("halal"));

const nonPlace = classifyFood({ amenity: "pharmacy" });
check("non-food amenity rejected", nonPlace === null);

// --- transform + heuristics -------------------------------------------------
const notableNode: OsmElement = {
  type: "node",
  id: 1,
  lat: 41.4,
  lon: 2.17,
  tags: { name: "Grand Museum", tourism: "museum", wikidata: "Q123" },
};
const notable = transformAttraction(notableNode, "barcelona", "Barcelona");
check("notable museum transforms", notable !== null);
check("notable rating in range", (notable?.rating ?? 0) >= 3.6 && (notable?.rating ?? 0) <= 4.9);

const chainNode: OsmElement = {
  type: "node",
  id: 2,
  lat: 41.4,
  lon: 2.17,
  tags: { name: "Burger Chain", amenity: "fast_food", brand: "BigBurger", "brand:wikidata": "Q9" },
};
const chain = transformFood(chainNode, "barcelona", "Barcelona");
check("chain transforms", chain !== null);
check(
  "chain less unique than notable",
  (chain?.uniqueness ?? 100) < (notable?.uniqueness ?? 0),
);
check(
  "chain higher trap risk than notable",
  (chain?.touristTrapRisk ?? 0) > (notable?.touristTrapRisk ?? 100),
);

const unnamed = transformFood(
  { type: "node", id: 3, lat: 41.4, lon: 2.17, tags: { amenity: "restaurant" } },
  "barcelona",
  "Barcelona",
);
check("unnamed place skipped", unnamed === null);

if (failures > 0) {
  console.error(`\n✗ ${failures} OSM check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ All OSM heuristic checks passed.");
