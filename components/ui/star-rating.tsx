import { Star } from "lucide-react";

/** Renders a numeric rating (out of 5) as filled/unfilled stars with an accessible label. */
export function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`size-4 ${
            star <= rounded ? "fill-[#d8bd86] text-[#8f6f3b]" : "text-[#cfc5b6]"
          }`}
        />
      ))}
    </span>
  );
}
