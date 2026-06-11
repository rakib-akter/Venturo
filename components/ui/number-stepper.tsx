"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Accessible +/- stepper for small integer values like traveler count. */
export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 12,
  ariaLabel = "Value",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const set = (next: number) => onChange(Math.max(min, Math.min(max, next)));
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5 shadow-sm">
      <button
        type="button"
        aria-label={`Decrease ${ariaLabel}`}
        onClick={() => set(value - 1)}
        disabled={value <= min}
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-secondary disabled:opacity-40",
        )}
      >
        <Minus className="size-4" />
      </button>
      <span
        className="min-w-8 text-center font-display text-lg font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${ariaLabel}`}
        onClick={() => set(value + 1)}
        disabled={value >= max}
        className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
