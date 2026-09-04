import { MetadataRoute } from "next";

/**
 * @file app/sitemap.ts
 * Generates the sitemap.xml used by search engines to discover public pages.
 * Only public-facing URLs are listed here; authenticated app routes are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://loop.com",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
  ];
}
