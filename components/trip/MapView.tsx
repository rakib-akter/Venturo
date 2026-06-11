"use client";

import * as React from "react";
import { Bookmark, MapPin, UtensilsCrossed, Camera, BedDouble, Star } from "lucide-react";
import type { Neighborhood, Place } from "@/lib/types";
import { cn, priceLevelLabel } from "@/lib/utils";
import { computeBounds, project } from "@/lib/map-projection";
import { Badge } from "@/components/ui/badge";

type LayerKey = "attractions" | "food" | "hotels" | "saved";

export function MapView({
  neighborhoods,
  attractions,
  food,
  savedPlaceIds,
}: {
  neighborhoods: Neighborhood[];
  attractions: Place[];
  food: Place[];
  savedPlaceIds: string[];
}) {
  const [layers, setLayers] = React.useState<Record<LayerKey, boolean>>({
    attractions: true,
    food: true,
    hotels: true,
    saved: false,
  });
  const [selected, setSelected] = React.useState<string | null>(null);
  const savedSet = React.useMemo(() => new Set(savedPlaceIds), [savedPlaceIds]);

  const bounds = React.useMemo(
    () =>
      computeBounds([
        ...attractions.map((a) => a.geo),
        ...food.map((f) => f.geo),
        ...neighborhoods.map((n) => n.center),
      ]),
    [attractions, food, neighborhoods],
  );

  const passesSaved = (p: Place) => !layers.saved || savedSet.has(p.id);
  const visibleAttractions = layers.attractions
    ? attractions.filter(passesSaved)
    : [];
  const visibleFood = layers.food ? food.filter(passesSaved) : [];
  const visiblePlaces = [...visibleAttractions, ...visibleFood];

  function toggle(key: LayerKey) {
    setLayers((l) => ({ ...l, [key]: !l[key] }));
  }

  function selectPlace(id: string) {
    setSelected(id);
    const el = document.getElementById(`map-card-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const filters: { key: LayerKey; label: string; icon: typeof Camera }[] = [
    { key: "attractions", label: "Attractions", icon: Camera },
    { key: "food", label: "Food", icon: UtensilsCrossed },
    { key: "hotels", label: "Hotel zones", icon: BedDouble },
    { key: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      {/* Map panel */}
      <div className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <div className="flex flex-wrap gap-2">
          {filters.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={layers[key]}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                layers[key]
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-[hsl(var(--secondary))] shadow-card">
          {/* schematic grid backdrop */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="bg-hero absolute inset-0" />

          {/* hotel zones */}
          {layers.hotels &&
            neighborhoods.map((n) => {
              const p = project(n.center, bounds);
              return (
                <div
                  key={n.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <div className="flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-medium text-primary">
                    <BedDouble className="size-4" />
                  </div>
                </div>
              );
            })}

          {/* place pins */}
          {visiblePlaces.map((place) => {
            const p = project(place.geo, bounds);
            const isFood = place.type !== "attraction";
            const active = selected === place.id;
            const Icon = isFood ? UtensilsCrossed : Camera;
            return (
              <button
                key={place.id}
                onClick={() => selectPlace(place.id)}
                aria-label={place.name}
                className="group absolute -translate-x-1/2 -translate-y-full focus:outline-none"
                style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: active ? 30 : 10 }}
              >
                <span
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 border-white shadow-card transition-all",
                    active ? "size-9" : "size-6 group-hover:size-7",
                    isFood ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
                  )}
                >
                  <Icon className={active ? "size-4" : "size-3"} />
                </span>
                {active ? (
                  <span className="absolute left-1/2 top-full mt-1 w-max max-w-40 -translate-x-1/2 rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background">
                    {place.name}
                  </span>
                ) : null}
              </button>
            );
          })}

          <div className="absolute bottom-2 left-2 rounded-md bg-card/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
            Schematic map · relative positions
          </div>
        </div>
      </div>

      {/* Scrollable card list */}
      <div className="space-y-2.5 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
        {visiblePlaces.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No places match these filters.
          </p>
        ) : (
          visiblePlaces.map((place) => {
            const isFood = place.type !== "attraction";
            const active = selected === place.id;
            return (
              <button
                key={place.id}
                id={`map-card-${place.id}`}
                onClick={() => setSelected(place.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  active
                    ? "border-primary bg-primary/[0.04] shadow-card"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    isFood ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
                  )}
                >
                  {isFood ? (
                    <UtensilsCrossed className="size-5" />
                  ) : (
                    <Camera className="size-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{place.name}</span>
                    <span className="flex shrink-0 items-center gap-1 text-xs">
                      <Star className="size-3 fill-gold text-gold" />
                      {place.rating.toFixed(1)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {place.category}
                    <span className="text-emerald">
                      {priceLevelLabel(place.priceLevel)}
                    </span>
                    {savedSet.has(place.id) ? (
                      <Badge variant="accent" className="ml-auto">
                        Saved
                      </Badge>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
