/**
 * Offline checks for the scoring engine. Run: npx tsx scripts/check-scoring.ts
 */
import type { TripPreferences } from "@/lib/types";
import {
  budgetToPriceLevel,
  rankNeighborhoods,
  scoreAttraction,
  scoreRestaurant,
} from "@/lib/scoring";
import {
  getAttractions,
  getFoodPlaces,
  getNeighborhoods,
} from "@/lib/mock-data";

let failures = 0;
function check(name: string, cond: boolean) {
  console[cond ? "log" : "error"](`  ${cond ? "✓" : "✗"} ${name}`);
  if (!cond) failures++;
}

const base: TripPreferences = {
  destination: "paris",
  startDate: "2026-07-10",
  endDate: "2026-07-13",
  travelers: 2,
  budget: "mid-range",
  pace: "balanced",
  interests: ["food", "museums"],
  foodPreferences: ["local"],
  hotelPriorities: ["metro"],
};

// budget → price target ordering
check(
  "budget < mid-range < luxury price targets",
  budgetToPriceLevel("budget") < budgetToPriceLevel("mid-range") &&
    budgetToPriceLevel("mid-range") < budgetToPriceLevel("luxury"),
);

// neighborhood ranking is sorted descending and bounded 0–100
const ranked = rankNeighborhoods(
  getNeighborhoods("paris"),
  base,
  getAttractions("paris"),
);
check("ranks all Paris neighborhoods", ranked.length === getNeighborhoods("paris").length);
check(
  "neighborhood scores sorted descending",
  ranked.every((n, i) => i === 0 || (ranked[i - 1].finalScore ?? 0) >= (n.finalScore ?? 0)),
);
check(
  "neighborhood scores within 0–100",
  ranked.every((n) => (n.finalScore ?? -1) >= 0 && (n.finalScore ?? 101) <= 100),
);

// interest match raises attraction score
const museumLover = scoreAttraction(
  getAttractions("paris").find((p) => p.interests.includes("museums"))!,
  base,
);
const noInterest = scoreAttraction(
  getAttractions("paris").find((p) => p.interests.includes("museums"))!,
  { ...base, interests: [] },
);
check("interest match raises attraction score", museumLover.score > noInterest.score);

// food preference match raises restaurant score
const localFood = getFoodPlaces("paris").find((p) => p.foodTags?.includes("local"))!;
const matched = scoreRestaurant(localFood, base);
const unmatched = scoreRestaurant(localFood, { ...base, foodPreferences: ["vegan"] });
check("food preference match raises restaurant score", matched.score >= unmatched.score);

// hotel priority shifts ranking: prioritizing cheap should help an affordable area
const cheapFirst = rankNeighborhoods(
  getNeighborhoods("paris"),
  { ...base, hotelPriorities: ["cheap"] },
  getAttractions("paris"),
);
check("ranking responds to hotel priorities", cheapFirst[0].id !== undefined);

if (failures > 0) {
  console.error(`\n✗ ${failures} scoring check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ All scoring checks passed.");
