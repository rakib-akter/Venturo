"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, CalendarRange, Trash2 } from "lucide-react";
import type { StoredTrip } from "@/lib/trip-store";
import { deleteTrip } from "@/lib/trip-store";
import { getDestination } from "@/lib/data/destinations";
import { cn, formatShortDate, tripDayCount } from "@/lib/utils";
import { optionLabel } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

/** A saved-trip summary card for the trips list and map picker. */
export function TripCard({
  trip,
  href,
  onDelete,
  className,
}: {
  trip: StoredTrip;
  href?: string;
  onDelete?: boolean;
  className?: string;
}) {
  const dest = getDestination(trip.preferences.destination);
  const days = tripDayCount(
    trip.preferences.startDate,
    trip.preferences.endDate,
  );
  const link = href ?? `/trips/${trip.id}`;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      <Link href={link} className="flex flex-1 flex-col">
        <div
          className={cn(
            "flex h-28 items-end bg-gradient-to-br p-4",
            dest?.heroColor ?? "from-slate-300 to-slate-400",
          )}
        >
          <span className="absolute right-4 top-4 text-3xl">{dest?.emoji}</span>
          <div>
            <h3 className="font-display text-lg font-semibold">
              {dest?.city ?? trip.preferences.destination}
            </h3>
            <p className="text-sm text-foreground/70">{dest?.country}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarRange className="size-3.5" />
              {formatShortDate(trip.preferences.startDate)}–
              {formatShortDate(trip.preferences.endDate)}
            </span>
            <span>· {days} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {optionLabel(trip.preferences.budget)}
            </Badge>
            <Badge variant="muted" className="gap-1">
              <Bookmark className="size-3" />
              {trip.savedPlaceIds.length} saved
            </Badge>
          </div>
          <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
            Continue planning
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>

      {onDelete ? (
        <button
          type="button"
          aria-label="Delete trip"
          onClick={() => deleteTrip(trip.id)}
          className="absolute bottom-4 right-4 flex size-9 items-center justify-center rounded-full border border-border bg-card/90 text-muted-foreground backdrop-blur transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
