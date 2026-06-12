"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CalendarRange, Users } from "lucide-react";
import { DESTINATIONS } from "@/lib/mock-data";
import { useTripDraft } from "@/lib/trip-draft";
import { readProfile } from "@/lib/profile-store";
import { nightsBetween } from "@/lib/utils";
import { StepIndicator } from "@/components/trip/StepIndicator";
import { DestinationSearch } from "@/components/trip/DestinationSearch";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PlanClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { draft, setField, patch } = useTripDraft();

  // Preselect a destination from ?destination= (landing-page links) and seed
  // budget/pace/food from the saved profile when the draft is still untouched.
  React.useEffect(() => {
    const slug = params.get("destination");
    if (slug && !draft.destination) {
      const d = DESTINATIONS.find((x) => x.slug === slug);
      if (d)
        patch({
          destination: d.slug,
          country: d.country,
          center: d.center,
          source: "curated",
          displayCity: d.city,
        });
    }
    if (!draft.destination && (draft.foodPreferences ?? []).length === 0) {
      const profile = readProfile();
      patch({
        budget: profile.defaultBudget,
        pace: profile.defaultTravelStyle,
        foodPreferences: profile.foodPreferences,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const nights = draft.startDate && draft.endDate
    ? nightsBetween(draft.startDate, draft.endDate)
    : 0;

  const datesValid =
    Boolean(draft.startDate && draft.endDate) && nights >= 1;
  const canContinue = Boolean(draft.destination) && datesValid;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <StepIndicator current={1} />

      <header className="mt-8 text-center">
        <h1 className="font-display text-3xl font-semibold">Where to?</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a city and your dates. We&apos;ll handle the rest.
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {/* Destination */}
        <section className="space-y-3">
          <Label className="text-base">Destination</Label>
          <DestinationSearch
            value={draft.destination}
            onSelect={(r) =>
              patch({
                destination: r.slug,
                country: r.country,
                center: r.center,
                source: r.source,
                displayCity: r.city,
              })
            }
          />
        </section>

        {/* Dates */}
        <section className="space-y-3">
          <Label className="flex items-center gap-2 text-base">
            <CalendarRange className="size-4 text-muted-foreground" /> Trip dates
          </Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="start" className="text-xs text-muted-foreground">
                Check-in
              </Label>
              <Input
                id="start"
                type="date"
                min={todayISO()}
                value={draft.startDate ?? ""}
                onChange={(e) => {
                  const start = e.target.value;
                  // keep end on/after start
                  const end =
                    draft.endDate && draft.endDate < start ? start : draft.endDate;
                  patch({ startDate: start, endDate: end });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end" className="text-xs text-muted-foreground">
                Check-out
              </Label>
              <Input
                id="end"
                type="date"
                min={draft.startDate ?? todayISO()}
                value={draft.endDate ?? ""}
                onChange={(e) => setField("endDate", e.target.value)}
              />
            </div>
          </div>
          {nights > 0 ? (
            <p className="text-sm text-muted-foreground">
              {nights} {nights === 1 ? "night" : "nights"} ·{" "}
              {nights + 1} days of planning
            </p>
          ) : null}
        </section>

        {/* Travelers */}
        <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <Label className="flex items-center gap-2 text-base">
            <Users className="size-4 text-muted-foreground" /> Travelers
          </Label>
          <NumberStepper
            value={draft.travelers ?? 2}
            onChange={(n) => setField("travelers", n)}
            ariaLabel="travelers"
          />
        </section>
      </div>

      <div className="mt-10 flex justify-end">
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={() => router.push("/preferences")}
        >
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
