import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Venturo — Plan smarter trips in minutes",
    template: "%s · Venturo",
  },
  description:
    "Find where to stay, what to do, where to eat, and how to organize your days. Venturo turns hours of trip research into a polished, day-by-day plan.",
  applicationName: "Venturo",
  keywords: [
    "travel planner",
    "trip itinerary",
    "where to stay",
    "city guide",
    "neighborhood guide",
  ],
  authors: [{ name: "Venturo" }],
  openGraph: {
    title: "Venturo — Plan smarter trips in minutes",
    description:
      "Find where to stay, what to do, where to eat, and how to organize your days.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
