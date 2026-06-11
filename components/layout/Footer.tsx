import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

/** Simple editorial footer. Hidden behind the mobile tab bar on phones. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            Plan smarter trips in minutes — where to stay, what to do, where to
            eat, day by day.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/plan" className="hover:text-foreground">
            Plan a trip
          </Link>
          <Link href="/trips" className="hover:text-foreground">
            My trips
          </Link>
          <Link href="/map" className="hover:text-foreground">
            Map
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Profile
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/70 px-6 py-4">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} Venturo · A demo travel planner.
        </p>
      </div>
    </footer>
  );
}
