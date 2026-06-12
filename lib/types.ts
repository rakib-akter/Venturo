/**
 * Venturo domain types.
 *
 * These mirror the Supabase tables (see lib/supabase schema) but are kept
 * framework-agnostic so the mock-data layer, scoring engine, and UI can all
 * share one vocabulary. IDs are strings (uuid in the DB, slug in mock data).
 */

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type Budget = "budget" | "mid-range" | "luxury";

export type TravelPace = "relaxed" | "balanced" | "packed";

export type Interest =
  | "food"
  | "museums"
  | "nature"
  | "nightlife"
  | "shopping"
  | "history"
  | "beaches"
  | "architecture";

export type HotelPriority =
  | "metro"
  | "nightlife"
  | "safety"
  | "attractions"
  | "cheap"
  | "luxury";

export type PlaceType = "attraction" | "restaurant" | "cafe" | "bar" | "hotel-zone";

export type FoodPreference =
  | "local"
  | "vegetarian"
  | "vegan"
  | "seafood"
  | "street-food"
  | "fine-dining"
  | "halal"
  | "cafe-culture";

export type TimeOfDay = "morning" | "lunch" | "afternoon" | "dinner" | "evening";

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export interface Geo {
  latitude: number;
  longitude: number;
}

export interface Neighborhood {
  id: string;
  destination: string; // city slug, e.g. "paris"
  name: string;
  description: string;
  bestFor: string[];
  pros: string[];
  cons: string[];
  /** All sub-scores are normalized 0–100. */
  transitScore: number;
  attractionScore: number;
  foodScore: number;
  safetyScore: number;
  affordabilityScore: number;
  nightlifeScore: number;
  /** Indicative nightly hotel price level, 1 (cheap) – 4 (luxury). */
  priceLevel: number;
  center: Geo;
  /** Computed by the scoring engine; absent in raw mock data. */
  finalScore?: number;
}

export interface Place {
  id: string;
  destination: string;
  name: string;
  type: PlaceType;
  category: string; // "Museum", "Bistro", "Wine bar", ...
  description: string;
  /** Why this place fits a traveler — filled per-trip by the AI layer. */
  whyItFits?: string;
  address: string;
  neighborhoodId: string;
  geo: Geo;
  /** 1 (cheap) – 4 (luxury). */
  priceLevel: number;
  /** Editorial rating placeholder, 0–5. */
  rating: number;
  /** Minutes a typical visit takes. */
  estimatedDuration: number;
  bestTimeToVisit: TimeOfDay;
  interests: Interest[];
  foodTags?: FoodPreference[];
  /** 0–100; higher means more of a tourist trap (penalized in scoring). */
  touristTrapRisk: number;
  /** 0–100; how distinctive/local the experience is. */
  uniqueness: number;
  /** 0–100; raw popularity. */
  popularity: number;
  /** e.g. "09:00–18:00"; informational for itinerary sequencing. */
  openHours?: string;
  imageColor?: string; // tailwind gradient seed for the photo placeholder
}

export interface Destination {
  slug: string;
  city: string;
  country: string;
  tagline: string;
  description: string;
  center: Geo;
  /** Suggested trip length range, in days. */
  idealDays: [number, number];
  heroColor: string; // gradient seed
  emoji: string;
}

// ---------------------------------------------------------------------------
// Trip + itinerary
// ---------------------------------------------------------------------------

export interface TripPreferences {
  destination: string; // city slug
  country?: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  travelers: number;
  budget: Budget;
  pace: TravelPace;
  interests: Interest[];
  foodPreferences: FoodPreference[];
  hotelPriorities: HotelPriority[];
  // --- Worldwide (non-curated) destinations -----------------------------
  /** Pretty display name from the geocoder, e.g. "Barcelona". */
  displayCity?: string;
  /** ISO 3166-1 alpha-2 country code, for the flag emoji. */
  countryCode?: string;
  /** City center; present for OSM-sourced destinations so we can fetch POIs. */
  center?: Geo;
  /** Which data source backs this destination. Defaults to curated. */
  source?: "curated" | "osm";
}

export interface ItineraryItem {
  id: string;
  placeId: string;
  slot: TimeOfDay;
  startTime: string; // "09:30"
  endTime: string; // "11:00"
  notes?: string;
  orderIndex: number;
  /** Travel minutes from the previous stop on the same day. */
  travelMinutesFromPrev?: number;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  date?: string;
  title: string;
  summary: string;
  neighborhoodId?: string;
  items: ItineraryItem[];
}

export interface Trip {
  id: string;
  userId?: string;
  preferences: TripPreferences;
  createdAt: string;
}

/** The full generated plan returned by the AI layer for the results dashboard. */
export interface GeneratedTrip {
  trip: Trip;
  destination: Destination;
  summary: string;
  highlights: string[];
  neighborhoods: Neighborhood[]; // scored + sorted
  attractions: Place[]; // scored + sorted
  food: Place[]; // scored + sorted
  itinerary: ItineraryDay[];
  /** Which data source produced this trip. */
  source?: "curated" | "osm";
  /** Required attribution line for live-data (OSM) trips. */
  attribution?: string;
}

export interface SavedPlace {
  id: string;
  userId?: string;
  tripId?: string;
  placeId: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  defaultBudget: Budget;
  defaultTravelStyle: TravelPace;
  foodPreferences: FoodPreference[];
  createdAt: string;
}
