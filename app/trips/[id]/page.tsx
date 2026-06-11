import type { Metadata } from "next";
import { ResultsClient } from "@/components/trip/ResultsClient";

export const metadata: Metadata = {
  title: "Your trip",
  description: "Your personalized trip plan: where to stay, what to do, and a day-by-day itinerary.",
};

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ResultsClient tripId={id} />;
}
