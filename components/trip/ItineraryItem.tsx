import {
  Sunrise,
  Utensils,
  Sun,
  UtensilsCrossed,
  Moon,
  Footprints,
  Info,
} from "lucide-react";
import type { ItineraryItem as Item, Place, TimeOfDay } from "@/lib/types";
import { cn, priceLevelLabel } from "@/lib/utils";

const SLOT_META: Record<
  TimeOfDay,
  { icon: typeof Sun; ring: string; label: string }
> = {
  morning: { icon: Sunrise, ring: "bg-sky/20 text-sky-foreground", label: "Morning" },
  lunch: { icon: Utensils, ring: "bg-gold/20 text-foreground", label: "Lunch" },
  afternoon: { icon: Sun, ring: "bg-accent/15 text-accent", label: "Afternoon" },
  dinner: { icon: UtensilsCrossed, ring: "bg-emerald/15 text-emerald", label: "Dinner" },
  evening: { icon: Moon, ring: "bg-primary/10 text-primary", label: "Evening" },
};

/** One stop in a day's timeline. */
export function ItineraryItem({
  item,
  place,
  isLast,
}: {
  item: Item;
  place: Place;
  isLast?: boolean;
}) {
  const meta = SLOT_META[item.slot];
  const Icon = meta.icon;

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline rail */}
      {!isLast ? (
        <span className="absolute left-[19px] top-10 h-[calc(100%-2rem)] w-px bg-border" />
      ) : null}
      <span
        className={cn(
          "z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
          meta.ring,
        )}
      >
        <Icon className="size-5" />
      </span>

      <div className="flex-1 space-y-1">
        {item.travelMinutesFromPrev ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Footprints className="size-3.5" />
            {item.travelMinutesFromPrev} min to next stop
          </p>
        ) : null}
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {meta.label} · {item.startTime}–{item.endTime}
          </p>
          <span className="text-xs text-emerald">
            {priceLevelLabel(place.priceLevel)}
          </span>
        </div>
        <h4 className="font-display text-base font-semibold leading-tight">
          {place.name}
        </h4>
        <p className="text-sm text-muted-foreground">{place.category}</p>
        {item.notes ? (
          <p className="mt-1.5 inline-flex items-start gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs text-secondary-foreground">
            <Info className="mt-px size-3.5 shrink-0 text-accent" />
            {item.notes}
          </p>
        ) : null}
      </div>
    </li>
  );
}
