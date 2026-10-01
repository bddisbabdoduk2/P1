import type { MetadataRoute } from "next";
import { siteUrl, reviewMode } from "@/lib/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: reviewMode ? undefined : "/",
      disallow: reviewMode
        ? "/"
        : [
            "/account",
            "/admin",
            "/auth",
            "/find",
            "/compare",
            "/community/new",
          ],
    },
    sitemap: siteUrl + "/sitemap.xml",
  };
}
