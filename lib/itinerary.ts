import type {
  ItineraryDay,
  ItineraryItem,
  Place,
  TimeOfDay,
  TripPreferences,
} from "@/lib/types";
import { haversineKm, travelMinutes } from "@/lib/geo";
import { tripDayCount } from "@/lib/utils";

/**
 * Builds an optimized day-by-day itinerary from scored places.
 *
 * Strategy:
 *  - Activities per day scale with travel pace.
 *  - Each day is anchored by the best unused attraction, then greedily filled
 *    with the nearest unused attractions to minimize backtracking.
 *  - Meals are slotted near the day's geographic center, matching meal time.
 *  - Start times flow sequentially, accounting for visit + travel duration.
 */

interface SlotPlan {
  slot: TimeOfDay;
  kind: "activity" | "food";
}

function activitiesPerDay(pace: TripPreferences["pace"]): number {
  return pace === "relaxed" ? 2 : pace === "balanced" ? 3 : 4;
}

function dayPlan(
  pace: TripPreferences["pace"],
  wantsNightlife: boolean,
): SlotPlan[] {
  const acts = activitiesPerDay(pace);
  const plan: SlotPlan[] = [{ slot: "morning", kind: "activity" }];
  if (acts >= 4) plan.push({ slot: "morning", kind: "activity" });
  plan.push({ slot: "lunch", kind: "food" });
  plan.push({ slot: "afternoon", kind: "activity" });
  if (acts >= 3) plan.push({ slot: "afternoon", kind: "activity" });
  plan.push({ slot: "dinner", kind: "food" });
  if (wantsNightlife || pace === "packed") {
    plan.push({ slot: "evening", kind: "activity" });
  }
  return plan;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Contextual planning note derived from a place's attributes and slot. */
function noteFor(place: Place, slot: TimeOfDay): string | undefined {
  if (place.bestTimeToVisit === "evening" && slot === "evening")
    return "Best at sunset — arrive a little early.";
  if (place.popularity >= 95 && place.type === "attraction")
    return "Book a timed ticket in advance to skip the queue.";
  if (place.touristTrapRisk >= 45)
    return "Go early or late to dodge the worst crowds.";
  if (place.priceLevel >= 3 && place.type === "restaurant")
    return "Reserve ahead — this one books out.";
  if (place.category === "Bakery" || place.category === "Bagels")
    return "Grab it fresh and eat as you walk.";
  return undefined;
}

/** Pick the best unused food place near a point, preferring matching meal time. */
function pickFood(
  foods: Place[],
  used: Set<string>,
  near: Place | undefined,
  slot: TimeOfDay,
): Place | undefined {
  const candidates = foods.filter((f) => !used.has(f.id));
  if (candidates.length === 0) return undefined;
  const scored = candidates
    .map((f) => {
      const distKm = near ? haversineKm(f.geo, near.geo) : 0;
      const slotBonus = f.bestTimeToVisit === slot ? 1.5 : 0;
      // lower is better: distance penalty minus slot affinity
      return { f, cost: distKm - slotBonus };
    })
    .sort((a, b) => a.cost - b.cost);
  return scored[0]?.f;
}

export function buildItinerary(
  prefs: TripPreferences,
  rankedAttractions: Place[],
  rankedFood: Place[],
): ItineraryDay[] {
  const days = tripDayCount(prefs.startDate, prefs.endDate);
  const wantsNightlife = prefs.interests.includes("nightlife");
  const usedAttractions = new Set<string>();
  const usedFood = new Set<string>();
  const result: ItineraryDay[] = [];

  for (let d = 0; d < days; d++) {
    const plan = dayPlan(prefs.pace, wantsNightlife);
    const activitySlots = plan.filter((p) => p.kind === "activity").length;

    // --- choose the day's attractions: anchor + nearest neighbors ---
    const dayAttractions: Place[] = [];
    const anchor = rankedAttractions.find((a) => !usedAttractions.has(a.id));
    if (anchor) {
      dayAttractions.push(anchor);
      usedAttractions.add(anchor.id);
      let last = anchor;
      while (dayAttractions.length < activitySlots) {
        const next = rankedAttractions
          .filter((a) => !usedAttractions.has(a.id))
          .sort(
            (a, b) =>
              haversineKm(a.geo, last.geo) - haversineKm(b.geo, last.geo),
          )[0];
        if (!next) break;
        dayAttractions.push(next);
        usedAttractions.add(next.id);
        last = next;
      }
    }

    // --- assign places to slots and schedule times ---
    const items: ItineraryItem[] = [];
    let cursorMin = 9 * 60 + 30; // start the day at 09:30
    let prevPlace: Place | undefined;
    let actIndex = 0;
    let order = 0;

    for (const step of plan) {
      let place: Place | undefined;
      if (step.kind === "activity") {
        place = dayAttractions[actIndex];
        actIndex += 1;
      } else {
        place = pickFood(rankedFood, usedFood, prevPlace, step.slot);
        if (place) usedFood.add(place.id);
      }
      if (!place) continue;

      const travel = prevPlace ? travelMinutes(prevPlace.geo, place.geo) : 0;
      cursorMin += travel;
      // Meals get a comfortable fixed window; activities use their duration.
      const duration =
        step.kind === "food"
          ? Math.max(45, Math.min(90, place.estimatedDuration))
          : place.estimatedDuration;
      const startMin = cursorMin;
      const endMin = startMin + duration;
      cursorMin = endMin + 10; // small buffer between stops

      items.push({
        id: `${place.id}-d${d + 1}-${order}`,
        placeId: place.id,
        slot: step.slot,
        startTime: minutesToTime(startMin),
        endTime: minutesToTime(endMin),
        notes: noteFor(place, step.slot),
        orderIndex: order,
        travelMinutesFromPrev: prevPlace ? travel : undefined,
      });
      order += 1;
      prevPlace = place;
    }

    const neighborhoodId = dayAttractions[0]?.neighborhoodId;
    result.push({
      id: `day-${d + 1}`,
      dayNumber: d + 1,
      title: dayTitle(d, dayAttractions),
      summary: daySummary(dayAttractions, items.length),
      neighborhoodId,
      items,
    });
  }

  return result;
}

function dayTitle(index: number, attractions: Place[]): string {
  if (attractions.length === 0) return `Day ${index + 1}`;
  const lead = attractions[0];
  return `Day ${index + 1} · ${lead.name}`;
}

function daySummary(attractions: Place[], stopCount: number): string {
  if (attractions.length === 0) return "A flexible day to explore at your own pace.";
  const names = attractions.map((a) => a.name);
  const lead = names.slice(0, 2).join(" and ");
  return `${lead}, plus ${Math.max(0, stopCount - attractions.length)} food stops across ${stopCount} planned moments.`;
}
