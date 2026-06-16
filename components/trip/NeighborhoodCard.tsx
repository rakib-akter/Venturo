import { Check, X, BedDouble } from "lucide-react";
import type { Neighborhood } from "@/lib/types";
import { cn, priceLevelLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PhotoFrame } from "@/components/trip/PhotoFrame";
import { ScoreBadge } from "@/components/trip/ScoreBadge";
import { ScoreBar } from "@/components/trip/ScoreBar";

const HOOD_GRADIENT = "from-sky-400/40 to-indigo-500/40";

/** A detailed, comparable neighborhood card for the "best areas to stay" view. */
export function NeighborhoodCard({
  hood,
  rank,
  imageUrl,
  className,
}: {
  hood: Neighborhood;
  rank?: number;
  imageUrl?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover",
        className,
      )}
    >
      {/* Photo banner */}
      <PhotoFrame
        imageUrl={imageUrl ?? hood.imageUrl}
        gradient={HOOD_GRADIENT}
        alt={hood.name}
        className="flex h-32 flex-col justify-end p-4"
      >
        {rank ? (
          <span className="absolute left-4 top-4 z-10 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow">
            {rank}
          </span>
        ) : null}
        {typeof hood.finalScore === "number" ? (
          <div className="absolute right-3 top-3 z-10">
            <ScoreBadge score={hood.finalScore} size="lg" showLabel />
          </div>
        ) : null}
        <h3 className="relative font-display text-lg font-semibold text-white drop-shadow">
          {hood.name}
        </h3>
      </PhotoFrame>

      <div className="flex flex-col gap-4 p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{hood.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {hood.bestFor.map((b) => (
              <Badge key={b} variant="secondary">
                {b}
              </Badge>
            ))}
          </div>
        </div>

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
      </div>
    </article>
  );
}
