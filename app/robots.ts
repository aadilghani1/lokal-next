import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/blog-url";

export default function robots(): MetadataRoute.Robots {
  const base = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/blog/"],
        disallow: ["/dashboard/", "/api/", "/sign-in", "/sign-up"],
      },
      {
        userAgent: [
          "GPTBot",
          "Google-Extended",
          "CCBot",
          "anthropic-ai",
          "ClaudeBot",
          "PerplexityBot",
          "Bytespider",
        ],
        allow: ["/blog/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
