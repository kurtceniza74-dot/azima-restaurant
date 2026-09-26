/**
 * Rogers Cafe Qatar — Google Maps review sources.
 *
 * These entries are only links to the cafe's own reviews on Google Maps.
 * Nothing else is stored on purpose: add `quote`, `reviewerName`, `rating`,
 * and `date` only when they are copied verbatim from the linked review.
 * Never invent them — the Reviews section hides any field that is `null`.
 */
export interface ReviewSource {
  id: string;
  url: string;
  /** Exact text from the linked review; `null` until supplied by the client. */
  quote: string | null;
  reviewerName: string | null;
  /** Rating out of 5 exactly as shown on the linked review; `null` until supplied. */
  rating: number | null;
  date: string | null;
}

export const reviewSources: ReviewSource[] = [
  {
    id: "google-review-1",
    url: "https://maps.app.goo.gl/1qEvqVjXsMxvp4Fr7",
    quote: null,
    reviewerName: null,
    rating: null,
    date: null,
  },
  {
    id: "google-review-2",
    url: "https://maps.app.goo.gl/kVWtTqrivjZdn2xx9",
    quote: null,
    reviewerName: null,
    rating: null,
    date: null,
  },
  {
    id: "google-review-3",
    url: "https://maps.app.goo.gl/w1iTKQ2C8AJQRDtD9",
    quote: null,
    reviewerName: null,
    rating: null,
    date: null,
  },
];
