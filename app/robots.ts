import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rogers-cafe-qatar.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
};

export default function Robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
