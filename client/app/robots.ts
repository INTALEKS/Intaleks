import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/settings", "/login", "/auth/", "/partner-invite/"],
    },
    sitemap: "https://www.intaleks.com/sitemap.xml",
  };
}
