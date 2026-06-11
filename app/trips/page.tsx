import type { Metadata } from "next";
import { TripsClient } from "@/components/trip/TripsClient";

export const metadata: Metadata = {
  title: "Your trips",
  description: "Your saved trips and plans.",
};

export default function TripsPage() {
  return <TripsClient />;
}
