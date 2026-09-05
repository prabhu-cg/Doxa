import type { MetadataRoute } from "next";
import { clientEnv } from "@/lib/env/client";

const PUBLIC_ROUTES = [
  "",
  "/features",
  "/pricing",
  "/why-doxa",
  "/about",
  "/contact",
  "/login",
  "/signup",
  "/privacy",
  "/terms",
  "/security",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clientEnv.NEXT_PUBLIC_APP_URL;

  return PUBLIC_ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
