"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Map as MapIcon } from "lucide-react";
import { generateTrip } from "@/lib/ai";
import { useTrip, useTrips } from "@/lib/trip-store";
import { useMounted } from "@/lib/use-mounted";
import { MapView } from "@/components/trip/MapView";
import { TripCard } from "@/components/trip/TripCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function MapClient() {
  const params = useSearchParams();
  const tripId = params.get("trip") ?? undefined;
  const trip = useTrip(tripId);
  const trips = useTrips();
  const mounted = useMounted();

  const generated = React.useMemo(() => {
    if (!trip) return null;
    const r = generateTrip(trip.preferences);
    return "error" in r ? null : r;
  }, [trip]);

  // A specific trip is selected → show its map.
  if (tripId) {
    if (!mounted) return <MapSkeleton />;
    if (!generated || !trip) {
      return (
        <EmptyState
          icon={MapIcon}
          title="Trip not found"
          description="We couldn't find that trip in this browser."
          action={
            <Button asChild>
              <Link href="/plan">Plan a trip</Link>
            </Button>
          }
        />
      );
    }
    return (
      <div className="mx-auto max-w-6xl px-6 py-6">
        <header className="mb-5">
          <h1 className="font-display text-2xl font-semibold">
            {generated.destination.city} map
          </h1>
          <p className="text-muted-foreground">
            Filter layers and tap a place to locate it.
          </p>
        </header>
        <MapView
          neighborhoods={generated.neighborhoods}
          attractions={generated.attractions}
          food={generated.food}
          savedPlaceIds={trip.savedPlaceIds}
        />
      </div>
    );
  }

  // No trip selected → pick one, or prompt to plan.
  if (!mounted) return <MapSkeleton />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-6">
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold">Map</h1>
        <p className="text-muted-foreground">
          Choose a trip to see everything laid out.
        </p>
      </header>
      {trips.length === 0 ? (
        <EmptyState
          icon={MapIcon}
          title="No trips yet"
          description="Plan a trip and you'll be able to explore it on the map."
          action={
            <Button asChild>
              <Link href="/plan">Plan my trip</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} href={`/map?trip=${t.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="mt-5 aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
