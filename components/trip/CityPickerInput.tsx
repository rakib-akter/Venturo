"use client";

import * as React from "react";
import { Check, Globe, Loader2, Search, Star, X } from "lucide-react";
import type { GeocodeResult } from "@/lib/providers/types";
import { DESTINATIONS } from "@/lib/mock-data";
import { cn, flagEmoji } from "@/lib/utils";
import { useDebounced } from "@/lib/use-debounce";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const geocodeCache = new Map<string, GeocodeResult[]>();

const CURATED_RESULTS: GeocodeResult[] = DESTINATIONS.map((d) => ({
  slug: d.slug,
  city: d.city,
  country: d.country,
  context: d.country,
  center: d.center,
  source: "curated" as const,
  curated: true,
}));

interface CityPickerInputProps {
  value: GeocodeResult | null;
  onSelect: (result: GeocodeResult) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Compact typeahead combobox for picking a city. Fits inside a multi-city
 * builder row without taking up the full page like DestinationSearch.
 */
export function CityPickerInput({
  value,
  onSelect,
  onClear,
  placeholder = "Search any city…",
  autoFocus,
}: CityPickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GeocodeResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounced = useDebounced(query, 350);

  // Close on outside click; restore display value if user abandoned.
  React.useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Geocode search.
  React.useEffect(() => {
    const q = debounced.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const cacheKey = q.toLowerCase();
    const hit = geocodeCache.get(cacheKey);
    if (hit) {
      setResults(hit);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          const list = data.results ?? [];
          geocodeCache.set(cacheKey, list);
          setResults(list);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const q = query.trim().toLowerCase();
  const curatedMatches = q
    ? CURATED_RESULTS.filter(
        (r) =>
          r.city.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          r.slug.includes(q),
      )
    : CURATED_RESULTS.slice(0, 8);
  const curatedSlugs = new Set(curatedMatches.map((r) => r.slug));
  const list =
    query.trim().length < 2
      ? curatedMatches
      : [
          ...curatedMatches,
          ...results.filter((r) => !curatedSlugs.has(r.slug)),
        ];

  function handleSelect(r: GeocodeResult) {
    setQuery("");
    setOpen(false);
    onSelect(r);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    setQuery("");
    setOpen(true);
    onClear?.();
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  const displayText = value && !open ? `${value.city}, ${value.country}` : query;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {value && !open ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base">
            {flagEmoji(value.countryCode)}
          </span>
        ) : (
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          value={displayText}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery(""); // clear so user can type a new search
          }}
          placeholder={placeholder}
          className={cn("pl-10 pr-8", value && !open && "font-medium")}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear city"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {open && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg">
          {list.length === 0 && !loading ? (
            <li className="p-3 text-center text-sm text-muted-foreground">
              {query.trim().length >= 2
                ? `No results for "${query}"`
                : "Type to search…"}
            </li>
          ) : (
            list.map((r) => (
              <li key={`${r.slug}-${r.country}-${r.center.latitude}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(r)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                    value?.slug === r.slug && "bg-primary/[0.04]",
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
                    {r.curated ? (
                      <Star className="size-3.5 text-accent" />
                    ) : (
                      <span>{flagEmoji(r.countryCode)}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{r.city}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      {r.context ?? r.country}
                    </span>
                  </span>
                  {r.curated ? (
                    <Badge variant="accent" className="shrink-0 text-xs">
                      Curated
                    </Badge>
                  ) : (
                    <Badge variant="sky" className="shrink-0 gap-1 text-xs">
                      <Globe className="size-3" /> Live
                    </Badge>
                  )}
                  {value?.slug === r.slug ? (
                    <Check className="size-4 shrink-0 text-primary" />
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
