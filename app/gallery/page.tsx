import type { Metadata } from "next";

import GalleryView from "@/components/gallery-view";
import { siteName } from "@/lib/contact";
import { galleryPhotos } from "@/lib/gallery";

export const metadata: Metadata = {
  title: `Gallery · ${siteName}`,
  description: `Photos of ${siteName} — the dining room and counter, straight from the cafe's Google listing in Qatar.`,
};

export default function GalleryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">
        Rogers · Qatar
      </p>
      <h1 className="mt-3 font-display text-3xl">Gallery</h1>
      <p className="mt-2 text-sm text-[#81766f]">
        Photos of the cafe from its Google listing. Open any photo to view it larger.
      </p>

      <GalleryView photos={galleryPhotos} />

      <nav
        aria-label="Gallery footer"
        className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#81766f]"
      >
        <a href="/" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Home</a>
        <a href="/reviews" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Reviews</a>
        <a href="/privacy" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Privacy Policy</a>
        <a href="/terms" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Terms</a>
        <a href="/accessibility" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Accessibility</a>
        <span aria-hidden="true">·</span>
        <span>© {siteName}</span>
      </nav>
    </main>
  );
}
