"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import type { TripPreferences } from "@/lib/types";
import {
  BUDGETS,
  PACES,
  INTERESTS,
  FOOD_PREFERENCES,
  HOTEL_PRIORITIES,
} from "@/lib/constants";
import { useTripDraft } from "@/lib/trip-draft";
import { createTrip } from "@/lib/trip-store";
import { StepIndicator } from "@/components/trip/StepIndicator";
import { SegmentedCard } from "@/components/ui/segmented-card";
import { OptionChip } from "@/components/ui/option-chip";
import { Button } from "@/components/ui/button";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function PreferencesClient() {
  const router = useRouter();
  const {
    draft,
    setField,
    toggleInterest,
    toggleFood,
    toggleHotelPriority,
  } = useTripDraft();
  const [submitting, setSubmitting] = React.useState(false);

  // Guard: must have completed step 1 first.
  React.useEffect(() => {
    if (!draft.destination || !draft.startDate || !draft.endDate) {
      router.replace("/plan");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.destination, draft.startDate, draft.endDate]);

  function handleGenerate() {
    if (!draft.destination || !draft.startDate || !draft.endDate) return;
    setSubmitting(true);
    const prefs: TripPreferences = {
      destination: draft.destination,
      country: draft.country,
      startDate: draft.startDate,
      endDate: draft.endDate,
      travelers: draft.travelers ?? 2,
      budget: draft.budget ?? "mid-range",
      pace: draft.pace ?? "balanced",
      interests: draft.interests ?? [],
      foodPreferences: draft.foodPreferences ?? [],
      hotelPriorities: draft.hotelPriorities ?? [],
    };
    const id = createTrip(prefs);
    router.push(`/trips/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8">
      <StepIndicator current={2} />

      <header className="mt-8 text-center">
        <h1 className="font-display text-3xl font-semibold">Your travel style</h1>
        <p className="mt-1 text-muted-foreground">
          A few taps and we&apos;ll tailor every recommendation to you.
        </p>
      </header>

      <div className="mt-8 space-y-10">
        <Section title="Budget" hint="Sets the price level for hotels and food.">
          <SegmentedCard
            options={BUDGETS}
            value={draft.budget}
            onChange={(v) => setField("budget", v)}
          />
        </Section>

        <Section title="Travel pace" hint="How packed should each day feel?">
          <SegmentedCard
            options={PACES}
            value={draft.pace}
            onChange={(v) => setField("pace", v)}
          />
        </Section>

        <Section title="Interests" hint="Pick a few — we rank sights around these.">
          <div className="flex flex-wrap gap-2.5">
            {INTERESTS.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={(draft.interests ?? []).includes(opt.value)}
                onToggle={() => toggleInterest(opt.value)}
              />
            ))}
          </div>
        </Section>

        <Section title="Food preferences" hint="We'll match restaurants to your taste.">
          <div className="flex flex-wrap gap-2.5">
            {FOOD_PREFERENCES.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={(draft.foodPreferences ?? []).includes(opt.value)}
                onToggle={() => toggleFood(opt.value)}
              />
            ))}
          </div>
        </Section>

        <Section
          title="Hotel priorities"
          hint="What matters most for where you stay?"
        >
          <div className="flex flex-wrap gap-2.5">
            {HOTEL_PRIORITIES.map((opt) => (
              <OptionChip
                key={opt.value}
                label={opt.label}
                icon={opt.icon}
                selected={(draft.hotelPriorities ?? []).includes(opt.value)}
                onToggle={() => toggleHotelPriority(opt.value)}
              />
            ))}
          </div>
        </Section>
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/plan")}>
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button size="lg" onClick={handleGenerate} disabled={submitting}>
          {submitting ? (
            "Building your trip…"
          ) : (
            <>
              <Sparkles className="size-4" /> Generate my trip
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
