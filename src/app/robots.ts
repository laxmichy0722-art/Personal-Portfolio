import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/data/site";

/**
 * robots.txt
 *
 * `/admin` and `/api` are disallowed: the first is authenticated and the second
 * accepts writes. Everything else is public content and is left crawlable.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}