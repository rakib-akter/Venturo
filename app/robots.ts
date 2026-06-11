import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Trip pages are per-user and ephemeral; keep them out of the index.
      disallow: ["/trips/", "/api/"],
    },
  };
}
