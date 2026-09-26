import { ArrowUpRight } from "lucide-react";

import { StarRating } from "@/components/ui/star-rating";
import { reviewSources } from "@/lib/reviews";

/**
 * Honest review cards: every card links to the cafe's own Google Maps review.
 * Quote, reviewer, rating, and date render only when they were copied verbatim
 * from the linked review (kept `null` in lib/reviews.ts until then).
 */
export function ReviewsSection() {
  if (reviewSources.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#cfc5b6] px-4 py-8 text-center text-sm text-[#81766f]">
        Reviews will appear here once they are linked from the cafe&apos;s Google Maps listing.
      </p>
    );
  }

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {reviewSources.map((review) => (
          <li key={review.id} className="min-w-0">
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full flex-col rounded-2xl border border-[#ded6c9]/70 bg-white/90 p-4 shadow-[0_4px_20px_rgba(51,33,28,0.035)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(51,33,28,0.08)]"
            >
              <div className="flex items-center justify-between gap-2">
                {review.rating !== null ? (
                  <StarRating rating={review.rating} />
                ) : (
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3b]">
                    Google review
                  </span>
                )}
                {review.date !== null && (
                  <span className="text-[11px] text-[#81766f]">{review.date}</span>
                )}
              </div>

              {review.quote !== null ? (
                <blockquote className="mt-3 flex-1 text-sm leading-6 text-[#4a423c]">
                  &ldquo;{review.quote}&rdquo;
                </blockquote>
              ) : (
                <p className="mt-3 flex-1 text-sm leading-6 text-[#6b625b]">
                  Open this card to read the full review on Google Maps.
                </p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#ded6c9]/70 pt-3 text-xs font-semibold text-[#692336]">
                <span className="truncate">{review.reviewerName ?? "Read the review"}</span>
                <span className="inline-flex shrink-0 items-center gap-1">
                  Google Maps
                  <ArrowUpRight aria-hidden="true" className="size-3" />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-5 text-[#81766f]">
        Cards open the review on Google Maps. Quotes and ratings are shown only when copied
        exactly from the linked review — nothing on this page is paraphrased or invented.
      </p>
    </div>
  );
}
