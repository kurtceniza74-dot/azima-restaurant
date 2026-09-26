import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { galleryPhotos } from "@/lib/gallery";
import { siteName } from "@/lib/contact";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rogers-cafe-qatar.example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Rogers Cafe Qatar | Coffee, Pastries & Light Bites",
  description:
    "Rogers Cafe Qatar: fresh coffee, iced drinks, pastries, and light bites — a relaxed cafe in Qatar with dine-in and takeaway ordering.",
  icons: {
    icon: "/brand/rogers-mark.svg",
    shortcut: "/brand/rogers-mark.svg",
    apple: "/brand/rogers-mark.svg",
  },
  openGraph: {
    title: "Rogers Cafe Qatar",
    description:
      "Fresh coffee, pastries, and light bites in Qatar. Browse the menu, visit the gallery, and order for dine-in or takeaway.",
    type: "website",
    locale: "en_QA",
    siteName,
    images: [
      {
        url: galleryPhotos[0]?.src ?? "/brand/rogers-mark.svg",
        alt: galleryPhotos[0]?.alt ?? "Rogers Cafe Qatar",
      },
    ],
  },
};

/** Only confirmed facts are exposed to structured data — no invented address or hours. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: siteName,
  url: siteUrl,
  image: galleryPhotos[0]?.src ?? "/brand/rogers-mark.svg",
};

export const viewport: Viewport = {
  themeColor: "#692336",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}