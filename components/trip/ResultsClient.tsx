"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Map as MapIcon, BedDouble } from "lucide-react";
import type { Place } from "@/lib/types";
import { generateTrip } from "@/lib/ai";
import { useTrip } from "@/lib/trip-store";
import { getNeighborhoodById } from "@/lib/mock-data";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TripSummary } from "@/components/trip/TripSummary";
import { NeighborhoodCard } from "@/components/trip/NeighborhoodCard";
import { PlaceCard } from "@/components/trip/PlaceCard";
import { ItineraryDay } from "@/components/trip/ItineraryDay";

type Tab = "overview" | "stay" | "do" | "eat" | "itinerary";

function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {action}
    </div>
  );
}

export function ResultsClient({ tripId }: { tripId: string }) {
  const stored = useTrip(tripId);
  const [tab, setTab] = React.useState<Tab>("overview");
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const generated = React.useMemo(() => {
    if (!stored) return null;
    const result = generateTrip(stored.preferences);
    return "error" in result ? null : result;
  }, [stored]);

  // Loading / not-found states
  if (!mounted || (!stored && !generated)) {
    if (mounted && !stored) {
      return (
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Trip not found</h1>
          <p className="mt-2 text-muted-foreground">
            This trip may have been cleared from your browser.
          </p>
          <Button asChild className="mt-6">
            <Link href="/plan">Plan a new trip</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-8">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!generated || !stored) return null;

  const { destination, neighborhoods, attractions, food, itinerary } = generated;
  const savedSet = new Set(stored.savedPlaceIds);
  const placesById: Record<string, Place> = Object.fromEntries(
    [...attractions, ...food].map((p) => [p.id, p]),
  );

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "stay", label: "Where to stay", count: neighborhoods.length },
    { value: "do", label: "Attractions", count: attractions.length },
    { value: "eat", label: "Food", count: food.length },
    { value: "itinerary", label: "Itinerary", count: itinerary.length },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <TripSummary
        destination={destination}
        preferences={stored.preferences}
        summary={generated.summary}
        highlights={generated.highlights}
      />

      <div className="sticky top-16 z-20 -mx-6 mt-5 bg-background/80 px-6 py-3 backdrop-blur">
        <PillTabs
          tabs={tabs}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
        />
      </div>

      <div className="mt-4 animate-fade-up">
        {tab === "overview" && (
          <div className="space-y-10">
            <section>
              <SectionTitle
                title="Best area to stay"
                action={
                  <Button variant="ghost" size="sm" onClick={() => setTab("stay")}>
                    Compare all <ArrowRight className="size-4" />
                  </Button>
                }
              />
              {neighborhoods[0] ? (
                <NeighborhoodCard hood={neighborhoods[0]} rank={1} />
              ) : null}
            </section>

            <section>
              <SectionTitle
                title="Top attractions"
                action={
                  <Button variant="ghost" size="sm" onClick={() => setTab("do")}>
                    See all <ArrowRight className="size-4" />
                  </Button>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {attractions.slice(0, 3).map((p, i) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    tripId={tripId}
                    saved={savedSet.has(p.id)}
                    rank={i + 1}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle
                title="Where to eat"
                action={
                  <Button variant="ghost" size="sm" onClick={() => setTab("eat")}>
                    See all <ArrowRight className="size-4" />
                  </Button>
                }
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {food.slice(0, 3).map((p) => (
                  <PlaceCard
                    key={p.id}
                    place={p}
                    tripId={tripId}
                    saved={savedSet.has(p.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <SectionTitle
                title="Your first day"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTab("itinerary")}
                  >
                    Full itinerary <ArrowRight className="size-4" />
                  </Button>
                }
              />
              {itinerary[0] ? (
                <ItineraryDay
                  day={itinerary[0]}
                  placesById={placesById}
                  neighborhood={
                    itinerary[0].neighborhoodId
                      ? getNeighborhoodById(itinerary[0].neighborhoodId)
                      : undefined
                  }
                />
              ) : null}
            </section>

            <Link
              href={`/map?trip=${tripId}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-sky/20 text-sky-foreground">
                  <MapIcon className="size-5" />
                </span>
                <div>
                  <p className="font-display font-semibold">See it on the map</p>
                  <p className="text-sm text-muted-foreground">
                    Attractions, food, and hotel zones in one view.
                  </p>
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
            </Link>
          </div>
        )}

        {tab === "stay" && (
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <BedDouble className="size-4" />
              Ranked for your priorities — transit, attractions, food, and safety.
            </p>
            {neighborhoods.map((h, i) => (
              <NeighborhoodCard key={h.id} hood={h} rank={i + 1} />
            ))}
          </div>
        )}

        {tab === "do" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {attractions.map((p, i) => (
              <PlaceCard
                key={p.id}
                place={p}
                tripId={tripId}
                saved={savedSet.has(p.id)}
                rank={i + 1}
              />
            ))}
          </div>
        )}

        {tab === "eat" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {food.map((p) => (
              <PlaceCard
                key={p.id}
                place={p}
                tripId={tripId}
                saved={savedSet.has(p.id)}
              />
            ))}
          </div>
        )}

        {tab === "itinerary" && (
          <div className="space-y-5">
            {itinerary.map((day) => (
              <ItineraryDay
                key={day.id}
                day={day}
                placesById={placesById}
                neighborhood={
                  day.neighborhoodId
                    ? getNeighborhoodById(day.neighborhoodId)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
