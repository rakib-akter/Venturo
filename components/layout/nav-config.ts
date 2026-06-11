import type { ComponentType } from "react";
import {
  Compass,
  Home,
  Map,
  User,
  Bookmark,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Match nested routes (e.g. /trips/[id]) as active. */
  prefix?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/plan", label: "Plan", icon: Compass },
  { href: "/trips", label: "Trips", icon: Bookmark, prefix: true },
  { href: "/map", label: "Map", icon: Map },
  { href: "/profile", label: "Profile", icon: User },
];

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return item.prefix ? pathname.startsWith(item.href) : pathname === item.href;
}
