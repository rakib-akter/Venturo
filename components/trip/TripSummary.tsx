import { CalendarRange, Users, Sparkles, Wallet } from "lucide-react";
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
}: {
  destination: Destination;
  preferences: TripPreferences;
  summary: string;
  highlights: string[];
}) {
  const days = tripDayCount(preferences.startDate, preferences.endDate);
  const cost = estimateTripCost(preferences.budget, days, preferences.travelers);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br p-6 shadow-card sm:p-8",
        destination.heroColor,
      )}
    >
      <div className="absolute right-5 top-5 text-5xl opacity-80">
        {destination.emoji}
      </div>

      <p className="text-sm font-medium text-foreground/70">
        {destination.country}
      </p>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
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
      </div>

      <p className="mt-4 max-w-2xl text-pretty text-foreground/80">{summary}</p>

      {highlights.length > 0 ? (
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {highlights.map((h) => (
            <li
              key={h}
              className="flex items-center gap-2 text-sm text-foreground/90"
            >
              <Sparkles className="size-4 shrink-0 text-accent" />
              {h}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
