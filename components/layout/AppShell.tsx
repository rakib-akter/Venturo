import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";

/**
 * Page chrome: top navbar (md+), the page content, and the mobile bottom tab
 * bar. Adds bottom padding on mobile so content clears the fixed tab bar.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
      <MobileNav />
    </>
  );
}
