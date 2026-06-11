import type {
  Budget,
  FoodPreference,
  HotelPriority,
  Interest,
  TravelPace,
} from "@/lib/types";

/**
 * UI-facing metadata for every preference option. Centralized so the
 * preferences form, summary chips, and score badges all read from one source.
 * `icon` values are lucide-react icon names resolved where they're rendered.
 */

export interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: string;
}

export const BUDGETS: Option<Budget>[] = [
  {
    value: "budget",
    label: "Budget",
    description: "Hostels, street food, free sights",
    icon: "PiggyBank",
  },
  {
    value: "mid-range",
    label: "Mid-range",
    description: "Comfortable hotels and sit-down meals",
    icon: "Wallet",
  },
  {
    value: "luxury",
    label: "Luxury",
    description: "Premium stays and standout dining",
    icon: "Gem",
  },
];

export const PACES: Option<TravelPace>[] = [
  {
    value: "relaxed",
    label: "Relaxed",
    description: "2–3 stops a day, lots of downtime",
    icon: "Coffee",
  },
  {
    value: "balanced",
    label: "Balanced",
    description: "A full but unhurried day",
    icon: "Scale",
  },
  {
    value: "packed",
    label: "Packed",
    description: "See as much as humanly possible",
    icon: "Zap",
  },
];

export const INTERESTS: Option<Interest>[] = [
  { value: "food", label: "Food", icon: "UtensilsCrossed" },
  { value: "museums", label: "Museums", icon: "Landmark" },
  { value: "nature", label: "Nature", icon: "Trees" },
  { value: "nightlife", label: "Nightlife", icon: "Wine" },
  { value: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { value: "history", label: "History", icon: "ScrollText" },
  { value: "beaches", label: "Beaches", icon: "Waves" },
  { value: "architecture", label: "Architecture", icon: "Building2" },
];

export const FOOD_PREFERENCES: Option<FoodPreference>[] = [
  { value: "local", label: "Local classics", icon: "MapPin" },
  { value: "street-food", label: "Street food", icon: "Sandwich" },
  { value: "cafe-culture", label: "Café culture", icon: "Coffee" },
  { value: "seafood", label: "Seafood", icon: "Fish" },
  { value: "vegetarian", label: "Vegetarian", icon: "Salad" },
  { value: "vegan", label: "Vegan", icon: "Sprout" },
  { value: "halal", label: "Halal", icon: "Moon" },
  { value: "fine-dining", label: "Fine dining", icon: "Utensils" },
];

export const HOTEL_PRIORITIES: Option<HotelPriority>[] = [
  {
    value: "metro",
    label: "Metro access",
    description: "Quick public-transit hops",
    icon: "TrainFront",
  },
  {
    value: "attractions",
    label: "Near attractions",
    description: "Walk to the big sights",
    icon: "Camera",
  },
  {
    value: "nightlife",
    label: "Nightlife",
    description: "Bars and energy at your doorstep",
    icon: "Wine",
  },
  {
    value: "safety",
    label: "Safety & walkability",
    description: "Calm, well-lit, easy on foot",
    icon: "ShieldCheck",
  },
  {
    value: "cheap",
    label: "Cheap stays",
    description: "Lowest nightly rates",
    icon: "PiggyBank",
  },
  {
    value: "luxury",
    label: "Luxury area",
    description: "Upscale streets and hotels",
    icon: "Gem",
  },
];

export const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  lunch: "Lunch",
  afternoon: "Afternoon",
  dinner: "Dinner",
  evening: "Evening",
};

/** Look up the display label for any option value across all option sets. */
const ALL_OPTIONS = [
  ...BUDGETS,
  ...PACES,
  ...INTERESTS,
  ...FOOD_PREFERENCES,
  ...HOTEL_PRIORITIES,
] as Option<string>[];

export function optionLabel(value: string): string {
  return ALL_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
