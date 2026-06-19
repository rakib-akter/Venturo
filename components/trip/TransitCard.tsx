"use client";

import * as React from "react";
import { Train, Plane, Bus, Ship, Car, ArrowRight, Clock, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { TransitLeg, TransitMode, BookingRisk } from "@/lib/transit";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MODE_ICON: Record<TransitMode, React.ElementType> = {
  train: Train,
  plane: Plane,
  bus: Bus,
  ferry: Ship,
  drive: Car,
};

const MODE_COLOR: Record<TransitMode, string> = {
  train: "bg-sky/20 text-sky-foreground",
  plane: "bg-accent/15 text-accent",
  bus: "bg-emerald/15 text-emerald",
  ferry: "bg-blue-500/15 text-blue-400",
  drive: "bg-muted text-muted-foreground",
};

const RISK_BADGE: Record<BookingRisk, { label: string; className: string }> = {
  low:    { label: "Book anytime",  className: "bg-emerald/15 text-emerald border-transparent" },
  medium: { label: "Book ahead",    className: "bg-gold/20 text-foreground border-transparent" },
  high:   { label: "Book early!",   className: "bg-red-500/10 text-red-400 border-transparent" },
};

export function TransitCard({ leg }: { leg: TransitLeg }) {
  const [expanded, setExpanded] = React.useState(false);

  const recommended = leg.options.find((o) => o.recommended) ?? leg.options[0];
  const others = leg.options.filter((o) => o !== recommended);
  const visibleOthers = expanded ? others : [];

  return (
    <div className="relative my-2 flex items-stretch gap-3">
      {/* vertical timeline connector */}
      <div className="flex w-5 shrink-0 flex-col items-center">
        <div className="mt-1 h-3 w-px bg-border" />
        <div className="flex size-5 items-center justify-center rounded-full border border-border bg-background">
          <ArrowRight className="size-2.5 text-muted-foreground" />
        </div>
        <div className="flex-1 w-px bg-border" />
      </div>

      {/* card */}
      <div className="mb-1 flex-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {/* header */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-2.5">
          <span className="font-display text-sm font-semibold">
            {leg.fromCity}
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="font-display text-sm font-semibold">
            {leg.toCity}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">— how to get there</span>
        </div>

        {/* recommended option */}
        <OptionRow option={recommended} isRecommended />

        {/* other options (collapsible) */}
        {others.length > 0 && (
          <>
            {visibleOthers.map((opt, i) => (
              <div key={i} className="border-t border-border/50">
                <OptionRow option={opt} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="flex w-full items-center justify-center gap-1.5 border-t border-border/50 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="size-3.5" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  {others.length} more option{others.length > 1 ? "s" : ""} (
                  {others.map((o) => o.mode).join(", ")})
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function OptionRow({
  option,
  isRecommended,
}: {
  option: TransitLeg["options"][number];
  isRecommended?: boolean;
}) {
  const Icon = MODE_ICON[option.mode];
  const risk = RISK_BADGE[option.bookingRisk];

  return (
    <div className={cn("px-4 py-3", isRecommended && "bg-accent/[0.04]")}>
      <div className="flex items-start gap-3">
        {/* mode icon */}
        <span
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
            isRecommended ? MODE_COLOR[option.mode] : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          {/* label row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("font-display text-sm font-semibold", !isRecommended && "text-foreground/80")}>
              {option.label}
            </span>
            {isRecommended && (
              <Badge variant="accent" className="text-[10px]">
                Recommended
              </Badge>
            )}
            {option.fastest && !isRecommended && (
              <Badge variant="sky" className="text-[10px]">
                Fastest
              </Badge>
            )}
          </div>

          {/* meta row: duration + price + risk */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {option.durationLabel}
            </span>
            {option.priceFrom && (
              <span className="text-muted-foreground">{option.priceFrom}</span>
            )}
            <span className={cn("rounded-full border px-2 py-0.5 font-medium", risk.className)}>
              {risk.label}
            </span>
          </div>

          {/* highlights */}
          {option.highlights && option.highlights.length > 0 && (
            <ul className="mt-1.5 space-y-0.5">
              {option.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald" />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* watch out */}
          {option.watchOut && (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-400">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {option.watchOut}
            </p>
          )}

          {/* risk note */}
          {option.riskNote && option.bookingRisk !== "low" && (
            <p
              className={cn(
                "mt-1 flex items-start gap-1.5 text-xs",
                option.bookingRisk === "high" ? "text-red-400" : "text-amber-400",
              )}
            >
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {option.riskNote}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
