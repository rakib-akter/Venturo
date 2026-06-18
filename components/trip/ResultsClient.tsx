"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Map as MapIcon, BedDouble, Globe, Loader2 } from "lucide-react";
import type { CityTrip, Place } from "@/lib/types";
import { useTrip } from "@/lib/trip-store";
import { useMounted } from "@/lib/use-mounted";
import { useGeneratedTrip } from "@/lib/use-generated-trip";
import { useTripImages } from "@/lib/use-trip-images";
import { Bookmark } from "lucide-react";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TripSummary } from "@/components/trip/TripSummary";
import { NeighborhoodCard } from "@/components/trip/NeighborhoodCard";
import { PlaceCard } from "@/components/trip/PlaceCard";
import { ItineraryDay } from "@/components/trip/ItineraryDay";
import { ShareTripButton } from "@/components/trip/ShareTripButton";

type Tab = "overview" | "stay" | "do" | "eat" | "itinerary" | "saved";

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
  const mounted = useMounted();
  const state = useGeneratedTrip(stored);
  const images = useTripImages(state.status === "ready" ? state.trip : null);

  // Not-found (mounted, but no such trip in storage)
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

  // Error building a worldwide guide
  if (mounted && state.status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">
          Couldn&apos;t build this trip
        </h1>
        <p className="mt-2 text-muted-foreground">{state.error}</p>
        <Button asChild className="mt-6">
          <Link href="/plan">Try another city</Link>
        </Button>
      </div>
    );
  }

  // Loading (curated is instant; worldwide fetches live data)
  if (!mounted || state.status === "loading") {
    const city =
      stored?.preferences.displayCity ?? stored?.preferences.destination;
    const worldwide = stored?.preferences.source === "osm";
    return (
      <div className="mx-auto max-w-5xl space-y-5 px-6 py-8">
        {worldwide && city ? (
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-card">
            <Loader2 className="size-5 shrink-0 animate-spin text-primary" />
            <div>
              <p className="font-display font-semibold">
                Building your guide to {city}…
              </p>
              <p className="text-sm text-muted-foreground">
                Pulling sights, food, and neighbourhoods from OpenStreetMap. This
                can take a few seconds.
              </p>
            </div>
          </div>
        ) : null}
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

  if (state.status !== "ready" || !stored) return null;
  const generated = state.trip;

  const { destination, neighborhoods, attractions, food, itinerary, cityTrips } = generated;
  const isMultiCity = (cityTrips?.length ?? 0) >= 2;
  const savedSet = new Set(stored.savedPlaceIds);
  const placesById: Record<string, Place> = Object.fromEntries(
    [...attractions, ...food].map((p) => [p.id, p]),
  );

  const savedPlaces = [...attractions, ...food].filter((p) =>
    savedSet.has(p.id),
  );
  // Look up neighbourhoods from this trip's data (works for curated + OSM ids).
  const neighborhoodsById = Object.fromEntries(
    neighborhoods.map((n) => [n.id, n]),
  );
  // Map citySlug → CityTrip for quick lookup in itinerary day rendering.
  const cityTripBySlug: Record<string, CityTrip> = Object.fromEntries(
    (cityTrips ?? []).map((ct) => [ct.destination.slug, ct]),
  );

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "stay", label: "Where to stay", count: neighborhoods.length },
    { value: "do", label: "Attractions", count: attractions.length },
    { value: "eat", label: "Food", count: food.length },
    { value: "itinerary", label: "Itinerary", count: itinerary.length },
    { value: "saved", label: "Saved", count: savedSet.size },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-6">
      <TripSummary
        destination={destination}
        preferences={stored.preferences}
        summary={generated.summary}
        highlights={generated.highlights}
        imageUrl={images[`dest:${destination.slug}`]}
        cityTrips={cityTrips}
      />

      <div className="sticky top-16 z-20 -mx-6 mt-5 flex items-center gap-3 bg-background/80 px-6 py-3 backdrop-blur">
        <PillTabs
          tabs={tabs}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          className="flex-1"
        />
        <div className="hidden shrink-0 sm:block">
          <ShareTripButton
            title={
              isMultiCity
                ? `${cityTrips!.map((ct) => ct.destination.city).join(" → ")} · Venturo`
                : `${destination.city} trip · Venturo`
            }
          />
        </div>
      </div>

      <div className="mt-4 animate-fade-up">
        {tab === "overview" && (
          <div className="space-y-10">
            {isMultiCity ? (
              /* Multi-city overview: one highlight section per city */
              cityTrips!.map((ct) => (
                <section key={ct.destination.slug}>
                  <SectionTitle
                    title={ct.destination.city}
                    action={
                      <span className="text-sm text-muted-foreground">
                        {ct.nights} {ct.nights === 1 ? "night" : "nights"}
                      </span>
                    }
                  />
                  {ct.neighborhoods[0] ? (
                    <div className="mb-4">
                      <NeighborhoodCard
                        hood={ct.neighborhoods[0]}
                        rank={1}
                        imageUrl={images[ct.neighborhoods[0].id]}
                      />
                    </div>
                  ) : null}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ct.attractions.slice(0, 2).map((p, i) => (
                      <PlaceCard
                        key={p.id}
                        place={p}
                        tripId={tripId}
                        saved={savedSet.has(p.id)}
                        rank={i + 1}
                        imageUrl={images[p.id]}
                      />
                    ))}
                    {ct.food[0] ? (
                      <PlaceCard
                        key={ct.food[0].id}
                        place={ct.food[0]}
                        tripId={tripId}
                        saved={savedSet.has(ct.food[0].id)}
                        imageUrl={images[ct.food[0].id]}
                      />
                    ) : null}
                  </div>
                </section>
              ))
            ) : (
              /* Single-city overview */
              <>
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
                    <NeighborhoodCard
                      hood={neighborhoods[0]}
                      rank={1}
                      imageUrl={images[neighborhoods[0].id]}
                    />
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
                        imageUrl={images[p.id]}
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
                        imageUrl={images[p.id]}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

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
                      ? neighborhoodsById[itinerary[0].neighborhoodId]
                      : undefined
                  }
                  cityTrip={itinerary[0].citySlug ? cityTripBySlug[itinerary[0].citySlug] : undefined}
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
          <div className="space-y-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <BedDouble className="size-4" />
              Ranked for your priorities — transit, attractions, food, and safety.
            </p>
            {isMultiCity
              ? cityTrips!.map((ct) => (
                  <div key={ct.destination.slug} className="space-y-3">
                    <h3 className="font-display text-base font-semibold text-muted-foreground">
                      {ct.destination.city}
                    </h3>
                    {ct.neighborhoods.map((h, i) => (
                      <NeighborhoodCard
                        key={h.id}
                        hood={h}
                        rank={i + 1}
                        imageUrl={images[h.id]}
                      />
                    ))}
                  </div>
                ))
              : neighborhoods.map((h, i) => (
                  <NeighborhoodCard
                    key={h.id}
                    hood={h}
                    rank={i + 1}
                    imageUrl={images[h.id]}
                  />
                ))}
          </div>
        )}

        {tab === "do" && (
          isMultiCity ? (
            <div className="space-y-8">
              {cityTrips!.map((ct) => (
                <div key={ct.destination.slug}>
                  <h3 className="mb-3 font-display text-base font-semibold text-muted-foreground">
                    {ct.destination.city}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ct.attractions.map((p, i) => (
                      <PlaceCard
                        key={p.id}
                        place={p}
                        tripId={tripId}
                        saved={savedSet.has(p.id)}
                        rank={i + 1}
                        imageUrl={images[p.id]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attractions.map((p, i) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  tripId={tripId}
                  saved={savedSet.has(p.id)}
                  rank={i + 1}
                  imageUrl={images[p.id]}
                />
              ))}
            </div>
          )
        )}

        {tab === "eat" && (
          isMultiCity ? (
            <div className="space-y-8">
              {cityTrips!.map((ct) => (
                <div key={ct.destination.slug}>
                  <h3 className="mb-3 font-display text-base font-semibold text-muted-foreground">
                    {ct.destination.city}
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ct.food.map((p) => (
                      <PlaceCard
                        key={p.id}
                        place={p}
                        tripId={tripId}
                        saved={savedSet.has(p.id)}
                        imageUrl={images[p.id]}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {food.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  tripId={tripId}
                  saved={savedSet.has(p.id)}
                  imageUrl={images[p.id]}
                />
              ))}
            </div>
          )
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
                    ? neighborhoodsById[day.neighborhoodId]
                    : undefined
                }
                cityTrip={day.citySlug ? cityTripBySlug[day.citySlug] : undefined}
              />
            ))}
          </div>
        )}

        {tab === "saved" &&
          (savedPlaces.length === 0 ? (
            <EmptyState
              icon={Bookmark}
              title="Nothing saved yet"
              description="Tap the bookmark on any place to keep it here for quick access."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedPlaces.map((p) => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  tripId={tripId}
                  saved
                  imageUrl={images[p.id]}
                />
              ))}
            </div>
          ))}
      </div>

      {generated.attribution ? (
        <p className="mt-8 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Globe className="size-3.5" />
          Live data: {generated.attribution}
        </p>
      ) : null}
    </div>
  );
}
