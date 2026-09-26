"use client";

import { Carousel, Card } from "@/components/ui/specials-linear-carousel";
import { galleryPhotos } from "@/lib/gallery";

/**
 * Rogers Cafe carousel showcasing cafe highlights using real gallery images
 * and representative menu categories. Uses the existing 2 gallery photos
 * from the Google listing without modification.
 */

const cafeHighlights = [
  {
    src: galleryPhotos[0].src, // Dining room
    title: "Warm Dining Space",
    category: "Ambiance",
    content: "Elegant seating with warm lighting",
  },
  {
    src: galleryPhotos[1].src, // Counter
    title: "Fresh Counter Service",
    category: "Service",
    content: "Watch your coffee being crafted",
  },
  {
    src: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=85",
    title: "Signature Espresso",
    category: "Coffee",
    content: "Bold, full-bodied shots",
  },
  {
    src: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=800&q=85",
    title: "Iced Specialties",
    category: "Cold Drinks",
    content: "Refreshing iced coffee creations",
  },
  {
    src: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85",
    title: "Fresh Pastries",
    category: "Bakery",
    content: "Baked daily with care",
  },
  {
    src: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85",
    title: "Light Bites",
    category: "Food",
    content: "Sandwiches and savory treats",
  },
];

export default function RogersCarousel() {
  const cards = cafeHighlights.map((card, index) => (
    <Card key={card.title + index} card={card} index={index} />
  ));

  return (
    <section className="w-full bg-[#f7f4ee] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b] text-center">
          Discover Rogers
        </p>
        <h2 className="mt-3 text-center font-display text-3xl md:text-4xl text-[#322624]">
          Experience Our Cafe
        </h2>
        <p className="mt-2 text-center text-sm text-[#81766f] max-w-2xl mx-auto">
          From signature coffee to warm ambiance — explore what makes Rogers Cafe Qatar special
        </p>
      </div>
      <Carousel items={cards} autoplay={true} autoplaySpeed={0.3} />
    </section>
  );
}