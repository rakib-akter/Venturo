"use client";

import * as React from "react";
import Link from "next/link";
import { Luggage, Plus } from "lucide-react";
import { useTrips } from "@/lib/trip-store";
import { TripCard } from "@/components/trip/TripCard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export function TripsClient() {
  const trips = useTrips();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Your trips</h1>
          <p className="text-muted-foreground">
            Pick up where you left off, or start a new plan.
          </p>
        </div>
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/plan">
            <Plus className="size-4" /> New trip
          </Link>
        </Button>
      </header>

      {!mounted ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Luggage}
          title="No saved trips yet"
          description="Your generated trips show up here automatically."
          action={
            <Button asChild>
              <Link href="/plan">Plan my first trip</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete />
          ))}
        </div>
      )}
    </div>
  );
}
