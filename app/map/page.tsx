import { Suspense } from "react";
import type { Metadata } from "next";
import { MapClient } from "@/components/trip/MapClient";

export const metadata: Metadata = {
  title: "Map",
  description: "See attractions, food, and hotel zones laid out on a map.",
};

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-muted" />
        </div>
      }
    >
      <MapClient />
    </Suspense>
  );
}
