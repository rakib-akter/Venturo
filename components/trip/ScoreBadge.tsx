import { cn } from "@/lib/utils";

/** Color tier for a 0–100 score. */
function tier(score: number): { ring: string; text: string; label: string } {
  if (score >= 85)
    return { ring: "ring-emerald/40 bg-emerald/10", text: "text-emerald", label: "Excellent" };
  if (score >= 70)
    return { ring: "ring-sky/40 bg-sky/10", text: "text-sky-foreground", label: "Great" };
  if (score >= 55)
    return { ring: "ring-gold/40 bg-gold/10", text: "text-foreground", label: "Good" };
  return { ring: "ring-border bg-muted", text: "text-muted-foreground", label: "Fair" };
}

export function ScoreBadge({
  score,
  size = "md",
  showLabel = false,
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}) {
  const t = tier(score);
  const dim =
    size === "lg" ? "size-16 text-2xl" : size === "sm" ? "size-10 text-sm" : "size-12 text-lg";
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-display font-semibold ring-2",
          dim,
          t.ring,
          t.text,
        )}
      >
        {Math.round(score)}
      </div>
      {showLabel ? (
        <span className={cn("text-xs font-medium", t.text)}>{t.label}</span>
      ) : null}
    </div>
  );
}
