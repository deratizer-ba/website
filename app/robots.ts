import type { MetadataRoute } from "next"
import { absoluteSitePath } from "@/lib/site-config"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: absoluteSitePath("/sitemap.xml"),
  }
}
