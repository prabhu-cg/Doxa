import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env/client";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/app", "/onboarding", "/org", "/profile", "/auth"],
      },
    ],
    sitemap: `${clientEnv.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
