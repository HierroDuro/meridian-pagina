import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/**
 * Disallows /admin from search engine crawling. This is a defense-in-depth
 * layer only — the panel's real protection is the auth middleware; robots.txt
 * is just etiquette that also keeps admin URLs out of search results/caches.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
