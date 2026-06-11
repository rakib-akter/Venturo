import { Check, X, BedDouble } from "lucide-react";
import type { Neighborhood } from "@/lib/types";
import { cn, priceLevelLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/trip/ScoreBadge";
import { ScoreBar } from "@/components/trip/ScoreBar";

/** A detailed, comparable neighborhood card for the "best areas to stay" view. */
export function NeighborhoodCard({
  hood,
  rank,
  className,
}: {
  hood: Neighborhood;
  rank?: number;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            {rank ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {rank}
              </span>
            ) : null}
            <h3 className="font-display text-lg font-semibold">{hood.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{hood.description}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {hood.bestFor.map((b) => (
              <Badge key={b} variant="secondary">
                {b}
              </Badge>
            ))}
          </div>
        </div>
        {typeof hood.finalScore === "number" ? (
          <ScoreBadge score={hood.finalScore} size="lg" showLabel />
        ) : null}
      </header>

      {/* Sub-scores */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
        <ScoreBar label="Transit" score={hood.transitScore} />
        <ScoreBar label="Attractions" score={hood.attractionScore} />
        <ScoreBar label="Food & nightlife" score={hood.foodScore} />
        <ScoreBar label="Safety & walkability" score={hood.safetyScore} />
      </div>

      {/* Pros & cons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ul className="space-y-1">
          {hood.pros.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {hood.cons.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <BedDouble className="size-4" />
          Typical hotel price
        </span>
        <span className="font-medium text-emerald">
          {priceLevelLabel(hood.priceLevel)}
        </span>
      </footer>
    </article>
  );
}
