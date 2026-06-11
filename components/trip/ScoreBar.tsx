import { cn } from "@/lib/utils";

function barColor(score: number): string {
  if (score >= 85) return "bg-emerald";
  if (score >= 70) return "bg-sky";
  if (score >= 55) return "bg-gold";
  return "bg-muted-foreground/50";
}

/** A labeled 0–100 metric bar used for neighborhood sub-scores. */
export function ScoreBar({
  label,
  score,
  className,
}: {
  label: string;
  score: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{Math.round(score)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", barColor(score))}
          style={{ width: `${Math.max(4, Math.min(100, score))}%` }}
        />
      </div>
    </div>
  );
}
