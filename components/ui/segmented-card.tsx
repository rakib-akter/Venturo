"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * A larger single-select card used for mutually exclusive choices like budget
 * and travel pace. Renders an icon, label, and supporting description.
 */
export function SegmentedCard<T extends string>({
  options,
  value,
  onChange,
  columns = 3,
}: {
  options: { value: T; label: string; description?: string; icon?: string }[];
  value: T | undefined;
  onChange: (value: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2",
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.99]",
              active
                ? "border-primary bg-primary/[0.04] shadow-card ring-1 ring-primary/20"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-xl",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              <Icon name={opt.icon} className="size-4" />
            </span>
            <span className="font-medium">{opt.label}</span>
            {opt.description ? (
              <span className="text-xs text-muted-foreground">
                {opt.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
