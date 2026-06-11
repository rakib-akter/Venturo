import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/** A single feature highlight used on the landing page grid. */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = "primary",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: "primary" | "accent" | "emerald" | "sky";
}) {
  const accentMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    emerald: "bg-emerald/15 text-emerald",
    sky: "bg-sky/20 text-sky-foreground",
  };
  return (
    <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          accentMap[accent],
        )}
      >
        <Icon className="size-5" />
      </span>
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
