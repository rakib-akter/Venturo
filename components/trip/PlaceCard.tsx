import { Clock, Star } from "lucide-react";
import type { Place } from "@/lib/types";
import { cn, priceLevelLabel } from "@/lib/utils";
import { TIME_SLOT_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { PhotoFrame } from "@/components/trip/PhotoFrame";
import { SavePlaceButton } from "@/components/trip/SavePlaceButton";

/** A rich place card for attractions, restaurants, and cafés. */
export function PlaceCard({
  place,
  tripId,
  saved = false,
  rank,
  imageUrl,
  className,
}: {
  place: Place;
  tripId?: string;
  saved?: boolean;
  rank?: number;
  imageUrl?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Photo */}
      <PhotoFrame
        imageUrl={imageUrl ?? place.imageUrl}
        gradient={place.imageColor}
        alt={place.name}
        className="flex h-36 items-start justify-between p-3"
      >
        <div className="relative flex flex-wrap gap-1.5">
          <Badge variant="outline" className="bg-card/90 backdrop-blur">
            {place.category}
          </Badge>
          {place.touristTrapRisk <= 12 ? (
            <Badge variant="emerald" className="bg-card/90 backdrop-blur">
              Local gem
            </Badge>
          ) : null}
        </div>
        {rank ? (
          <span className="relative flex size-7 items-center justify-center rounded-full bg-primary/90 text-xs font-semibold text-primary-foreground backdrop-blur">
            {rank}
          </span>
        ) : null}
        {tripId ? (
          <div className="absolute bottom-3 right-3 z-10">
            <SavePlaceButton tripId={tripId} placeId={place.id} saved={saved} />
          </div>
        ) : null}
      </PhotoFrame>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight">
            {place.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="size-3.5 fill-gold text-gold" />
            {place.rating.toFixed(1)}
          </span>
        </div>

        {place.whyItFits ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {place.whyItFits}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {place.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          <span className="font-medium text-emerald">
            {priceLevelLabel(place.priceLevel)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            Best {TIME_SLOT_LABELS[place.bestTimeToVisit].toLowerCase()}
          </span>
        </div>
      </div>
    </article>
  );
}
