import type { Metadata } from "next";

import { ReviewsSection } from "@/components/reviews-section";
import { siteName } from "@/lib/contact";

export const metadata: Metadata = {
  title: `Reviews · ${siteName}`,
  description: `Guest reviews of ${siteName}, linked straight to the cafe's Google Maps listing in Qatar.`,
};

export default function ReviewsPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">
        Rogers · Qatar
      </p>
      <h1 className="mt-3 font-display text-3xl">What guests say</h1>
      <p className="mt-2 text-sm text-[#81766f]">
        Every card opens the review on Google Maps, so you can read it in full and in context.
      </p>

      <div className="mt-8">
        <ReviewsSection />
      </div>

      <nav
        aria-label="Reviews footer"
        className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#81766f]"
      >
        <a href="/" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Home</a>
        <a href="/gallery" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Gallery</a>
        <a href="/privacy" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Privacy Policy</a>
        <a href="/terms" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Terms</a>
        <a href="/accessibility" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Accessibility</a>
        <span aria-hidden="true">·</span>
        <span>© {siteName}</span>
      </nav>
    </main>
  );
}
