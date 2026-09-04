import { MetadataRoute } from "next";

/**
 * @file app/robots.ts
 * Generates the robots.txt file for the application.
 * Allows all user agents to crawl the site and exposes the sitemap URL.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://loop.com/sitemap.xml",
  };
}
