"use client";

import * as React from "react";
import type {
  Budget,
  FoodPreference,
  HotelPriority,
  Interest,
  TravelPace,
  TripPreferences,
} from "@/lib/types";

/** The in-progress trip the user is assembling across the planning flow. */
export type TripDraft = Partial<TripPreferences>;

const STORAGE_KEY = "venturo.draft";

const DEFAULT_DRAFT: TripDraft = {
  travelers: 2,
  budget: "mid-range",
  pace: "balanced",
  interests: [],
  foodPreferences: [],
  hotelPriorities: [],
};

interface DraftContextValue {
  draft: TripDraft;
  setField: <K extends keyof TripPreferences>(
    key: K,
    value: TripPreferences[K],
  ) => void;
  patch: (partial: TripDraft) => void;
  toggleInterest: (value: Interest) => void;
  toggleFood: (value: FoodPreference) => void;
  toggleHotelPriority: (value: HotelPriority) => void;
  reset: () => void;
  /** True once the draft has the minimum needed to generate a trip. */
  isComplete: boolean;
}

const DraftContext = React.createContext<DraftContextValue | null>(null);

export function TripDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = React.useState<TripDraft>(DEFAULT_DRAFT);

  // Hydrate from sessionStorage on mount (client only).
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage hydration is client-only
      if (raw) setDraft({ ...DEFAULT_DRAFT, ...JSON.parse(raw) });
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  // Persist on every change.
  React.useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      /* storage may be unavailable */
    }
  }, [draft]);

  const setField = React.useCallback<DraftContextValue["setField"]>(
    (key, value) => setDraft((d) => ({ ...d, [key]: value })),
    [],
  );

  const patch = React.useCallback(
    (partial: TripDraft) => setDraft((d) => ({ ...d, ...partial })),
    [],
  );

  const toggleIn = React.useCallback(
    <K extends "interests" | "foodPreferences" | "hotelPriorities">(
      key: K,
      value: TripPreferences[K][number],
    ) =>
      setDraft((d) => {
        const list = (d[key] ?? []) as string[];
        const next = list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value];
        return { ...d, [key]: next };
      }),
    [],
  );

  const value: DraftContextValue = {
    draft,
    setField,
    patch,
    toggleInterest: (v) => toggleIn("interests", v),
    toggleFood: (v) => toggleIn("foodPreferences", v),
    toggleHotelPriority: (v) => toggleIn("hotelPriorities", v),
    reset: () => setDraft(DEFAULT_DRAFT),
    isComplete: Boolean(
      draft.destination && draft.startDate && draft.endDate && draft.budget,
    ),
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useTripDraft(): DraftContextValue {
  const ctx = React.useContext(DraftContext);
  if (!ctx) {
    throw new Error("useTripDraft must be used within a TripDraftProvider");
  }
  return ctx;
}

export type { Budget, TravelPace };
