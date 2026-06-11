import type { Metadata } from "next";
import { PreferencesClient } from "@/components/trip/PreferencesClient";

export const metadata: Metadata = {
  title: "Trip preferences",
  description: "Tell us your budget, pace, interests, and food preferences.",
};

export default function PreferencesPage() {
  return <PreferencesClient />;
}
