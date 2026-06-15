"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/layout/Logo";
import { NAV_ITEMS, isActive } from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";

/** Sticky top navigation, shown on tablet and up. */
export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-border/70 bg-background/80 backdrop-blur-md md:block">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!loading && user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Sign out
            </Button>
          ) : !loading ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <LogIn className="size-4" /> Sign in
              </Link>
            </Button>
          ) : null}
          <Button asChild size="sm">
            <Link href="/plan">Plan a trip</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
