"use client";

import * as React from "react";
import { Check, Globe, Loader2, Search, Star } from "lucide-react";
import type { GeocodeResult } from "@/lib/providers/types";
import { DESTINATIONS } from "@/lib/mock-data";
import { cn, flagEmoji } from "@/lib/utils";
import { useDebounced } from "@/lib/use-debounce";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

/** Curated cities surfaced as quick picks when the search box is empty. */
const CURATED_RESULTS: GeocodeResult[] = DESTINATIONS.map((d) => ({
  slug: d.slug,
  city: d.city,
  country: d.country,
  context: d.country,
  center: d.center,
  source: "curated",
  curated: true,
}));

export function DestinationSearch({
  value,
  onSelect,
}: {
  value: string | undefined;
  onSelect: (result: GeocodeResult) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const debounced = useDebounced(query, 350);

  React.useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError("Search is unavailable right now. Try a curated city below.");
          setResults([]);
        } else {
          setResults(data.results ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't reach the search service.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const showCurated = query.trim().length < 2;
  const list = showCurated ? CURATED_RESULTS : results;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any city — Barcelona, Tokyo, Cape Town…"
          className="pl-11 pr-10"
          aria-label="Search destinations worldwide"
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-sm text-muted-foreground">
          {error}
        </p>
      ) : null}

      {showCurated ? (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Curated guides
        </p>
      ) : null}

      {list.length === 0 && !showCurated && !loading && !error ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          No cities found for “{query}”. Try a different spelling.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((r) => {
            const active = value === r.slug;
            return (
              <li key={`${r.slug}-${r.country}-${r.center.latitude}`}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(r)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.99]",
                    active
                      ? "border-primary bg-primary/[0.04] shadow-card"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg text-lg",
                      r.curated
                        ? "bg-accent/15 text-accent"
                        : "bg-sky/20 text-sky-foreground",
                    )}
                  >
                    {r.curated ? (
                      <Star className="size-5" />
                    ) : (
                      <span aria-hidden>{flagEmoji(r.countryCode)}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.city}</span>
                      {r.curated ? (
                        <Badge variant="accent">Curated</Badge>
                      ) : (
                        <Badge variant="sky" className="gap-1">
                          <Globe className="size-3" /> Worldwide
                        </Badge>
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.context ?? r.country}
                    </span>
                  </span>
                  {active ? (
                    <Check className="size-5 shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
