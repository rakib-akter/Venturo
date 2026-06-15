import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { TripDraftProvider } from "@/lib/trip-draft";
import { AuthProvider } from "@/lib/auth-context";

/**
 * Page chrome: top navbar (md+), the page content, and the mobile bottom tab
 * bar. Adds bottom padding on mobile so content clears the fixed tab bar.
 * Wraps everything in the trip-draft provider so the planning flow shares state.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TripDraftProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 pb-24 md:pb-0">
        {children}
      </main>
      <MobileNav />
      </TripDraftProvider>
    </AuthProvider>
  );
}
