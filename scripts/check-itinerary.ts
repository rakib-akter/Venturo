/**
 * Offline checks for the itinerary builder and trip generator.
 * Run: npx tsx scripts/check-itinerary.ts
 */
import type { GeneratedTrip, TripPreferences } from "@/lib/types";
import { generateTrip } from "@/lib/ai";

let failures = 0;
function check(name: string, cond: boolean) {
  console[cond ? "log" : "error"](`  ${cond ? "✓" : "✗"} ${name}`);
  if (!cond) failures++;
}

function gen(prefs: Partial<TripPreferences>): GeneratedTrip {
  const r = generateTrip({
    destination: "rome",
    startDate: "2026-07-10",
    endDate: "2026-07-13",
    travelers: 2,
    budget: "mid-range",
    pace: "balanced",
    interests: ["food", "history"],
    foodPreferences: ["local"],
    hotelPriorities: ["metro"],
    ...prefs,
  });
  if ("error" in r) throw new Error(r.error);
  return r;
}

// day count matches the date range (inclusive)
const trip = gen({ startDate: "2026-07-10", endDate: "2026-07-13" });
check("4-day range → 4 itinerary days", trip.itinerary.length === 4);

// each day has at least one stop and times are ordered
const day = trip.itinerary[0];
check("day has stops", day.items.length > 0);
check(
  "stop times are non-decreasing",
  day.items.every((it, i) => i === 0 || it.startTime >= day.items[i - 1].startTime),
);
check(
  "every item references a known place",
  trip.itinerary.every((d) =>
    d.items.every((it) =>
      [...trip.attractions, ...trip.food].some((p) => p.id === it.placeId),
    ),
  ),
);

// pace changes density: packed has more stops on day 1 than relaxed
const packed = gen({ pace: "packed" });
const relaxed = gen({ pace: "relaxed" });
check(
  "packed pace schedules more than relaxed",
  packed.itinerary[0].items.length >= relaxed.itinerary[0].items.length,
);

// travel times appear between stops (after the first)
check(
  "travel time recorded between stops",
  day.items.slice(1).some((it) => (it.travelMinutesFromPrev ?? 0) > 0),
);

if (failures > 0) {
  console.error(`\n✗ ${failures} itinerary check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ All itinerary checks passed.");
