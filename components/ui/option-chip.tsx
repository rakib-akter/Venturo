"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * A selectable pill used for multi-select preference fields (interests, food,
 * hotel priorities). Controlled via `selected` + `onToggle`.
 */
export function OptionChip({
  label,
  icon,
  selected,
  onToggle,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-card"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted",
      )}
    >
      {selected ? (
        <Check className="size-4" />
      ) : (
        <Icon name={icon} className="size-4 text-muted-foreground group-hover:text-foreground" />
      )}
      {label}
    </button>
  );
}
