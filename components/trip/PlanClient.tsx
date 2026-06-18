"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarRange,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import type { CityLeg } from "@/lib/types";
import type { GeocodeResult } from "@/lib/providers/types";
import { DESTINATIONS } from "@/lib/mock-data";
import { useTripDraft } from "@/lib/trip-draft";
import { readProfile } from "@/lib/profile-store";
import { addDays, nightsBetween } from "@/lib/utils";
import { StepIndicator } from "@/components/trip/StepIndicator";
import { CityPickerInput } from "@/components/trip/CityPickerInput";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DraftLeg {
  geo: GeocodeResult | null;
  nights: number;
}

function legToGeo(leg: CityLeg): GeocodeResult {
  return {
    slug: leg.slug,
    city: leg.displayCity,
    country: leg.country ?? "",
    countryCode: leg.countryCode,
    center: leg.center ?? { latitude: 0, longitude: 0 },
    source: leg.source ?? "curated",
    curated: leg.source !== "osm",
    context: leg.country,
  };
}

export function PlanClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { draft, patch } = useTripDraft();

  // Local state for city legs (committed to draft on Continue).
  const [legs, setLegs] = React.useState<DraftLeg[]>(() => {
    if (draft.destinations && draft.destinations.length > 0) {
      return draft.destinations.map((l) => ({ geo: legToGeo(l), nights: l.nights }));
    }
    return [{ geo: null, nights: 3 }];
  });
  const [startDate, setStartDate] = React.useState(draft.startDate ?? "");

  // Seed from ?destination= or saved profile on first load.
  React.useEffect(() => {
    const slug = params.get("destination");
    if (slug && legs[0]?.geo === null) {
      const d = DESTINATIONS.find((x) => x.slug === slug);
      if (d) {
        const geo: GeocodeResult = {
          slug: d.slug,
          city: d.city,
          country: d.country,
          context: d.country,
          center: d.center,
          source: "curated",
          curated: true,
        };
        setLegs((prev) => [{ ...prev[0], geo }, ...prev.slice(1)]);
      }
    }
    if (!draft.budget && (draft.foodPreferences ?? []).length === 0) {
      const profile = readProfile();
      patch({
        budget: profile.defaultBudget,
        pace: profile.defaultTravelStyle,
        foodPreferences: profile.foodPreferences,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const totalNights = legs.reduce((s, l) => s + l.nights, 0);
  const completedLegs = legs.filter((l) => l.geo !== null);
  const canContinue =
    completedLegs.length > 0 &&
    completedLegs.length === legs.length &&
    Boolean(startDate);

  function updateLeg(index: number, updates: Partial<DraftLeg>) {
    setLegs((prev) =>
      prev.map((l, i) => (i === index ? { ...l, ...updates } : l)),
    );
  }

  function removeLeg(index: number) {
    setLegs((prev) => prev.filter((_, i) => i !== index));
  }

  function addLeg() {
    setLegs((prev) => [...prev, { geo: null, nights: 3 }]);
  }

  function handleContinue() {
    if (!canContinue || !startDate) return;

    const destinations: CityLeg[] = completedLegs.map((l) => ({
      slug: l.geo!.slug,
      displayCity: l.geo!.city,
      country: l.geo!.country,
      countryCode: l.geo!.countryCode,
      center: l.geo!.center,
      source: l.geo!.source,
      nights: l.nights,
    }));

    const endDate = addDays(startDate, totalNights);
    const first = destinations[0];

    patch({
      destinations,
      destination: first.slug,
      country: first.country,
      countryCode: first.countryCode,
      displayCity: first.displayCity,
      center: first.center,
      source: first.source,
      startDate,
      endDate,
    });
    router.push("/preferences");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <StepIndicator current={1} />

      <header className="mt-8 text-center">
        <h1 className="font-display text-3xl font-semibold">Where to?</h1>
        <p className="mt-1 text-muted-foreground">
          Add one city or build a multi-city journey — we&apos;ll plan it all.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {/* City legs */}
        <section className="space-y-3">
          <Label className="text-base">Cities</Label>
          <div className="space-y-3">
            {legs.map((leg, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* City picker */}
                <div className="flex-1">
                  <CityPickerInput
                    value={leg.geo}
                    onSelect={(r) => updateLeg(i, { geo: r })}
                    onClear={() => updateLeg(i, { geo: null })}
                    placeholder={
                      i === 0 ? "Search any city — Paris, Tokyo…" : "Add a city"
                    }
                    autoFocus={i > 0 && leg.geo === null}
                  />
                </div>

                {/* Nights stepper — only shown once a city is selected */}
                {leg.geo ? (
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">nights</span>
                    <NumberStepper
                      value={leg.nights}
                      onChange={(n) => updateLeg(i, { nights: n })}
                      min={1}
                      max={30}
                      ariaLabel={`nights in ${leg.geo.city}`}
                    />
                  </div>
                ) : null}

                {/* Remove button — only when >1 leg */}
                {legs.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeLeg(i)}
                    aria-label={`Remove ${leg.geo?.city ?? "city"}`}
                    className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {legs.length < 5 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-1 gap-1.5"
              onClick={addLeg}
            >
              <Plus className="size-4" /> Add another city
            </Button>
          ) : null}

          {totalNights > 0 && completedLegs.length === legs.length ? (
            <p className="text-sm text-muted-foreground">
              {completedLegs.length > 1
                ? `${completedLegs.map((l) => l.geo!.city).join(" → ")} · `
                : ""}
              {totalNights} {totalNights === 1 ? "night" : "nights"} total
            </p>
          ) : null}
        </section>

        {/* Start date */}
        <section className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <CalendarRange className="size-4 text-muted-foreground" /> Start date
          </Label>
          <div className="max-w-xs space-y-1.5">
            <Input
              id="start"
              type="date"
              min={todayISO()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            {startDate && totalNights > 0 ? (
              <p className="text-xs text-muted-foreground">
                Returning {addDays(startDate, totalNights)} · {totalNights + 1} days of planning
              </p>
            ) : null}
          </div>
        </section>

        {/* Travelers */}
        <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <Label className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" /> Travelers
          </Label>
          <NumberStepper
            value={draft.travelers ?? 2}
            onChange={(n) => patch({ travelers: n })}
            ariaLabel="travelers"
          />
        </section>
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
