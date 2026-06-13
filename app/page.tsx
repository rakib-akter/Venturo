import Link from "next/link";
import {
  ArrowRight,
  MapPinned,
  UtensilsCrossed,
  CalendarRange,
  Map as MapIcon,
  Sparkles,
  Search,
  Route,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { DestinationCard } from "@/components/trip/DestinationCard";
import { Footer } from "@/components/layout/Footer";
import { DESTINATIONS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-16 pt-14 text-center sm:pt-20">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-4 text-accent" />
            Your AI travel concierge
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
            Plan smarter trips
            <span className="block text-primary">in minutes.</span>
          </h1>
          <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
            Find where to stay, what to do, where to eat, and how to organize
            your days — all in one polished, day-by-day plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/plan">
                Plan my trip <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/trips">See saved trips</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Anywhere on earth · {DESTINATIONS.length} destinations hand-curated,
            every other city built live from OpenStreetMap
          </p>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={MapPinned}
            title="Best areas"
            description="Compare neighborhoods on transit, safety, food, and proximity to the sights."
            accent="primary"
          />
          <FeatureCard
            icon={UtensilsCrossed}
            title="Food spots"
            description="Local cafés and restaurants matched to your taste — not the tourist traps."
            accent="accent"
          />
          <FeatureCard
            icon={CalendarRange}
            title="Itinerary"
            description="An optimized day-by-day plan that groups nearby places and respects your pace."
            accent="emerald"
          />
          <FeatureCard
            icon={MapIcon}
            title="Smart map"
            description="See attractions, food, and hotel zones laid out so distances finally make sense."
            accent="sky"
          />
        </div>
      </section>

      {/* Worldwide band */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-2">
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky/20 text-sky-foreground">
              <Globe className="size-5" />
            </span>
            <div>
              <p className="font-display font-semibold">Now worldwide</p>
              <p className="text-sm text-muted-foreground">
                {DESTINATIONS.length} destinations are hand-curated; search any
                other city and we build it live from OpenStreetMap.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/plan">
              Try any city <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              Start with a city
            </h2>
            <p className="text-muted-foreground">
              Hand-curated guides — or search any city in the world.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/plan">
              Search worldwide <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-14">
        <h2 className="mb-8 text-center font-display text-2xl font-semibold">
          Three steps to a finished plan
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              icon: Search,
              step: "01",
              title: "Tell us where & when",
              body: "Pick a city, your dates, and how many are traveling.",
            },
            {
              icon: Sparkles,
              step: "02",
              title: "Share your style",
              body: "Budget, pace, interests, and food preferences — a few taps.",
            },
            {
              icon: Route,
              step: "03",
              title: "Get your trip",
              body: "Areas to stay, top sights, food, and an optimized itinerary.",
            },
          ].map(({ icon: Icon, step, title, body }) => (
            <div
              key={step}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="font-display text-sm font-semibold text-accent">
                {step}
              </span>
              <Icon className="my-3 size-6 text-primary" />
              <h3 className="font-display text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground shadow-card-hover">
          <h2 className="font-display text-3xl font-semibold">
            Stop researching. Start planning.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-primary-foreground/80">
            Venturo turns hours of open browser tabs into one clear plan you can
            actually follow.
          </p>
          <Button asChild size="lg" variant="accent" className="mt-7">
            <Link href="/plan">
              Plan my trip <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
