import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your default travel preferences.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
