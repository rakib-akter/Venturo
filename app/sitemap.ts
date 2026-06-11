import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/plan", "/preferences", "/trips", "/map", "/profile"];
  const now = new Date();
  return routes.map((path) => ({
    url: `https://venturo.app${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
