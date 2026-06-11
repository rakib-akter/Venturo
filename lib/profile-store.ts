"use client";

import * as React from "react";
import type { Budget, FoodPreference, TravelPace } from "@/lib/types";

/**
 * Local user profile (name + default preferences). Persisted to localStorage
 * for the MVP; maps onto the Supabase `users` row once auth is wired up.
 */
export interface Profile {
  fullName: string;
  email: string;
  defaultBudget: Budget;
  defaultTravelStyle: TravelPace;
  foodPreferences: FoodPreference[];
}

const KEY = "venturo.profile";
const EVENT = "venturo:profile-changed";

export const DEFAULT_PROFILE: Profile = {
  fullName: "",
  email: "",
  defaultBudget: "mid-range",
  defaultTravelStyle: "balanced",
  foodPreferences: [],
};

export function readProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function writeProfile(profile: Profile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(EVENT));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Live profile hook (same-tab + cross-tab sync). */
export function useProfile(): [Profile, (p: Profile) => void] {
  const [profile, setProfile] = React.useState<Profile>(DEFAULT_PROFILE);
  React.useEffect(() => {
    const sync = () => setProfile(readProfile());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return [profile, writeProfile];
}
