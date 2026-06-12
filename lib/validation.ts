import { z } from "zod";

/**
 * Zod schemas for API request validation. The `tripPreferencesSchema` is the
 * canonical contract for POST /api/generate-trip and mirrors TripPreferences.
 */

export const budgetSchema = z.enum(["budget", "mid-range", "luxury"]);
export const paceSchema = z.enum(["relaxed", "balanced", "packed"]);
export const interestSchema = z.enum([
  "food",
  "museums",
  "nature",
  "nightlife",
  "shopping",
  "history",
  "beaches",
  "architecture",
]);
export const foodPreferenceSchema = z.enum([
  "local",
  "vegetarian",
  "vegan",
  "seafood",
  "street-food",
  "fine-dining",
  "halal",
  "cafe-culture",
]);
export const hotelPrioritySchema = z.enum([
  "metro",
  "nightlife",
  "safety",
  "attractions",
  "cheap",
  "luxury",
]);

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

export const tripPreferencesSchema = z
  .object({
    destination: z.string().min(1),
    country: z.string().optional(),
    startDate: isoDate,
    endDate: isoDate,
    travelers: z.number().int().min(1).max(20),
    budget: budgetSchema,
    pace: paceSchema,
    interests: z.array(interestSchema).default([]),
    foodPreferences: z.array(foodPreferenceSchema).default([]),
    hotelPriorities: z.array(hotelPrioritySchema).default([]),
    // Worldwide (non-curated) destinations carry a geocoded center + source.
    displayCity: z.string().optional(),
    source: z.enum(["curated", "osm"]).optional(),
    center: z
      .object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
      .optional(),
  })
  .refine((p) => p.endDate >= p.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const savePlaceSchema = z.object({
  tripId: z.string().min(1),
  placeId: z.string().min(1),
});

export type TripPreferencesInput = z.infer<typeof tripPreferencesSchema>;
