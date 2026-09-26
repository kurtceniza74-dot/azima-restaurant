"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { GalleryPhoto } from "@/lib/gallery";

/**
 * Photo grid with a keyboard-operable lightbox:
 * Escape closes, arrow keys move between photos, and focus stays on the
 * trigger so screen-reader users can re-enter the dialog.
 */
export default function GalleryView({ photos }: { photos: GalleryPhoto[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const close = useCallback(() => setActiveIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null ? current : (current + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, step]);

  if (photos.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[#cfc5b6] px-4 py-12 text-center text-sm text-[#81766f]">
        Photos will appear here once the cafe supplies them.
      </p>
    );
  }

  const active = activeIndex === null ? null : photos[activeIndex];

  return (
    <>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-[#ded6c9]/70 bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#692336] focus-visible:ring-offset-2"
              aria-label={`Open photo ${index + 1} of ${photos.length}: ${photo.alt}`}
            >
              <span className="block aspect-[4/3] w-full">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && activeIndex !== null && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`Photo viewer: ${active.alt}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.2 }}
            className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.figure
              key={active.id}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-3xl"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={active.src}
                alt={active.alt}
                className="max-h-[74vh] w-full rounded-2xl object-contain"
              />
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/85">
                <span>{active.alt}</span>
                <span className="tabular-nums">
                  {activeIndex + 1} / {photos.length}
                </span>
              </figcaption>

              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="grid size-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close photo viewer"
                  className="grid size-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="grid size-10 place-items-center rounded-full border border-white/30 text-white transition-colors hover:bg-white/10"
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
