import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rogers-cafe-qatar.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${siteUrl}/`, lastModified: now },
    { url: `${siteUrl}/gallery`, lastModified: now },
    { url: `${siteUrl}/reviews`, lastModified: now },
    { url: `${siteUrl}/privacy`, lastModified: now },
    { url: `${siteUrl}/terms`, lastModified: now },
    { url: `${siteUrl}/accessibility`, lastModified: now },
  ];
}
