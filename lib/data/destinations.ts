import type { Destination } from "@/lib/types";

/**
 * Supported destinations for the MVP. Hardcoded per the "start simple" rule —
 * Paris, Rome, and Montreal — each with a city center used to seed map views
 * and distance-based scoring.
 */
export const DESTINATIONS: Destination[] = [
  {
    slug: "paris",
    city: "Paris",
    country: "France",
    tagline: "Boulevards, bistros, and timeless museums",
    description:
      "Wide Haussmann avenues, café terraces, and world-class art. Paris rewards slow mornings and long, well-fed walks between landmarks.",
    center: { latitude: 48.8566, longitude: 2.3522 },
    idealDays: [3, 6],
    heroColor: "from-sky-500/30 via-indigo-500/20 to-rose-400/20",
    emoji: "🗼",
  },
  {
    slug: "rome",
    city: "Rome",
    country: "Italy",
    tagline: "Ancient ruins, piazzas, and pasta worth the trip",
    description:
      "Three thousand years stacked on top of each other. Rome is an open-air museum where the best meals are often a few streets off the tourist trail.",
    center: { latitude: 41.9028, longitude: 12.4964 },
    idealDays: [3, 5],
    heroColor: "from-amber-500/30 via-orange-500/20 to-rose-500/20",
    emoji: "🏛️",
  },
  {
    slug: "montreal",
    city: "Montréal",
    country: "Canada",
    tagline: "Bilingual, bikeable, and seriously good at brunch",
    description:
      "European bones with North American ease. Montréal pairs cobblestone Old-Port charm with buzzing Plateau cafés, festivals, and a famous food scene.",
    center: { latitude: 45.5019, longitude: -73.5674 },
    idealDays: [2, 4],
    heroColor: "from-emerald-500/30 via-teal-500/20 to-sky-500/20",
    emoji: "🍁",
  },
];

export const DESTINATION_BY_SLUG: Record<string, Destination> =
  Object.fromEntries(DESTINATIONS.map((d) => [d.slug, d]));

export function getDestination(slug: string): Destination | undefined {
  return DESTINATION_BY_SLUG[slug.toLowerCase()];
}
