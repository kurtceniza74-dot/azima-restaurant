"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselProps {
  items: React.JSX.Element[];
  initialScroll?: number;
}

type Card = {
  src: string;
  title: string;
  category?: string;
  content: React.ReactNode;
};

export const Carousel = ({
  items,
  initialScroll = 0,
  autoplay = false,
  autoplaySpeed = 0.5,
}: CarouselProps & { autoplay?: boolean; autoplaySpeed?: number }) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<number | null>(null);
  // Whether the strip is on screen, so autoplay can stop when it is not.
  const [isVisible, setIsVisible] = useState(false);
  // Duplicate items to create infinite effect. Memoised so the strip is not
  // rebuilt (spread + cloneElement + indexOf) on every single render.
  const loopedItems = useMemo(
    () => [
      ...items,
      ...items.map((item, itemIndex) =>
        React.cloneElement(item, {
          key: (item.key ?? "") + "-duplicate",
          index: itemIndex + items.length,
        }),
      ),
    ],
    [items],
  );

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  // Keep the strip mounted-state in sync with the viewport so autoplay pauses
  // while the carousel is scrolled out of sight.
  useEffect(() => {
    const node = carouselRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll logic. Halts when the strip is hovered or scrolled out of view
  // so a looping carousel never keeps a background frame busy.
  useEffect(() => {
    if (!autoplay || isHovered || !isVisible) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current!);
      return;
    }

    const scroll = () => {
      if (carouselRef.current) {
        // Scroll by speed
        carouselRef.current.scrollLeft += autoplaySpeed;

        const scrollWidth = carouselRef.current.scrollWidth;

        if (carouselRef.current.scrollLeft >= scrollWidth / 2) {
          carouselRef.current.scrollLeft = 0;
        }

        checkScrollability();
        animationRef.current = requestAnimationFrame(scroll);
      }
    };

    animationRef.current = requestAnimationFrame(scroll);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoplay, autoplaySpeed, isHovered, isVisible]);

  const checkScrollability = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      // Compared against the previous value so the per-frame autoplay tick only
      // commits a re-render when the arrow state actually flips.
      const left = scrollLeft > 0;
      const right = scrollLeft < scrollWidth - clientWidth;
      setCanScrollLeft((was) => (was === left ? was : left));
      setCanScrollRight((was) => (was === right ? was : right));
    }
  }, []);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
    }
  };

  // Drag to scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeftState(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeftState - walk;
    }
  };

  return (
      <div
        className="relative w-full mx-auto px-4 md:px-8"
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
      >
        <div
          className={cn(
            "flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20 cursor-grab active:cursor-grabbing",
            isDragging && "cursor-grabbing scroll-auto",
          )}
          ref={carouselRef}
          onScroll={checkScrollability}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div
            className={cn(
              "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l from-[#f7f4ee] to-transparent pointer-events-none",
            )}
          ></div>

          <div className={cn("flex flex-row justify-start gap-4")}>
            {loopedItems.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 * (index % items.length),
                  ease: "easeOut",
                }}
                key={"card" + index}
                className="rounded-3xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#ded6c9] hover:bg-[#f6f1e6] disabled:opacity-50 transition-colors"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ChevronLeft className="h-6 w-6 text-[#81766f]" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white border border-[#ded6c9] hover:bg-[#f6f1e6] disabled:opacity-50 transition-colors"
            onClick={scrollRight}
            disabled={!canScrollRight}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <ChevronRight className="h-6 w-6 text-[#81766f]" />
          </button>
        </div>
      </div>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: Card;
  index: number;
  layout?: boolean;
}) => {
  return (
    <motion.button
      layoutId={layout ? `card-${card.title}-${index}` : undefined}
      className="relative z-10 flex h-60 w-56 flex-col items-start justify-end overflow-hidden rounded-3xl bg-[#f6f1e6] md:h-96 md:w-80"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-2/3 bg-gradient-to-t from-[#322624]/90 via-[#322624]/50 to-transparent" />
      <div className="relative z-40 p-8 w-full">
        {card.category && (
          <motion.p
            layoutId={layout ? `category-${card.category}-${index}` : undefined}
            className="text-left text-xs font-semibold tracking-wider uppercase text-[#d8bd86] md:text-sm"
          >
            {card.category}
          </motion.p>
        )}
        <motion.p
          layoutId={layout ? `title-${card.title}-${index}` : undefined}
          className="mt-2 max-w-xs text-left text-xl font-semibold [text-wrap:balance] text-white md:text-3xl"
        >
          {card.title}
        </motion.p>
      </div>
      <img
        src={card.src}
        alt={card.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 z-10 w-full h-full object-cover"
      />
    </motion.button>
  );
};

export default Carousel;