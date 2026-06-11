"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleSavedPlace } from "@/lib/trip-store";

/** Heart/bookmark toggle that persists a saved place against a trip. */
export function SavePlaceButton({
  tripId,
  placeId,
  saved,
  size = "md",
}: {
  tripId: string;
  placeId: string;
  saved: boolean;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-8" : "size-9";
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save place"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSavedPlace(tripId, placeId);
      }}
      className={cn(
        "flex items-center justify-center rounded-full border transition-all duration-200 active:scale-90",
        dim,
        saved
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card/90 text-muted-foreground backdrop-blur hover:text-foreground",
      )}
    >
      <Bookmark className={cn("size-4", saved && "fill-current")} />
    </button>
  );
}
