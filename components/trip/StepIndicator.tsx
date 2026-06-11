import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Destination", "Preferences", "Your trip"];

/** Three-step progress indicator for the planning flow. */
export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mx-auto flex max-w-md items-center justify-between gap-2">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-emerald text-emerald-foreground",
                active && "bg-primary text-primary-foreground",
                !done && !active && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : step}
            </div>
            <span
              className={cn(
                "hidden text-sm font-medium sm:inline",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {step < STEPS.length ? (
              <span
                className={cn(
                  "h-px flex-1",
                  done ? "bg-emerald" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
