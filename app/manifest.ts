import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Venturo — Travel planner",
    short_name: "Venturo",
    description:
      "Plan smarter trips in minutes: where to stay, what to do, where to eat, day by day.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#1B2A4A",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
