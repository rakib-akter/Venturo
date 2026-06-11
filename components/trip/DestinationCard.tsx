import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Large photographic-style destination card with a gradient hero. */
export function DestinationCard({
  destination,
  href,
  className,
}: {
  destination: Destination;
  href?: string;
  className?: string;
}) {
  const link = href ?? `/plan?destination=${destination.slug}`;
  return (
    <Link
      href={link}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-40 items-end bg-gradient-to-br p-4",
          destination.heroColor,
        )}
      >
        <span className="absolute right-4 top-4 text-4xl drop-shadow-sm">
          {destination.emoji}
        </span>
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">
            {destination.city}
          </h3>
          <p className="text-sm text-foreground/70">{destination.country}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm text-muted-foreground">{destination.tagline}</p>
        <div className="mt-auto flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {destination.idealDays[0]}–{destination.idealDays[1]} days
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-primary transition-transform group-hover:translate-x-0.5">
            Plan it <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
