import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names while resolving Tailwind conflicts.
 * The single helper every UI primitive and page composes with.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date (YYYY-MM-DD) into a short, human label, e.g. "Jun 14". */
export function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Inclusive number of nights between two ISO dates. */
export function nightsBetween(start: string, end: string): number {
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/** Inclusive number of days a trip spans (nights + 1, floored at 1). */
export function tripDayCount(start: string, end: string): number {
  return Math.max(1, nightsBetween(start, end) + 1);
}

/** Render a price level (1-4) as `$`…`$$$$`. */
export function priceLevelLabel(level: number): string {
  return "$".repeat(Math.min(4, Math.max(1, Math.round(level))));
}

/** Clamp a number into the [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Stable, URL-safe slug from an arbitrary label. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
