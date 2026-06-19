import type { CityLeg } from "./types";

export type TransitMode = "train" | "plane" | "bus" | "ferry" | "drive";
export type BookingRisk = "low" | "medium" | "high";
export type PriceRange = "budget" | "moderate" | "expensive";

export interface TransitOption {
  mode: TransitMode;
  label: string;
  durationMinutes: number;
  durationLabel: string;
  priceRange: PriceRange;
  priceFrom?: string;
  bookingRisk: BookingRisk;
  riskNote?: string;
  recommended?: boolean;
  fastest?: boolean;
  highlights?: string[];
  watchOut?: string;
}

export interface TransitLeg {
  fromSlug: string;
  toSlug: string;
  fromCity: string;
  toCity: string;
  options: TransitOption[];
}

// ─── Curated routes ──────────────────────────────────────────────────────────
// Key = sorted slugs joined by "|". All durations are realistic door-to-door.
// Planes include ~3h airport overhead (1.5h check-in + 30min baggage + transit).
// Trains/buses add ~30min for getting to/from central stations.

const ROUTES: Record<string, TransitOption[]> = {

  // ── Italy ──────────────────────────────────────────────────────────────────

  "florence|rome": [
    {
      mode: "train", label: "Frecciarossa (high-speed)",
      durationMinutes: 125, durationLabel: "~1h 35m",
      priceRange: "moderate", priceFrom: "from €30",
      bookingRisk: "medium", riskNote: "Book 1–2 weeks ahead for best fares; same-day is 2×",
      recommended: true,
      highlights: ["City center to city center", "No airport queues or luggage limits"],
    },
    {
      mode: "drive", label: "Drive (A1 Autostrada)",
      durationMinutes: 195, durationLabel: "~3h 15m",
      priceRange: "moderate",
      bookingRisk: "low",
      highlights: ["Flexible schedule", "Scenic Tuscan countryside route"],
      watchOut: "ZTL (traffic restricted zones) in central Rome — park outside and take the metro in",
    },
  ],

  "naples|rome": [
    {
      mode: "train", label: "Frecciarossa (high-speed)",
      durationMinutes: 100, durationLabel: "~1h 10m",
      priceRange: "budget", priceFrom: "from €19",
      bookingRisk: "medium", recommended: true,
      highlights: ["Frequent departures every 30–60 min", "Arrives at Roma Termini — dead central"],
    },
    {
      mode: "drive", label: "Drive (A1)",
      durationMinutes: 165, durationLabel: "~2h 45m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible stops en route"],
      watchOut: "Naples and Rome outskirts traffic; ZTL zones in Rome",
    },
  ],

  "rome|venice": [
    {
      mode: "train", label: "Frecciarossa (high-speed)",
      durationMinutes: 240, durationLabel: "~3h 30m",
      priceRange: "moderate", priceFrom: "from €39",
      bookingRisk: "medium", recommended: true,
      highlights: ["Direct service", "Arrives Venice Santa Lucia — steps from the Grand Canal"],
    },
    {
      mode: "drive", label: "Drive (A1/A4)",
      durationMinutes: 345, durationLabel: "~5h 45m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Padova or Verona"],
      watchOut: "No cars inside Venice — park at Mestre or Piazzale Roma and walk/take vaporetto",
    },
  ],

  "puglia|rome": [
    {
      mode: "train", label: "Frecciarossa (to Bari)",
      durationMinutes: 255, durationLabel: "~3h 45m",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true,
      highlights: ["Direct Rome Termini → Bari Centrale", "No airport overhead"],
      riskNote: "Book 1 week ahead; avoid same-day walk-up prices",
    },
    {
      mode: "plane", label: "Budget flight (FCO/CIA → BRI)",
      durationMinutes: 225, durationLabel: "~3h 45m door-to-door",
      priceRange: "budget", priceFrom: "from €25",
      bookingRisk: "high", fastest: true,
      highlights: ["~55 min in the air"],
      watchOut: "Airport overhead on both ends erases the time advantage; last-minute prices spike hard",
      riskNote: "Book 3+ weeks ahead — last-minute fares can hit €150+",
    },
    {
      mode: "drive", label: "Drive (A24/A14)",
      durationMinutes: 285, durationLabel: "~4h 45m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Matera or Alberobello en route"],
    },
  ],

  "amalfi-coast|rome": [
    {
      mode: "train", label: "Train to Naples, then SITA bus / ferry",
      durationMinutes: 210, durationLabel: "~3h 30m total",
      priceRange: "budget", priceFrom: "from €22",
      bookingRisk: "medium", recommended: true,
      highlights: ["Frecciarossa Rome→Naples (1h 10m), then bus to coast", "Train is the most reliable leg"],
      watchOut: "Summer coastal buses are packed — take the early morning departure",
    },
    {
      mode: "drive", label: "Drive",
      durationMinutes: 255, durationLabel: "~4h 15m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Most flexible option"],
      watchOut: "Amalfi coastal road is single-lane and terrifying in peak summer — consider driving off-season only",
    },
  ],

  "florence|venice": [
    {
      mode: "train", label: "Frecciarossa (high-speed)",
      durationMinutes: 160, durationLabel: "~2h 10m",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "medium", recommended: true,
      highlights: ["Frequent service", "Arrives Venice Santa Lucia"],
    },
    {
      mode: "drive", label: "Drive (A1/A13)",
      durationMinutes: 180, durationLabel: "~3h",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Padova or Ferrara"],
      watchOut: "Park at Mestre — no cars in Venice",
    },
  ],

  "florence|naples": [
    {
      mode: "train", label: "Frecciarossa (high-speed)",
      durationMinutes: 210, durationLabel: "~3h",
      priceRange: "moderate", priceFrom: "from €30",
      bookingRisk: "medium", recommended: true,
      highlights: ["Direct service, no changes", "City center to city center"],
    },
    {
      mode: "drive", label: "Drive (A1)",
      durationMinutes: 315, durationLabel: "~5h 15m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Rome if time allows"],
    },
  ],

  "naples|puglia": [
    {
      mode: "drive", label: "Drive (A16)",
      durationMinutes: 165, durationLabel: "~2h 45m",
      priceRange: "moderate", bookingRisk: "low", recommended: true,
      highlights: ["Easy motorway", "Most practical for Puglia's coastal towns"],
    },
    {
      mode: "train", label: "Train (via Bari)",
      durationMinutes: 240, durationLabel: "~3h 30m",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "low",
      highlights: ["Relax and enjoy the journey"],
    },
  ],

  "amalfi-coast|naples": [
    {
      mode: "bus", label: "SITA Bus (Positano / Amalfi → Naples)",
      durationMinutes: 90, durationLabel: "~1h 30m",
      priceRange: "budget", priceFrom: "from €3",
      bookingRisk: "low", recommended: true,
      highlights: ["Frequent departures", "Scenic cliff-top road"],
      watchOut: "Extremely crowded July–August — go early morning",
    },
    {
      mode: "ferry", label: "Ferry (seasonal, Apr–Oct)",
      durationMinutes: 90, durationLabel: "~1h 30m",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "medium",
      highlights: ["Stunning sea views", "Beats the coastal road traffic"],
      watchOut: "Seasonal only — confirm schedule in advance; cancels in rough weather",
    },
    {
      mode: "drive", label: "Drive",
      durationMinutes: 75, durationLabel: "~1h 15m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible departures"],
      watchOut: "One-lane sections on the coastal road; allow extra time in peak season",
    },
  ],

  "florence|puglia": [
    {
      mode: "train", label: "Frecciarossa (Florence → Bari)",
      durationMinutes: 330, durationLabel: "~4h 30m",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true,
      highlights: ["Direct high-speed service", "No driving through Rome"],
    },
    {
      mode: "plane", label: "Flight (FLR/PSA → BRI)",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "budget", priceFrom: "from €30",
      bookingRisk: "high", fastest: true,
      highlights: ["Short flight (~1h)"],
      watchOut: "Airport overhead makes it similar to the train — book well ahead",
    },
  ],

  // ── Spain & Portugal ───────────────────────────────────────────────────────

  "barcelona|madrid": [
    {
      mode: "train", label: "AVE (high-speed)",
      durationMinutes: 180, durationLabel: "~2h 30m",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "medium", recommended: true,
      highlights: ["City center to city center (Sants ↔ Atocha)", "Fastest door-to-door option"],
      riskNote: "Book 2+ weeks ahead — cheapest fares go fast",
    },
    {
      mode: "plane", label: "Budget flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "budget", priceFrom: "from €20",
      bookingRisk: "high",
      highlights: ["Cheap if booked weeks ahead"],
      watchOut: "Airport overhead on both ends makes AVE faster door-to-door; last-minute prices spike",
    },
    {
      mode: "drive", label: "Drive (A-2)",
      durationMinutes: 360, durationLabel: "~6h",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Zaragoza"],
    },
  ],

  "madrid|seville": [
    {
      mode: "train", label: "AVE (high-speed)",
      durationMinutes: 180, durationLabel: "~2h 30m",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "medium", recommended: true,
      highlights: ["Fastest and most comfortable option", "Central stations at both ends"],
    },
    {
      mode: "drive", label: "Drive (A-4)",
      durationMinutes: 330, durationLabel: "~5h 30m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Stop in Córdoba"],
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", bookingRisk: "medium",
      highlights: ["Option if AVE is sold out"],
      watchOut: "AVE is faster door-to-door and more convenient",
    },
  ],

  "lisbon|madrid": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true, fastest: true,
      highlights: ["~1h 20m in the air", "Multiple airlines daily"],
      watchOut: "LIS and MAD airports are far from city center — add 1h transit each end",
    },
    {
      mode: "bus", label: "ALSA / Rede bus (or overnight)",
      durationMinutes: 510, durationLabel: "~8h 30m",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "low",
      highlights: ["Very cheap", "Overnight bus saves a night's accommodation"],
      watchOut: "Long journey — the overnight option is much better value",
    },
    {
      mode: "drive", label: "Drive (E-80/A-6)",
      durationMinutes: 360, durationLabel: "~6h",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Straightforward highway route", "Flexible stops"],
    },
  ],

  "lisbon|porto": [
    {
      mode: "train", label: "Alfa Pendular",
      durationMinutes: 195, durationLabel: "~2h 45m",
      priceRange: "budget", priceFrom: "from €20",
      bookingRisk: "low", recommended: true,
      highlights: ["Comfortable, frequent departures", "Santa Apolónia ↔ Campanhã — both central"],
    },
    {
      mode: "drive", label: "Drive (A1)",
      durationMinutes: 210, durationLabel: "~3h 30m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible stops"],
    },
    {
      mode: "bus", label: "Rede Expressos",
      durationMinutes: 225, durationLabel: "~3h 45m",
      priceRange: "budget", priceFrom: "from €12",
      bookingRisk: "low",
      highlights: ["Very cheap, book day-before is fine"],
    },
  ],

  "barcelona|lisbon": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 270, durationLabel: "~4h 30m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h in the air; only practical for this distance"],
    },
    {
      mode: "drive", label: "Drive",
      durationMinutes: 660, durationLabel: "~11h",
      priceRange: "expensive", bookingRisk: "low",
      highlights: ["Epic Iberian road trip"],
      watchOut: "Very long — split overnight in Madrid or Zaragoza",
    },
  ],

  "barcelona|seville": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true,
      highlights: ["~1h 30m in the air"],
    },
    {
      mode: "train", label: "AVE (via Madrid)",
      durationMinutes: 420, durationLabel: "~6h (with change in Madrid)",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium",
      highlights: ["Scenic, city center routing"],
      watchOut: "Requires change in Madrid; total journey is long",
    },
  ],

  // ── France, Benelux & UK ───────────────────────────────────────────────────

  "london|paris": [
    {
      mode: "train", label: "Eurostar",
      durationMinutes: 170, durationLabel: "~2h 20m + security",
      priceRange: "moderate", priceFrom: "from €44",
      bookingRisk: "high", recommended: true,
      highlights: ["St Pancras ↔ Gare du Nord — both dead central", "No baggage limits; arrive 30 min before"],
      riskNote: "Sells out fast — book 4+ weeks ahead in peak season; last-minute fares exceed €200",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 270, durationLabel: "~4h 30m door-to-door",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium",
      highlights: ["Multiple departures daily"],
      watchOut: "LHR/LGW or CDG/ORY are far out — add 1h+ transit each end",
    },
  ],

  "brussels|paris": [
    {
      mode: "train", label: "Eurostar / Thalys",
      durationMinutes: 110, durationLabel: "~1h 20m",
      priceRange: "moderate", priceFrom: "from €29",
      bookingRisk: "medium", recommended: true,
      highlights: ["Midi ↔ Gare du Nord — both central", "Much faster than driving"],
    },
    {
      mode: "drive", label: "Drive (A2/E19)",
      durationMinutes: 225, durationLabel: "~3h 45m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible"],
    },
    {
      mode: "bus", label: "FlixBus",
      durationMinutes: 240, durationLabel: "~3h 30m",
      priceRange: "budget", priceFrom: "from €5",
      bookingRisk: "low",
      highlights: ["Very cheap if booked ahead"],
    },
  ],

  "amsterdam|paris": [
    {
      mode: "train", label: "Eurostar / Thalys",
      durationMinutes: 230, durationLabel: "~3h 20m",
      priceRange: "moderate", priceFrom: "from €35",
      bookingRisk: "medium", recommended: true,
      highlights: ["Amsterdam Centraal ↔ Gare du Nord", "Skip both airports entirely"],
      riskNote: "Book 2+ weeks ahead for best prices",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", bookingRisk: "medium",
      highlights: ["~1h in the air"],
      watchOut: "Schiphol is enormous — allow 2h before your flight",
    },
    {
      mode: "bus", label: "FlixBus",
      durationMinutes: 405, durationLabel: "~6h 45m",
      priceRange: "budget", priceFrom: "from €9",
      bookingRisk: "low",
      highlights: ["Cheapest option; overnight bus available"],
    },
  ],

  "amsterdam|brussels": [
    {
      mode: "train", label: "Intercity / Thalys",
      durationMinutes: 140, durationLabel: "~2h",
      priceRange: "moderate", priceFrom: "from €20",
      bookingRisk: "low", recommended: true,
      highlights: ["Frequent service every 30–60 min", "City center to city center"],
    },
    {
      mode: "drive", label: "Drive (A10/E19)",
      durationMinutes: 165, durationLabel: "~2h 45m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible"],
    },
  ],

  "brussels|london": [
    {
      mode: "train", label: "Eurostar",
      durationMinutes: 150, durationLabel: "~2h",
      priceRange: "moderate", priceFrom: "from €44",
      bookingRisk: "high", recommended: true,
      highlights: ["Midi ↔ St Pancras — both dead central", "Fastest door-to-door option"],
      riskNote: "Book 3+ weeks ahead in school holidays or summer; fills completely",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", bookingRisk: "medium",
      highlights: ["More timing flexibility"],
      watchOut: "Add 1h+ airport transit on each end; Eurostar wins on total journey time",
    },
  ],

  "amsterdam|london": [
    {
      mode: "train", label: "Eurostar (direct)",
      durationMinutes: 270, durationLabel: "~3h 52m + security",
      priceRange: "moderate", priceFrom: "from €49",
      bookingRisk: "high", recommended: true,
      highlights: ["Amsterdam Centraal ↔ St Pancras — both central", "No luggage limits"],
      riskNote: "Book 4+ weeks ahead — sells out completely in summer; last-minute > €200",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", bookingRisk: "medium", fastest: true,
      highlights: ["Slightly faster if airports are convenient for you"],
      watchOut: "Schiphol to Heathrow/Gatwick — airport transit adds 1h+ each end",
    },
  ],

  "edinburgh|london": [
    {
      mode: "train", label: "LNER (East Coast Mainline)",
      durationMinutes: 300, durationLabel: "~4h 30m",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "medium", recommended: true,
      highlights: ["Edinburgh Waverley ↔ Kings Cross — both central", "Scenic Northumberland coast views"],
      riskNote: "Advance tickets (released 12 weeks out) are a fraction of walk-up price",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "budget", priceFrom: "from €30",
      bookingRisk: "medium", fastest: true,
      highlights: ["Slightly faster door-to-door"],
      watchOut: "Edinburgh and Heathrow/Gatwick are far from city center — trains are very competitive",
    },
    {
      mode: "bus", label: "Megabus / National Express",
      durationMinutes: 540, durationLabel: "~9h",
      priceRange: "budget", priceFrom: "from €5",
      bookingRisk: "low",
      highlights: ["Overnight option saves accommodation costs"],
    },
  ],

  "dublin|london": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "budget", priceFrom: "from €20",
      bookingRisk: "medium", recommended: true,
      highlights: ["~1h 30m in the air", "Multiple carriers — Ryanair, Aer Lingus, BA"],
      riskNote: "Book 2+ weeks ahead; prices double last-minute",
    },
    {
      mode: "ferry", label: "Ferry + train (overnight)",
      durationMinutes: 660, durationLabel: "~11h (overnight cabin)",
      priceRange: "budget", priceFrom: "from €35",
      bookingRisk: "low",
      highlights: ["Saves a night's accommodation", "Essential if you're bringing a car"],
      watchOut: "Add London → Holyhead rail (3h) or drive to Pembroke to reach the ferry port",
    },
  ],

  "dublin|edinburgh": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 225, durationLabel: "~3h 45m door-to-door",
      priceRange: "budget", priceFrom: "from €20",
      bookingRisk: "low", recommended: true,
      highlights: ["~1h in the air", "Multiple daily services from DUB → EDI"],
    },
  ],

  // ── Central Europe ─────────────────────────────────────────────────────────

  "prague|vienna": [
    {
      mode: "train", label: "Railjet / RegioJet",
      durationMinutes: 270, durationLabel: "~4h",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "low", recommended: true,
      highlights: ["Comfortable, frequent service", "City center to city center"],
    },
    {
      mode: "drive", label: "Drive (D1/A1)",
      durationMinutes: 240, durationLabel: "~4h",
      priceRange: "moderate", bookingRisk: "low", fastest: true,
      highlights: ["Slightly faster, flexible stops"],
    },
    {
      mode: "bus", label: "FlixBus / RegioJet",
      durationMinutes: 285, durationLabel: "~4h 45m",
      priceRange: "budget", priceFrom: "from €8",
      bookingRisk: "low",
      highlights: ["Cheapest option; book day-before is usually fine"],
    },
  ],

  "budapest|vienna": [
    {
      mode: "train", label: "Railjet (ÖBB)",
      durationMinutes: 180, durationLabel: "~2h 30m",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "low", recommended: true,
      highlights: ["Comfortable, scenic Danube valley views", "Frequent departures"],
    },
    {
      mode: "bus", label: "FlixBus",
      durationMinutes: 195, durationLabel: "~3h 15m",
      priceRange: "budget", priceFrom: "from €8",
      bookingRisk: "low",
      highlights: ["Very cheap"],
    },
    {
      mode: "drive", label: "Drive (M1)",
      durationMinutes: 195, durationLabel: "~3h 15m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible"],
      watchOut: "Austrian motorway vignette required (~€10 for 10 days)",
    },
  ],

  "berlin|prague": [
    {
      mode: "train", label: "Eurocity (EC)",
      durationMinutes: 270, durationLabel: "~4h",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "low", recommended: true,
      highlights: ["Scenic route through Saxon Switzerland gorge", "Central stations both ends"],
      riskNote: "New high-speed line opens ~2028 — will cut journey to ~2h",
    },
    {
      mode: "drive", label: "Drive (A17/D5)",
      durationMinutes: 225, durationLabel: "~3h 30m",
      priceRange: "moderate", bookingRisk: "low", fastest: true,
      highlights: ["Fastest current option", "Scenic via Dresden"],
    },
    {
      mode: "bus", label: "FlixBus",
      durationMinutes: 315, durationLabel: "~5h 15m",
      priceRange: "budget", priceFrom: "from €5",
      bookingRisk: "low",
      highlights: ["Very affordable"],
    },
  ],

  "amsterdam|berlin": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true, fastest: true,
      highlights: ["~1h 30m in the air; quickest option for this distance"],
    },
    {
      mode: "train", label: "ICE (high-speed)",
      durationMinutes: 390, durationLabel: "~6h",
      priceRange: "moderate", priceFrom: "from €30",
      bookingRisk: "low",
      highlights: ["Comfortable, no airport hassle", "Book early for cheap fares"],
      watchOut: "Significantly longer than flying — choose this for the journey, not speed",
    },
    {
      mode: "bus", label: "FlixBus (overnight)",
      durationMinutes: 540, durationLabel: "~9h (overnight option)",
      priceRange: "budget", priceFrom: "from €10",
      bookingRisk: "low",
      highlights: ["Overnight saves accommodation costs"],
    },
  ],

  "berlin|vienna": [
    {
      mode: "train", label: "Nightjet (overnight)",
      durationMinutes: 600, durationLabel: "~10h (overnight)",
      priceRange: "budget", priceFrom: "from €49 seat / €79 couchette",
      bookingRisk: "medium", recommended: true,
      highlights: ["Sleep on the train — save a night's accommodation", "Departs evening, arrives morning"],
      riskNote: "Couchette and sleeper berths sell out fast — book 4+ weeks ahead",
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 285, durationLabel: "~4h 45m door-to-door",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium", fastest: true,
      highlights: ["Best if you want to travel during the day"],
    },
  ],

  "budapest|prague": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €35",
      bookingRisk: "medium", recommended: true, fastest: true,
      highlights: ["~1h 20m in the air; quickest for this distance"],
      watchOut: "Airport transit adds 1h+ each end — drive is similar total time",
    },
    {
      mode: "drive", label: "Drive (M0/D1)",
      durationMinutes: 315, durationLabel: "~5h 15m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible; stop in Brno"],
    },
    {
      mode: "bus", label: "RegioJet bus",
      durationMinutes: 420, durationLabel: "~7h",
      priceRange: "budget", priceFrom: "from €12",
      bookingRisk: "low",
      highlights: ["Free Wi-Fi and coffee on RegioJet", "Overnight option available"],
    },
  ],

  "krakow|prague": [
    {
      mode: "drive", label: "Drive (D1/A1)",
      durationMinutes: 345, durationLabel: "~5h 45m",
      priceRange: "moderate", bookingRisk: "low", recommended: true, fastest: true,
      highlights: ["Scenic mountain route via the High Tatras", "Most practical option"],
    },
    {
      mode: "bus", label: "FlixBus / RegioJet",
      durationMinutes: 480, durationLabel: "~8h",
      priceRange: "budget", priceFrom: "from €10",
      bookingRisk: "low",
      highlights: ["Budget-friendly direct route"],
    },
    {
      mode: "plane", label: "Flight (usually via hub)",
      durationMinutes: 420, durationLabel: "~7h (with connection)",
      priceRange: "moderate", bookingRisk: "medium",
      watchOut: "No regular direct flight; a connection makes this slower than driving",
    },
  ],

  "budapest|krakow": [
    {
      mode: "drive", label: "Drive (M3/S7)",
      durationMinutes: 285, durationLabel: "~4h 45m",
      priceRange: "moderate", bookingRisk: "low", recommended: true,
      highlights: ["Scenic Tatra mountain route", "Most direct option"],
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €35",
      bookingRisk: "medium", fastest: true,
      highlights: ["Direct flights available (Ryanair BUD → KRK)"],
    },
    {
      mode: "bus", label: "Bus",
      durationMinutes: 360, durationLabel: "~6h",
      priceRange: "budget", priceFrom: "from €15",
      bookingRisk: "low",
      highlights: ["Budget option with direct services"],
    },
  ],

  "berlin|copenhagen": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true, fastest: true,
      highlights: ["~1h 20m in the air"],
    },
    {
      mode: "train", label: "Train + ferry crossing",
      durationMinutes: 300, durationLabel: "~5h (incl. ferry)",
      priceRange: "moderate", priceFrom: "from €30",
      bookingRisk: "low",
      highlights: ["Scenic; includes a 45-min Fehmarn Belt ferry crossing", "Fehmarnbelt tunnel (~2029) will cut this to ~2h 30m"],
    },
    {
      mode: "drive", label: "Drive + Puttgarden–Rødby ferry",
      durationMinutes: 390, durationLabel: "~6h 30m (incl. ferry)",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible; ferry crossing is 45 min"],
    },
  ],

  "amsterdam|copenhagen": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium", recommended: true,
      highlights: ["~1h 30m in the air; best option for this distance"],
    },
    {
      mode: "train", label: "Train (via Hamburg)",
      durationMinutes: 345, durationLabel: "~5h 30m",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Scenic, no airport hassle"],
      watchOut: "Requires a change in Hamburg",
    },
  ],

  // ── Athens (cross-Mediterranean) ───────────────────────────────────────────

  "athens|rome": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 315, durationLabel: "~5h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €60",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h 30m in the air", "Only practical option for most travelers"],
    },
    {
      mode: "ferry", label: "Ferry (Patras → Ancona/Bari, overnight)",
      durationMinutes: 1440, durationLabel: "~20–24h (overnight crossing)",
      priceRange: "budget", priceFrom: "from €50 per person",
      bookingRisk: "low",
      highlights: ["Epic Mediterranean crossing experience", "Great with a car"],
      watchOut: "Extremely long — only worth it if the journey itself is the destination",
    },
  ],

  "athens|naples": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 285, durationLabel: "~4h 45m door-to-door",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h in the air; ATH → NAP direct or via Rome"],
    },
  ],

  "athens|barcelona": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 315, durationLabel: "~5h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €60",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h 30m in the air; only viable option"],
    },
  ],

  "athens|madrid": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 345, durationLabel: "~5h 45m door-to-door",
      priceRange: "moderate", priceFrom: "from €70",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h 45m in the air; only viable option"],
    },
  ],

  "athens|paris": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 345, durationLabel: "~5h 45m door-to-door",
      priceRange: "moderate", priceFrom: "from €80",
      bookingRisk: "medium", recommended: true,
      highlights: ["~3h in the air; only viable option"],
    },
  ],

  "athens|london": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 375, durationLabel: "~6h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €80",
      bookingRisk: "medium", recommended: true,
      highlights: ["~3h 30m in the air; direct on British Airways, Aegean, easyJet"],
    },
  ],

  // ── Paris ↔ Spain ──────────────────────────────────────────────────────────

  "madrid|paris": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 285, durationLabel: "~4h 45m door-to-door",
      priceRange: "moderate", priceFrom: "from €60",
      bookingRisk: "medium", recommended: true,
      highlights: ["~2h in the air; best for this distance"],
      watchOut: "MAD and CDG are far from city center — add 1h transit each end",
    },
    {
      mode: "bus", label: "Overnight bus",
      durationMinutes: 960, durationLabel: "~16h (overnight)",
      priceRange: "budget", priceFrom: "from €20",
      bookingRisk: "low",
      highlights: ["Overnight saves accommodation", "Arrives Paris morning"],
      watchOut: "Very long — only worthwhile as an overnight option",
    },
  ],

  "barcelona|paris": [
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", recommended: true, fastest: true,
      highlights: ["~2h in the air; faster door-to-door"],
      watchOut: "BCN and CDG airport transit adds ~2h total",
    },
    {
      mode: "train", label: "TGV (direct)",
      durationMinutes: 420, durationLabel: "~6h 30m",
      priceRange: "moderate", priceFrom: "from €50",
      bookingRisk: "medium",
      highlights: ["Barcelona Sants ↔ Gare de Lyon — both central", "No airport hassle; scenic Pyrenees views"],
    },
  ],

  // ── Krakow connections ────────────────────────────────────────────────────

  "berlin|krakow": [
    {
      mode: "train", label: "Train (via Warsaw or direct)",
      durationMinutes: 390, durationLabel: "~5h 30m",
      priceRange: "moderate", priceFrom: "from €25",
      bookingRisk: "low", recommended: true,
      highlights: ["Improving direct services", "Comfortable overnight option also available"],
    },
    {
      mode: "drive", label: "Drive (A12/A2)",
      durationMinutes: 360, durationLabel: "~6h",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible"],
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", fastest: true,
      highlights: ["~1h in the air"],
    },
  ],

  "budapest|berlin": [
    {
      mode: "train", label: "Train (Eurocity / Nightjet)",
      durationMinutes: 420, durationLabel: "~6h 30m (or overnight)",
      priceRange: "moderate", priceFrom: "from €30",
      bookingRisk: "low", recommended: true,
      highlights: ["Direct services; overnight Nightjet option saves accommodation"],
    },
    {
      mode: "plane", label: "Flight",
      durationMinutes: 255, durationLabel: "~4h 15m door-to-door",
      priceRange: "moderate", priceFrom: "from €40",
      bookingRisk: "medium", fastest: true,
      highlights: ["~1h 30m in the air"],
    },
    {
      mode: "drive", label: "Drive",
      durationMinutes: 420, durationLabel: "~7h",
      priceRange: "moderate", bookingRisk: "low",
      highlights: ["Flexible; stop in Vienna or Prague"],
    },
  ],

};

// ─── Heuristic fallback for uncurated pairs ──────────────────────────────────

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const a2 =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `~${m}m`;
  return m === 0 ? `~${h}h` : `~${h}h ${m}m`;
}

function estimateOptions(from: CityLeg, to: CityLeg): TransitOption[] {
  // No coordinates — generic fallback
  if (!from.center || !to.center) {
    return [
      {
        mode: "plane",
        label: "Flight",
        durationMinutes: 300,
        durationLabel: "~5h (estimated door-to-door)",
        priceRange: "moderate",
        bookingRisk: "medium",
        recommended: true,
        highlights: ["Check available airlines for this route"],
      },
    ];
  }

  const km = haversineKm(from.center, to.center);

  // ── Long-haul / intercontinental ──────────────────────────────────────────
  if (km > 4000) {
    const flightMin = Math.round((km / 900) * 60) + 180; // 900 km/h cruise + airport overhead
    return [
      {
        mode: "plane",
        label: "Long-haul flight",
        durationMinutes: flightMin,
        durationLabel: `${fmt(flightMin)} door-to-door`,
        priceRange: "expensive",
        bookingRisk: "medium",
        recommended: true,
        highlights: ["Only practical option for this distance"],
        watchOut: "Book well in advance; prices rise steeply last-minute",
      },
    ];
  }

  // ── Regional (< 200 km) ───────────────────────────────────────────────────
  if (km < 200) {
    const trainMin = Math.round((km / 100) * 60) + 30;
    const driveMin = Math.round((km / 90) * 60) + 15;
    const busMin = driveMin + 30;
    return [
      {
        mode: "train",
        label: "Regional train",
        durationMinutes: trainMin,
        durationLabel: fmt(trainMin),
        priceRange: "budget",
        bookingRisk: "low",
        recommended: true,
        highlights: ["City center to city center", "Usually bookable same-day"],
      },
      {
        mode: "drive",
        label: "Drive",
        durationMinutes: driveMin,
        durationLabel: fmt(driveMin),
        priceRange: "moderate",
        bookingRisk: "low",
        highlights: ["Flexible, no timetable"],
      },
      {
        mode: "bus",
        label: "Bus",
        durationMinutes: busMin,
        durationLabel: fmt(busMin),
        priceRange: "budget",
        bookingRisk: "low",
        highlights: ["Cheapest option"],
      },
    ];
  }

  // ── Medium (200–700 km) — train competes ──────────────────────────────────
  if (km < 700) {
    const trainMin = Math.round((km / 140) * 60) + 30; // ~140 km/h average incl. stops
    const driveMin = Math.round((km / 90) * 60) + 15;
    const flightMin = Math.round((km / 800) * 60) + 180;
    const opts: TransitOption[] = [
      {
        mode: "train",
        label: "Train",
        durationMinutes: trainMin,
        durationLabel: fmt(trainMin),
        priceRange: "moderate",
        bookingRisk: "low",
        recommended: trainMin <= flightMin,
        highlights: ["City center to city center", "No airport overhead"],
      },
      {
        mode: "drive",
        label: "Drive",
        durationMinutes: driveMin,
        durationLabel: fmt(driveMin),
        priceRange: "moderate",
        bookingRisk: "low",
        highlights: ["Flexible schedule"],
      },
    ];
    if (km > 400) {
      opts.push({
        mode: "plane",
        label: "Flight",
        durationMinutes: flightMin,
        durationLabel: `${fmt(flightMin)} door-to-door`,
        priceRange: "moderate",
        bookingRisk: "medium",
        recommended: flightMin < trainMin,
        fastest: flightMin < trainMin,
        highlights: ["Faster if airports are convenient"],
        watchOut: "Airport overhead can erode the time advantage",
      });
    }
    return opts;
  }

  // ── Long domestic / regional international (700–4000 km) ─────────────────
  const flightMin = Math.round((km / 850) * 60) + 180;
  const trainMin = Math.round((km / 160) * 60) + 30; // slower long-distance average
  const driveMin = Math.round((km / 90) * 60) + 15;
  return [
    {
      mode: "plane",
      label: "Flight",
      durationMinutes: flightMin,
      durationLabel: `${fmt(flightMin)} door-to-door`,
      priceRange: "moderate",
      bookingRisk: "medium",
      recommended: true,
      fastest: true,
      highlights: ["Fastest option for this distance"],
      watchOut: "Book 2+ weeks ahead for best fares",
    },
    {
      mode: "train",
      label: "Train (may require changes)",
      durationMinutes: trainMin,
      durationLabel: fmt(trainMin),
      priceRange: "moderate",
      bookingRisk: "low",
      highlights: ["No airport hassle", "Overnight trains available on some routes"],
      watchOut: "Long journey — check if a direct service exists",
    },
    ...(driveMin < 480
      ? [
          {
            mode: "drive" as TransitMode,
            label: "Drive",
            durationMinutes: driveMin,
            durationLabel: fmt(driveMin),
            priceRange: "moderate" as PriceRange,
            bookingRisk: "low" as BookingRisk,
            highlights: ["Flexible; split over two days if needed"],
          } satisfies TransitOption,
        ]
      : []),
  ];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getTransitLeg(from: CityLeg, to: CityLeg): TransitLeg {
  const key = [from.slug, to.slug].sort().join("|");
  const options = ROUTES[key] ?? estimateOptions(from, to);
  return {
    fromSlug: from.slug,
    toSlug: to.slug,
    fromCity: from.displayCity,
    toCity: to.displayCity,
    options,
  };
}

export function getMultiCityTransit(legs: CityLeg[]): TransitLeg[] {
  const result: TransitLeg[] = [];
  for (let i = 0; i < legs.length - 1; i++) {
    result.push(getTransitLeg(legs[i], legs[i + 1]));
  }
  return result;
}
