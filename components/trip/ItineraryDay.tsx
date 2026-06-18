import { MapPin } from "lucide-react";
import type {
  CityTrip,
  ItineraryDay as Day,
  Neighborhood,
  Place,
} from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItineraryItem } from "@/components/trip/ItineraryItem";

/** A single day card: header plus a vertical timeline of stops. */
export function ItineraryDay({
  day,
  placesById,
  neighborhood,
  cityTrip,
}: {
  day: Day;
  placesById: Record<string, Place>;
  neighborhood?: Neighborhood;
  cityTrip?: CityTrip;
}) {
  return (
    <Card className="p-5">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-semibold text-accent">
              Day {day.dayNumber}
            </p>
            {cityTrip ? (
              <Badge variant="muted" className="gap-1 text-xs">
                <span aria-hidden>{cityTrip.destination.emoji}</span>
                {cityTrip.destination.city}
              </Badge>
            ) : null}
          </div>
          <h3 className="font-display text-xl font-semibold leading-tight">
            {day.title.replace(/^Day \d+ · /, "")}
          </h3>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {day.summary}
          </p>
        </div>
        {neighborhood ? (
          <Badge variant="muted" className="gap-1">
            <MapPin className="size-3" />
            {neighborhood.name}
          </Badge>
        ) : null}
      </header>

      <ol className="ml-1">
        {day.items.map((item, i) => {
          const place = placesById[item.placeId];
          if (!place) return null;
          return (
            <ItineraryItem
              key={item.id}
              item={item}
              place={place}
              isLast={i === day.items.length - 1}
            />
          );
        })}
      </ol>
    </Card>
  );
}
