# Venturo ✦ Plan smarter trips in minutes

Venturo turns hours of travel research into one polished, day-by-day plan. Enter
a destination, dates, budget, and travel style, and it recommends **where to
stay**, **what to do**, **where to eat**, and **how to organize your days** —
with an interactive map tying it all together.

> **Worldwide, hybrid data.** 16+ destinations — Paris, Rome, Montréal,
> Amsterdam, London, Berlin, Madrid, Vienna, Florence, **Puglia** (a multi-town
> region), Lisbon, Porto, Prague, Seville, Venice, Dublin — are hand-curated as
> premium guides; **any other city on earth** is built live from OpenStreetMap.
> Recommendations come from a deterministic, rule-based scoring engine — no paid
> APIs, no keys.

## Features

- **Worldwide destination search** — type any city; curated guides are flagged,
  everywhere else is geocoded and built live from open data.
- **Destination search** — pick a city, dates, and travelers.
- **Preference form** — budget, pace, interests, food, and hotel priorities.
- **Trip dashboard** — summary, best areas to stay, top attractions, food, and
  a day-by-day itinerary, all in one tabbed view.
- **Best-area scoring** — neighborhoods ranked on transit, attraction access,
  food, safety, affordability, and vibe, with transparent sub-scores.
- **Optimized itinerary** — nearest-neighbor day routing that groups nearby
  places, balances food and activities, and respects your pace.
- **Interactive map** — schematic city map with layer filters (attractions,
  food, hotel zones, saved) and card ↔ pin highlighting.
- **Saved trips & places** — persisted locally; saved places per trip.
- **Profile** — default budget, travel style, and food preferences.
- **Dark mode** and a mobile-first, editorial design system.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with a custom token-based design system
- **shadcn-style UI primitives** (hand-built, dependency-light)
- **lucide-react** icons · **Inter** + **Plus Jakarta Sans** (self-hosted)
- **Supabase** (Postgres + Auth) for optional persistence
- **Zod** for API validation

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

The app works fully without any backend — trips are saved in your browser.

## Architecture

```
app/                 Routes (App Router) + API route handlers
  page.tsx           Landing
  plan/              Destination + dates + travelers
  preferences/       Travel-style form
  trips/             Saved trips · trips/[id] results dashboard
  map/               Interactive map
  profile/           Settings
  api/               generate-trip, places, neighborhoods, trips, save-place
components/
  ui/                Design-system primitives (Button, Card, Badge, …)
  trip/              Domain components (PlaceCard, NeighborhoodCard, …)
  layout/            Navbar, MobileNav, Footer, AppShell
lib/
  types.ts           Domain model
  data/              Curated destinations, neighborhoods, places
  scoring.ts         Weighted neighborhood/attraction/restaurant scoring
  itinerary.ts       Day-by-day route builder
  ai.ts              Curated (sync) trip generator
  ai-async.ts        Worldwide (async) generator — server only
  geo.ts             Distance + travel-time helpers
  trip-store.ts      Client persistence (localStorage)
  supabase.ts        Supabase client factories (optional)
  providers/         Hybrid data layer (see below)
    curated.ts       Curated provider (hand-written guides)
    osm/             OpenStreetMap provider (Nominatim + Overpass)
supabase/schema.sql  Database schema + RLS policies
```

## Worldwide data (the hybrid model)

A `DestinationProvider` abstraction resolves each trip to the best source:

- **Curated provider** — instant, offline, hand-written guides for the six
  flagship cities.
- **OSM provider** — for every other city, geocodes via **Nominatim**, pulls
  attractions and food via **Overpass**, and synthesizes neighbourhoods from
  OSM districts (or POI clustering). Sparse OSM data is enriched with heuristic
  scoring proxies (popularity from Wikidata links, uniqueness penalised for
  chains, tourist-trap risk, etc.), then fed through the *same* scoring engine.

Resilience: Overpass calls rotate across mirrors, short-circuit on timeouts,
cache results (in-memory, 7-day TTL), and never cache failures. Worldwide trips
persist a snapshot client-side so revisits and the map don't re-fetch. The
flow is server-side (`/api/generate-trip`) so OSM code never ships to the
browser. Live data is attributed per the OpenStreetMap ODbL licence.

```bash
npm run check:data   # validate the curated dataset
npm run check:osm    # validate OSM classification + scoring heuristics
```

## Scoring model

Neighborhoods are scored as a weighted blend (30% attraction access, 25%
transit, 15% food, 15% safety/walkability, 10% affordability, 5% vibe), nudged
by your hotel priorities. Attractions and restaurants are scored on interest/
cuisine match, rating, uniqueness, budget fit, and a tourist-trap penalty. See
[`lib/scoring.ts`](lib/scoring.ts).

## Enabling Supabase persistence

1. Copy `.env.example` to `.env.local` and fill in your Supabase URL + keys.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
3. The `/api/trips` and `/api/save-place` routes switch from `503` to live.

## Roadmap

- Real map tiles (Mapbox/Google) behind the schematic view
- Supabase Auth + server-synced trips
- More destinations and live place data
- Swap the rule-based generator for an LLM behind the same `generateTrip` API
