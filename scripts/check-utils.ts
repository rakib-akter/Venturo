/**
 * Offline checks for pure helpers (utils + geo). Run: npx tsx scripts/check-utils.ts
 */
import {
  flagEmoji,
  slugify,
  nightsBetween,
  tripDayCount,
  priceLevelLabel,
  clamp,
} from "@/lib/utils";
import { haversineKm, travelMinutes } from "@/lib/geo";

let failures = 0;
function check(name: string, cond: boolean) {
  console[cond ? "log" : "error"](`  ${cond ? "✓" : "✗"} ${name}`);
  if (!cond) failures++;
}

// flagEmoji
check("flagEmoji('fr') is the French flag", flagEmoji("fr") === "🇫🇷");
check("flagEmoji(undefined) falls back to globe", flagEmoji(undefined) === "🌍");
check("flagEmoji('xyz') falls back to globe", flagEmoji("xyz") === "🌍");

// slugify
check("slugify('Montréal') → montreal", slugify("Montréal") === "montreal");
check("slugify('New York!') → new-york", slugify("New York!") === "new-york");

// dates
check("nightsBetween 10→13 = 3", nightsBetween("2026-07-10", "2026-07-13") === 3);
check("tripDayCount 10→13 = 4", tripDayCount("2026-07-10", "2026-07-13") === 4);
check("tripDayCount same day = 1", tripDayCount("2026-07-10", "2026-07-10") === 1);

// price + clamp
check("priceLevelLabel(3) = $$$", priceLevelLabel(3) === "$$$");
check("clamp keeps within range", clamp(150, 0, 100) === 100 && clamp(-5, 0, 100) === 0);

// geo
const a = { latitude: 41.9028, longitude: 12.4964 }; // Rome
const b = { latitude: 41.8902, longitude: 12.4922 }; // Colosseum (~1.4km)
check("haversine Rome→Colosseum ~1–2km", haversineKm(a, b) > 0.8 && haversineKm(a, b) < 2.5);
check("haversine is zero for same point", haversineKm(a, a) === 0);

// travel-time tiers: walk < transit < regional drive for growing distance
const near = { latitude: 41.9028, longitude: 12.4964 };
const mid = { latitude: 41.9100, longitude: 12.5100 }; // ~1.5km
const far = { latitude: 41.7000, longitude: 12.7000 }; // ~30km
check(
  "travelMinutes grows with distance",
  travelMinutes(near, near) < travelMinutes(near, mid) &&
    travelMinutes(near, mid) < travelMinutes(near, far),
);
check("regional drive is faster per-km than transit", travelMinutes(near, far) < 60);

if (failures > 0) {
  console.error(`\n✗ ${failures} util check(s) failed.`);
  process.exit(1);
}
console.log("\n✓ All util/geo checks passed.");
