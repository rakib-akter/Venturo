import { Suspense } from "react";
import type { Metadata } from "next";
import { PlanClient } from "@/components/trip/PlanClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Plan a trip",
  description: "Choose your destination, dates, and travelers.",
};

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <Skeleton className="h-7 w-full max-w-md mx-auto" />
          <Skeleton className="mt-8 h-48 w-full" />
        </div>
      }
    >
      <PlanClient />
    </Suspense>
  );
}
