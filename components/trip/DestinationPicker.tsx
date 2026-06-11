"use client";

import * as React from "react";
import { Check, Search } from "lucide-react";
import type { Destination } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

/** Searchable, selectable grid of supported destinations. */
export function DestinationPicker({
  destinations,
  value,
  onSelect,
}: {
  destinations: Destination[];
  value: string | undefined;
  onSelect: (slug: string, country: string) => void;
}) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter(
      (d) =>
        d.city.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q),
    );
  }, [destinations, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city — Paris, Rome, Montréal…"
          className="pl-11"
          aria-label="Search destinations"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          No curated guide for “{query}” yet. Try Paris, Rome, or Montréal.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {filtered.map((d) => {
            const active = value === d.slug;
            return (
              <button
                key={d.slug}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(d.slug, d.country)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.99]",
                  active
                    ? "border-primary ring-1 ring-primary/30 shadow-card"
                    : "border-border hover:border-primary/40 hover:shadow-card",
                )}
              >
                <div
                  className={cn(
                    "mb-3 flex h-20 items-end rounded-xl bg-gradient-to-br p-2 text-3xl",
                    d.heroColor,
                  )}
                >
                  {d.emoji}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold">{d.city}</p>
                    <p className="text-xs text-muted-foreground">{d.country}</p>
                  </div>
                  {active ? (
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
