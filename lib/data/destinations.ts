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
  {
    slug: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    tagline: "Canals, world-class art, and bikes everywhere",
    description:
      "A compact, walkable city of gabled houses and golden-age museums. Amsterdam rewards slow canal-side wandering between the Rijksmuseum and a brown café.",
    center: { latitude: 52.3676, longitude: 4.9041 },
    idealDays: [2, 4],
    heroColor: "from-orange-500/30 via-amber-500/20 to-sky-500/20",
    emoji: "🚲",
  },
  {
    slug: "london",
    city: "London",
    country: "United Kingdom",
    tagline: "Centuries of history, endless food, free museums",
    description:
      "Vast, layered, and endlessly varied. London pairs world-class (and often free) museums with markets, parks, and a neighbourhood for every mood.",
    center: { latitude: 51.5074, longitude: -0.1278 },
    idealDays: [3, 6],
    heroColor: "from-rose-500/25 via-indigo-500/20 to-sky-500/20",
    emoji: "🇬🇧",
  },
  {
    slug: "berlin",
    city: "Berlin",
    country: "Germany",
    tagline: "History, street art, and Europe's best nightlife",
    description:
      "Raw, creative, and steeped in 20th-century history. Berlin blends Museum Island grandeur with Kreuzberg street food and legendary clubs.",
    center: { latitude: 52.52, longitude: 13.405 },
    idealDays: [3, 5],
    heroColor: "from-amber-500/25 via-yellow-500/20 to-stone-500/20",
    emoji: "🐻",
  },
  {
    slug: "madrid",
    city: "Madrid",
    country: "Spain",
    tagline: "World-class art, late nights, and endless tapas",
    description:
      "Sunny, social, and proudly nocturnal. Madrid pairs the Prado's masterpieces with marathon tapas crawls and grand plazas.",
    center: { latitude: 40.4168, longitude: -3.7038 },
    idealDays: [2, 4],
    heroColor: "from-rose-500/25 via-amber-500/20 to-orange-500/20",
    emoji: "🇪🇸",
  },
  {
    slug: "vienna",
    city: "Vienna",
    country: "Austria",
    tagline: "Imperial palaces, grand cafés, and Klimt",
    description:
      "Elegant and unhurried. Vienna blends Habsburg grandeur with a coffee-house culture made for slow mornings and great cake.",
    center: { latitude: 48.2082, longitude: 16.3738 },
    idealDays: [2, 4],
    heroColor: "from-rose-500/25 via-amber-500/20 to-emerald-500/20",
    emoji: "🎻",
  },
  {
    slug: "florence",
    city: "Florence",
    country: "Italy",
    tagline: "The Renaissance, on foot and over Tuscan dinners",
    description:
      "A walkable open-air museum. Florence packs Botticelli and Michelangelo between artisan workshops and superb Tuscan trattorias.",
    center: { latitude: 43.7696, longitude: 11.2558 },
    idealDays: [2, 3],
    heroColor: "from-amber-500/30 via-orange-500/20 to-emerald-500/20",
    emoji: "🎨",
  },
  {
    slug: "puglia",
    city: "Puglia",
    country: "Italy",
    tagline: "Trulli, white towns, sea cliffs, and orecchiette",
    description:
      "The sun-baked heel of Italy — whitewashed hill-towns, UNESCO trulli, Adriatic and Ionian coves, and some of the country's best home cooking. A region made for a slow road trip between a couple of bases.",
    center: { latitude: 40.7560, longitude: 17.4100 },
    idealDays: [4, 7],
    heroColor: "from-sky-500/25 via-amber-500/20 to-emerald-500/20",
    emoji: "🫒",
  },
  {
    slug: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    tagline: "Hills, tiles, trams, and pastéis de nata",
    description:
      "Sun-washed and soulful, spread over seven hills above the Tagus. Lisbon pairs miradouro views and rattling trams with great seafood and fado.",
    center: { latitude: 38.7223, longitude: -9.1393 },
    idealDays: [3, 5],
    heroColor: "from-amber-500/25 via-rose-500/20 to-sky-500/20",
    emoji: "🚋",
  },
  {
    slug: "porto",
    city: "Porto",
    country: "Portugal",
    tagline: "Port wine, azulejos, and the Douro riverfront",
    description:
      "Atmospheric and compact, tumbling down to the Douro. Porto pairs tiled façades and a UNESCO riverfront with port cellars just across the bridge.",
    center: { latitude: 41.1579, longitude: -8.6291 },
    idealDays: [2, 4],
    heroColor: "from-rose-500/25 via-amber-500/20 to-indigo-500/20",
    emoji: "🍷",
  },
  {
    slug: "prague",
    city: "Prague",
    country: "Czechia",
    tagline: "Spires, the castle, and the world's best beer",
    description:
      "A storybook of Gothic and baroque spires straddling the Vltava. Prague pairs the castle and Charles Bridge with cheap, brilliant beer halls.",
    center: { latitude: 50.0755, longitude: 14.4378 },
    idealDays: [2, 4],
    heroColor: "from-amber-500/25 via-rose-500/20 to-slate-500/20",
    emoji: "🏰",
  },
  {
    slug: "seville",
    city: "Seville",
    country: "Spain",
    tagline: "Alcázar palaces, flamenco, and endless tapas",
    description:
      "Hot-blooded and beautiful, the soul of Andalucía. Seville pairs Mudéjar palaces and orange-tree patios with flamenco and a legendary tapas scene.",
    center: { latitude: 37.3891, longitude: -5.9845 },
    idealDays: [2, 4],
    heroColor: "from-orange-500/30 via-amber-500/20 to-rose-500/20",
    emoji: "💃",
  },
  {
    slug: "venice",
    city: "Venice",
    country: "Italy",
    tagline: "Canals, cicchetti, and impossible beauty",
    description:
      "A city on water unlike anywhere else. Venice pairs St Mark's grandeur and the Grand Canal with quiet back-canal bacari and morning markets.",
    center: { latitude: 45.4408, longitude: 12.3155 },
    idealDays: [2, 3],
    heroColor: "from-sky-500/25 via-emerald-500/20 to-amber-500/20",
    emoji: "🛶",
  },
  {
    slug: "dublin",
    city: "Dublin",
    country: "Ireland",
    tagline: "Georgian streets, great museums, and proper pubs",
    description:
      "Compact, literary, and famously warm. Dublin pairs Trinity's treasures and free museums with trad-music sessions and a perfect pint of Guinness.",
    center: { latitude: 53.3498, longitude: -6.2603 },
    idealDays: [2, 3],
    heroColor: "from-emerald-500/30 via-teal-500/20 to-amber-500/20",
    emoji: "🍀",
  },
  {
    slug: "edinburgh",
    city: "Edinburgh",
    country: "United Kingdom",
    tagline: "A castle on a crag, closes, and crags to climb",
    description:
      "Dramatic and atmospheric, built on volcanic hills. Edinburgh pairs its clifftop castle and medieval Old Town with Georgian elegance and wild views.",
    center: { latitude: 55.9533, longitude: -3.1883 },
    idealDays: [2, 3],
    heroColor: "from-slate-500/25 via-indigo-500/20 to-emerald-500/20",
    emoji: "🏴",
  },
  {
    slug: "budapest",
    city: "Budapest",
    country: "Hungary",
    tagline: "Thermal baths, ruin bars, and Danube grandeur",
    description:
      "Grand and gritty across the Danube. Budapest pairs Parliament and Castle Hill with steaming thermal baths and the famous ruin-bar nightlife.",
    center: { latitude: 47.4979, longitude: 19.0402 },
    idealDays: [2, 4],
    heroColor: "from-amber-500/25 via-emerald-500/20 to-sky-500/20",
    emoji: "🛁",
  },
  {
    slug: "copenhagen",
    city: "Copenhagen",
    country: "Denmark",
    tagline: "Bikes, harbours, hygge, and New Nordic food",
    description:
      "Effortlessly cool and bike-friendly. Copenhagen pairs Nyhavn's painted harbour and Tivoli with a world-leading food scene and design at every turn.",
    center: { latitude: 55.6761, longitude: 12.5683 },
    idealDays: [2, 4],
    heroColor: "from-sky-500/25 via-rose-500/20 to-emerald-500/20",
    emoji: "🚲",
  },
];

export const DESTINATION_BY_SLUG: Record<string, Destination> =
  Object.fromEntries(DESTINATIONS.map((d) => [d.slug, d]));

export function getDestination(slug: string): Destination | undefined {
  return DESTINATION_BY_SLUG[slug.toLowerCase()];
}
