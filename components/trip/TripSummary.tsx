import { CalendarRange, Users, Sparkles, Wallet, Globe } from "lucide-react";
import type { Destination, TripPreferences } from "@/lib/types";
import { cn, formatShortDate, tripDayCount } from "@/lib/utils";
import { optionLabel } from "@/lib/constants";
import { estimateTripCost, formatMoney } from "@/lib/cost";
import { Badge } from "@/components/ui/badge";

/** Hero summary banner at the top of the results dashboard. */
export function TripSummary({
  destination,
  preferences,
  summary,
  highlights,
  imageUrl,
}: {
  destination: Destination;
  preferences: TripPreferences;
  summary: string;
  highlights: string[];
  imageUrl?: string;
}) {
  const days = tripDayCount(preferences.startDate, preferences.endDate);
  const cost = estimateTripCost(preferences.budget, days, preferences.travelers);
  const onPhoto = Boolean(imageUrl ?? destination.imageUrl);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-6 shadow-card sm:p-8",
        destination.heroColor,
      )}
    >
      {onPhoto ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl ?? destination.imageUrl}
            alt={destination.city}
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/30" />
        </>
      ) : null}

      <div className="relative">
      <div className="absolute right-0 top-0 text-5xl opacity-80 drop-shadow">
        {destination.emoji}
      </div>

      <p
        className={cn(
          "text-sm font-medium",
          onPhoto ? "text-white/80" : "text-foreground/70",
        )}
      >
        {destination.country}
      </p>
      <h1
        className={cn(
          "font-display text-3xl font-bold sm:text-4xl",
          onPhoto && "text-white drop-shadow",
        )}
      >
        {destination.city}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="bg-card/80 backdrop-blur">
          <CalendarRange className="size-3" />
          {formatShortDate(preferences.startDate)} –{" "}
          {formatShortDate(preferences.endDate)} · {days} days
        </Badge>
        <Badge variant="outline" className="bg-card/80 backdrop-blur">
          <Users className="size-3" />
          {preferences.travelers}{" "}
          {preferences.travelers === 1 ? "traveler" : "travelers"}
        </Badge>
        <Badge variant="outline" className="bg-card/80 backdrop-blur">
          {optionLabel(preferences.budget)}
        </Badge>
        <Badge variant="outline" className="bg-card/80 backdrop-blur">
          {optionLabel(preferences.pace)}
        </Badge>
        <Badge variant="outline" className="bg-card/80 backdrop-blur">
          <Wallet className="size-3" />
          Est. {formatMoney(cost.low)}–{formatMoney(cost.high)}
        </Badge>
        {preferences.source === "osm" ? (
          <Badge variant="sky" className="gap-1 bg-card/80 backdrop-blur">
            <Globe className="size-3" /> Live data
          </Badge>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-4 max-w-2xl text-pretty",
          onPhoto ? "text-white/90" : "text-foreground/80",
        )}
      >
        {summary}
      </p>

      {highlights.length > 0 ? (
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {highlights.map((h) => (
            <li
              key={h}
              className={cn(
                "flex items-center gap-2 text-sm",
                onPhoto ? "text-white/90" : "text-foreground/90",
              )}
            >
              <Sparkles className="size-4 shrink-0 text-accent" />
              {h}
            </li>
          ))}
        </ul>
      ) : null}
      </div>
    </div>
  );
}
