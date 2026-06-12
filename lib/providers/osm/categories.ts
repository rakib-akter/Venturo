import type {
  FoodPreference,
  Interest,
  PlaceType,
  TimeOfDay,
} from "@/lib/types";

/** Flat string map of OSM tags for one element. */
export type OsmTags = Record<string, string>;

export interface Classification {
  type: PlaceType;
  category: string;
  interests: Interest[];
  foodTags?: FoodPreference[];
  /** Typical visit length in minutes. */
  duration: number;
  bestTime: TimeOfDay;
  /** 1–4 indicative price level. */
  priceLevel: number;
}

/** Title-case an OSM enum value: "theme_park" → "Theme Park". */
function titleize(value: string): string {
  return value
    .split(/[_:]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Attractions
// ---------------------------------------------------------------------------

const TOURISM_CATEGORY: Record<
  string,
  { label: string; interests: Interest[]; duration: number; time: TimeOfDay; price: number }
> = {
  museum: { label: "Museum", interests: ["museums", "history"], duration: 120, time: "afternoon", price: 2 },
  gallery: { label: "Art gallery", interests: ["museums", "architecture"], duration: 90, time: "afternoon", price: 2 },
  artwork: { label: "Public art", interests: ["architecture"], duration: 20, time: "afternoon", price: 1 },
  viewpoint: { label: "Viewpoint", interests: ["nature", "architecture"], duration: 30, time: "evening", price: 1 },
  attraction: { label: "Attraction", interests: ["history", "architecture"], duration: 60, time: "afternoon", price: 1 },
  theme_park: { label: "Theme park", interests: ["nature"], duration: 240, time: "morning", price: 3 },
  zoo: { label: "Zoo", interests: ["nature"], duration: 150, time: "morning", price: 2 },
  aquarium: { label: "Aquarium", interests: ["nature"], duration: 120, time: "afternoon", price: 2 },
};

const HISTORIC_CATEGORY: Record<string, { label: string; duration: number }> = {
  monument: { label: "Monument", duration: 30 },
  memorial: { label: "Memorial", duration: 25 },
  castle: { label: "Castle", duration: 90 },
  fort: { label: "Fortress", duration: 75 },
  ruins: { label: "Ruins", duration: 60 },
  archaeological_site: { label: "Archaeological site", duration: 75 },
  city_gate: { label: "Historic gate", duration: 20 },
  church: { label: "Historic church", duration: 40 },
};

export function classifyAttraction(tags: OsmTags): Classification | null {
  if (tags.tourism && TOURISM_CATEGORY[tags.tourism]) {
    const c = TOURISM_CATEGORY[tags.tourism];
    return {
      type: "attraction",
      category: c.label,
      interests: c.interests,
      duration: c.duration,
      bestTime: c.time,
      priceLevel: c.price,
    };
  }
  if (tags.historic && HISTORIC_CATEGORY[tags.historic]) {
    const c = HISTORIC_CATEGORY[tags.historic];
    return {
      type: "attraction",
      category: c.label,
      interests: ["history", "architecture"],
      duration: c.duration,
      bestTime: "afternoon",
      priceLevel: 1,
    };
  }
  if (tags.leisure === "park" || tags.leisure === "garden") {
    return {
      type: "attraction",
      category: tags.leisure === "garden" ? "Garden" : "Park",
      interests: ["nature"],
      duration: 60,
      bestTime: "afternoon",
      priceLevel: 1,
    };
  }
  if (tags.amenity === "place_of_worship") {
    return {
      type: "attraction",
      category: titleize(tags.religion ? `${tags.religion} site` : "Place of worship"),
      interests: ["history", "architecture"],
      duration: 35,
      bestTime: "morning",
      priceLevel: 1,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Food & drink
// ---------------------------------------------------------------------------

const AMENITY_FOOD: Record<
  string,
  { type: PlaceType; label: string; duration: number; time: TimeOfDay; price: number; nightlife?: boolean }
> = {
  restaurant: { type: "restaurant", label: "Restaurant", duration: 80, time: "dinner", price: 2 },
  cafe: { type: "cafe", label: "Café", duration: 35, time: "morning", price: 1 },
  bar: { type: "bar", label: "Bar", duration: 75, time: "evening", price: 2, nightlife: true },
  pub: { type: "bar", label: "Pub", duration: 75, time: "evening", price: 2, nightlife: true },
  biergarten: { type: "bar", label: "Beer garden", duration: 90, time: "evening", price: 2, nightlife: true },
  ice_cream: { type: "cafe", label: "Gelato & ice cream", duration: 20, time: "afternoon", price: 1 },
  fast_food: { type: "restaurant", label: "Street food", duration: 25, time: "lunch", price: 1 },
};

export function classifyFood(tags: OsmTags): Classification | null {
  let base = tags.amenity ? AMENITY_FOOD[tags.amenity] : undefined;
  if (!base && tags.shop === "bakery") {
    base = { type: "cafe", label: "Bakery", duration: 20, time: "morning", price: 1 };
  }
  if (!base) return null;

  const interests: Interest[] = ["food"];
  if (base.nightlife) interests.push("nightlife");

  // Cuisine refines the category label, e.g. "Italian restaurant".
  const cuisine = tags.cuisine?.split(/[;,]/)[0];
  const category = cuisine
    ? `${titleize(cuisine)} ${base.label.toLowerCase()}`
    : base.label;

  return {
    type: base.type,
    category,
    interests,
    foodTags: foodTagsFor(tags, base.type),
    duration: base.duration,
    bestTime: base.time,
    priceLevel: priceFromTags(tags, base.price),
  };
}

function foodTagsFor(tags: OsmTags, type: PlaceType): FoodPreference[] {
  const out = new Set<FoodPreference>();
  if (type === "cafe") out.add("cafe-culture");
  if (tags.amenity === "fast_food" || tags.shop === "bakery") out.add("street-food");
  if (tags["diet:vegetarian"] === "yes" || tags.cuisine?.includes("vegetarian"))
    out.add("vegetarian");
  if (tags["diet:vegan"] === "yes" || tags.cuisine?.includes("vegan"))
    out.add("vegan");
  if (tags["diet:halal"] === "yes") out.add("halal");
  const c = tags.cuisine ?? "";
  if (/seafood|fish/.test(c)) out.add("seafood");
  if (/fine_dining/.test(c)) out.add("fine-dining");
  out.add("local");
  return [...out];
}

function priceFromTags(tags: OsmTags, fallback: number): number {
  // Some venues tag a price range; otherwise use the category default.
  const pr = tags.price_range ?? tags.price ?? "";
  const dollars = (pr.match(/\$/g) ?? []).length;
  if (dollars >= 1) return Math.min(4, dollars);
  if (tags.cuisine?.includes("fine_dining")) return 4;
  return fallback;
}
