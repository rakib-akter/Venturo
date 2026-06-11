import Link from "next/link";
import { cn } from "@/lib/utils";

/** Venturo wordmark with a compass-pin glyph. */
export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="Venturo home"
    >
      <span className="relative flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-card transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" fill="none" className="size-5">
          <path
            d="M12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5 12 2Z"
            fill="currentColor"
            className="text-accent"
          />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Venturo
      </span>
    </Link>
  );
}
