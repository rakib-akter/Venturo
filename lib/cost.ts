import type { Budget } from "@/lib/types";

/**
 * Rough trip-cost estimator. Per-person, per-day bands (lodging + food +
 * activities + local transit) by budget tier — intentionally wide, meant as a
 * planning ballpark rather than a quote.
 */
const DAILY_BAND: Record<Budget, { low: number; high: number }> = {
  budget: { low: 70, high: 120 },
  "mid-range": { low: 150, high: 240 },
  luxury: { low: 340, high: 650 },
};

export interface CostEstimate {
  low: number;
  high: number;
}

export function estimateTripCost(
  budget: Budget,
  days: number,
  travelers: number,
): CostEstimate {
  const band = DAILY_BAND[budget];
  return {
    low: band.low * days * travelers,
    high: band.high * days * travelers,
  };
}

/** Format a whole-dollar amount as a compact USD string (e.g. $1,240). */
export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}
