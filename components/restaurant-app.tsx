"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Filter,
  Home,
  MapPin,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  Utensils,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import MacOSMenuBar from "@/components/ui/mac-os-menu-bar";
import {
  featuredDrinkIds,
  featuredFoodIds,
  formatPrice,
  menuCategories,
  menuItems,
  type MenuCategory,
  type MenuItem,
} from "@/lib/menu";
import type { Fulfillment, OrderItem, OrderStatus, PublicOrder } from "@/lib/order-types";
import {
  brandShortName,
  countryLabel,
  directionsUrl,
  mapCode,
  officialProfileUrl,
  phoneDisplay,
  phoneHref,
  siteName,
  whatsappDisplay,
  whatsappHref,
} from "@/lib/contact";
import { galleryPhotos } from "@/lib/gallery";
import { ReviewsSection } from "@/components/reviews-section";
import RogersCarousel from "@/components/rogers-carousel";

type AppTab = "home" | "menu" | "orders" | "visit";
const pendingOrderStorageKey = "rogers-pending-order";
const orderStatuses: OrderStatus[] = ["draft", "submitted", "confirmed", "rejected", "delivered"];

function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.name === "string" &&
    typeof item.price === "number" && typeof item.quantity === "number";
}

function isPendingOrder(value: unknown): value is PublicOrder {
  if (typeof value !== "object" || value === null) return false;
  const order = value as Partial<PublicOrder>;
  return typeof order.code === "string" && /^[A-Za-z]{4}$/.test(order.code) &&
    Array.isArray(order.items) && order.items.every(isOrderItem) &&
    (order.fulfillment === "Dine in" || order.fulfillment === "Takeaway") &&
    typeof order.subtotal === "number" && typeof order.createdAt === "string" &&
    typeof order.updatedAt === "string" &&
    (typeof order.submittedAt === "string" || order.submittedAt === null) &&
    typeof order.status === "string" && orderStatuses.includes(order.status as OrderStatus);
}

function readPendingOrder(): PublicOrder | null {
  try {
    const stored = window.localStorage.getItem(pendingOrderStorageKey);
    if (!stored) return null;
    const order: unknown = JSON.parse(stored);
    return isPendingOrder(order) ? order : null;
  } catch {
    return null;
  }
}

function buildOrderWhatsAppUrl(order: PublicOrder): string | null {
  if (!whatsappHref) return null;
  const message = [
    "ROGERS I WANT TO ORDER",
    `Order type: ${order.fulfillment}`,
    ...order.items.map((item) => `${item.quantity} x ${item.name} - ${formatPrice(item.price * item.quantity)}`),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `ORDER CODE #${order.code}`,
  ].join("\n");
  return `${whatsappHref}?text=${encodeURIComponent(message)}`;
}

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ type: "spring", stiffness: 260, damping: 30, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shared by the desktop menu bar and the phone header so the page carries a
// single passive scroll listener instead of one per header. The state updater
// returns the previous value when the direction has not changed, so React
// bails out of the re-render rather than re-rendering the tree on every tick.
function useIsScrolledDown(threshold = 12) {
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;
      if (Math.abs(delta) < threshold) return;
      lastScrollY.current = currentScrollY;
      setIsScrolledDown((previous) => {
        const next = delta > 0 && currentScrollY > 96;
        return next === previous ? previous : next;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolledDown;
}


interface QuantityControlProps {
  item: MenuItem;
  quantity: number;
  onChange: (itemId: string, change: number) => void;
}

function QuantityControl({ item, quantity, onChange }: QuantityControlProps) {
  if (quantity === 0) {
    return (
      <motion.button
        type="button"
        aria-label={`Add ${item.name}`}
        onClick={() => onChange(item.id, 1)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.90 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#692336] text-white shadow-sm transition-colors hover:bg-[#4f1929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6f3b] focus-visible:ring-offset-2 sm:size-10"
      >
        <Plus aria-hidden="true" className="size-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[#692336] px-1.5 text-white shadow-sm sm:h-10 sm:gap-1.5 sm:px-2"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.82 }}
        aria-label={`Remove one ${item.name}`}
        onClick={() => onChange(item.id, -1)}
        className="grid size-6 place-items-center rounded-full transition-colors hover:bg-white/20 active:bg-white/30 sm:size-7"
      >
        <Minus aria-hidden="true" className="size-3 sm:size-3.5" />
      </motion.button>
      <motion.span
        key={quantity}
        initial={{ y: -4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="min-w-4 text-center text-xs font-semibold tabular-nums sm:min-w-5 sm:text-sm"
      >
        {quantity}
      </motion.span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.82 }}
        aria-label={`Add one ${item.name}`}
        onClick={() => onChange(item.id, 1)}
        className="grid size-6 place-items-center rounded-full transition-colors hover:bg-white/20 active:bg-white/30 sm:size-7"
      >
        <Plus aria-hidden="true" className="size-3 sm:size-3.5" />
      </motion.button>
    </motion.div>
  );
}

function ProductRow({ item, quantity, onChange }: QuantityControlProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#ded6c9]/70 bg-white/90 p-3 shadow-[0_4px_20px_rgba(51,33,28,0.035)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(51,33,28,0.08)] sm:gap-4 sm:p-4"
    >
      <div className="relative size-[76px] shrink-0 overflow-hidden rounded-xl sm:size-[88px]">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 will-change-transform hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold tracking-tight text-[#322624] sm:text-[15px]">{item.name}</p>
        <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[#81766f] sm:mt-1 sm:text-[13px]">{item.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#692336]">{formatPrice(item.price)}</span>
          <span className="text-[#b2a79b]">·</span>
          <span className="flex items-center gap-1 text-[#81766f]">
            <Clock3 aria-hidden="true" className="size-3" /> {item.prepTime} min
          </span>
        </div>
      </div>
      <QuantityControl item={item} quantity={quantity} onChange={onChange} />
    </motion.article>
  );
}

/** Compact card for the homepage featured strips — image on top, stepper below. */
function FeaturedCard({ item, quantity, onChange }: QuantityControlProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ type: "spring", stiffness: 280, damping: 28 }}
      className="group min-w-0 overflow-hidden rounded-2xl border border-[#ded6c9]/70 bg-white/90 shadow-[0_4px_20px_rgba(51,33,28,0.035)] backdrop-blur-sm"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#322624]">{item.name}</p>
          <p className="mt-0.5 text-xs font-semibold text-[#692336]">{formatPrice(item.price)}</p>
        </div>
        <QuantityControl item={item} quantity={quantity} onChange={onChange} />
      </div>
    </motion.article>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-2xl border border-[#ded6c9] bg-white/85 px-4 text-[#81766f] shadow-[0_2px_12px_rgba(51,33,28,0.03)] backdrop-blur-md transition-all duration-300 focus-within:border-[#692336] focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(105,35,54,0.12)] sm:h-12">
      <Search aria-hidden="true" className="size-4 shrink-0 text-[#8f6f3b]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search dishes, drinks and delicacies…"
        className="min-w-0 flex-1 bg-transparent text-xs text-[#322624] outline-none placeholder:text-[#a69b91] sm:text-sm"
        aria-label="Search menu"
      />
    </label>
  );
}

function CategoryDropdown({ active, onSelect }: { active: MenuCategory; onSelect: (category: MenuCategory) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [highlighted, setHighlighted] = useState<MenuCategory>(active);
  const [panel, setPanel] = useState({ top: 0, left: 0, width: 244, opensUpwards: false });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const shouldReduceMotion = useReducedMotion();

  const options = menuCategories.map((category) => ({
    category,
    count: category === "All" ? menuItems.length : menuItems.filter((item) => item.category === category).length,
  }));
  const optionId = (category: MenuCategory) =>
    `${baseId}-option-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => setMounted(true), []);

  // The panel is portaled to <body>, so it can never be clipped or painted behind
  // the revealed/transformed sections around it. We place it against the trigger.
  const positionPanel = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(Math.max(244, Math.round(rect.width)), Math.max(244, window.innerWidth - 24));
    const estimatedHeight = menuCategories.length * 48 + 16;
    const opensUpwards = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    setPanel({
      top: Math.round(opensUpwards ? rect.top - estimatedHeight - 10 : rect.bottom + 10),
      left: Math.round(Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12))),
      width,
      opensUpwards,
    });
  }, []);

  const open = () => {
    setHighlighted(active);
    positionPanel();
    setIsOpen(true);
  };

  const commit = useCallback(
    (category: MenuCategory) => {
      onSelect(category);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onSelect],
  );

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key === "Tab") {
        setIsOpen(false);
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const index = menuCategories.indexOf(highlighted);
        const step = event.key === "ArrowDown" ? 1 : -1;
        setHighlighted(menuCategories[(index + step + menuCategories.length) % menuCategories.length]);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        commit(highlighted);
      }
    };

    const handleReflow = () => positionPanel();

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleReflow, { passive: true, capture: true });
    window.addEventListener("resize", handleReflow);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleReflow, true);
      window.removeEventListener("resize", handleReflow);
    };
  }, [isOpen, highlighted, commit, positionPanel]);

  const panelTransition = shouldReduceMotion
    ? { duration: 0.12 }
    : { type: "spring" as const, stiffness: 460, damping: 32, mass: 0.6 };

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : open())}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: isOpen ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 26 }}
        className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-sm backdrop-blur-sm transition-colors sm:h-10 sm:gap-2 sm:px-4 ${
          isOpen
            ? "border-[#692336] bg-white text-[#692336] shadow-[0_6px_18px_rgba(105,35,54,0.14)]"
            : "border-[#ded6c9] bg-white/90 text-[#322624] hover:border-[#8f6f3b] hover:bg-white"
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${baseId}-panel` : undefined}
        aria-activedescendant={isOpen ? optionId(highlighted) : undefined}
      >
        <Filter aria-hidden="true" className="size-3 shrink-0 text-[#8f6f3b]" />
        <span className="whitespace-nowrap">{active}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="shrink-0"
        >
          <ChevronDown aria-hidden="true" className="size-3 text-[#81766f]" />
        </motion.span>
      </motion.button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                key="category-panel"
                id={`${baseId}-panel`}
                ref={panelRef}
                role="listbox"
                aria-label="Menu categories"
                initial={{ opacity: 0, scale: 0.9, y: panel.opensUpwards ? 10 : -12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: panel.opensUpwards ? 6 : -8 }}
                transition={panelTransition}
                style={{
                  top: panel.top,
                  left: panel.left,
                  width: panel.width,
                  transformOrigin: panel.opensUpwards ? "bottom left" : "top left",
                }}
                className="fixed z-[120] rounded-3xl border border-white/70 bg-white/85 p-1.5 shadow-[0_20px_60px_rgba(51,33,28,0.22)] ring-1 ring-[#ded6c9]/70 backdrop-blur-2xl"
              >
                <motion.div
                  initial={shouldReduceMotion ? undefined : "hidden"}
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } } }}
                  className="flex flex-col gap-0.5"
                >
                  {options.map(({ category, count }) => {
                    const isHighlighted = highlighted === category;
                    const isSelected = active === category;
                    return (
                      <motion.button
                        key={category}
                        id={optionId(category)}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        tabIndex={-1}
                        variants={{
                          hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
                          show: { opacity: 1, y: 0, filter: "blur(0px)" },
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setHighlighted(category)}
                        onClick={() => commit(category)}
                        className={`relative flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left text-[13px] font-medium outline-none transition-colors duration-150 ${
                          isHighlighted ? "text-white" : "text-[#4a3b32] hover:text-[#692336]"
                        }`}
                      >
                        {isHighlighted && (
                          <motion.span
                            layoutId={`${baseId}-highlight`}
                            transition={{ type: "spring", stiffness: 520, damping: 36 }}
                            className="absolute inset-0 rounded-2xl bg-[#692336] shadow-[0_8px_20px_rgba(105,35,54,0.3)]"
                          />
                        )}
                        <span className="relative whitespace-nowrap">{category}</span>
                        <span className="relative flex items-center gap-2">
                          <span className={`text-[11px] tabular-nums ${isHighlighted ? "text-white/70" : "text-[#a89e95]"}`}>
                            {count}
                          </span>
                          <motion.span
                            animate={{ scale: isSelected ? 1 : 0.5, opacity: isSelected ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 26 }}
                            className="grid size-4 place-items-center"
                          >
                            <Check aria-hidden="true" className={`size-3.5 ${isHighlighted ? "text-white" : "text-[#692336]"}`} />
                          </motion.span>
                        </span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function CategoryTabs({ active, onSelect }: { active: MenuCategory; onSelect: (category: MenuCategory) => void }) {
  return (
    <div className="flex items-center gap-2">
      <CategoryDropdown active={active} onSelect={onSelect} />
      <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Menu categories">
        {menuCategories.map((category) => {
          const isSelected = active === category;
          return (
            <motion.button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(category)}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className={`relative h-9 shrink-0 rounded-full border px-3.5 text-xs font-medium transition-colors duration-200 sm:h-10 sm:px-4 ${
                isSelected
                  ? "border-transparent text-white"
                  : "border-[#ded6c9] bg-white/80 text-[#6b625b] hover:border-[#8f6f3b] hover:bg-white hover:text-[#322624]"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="category-pill"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-[#692336] shadow-sm"
                />
              )}
              <span className="relative">{category}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MobileHeader({ cartCount, hasOrder, onNavigate, isScrolledDown }: { cartCount: number; hasOrder: boolean; onNavigate: (tab: AppTab) => void; isScrolledDown: boolean }) {

  return (
    <motion.header
      animate={{ y: isScrolledDown ? "-105%" : "0%" }}
      initial={false}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
      className="sticky top-0 z-40 border-b border-[#e8e0d5]/80 bg-[#f7f4ee]/85 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-xl will-change-transform md:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2.5 text-left"
        >
          <img src="/brand/rogers-mark.svg" alt="" className="size-9 shrink-0 rounded-lg object-contain sm:size-10" />
          <span>
            <span className="block text-sm font-semibold tracking-[0.16em] text-[#322624]">{brandShortName}</span>
            <span className="mt-0.5 block text-[10px] text-[#81766f]">{countryLabel}</span>
          </span>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onNavigate("orders")}
          aria-label={hasOrder ? "Track current order" : `Open order, ${cartCount} items`}
          className="relative grid size-10 place-items-center rounded-full border border-[#ded6c9] bg-white text-[#692336] shadow-sm transition-colors hover:bg-[#fbf9f5]"
        >
          <ShoppingBag aria-hidden="true" className="size-[18px]" />
          {(cartCount > 0 || hasOrder) && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#692336] px-1 text-[10px] font-semibold leading-5 text-white shadow-sm"
            >
              {cartCount || "•"}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}

function HomeView({ category, onCategory, search, onSearch, quantities, onQuantity, onNavigate, fulfillment, onFulfillment }: {
  category: MenuCategory;
  onCategory: (category: MenuCategory) => void;
  search: string;
  onSearch: (value: string) => void;
  quantities: Record<string, number>;
  onQuantity: (itemId: string, change: number) => void;
  onNavigate: (tab: AppTab) => void;
  fulfillment: Fulfillment;
  onFulfillment: (value: Fulfillment) => void;
}) {
  const visibleItems = menuItems.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
      <div className="min-w-0">
        <Reveal className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">Coffee & pastries · Qatar</p>
          <h1 className="mt-2 font-display text-[32px] leading-tight text-[#322624] sm:text-4xl lg:text-5xl">What sounds good today?</h1>
          <p className="mt-2 text-sm text-[#81766f]">A relaxed Rogers Cafe stop for coffee, pastries, and light bites.</p>
        </Reveal>

        <SearchField value={search} onChange={onSearch} />

        <div className="mt-4 flex h-11 w-full rounded-2xl bg-[#eae5da]/70 p-1 backdrop-blur-sm" role="group" aria-label="Choose dining option">
          {(["Dine in", "Takeaway"] as const).map((option) => {
            const isActive = fulfillment === option;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => onFulfillment(option)}
                className={`relative flex flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors sm:text-sm ${isActive ? "text-[#692336]" : "text-[#6b625b] hover:text-[#322624]"}`}
              >
                {isActive && (
                  <motion.span
                    layoutId="fulfillment-pill"
                    transition={{ type: "spring", stiffness: 520, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-white shadow-sm"
                  />
                )}
                <span className="relative">{option}</span>
              </button>
            );
          })}
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={() => onNavigate("menu")}
          className="group relative mt-6 flex min-h-44 w-full items-end overflow-hidden rounded-3xl bg-[#2b1c1c] p-6 text-left text-white shadow-[0_8px_32px_rgba(43,28,28,0.18)] sm:min-h-56 sm:p-8"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(35,22,22,.92), rgba(35,22,22,.25)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85')", backgroundPosition: "center", backgroundSize: "cover" }}
        >
          <span className="relative block max-w-sm">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e3c98f]">Slow mornings</span>
            <span className="mt-2 block font-display text-3xl leading-tight sm:text-4xl">A little more Rogers.</span>
            <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90">
              Browse the menu <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </span>
        </motion.button>

        <Reveal className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#322624]">Featured drinks</h2>
            <button type="button" onClick={() => onNavigate("menu")} className="text-xs font-semibold text-[#692336] hover:underline">
              Full menu
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {featuredDrinkIds.map((id) => {
              const item = menuItems.find((entry) => entry.id === id);
              return item ? (
                <FeaturedCard key={id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
              ) : null;
            })}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#322624]">From the kitchen</h2>
            <button type="button" onClick={() => onNavigate("menu")} className="text-xs font-semibold text-[#692336] hover:underline">
              Full menu
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {featuredFoodIds.map((id) => {
              const item = menuItems.find((entry) => entry.id === id);
              return item ? (
                <FeaturedCard key={id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
              ) : null;
            })}
          </div>
        </Reveal>

        {/* Rogers Cafe carousel showcase */}
        <div className="-mx-5 mt-12">
          <RogersCarousel />
        </div>

        <Reveal className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#322624]">Find your favourite</h2>
            <button type="button" onClick={() => onNavigate("menu")} className="text-xs font-semibold text-[#692336] hover:underline">
              Full menu
            </button>
          </div>

          <div className="mt-3">
            <CategoryTabs active={category} onSelect={onCategory} />
          </div>
        </Reveal>

        <div className="mt-5 space-y-3">
          {visibleItems.length ? (
            visibleItems.map((item) => (
              <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-[#cfc5b6] px-4 py-8 text-center text-sm text-[#81766f]">
              No menu items match that search.
            </p>
          )}
        </div>

        <Reveal className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#322624]">Around the cafe</h2>
            <a href="/gallery" className="text-xs font-semibold text-[#692336] hover:underline">
              View gallery
            </a>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {galleryPhotos.map((photo) => (
              <a
                key={photo.id}
                href="/gallery"
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-[#ded6c9]/70"
                aria-label={`View gallery: ${photo.alt}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl text-[#322624]">What guests say</h2>
            <a href="/reviews" className="text-xs font-semibold text-[#692336] hover:underline">
              All reviews
            </a>
          </div>
          <div className="mt-4">
            <ReviewsSection />
          </div>
        </Reveal>
      </div>

      <aside className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="sticky top-28 rounded-3xl border border-[#ded6c9]/80 bg-white/70 p-7 shadow-[0_4px_24px_rgba(51,33,28,0.03)] backdrop-blur-md"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#8f6f3b]">The Rogers touch</p>
          <h2 className="mt-3 font-display text-3xl leading-tight text-[#322624]">A counter with heart.</h2>
          <p className="mt-3 text-sm leading-6 text-[#6b625b]">Fresh coffee, warm pastries, and light bites — a relaxed place to pause any time of day.</p>
          <div className="mt-7 space-y-4 border-y border-[#ded6c9] py-5 text-sm text-[#6b625b]">
            <p className="flex items-center gap-3"><Utensils aria-hidden="true" className="size-4 text-[#692336]" /> Dine in, takeaway, and gatherings</p>
            <p className="flex items-center gap-3"><MapPin aria-hidden="true" className="size-4 text-[#692336]" /> Qatar</p>
          </div>
          <button type="button" onClick={() => onNavigate("visit")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#692336] hover:underline">
            Visit & contact <ArrowUpRight aria-hidden="true" className="size-4" />
          </button>
        </motion.div>
      </aside>
    </div>
  );
}

function MenuView({ category, onCategory, search, onSearch, quantities, onQuantity }: {
  category: MenuCategory;
  onCategory: (category: MenuCategory) => void;
  search: string;
  onSearch: (value: string) => void;
  quantities: Record<string, number>;
  onQuantity: (itemId: string, change: number) => void;
}) {
  const visibleItems = menuItems.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <section className="mx-auto max-w-3xl">
      <Reveal>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">From the Rogers counter</p>
        <h1 className="mt-2 font-display text-[30px] leading-tight text-[#322624] sm:text-4xl">The menu</h1>
        <p className="mt-2 text-sm text-[#81766f]">Prices shown in Qatari riyals (QAR).</p>
        <div className="mt-6"><SearchField value={search} onChange={onSearch} /></div>
        <div className="mt-4"><CategoryTabs active={category} onSelect={onCategory} /></div>
      </Reveal>
      <div className="mt-5 space-y-3">
        {visibleItems.length ? (
          visibleItems.map((item) => (
            <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[#cfc5b6] px-4 py-10 text-center text-sm text-[#81766f]">
            No menu items match that search.
          </p>
        )}
      </div>
    </section>
  );
}

function OrderTrackingView({ order, onStartAnotherOrder }: { order: PublicOrder; onStartAnotherOrder: () => void }) {
  const whatsappUrl = buildOrderWhatsAppUrl(order);
  const isRejected = order.status === "rejected";
  const isDelivered = order.status === "delivered";
  const isPreparing = order.status === "confirmed";
  const isSubmitted = order.status === "submitted";

  const steps = [
    { label: "Sent", done: true },
    { label: "Accepted", done: isPreparing || isDelivered },
    { label: "Delivered", done: isDelivered },
  ];
  const progress = isRejected ? 0 : isDelivered ? 1 : isPreparing ? 0.66 : 0.33;

  const statusTitle = isSubmitted
    ? "Order Confirmed"
    : isPreparing
      ? "Order Accepted & Preparing"
      : isRejected
        ? "Order Not Accepted"
        : "Order Delivered";

  const statusMessage = isSubmitted
    ? "Our chefs have your order — waiting for a response from the kitchen."
    : isPreparing
      ? "The kitchen is preparing your dishes right now."
      : isRejected
        ? "Rogers Cafe could not accept this order. Please contact us and we will help."
        : "Delivered · Enjoy your meal!";

  return (
    <section className="mx-auto max-w-2xl" aria-labelledby="order-status-title">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3b]">Order · #{order.code}</p>
        <span className="rounded-full bg-[#f4ece1] px-3 py-1 text-xs font-semibold capitalize text-[#692336]">{order.fulfillment}</span>
      </div>

      <h1 id="order-status-title" className="mt-2 font-display text-[28px] leading-tight text-[#322624] sm:text-4xl">
        {statusTitle}
      </h1>

      {isSubmitted && (
        <div className="mt-4 rounded-2xl border border-[#b48a43]/30 bg-[#fdfbf7] p-4 text-sm text-[#4a3b32] sm:p-5">
          <p className="font-semibold text-[#692336]">Order confirmed!</p>
          <p className="mt-1 text-xs text-[#81766f]">Please wait for a response from the cooking team.</p>
        </div>
      )}

      {isPreparing && (
        <div className="mt-4 rounded-2xl border border-[#28634c]/30 bg-[#f4f9f6] p-4 text-sm text-[#28634c] sm:p-5">
          <p className="font-semibold">The kitchen is preparing your dishes!</p>
          <p className="mt-1 text-xs text-[#4b6a5a]">Your order has been accepted. We will let you know once it is ready.</p>
        </div>
      )}

      <div role="status" aria-live="polite" className="mt-5 rounded-3xl border border-[#ded6c9]/80 bg-white/80 p-5 shadow-[0_4px_20px_rgba(51,33,28,0.035)] backdrop-blur-md sm:p-6">
        <div className="relative h-1 overflow-hidden rounded-full bg-[#eae5da]">
          <motion.div
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
            className={`absolute inset-y-0 left-0 rounded-full ${isRejected ? "bg-[#ad392b]" : "bg-[#692336]"}`}
          />
        </div>

        <div className="mt-3 grid grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex flex-col gap-1.5 ${index === 1 ? "items-center" : index === 2 ? "items-end" : "items-start"}`}
            >
              <motion.span
                animate={{ scale: step.done ? 1 : 0.65, opacity: step.done ? 1 : 0.5 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className={`size-2.5 rounded-full ${step.done ? (isRejected && index > 0 ? "bg-[#ad392b]" : "bg-[#692336]") : "bg-[#cfc5b6]"}`}
              />
              <span className={`text-[11px] font-medium ${step.done ? "text-[#322624]" : "text-[#a69b91]"}`}>{step.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 flex items-center gap-2.5 text-sm font-medium text-[#322624]">
          <span className={`size-2 shrink-0 rounded-full ${isRejected ? "bg-[#ad392b]" : isDelivered ? "bg-[#28634c]" : "animate-pulse bg-[#b48a43]"}`} />
          {statusMessage}
        </p>
      </div>

      <div className="mt-6 border-b border-[#ded6c9]">
        {order.items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, delay: 0.05 * index }}
            className="flex items-center justify-between gap-4 border-t border-[#ded6c9] py-3 text-sm"
          >
            <span>{item.quantity} x {item.name}</span>
            <span className="font-medium text-[#692336]">{formatPrice(item.price * item.quantity)}</span>
          </motion.div>
        ))}
        <div className="flex items-center justify-between border-t border-[#ded6c9] py-3 text-sm">
          <span className="text-[#81766f]">Subtotal</span>
          <span className="font-semibold text-[#322624]">{formatPrice(order.subtotal)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {whatsappUrl && (
          <motion.a
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#28634c]/30 bg-white px-5 text-sm font-semibold text-[#28634c] shadow-sm transition-colors hover:bg-[#f4f9f6]"
          >
            <MessageCircle aria-hidden="true" className="size-4" />
            <span>Notify us on WhatsApp (optional)</span>
          </motion.a>
        )}

        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartAnotherOrder}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#ded6c9] bg-white px-5 text-sm font-semibold text-[#692336] shadow-sm transition-colors hover:bg-[#fbf9f5]"
        >
          Start another order
        </motion.button>
      </div>
    </section>
  );
}

function OrderReviewView({
  selectedItems,
  quantities,
  onQuantity,
  fulfillment,
  isPlacingOrder,
  error,
  onPlaceOrder,
  onNavigate,
}: {
  selectedItems: MenuItem[];
  quantities: Record<string, number>;
  onQuantity: (itemId: string, change: number) => void;
  fulfillment: Fulfillment;
  isPlacingOrder: boolean;
  error: string | null;
  onPlaceOrder: () => void;
  onNavigate: (tab: AppTab) => void;
}) {
  const reviewItems: OrderItem[] = selectedItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: quantities[item.id] ?? 0,
  }));
  const subtotal = reviewItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="mx-auto max-w-2xl">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3b]">Order review</p>
      <h1 className="mt-2 font-display text-[30px] leading-tight text-[#322624] sm:text-4xl">Review your order</h1>

      {reviewItems.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-[#cfc5b6] bg-white/60 px-5 py-12 text-center backdrop-blur-sm">
          <ShoppingBag aria-hidden="true" className="mx-auto size-8 text-[#8f6f3b]" />
          <h2 className="mt-4 font-display text-2xl text-[#322624]">Your bag is waiting</h2>
          <p className="mt-2 text-sm text-[#81766f]">Add a favourite from the menu to get started.</p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onNavigate("menu")}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#692336] px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#521b2b]"
          >
            Browse menu <ArrowRight aria-hidden="true" className="size-4" />
          </motion.button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#81766f]">{fulfillment} · {reviewItems.reduce((sum, item) => sum + item.quantity, 0)} items</p>
          <div className="mt-6 space-y-3">
            {selectedItems.map((item) => (
              <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="mt-6 rounded-3xl border border-[#ded6c9]/80 bg-white/80 p-5 shadow-[0_4px_20px_rgba(51,33,28,0.035)] backdrop-blur-md sm:p-6"
          >
            <div className="flex items-center justify-between text-sm text-[#6b625b]">
              <span>Subtotal</span>
              <span className="text-base font-semibold text-[#322624]">{formatPrice(subtotal)}</span>
            </div>

            {error && <p role="alert" className="mt-3 text-sm text-[#ad392b]">{error}</p>}

            <motion.button
              type="button"
              disabled={isPlacingOrder}
              onClick={onPlaceOrder}
              whileHover={isPlacingOrder ? undefined : { scale: 1.01 }}
              whileTap={isPlacingOrder ? undefined : { scale: 0.98 }}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-[#692336] px-5 text-base font-semibold text-white shadow-md transition-colors hover:bg-[#521b2b] disabled:cursor-progress disabled:opacity-70"
            >
              {isPlacingOrder ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
                    className="size-4 rounded-full border-2 border-white/30 border-t-white"
                  />
                  Sending to the kitchen
                </>
              ) : (
                <>
                  Order now · {formatPrice(subtotal)}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </>
              )}
            </motion.button>

            <p className="mt-3 text-center text-xs text-[#81766f]">
              Direct to kitchen · Real-time status updates
            </p>
          </motion.div>
        </>
      )}
    </section>
  );
}

function VisitView() {
  const [copiedMapCode, setCopiedMapCode] = useState(false);

  const copyMapCode = async () => {
    if (!mapCode) return;
    try {
      await navigator.clipboard.writeText(mapCode);
      setCopiedMapCode(true);
      window.setTimeout(() => setCopiedMapCode(false), 2_000);
    } catch {
      setCopiedMapCode(false);
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <Reveal className="mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">A counter with heart</p>
        <h1 className="mt-2 font-display text-[32px] leading-tight text-[#322624] sm:text-4xl">Welcome to Rogers Cafe.</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6b625b] sm:text-base sm:leading-7">
          A relaxed Qatar cafe for fresh coffee, warm pastries, and light bites — dine in or takeaway.
        </p>
      </Reveal>

      <Reveal className="mt-8 rounded-3xl border border-[#ded6c9]/80 bg-white/70 p-5 shadow-[0_4px_24px_rgba(51,33,28,0.03)] backdrop-blur-md sm:p-7">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8f6f3b]">Hospitality & Services</h2>
        <div className="mt-4 divide-y divide-[#ded6c9]/70">
          <article className="flex gap-4 py-4 first:pt-0 last:pb-0">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#692336]/10 text-[#692336]">
              <Utensils aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#322624]">Dine in</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#81766f] sm:text-sm">Settle in for a relaxed coffee and a bite, with as much time as you need.</p>
            </div>
          </article>
          <article className="flex gap-4 py-4 last:pb-0">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#692336]/10 text-[#692336]">
              <ShoppingBag aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#322624]">Takeaway</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#81766f] sm:text-sm">Take your Rogers favourites with you and make any pause feel like home.</p>
            </div>
          </article>
          <article className="flex gap-4 py-4 last:pb-0">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#692336]/10 text-[#692336]">
              <UsersRound aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[#322624]">Gather together</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-[#81766f] sm:text-sm">Bring friends and family together for milestones, reunions, and shared plates.</p>
            </div>
          </article>
        </div>
      </Reveal>

      {!phoneHref && !whatsappHref && !mapCode && !officialProfileUrl && !directionsUrl && (
        <Reveal delay={0.05} className="mt-8 rounded-3xl border border-dashed border-[#cfc5b6] bg-white/60 p-5 backdrop-blur-md sm:p-7">
          <h2 className="text-base font-semibold text-[#322624]">Contact details coming soon</h2>
          <p className="mt-2 text-sm leading-6 text-[#81766f]">
            The cafe&apos;s phone, WhatsApp, and map links will appear on this tab as soon as they
            are published. Until then, browse the menu or read guest reviews on Google Maps.
          </p>
        </Reveal>
      )}

      {(phoneHref || whatsappHref) && (
        <Reveal delay={0.1} className="mt-8 grid gap-3 sm:grid-cols-2">
          {phoneHref && (
            <motion.a
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href={phoneHref}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#ded6c9] bg-white px-5 text-sm font-semibold text-[#692336] shadow-sm transition-colors hover:bg-[#fbf9f5]"
            >
              <Phone aria-hidden="true" className="size-4" /> Call {phoneDisplay}
            </motion.a>
          )}
          {whatsappHref && (
            <motion.a
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#28634c] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#20523e]"
            >
              <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp {whatsappDisplay}
            </motion.a>
          )}
        </Reveal>
      )}

      {mapCode && (
        <Reveal delay={0.15} className="mt-3">
          <motion.button
            type="button"
            onClick={() => void copyMapCode()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Copy map code ${mapCode}`}
            className="flex min-h-12 items-center justify-between gap-2 rounded-2xl border border-[#ded6c9] bg-white px-5 text-sm font-semibold text-[#322624] shadow-sm transition-colors hover:bg-[#fbf9f5]"
          >
            <span className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-4 text-[#692336]" /> Map code
            </span>
            <span className="flex items-center gap-2">
              <span className="tracking-[0.08em] text-[#8f6f3b]">{mapCode}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copiedMapCode ? "copied" : "copy"}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 520, damping: 26 }}
                  className="grid place-items-center"
                >
                  {copiedMapCode ? (
                    <Check aria-hidden="true" className="size-4 text-[#28634c]" />
                  ) : (
                    <Copy aria-hidden="true" className="size-4 text-[#81766f]" />
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>
        </Reveal>
      )}

      {officialProfileUrl && (
        <Reveal delay={0.15} className="mt-3">
          <motion.a
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            href={officialProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#ded6c9] bg-white px-5 text-sm font-semibold text-[#692336] shadow-sm transition-colors hover:bg-[#fbf9f5]"
          >
            Official profile <ArrowUpRight aria-hidden="true" className="size-4" />
          </motion.a>
        </Reveal>
      )}

      {directionsUrl && (
        <motion.a
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-60px" }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#692336] px-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#521b2b]"
        >
          <MapPin aria-hidden="true" className="size-4" /> Directions to {siteName} <ArrowUpRight aria-hidden="true" className="size-4" />
        </motion.a>
      )}

      <nav aria-label="Legal and privacy" className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#81766f]">
        <a href="/gallery" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Gallery</a>
        <a href="/reviews" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Reviews</a>
        <a href="/privacy" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Privacy Policy</a>
        <a href="/terms" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Terms</a>
        <a href="/accessibility" className="underline-offset-4 transition-colors hover:text-[#692336] hover:underline">Accessibility</a>
        <span aria-hidden="true">·</span>
        <span>© {siteName}</span>
      </nav>
    </section>
  );
}

function FloatingCart({
  items,
  quantities,
  onQuantity,
  onClear,
  onReview,
  cartCount,
  cartTotal,
  activeOrderCode,
}: {
  items: MenuItem[];
  quantities: Record<string, number>;
  onQuantity: (itemId: string, change: number) => void;
  onClear: () => void;
  onReview: () => void;
  cartCount: number;
  cartTotal: number;
  activeOrderCode: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const previousCount = useRef(cartCount);

  // Every new "+" opens the cart again, so guests always see what was just added.
  useEffect(() => {
    if (cartCount > previousCount.current) setIsExpanded(true);
    previousCount.current = cartCount;
  }, [cartCount]);

  return (
    <motion.section
      aria-label="Your cart"
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-50 mx-auto max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_18px_50px_rgba(51,33,28,0.24)] backdrop-blur-xl md:bottom-8 md:left-auto md:right-8 md:mx-0 md:w-96"
    >
      <div className="flex items-center gap-3 bg-[#692336] px-4 py-3 text-white">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15">
          <ShoppingBag aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1 text-left">
          <p aria-live="polite" className="truncate text-sm font-semibold tracking-wide">
            Your cart · {cartCount} {cartCount === 1 ? "item" : "items"}
          </p>
          <p className="mt-0.5 text-[11px] text-white/75">{formatPrice(cartTotal)} subtotal</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse cart" : "Expand cart"}
          className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 480, damping: 30 }}
            className="grid place-items-center"
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="cart-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="overflow-hidden"
          >
            <ul className="max-h-[min(42vh,17rem)] divide-y divide-[#ded6c9]/70 overflow-y-auto overscroll-contain px-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <img src={item.imageUrl} alt="" loading="lazy" decoding="async" className="size-11 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-[#322624]">{item.name}</p>
                    <p className="mt-0.5 text-[11px] text-[#81766f]">
                      {formatPrice(item.price)} each · {formatPrice(item.price * (quantities[item.id] ?? 0))}
                    </p>
                  </div>
                  <QuantityControl item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
                </li>
              ))}
            </ul>

            <div className="border-t border-[#ded6c9]/70 bg-[#fdfbf7] px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6b625b]">Subtotal</span>
                <span className="font-semibold tabular-nums text-[#322624]">{formatPrice(cartTotal)}</span>
              </div>

              {activeOrderCode && (
                <p className="mt-2 text-[11px] leading-relaxed text-[#81766f]">
                  Order #{activeOrderCode} stays active in the kitchen. Reviewing starts a new order with these items.
                </p>
              )}

              <motion.button
                type="button"
                onClick={onReview}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#692336] px-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#521b2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6f3b] focus-visible:ring-offset-2"
              >
                {activeOrderCode ? "Start new order" : "Review Order"}
                <ArrowRight aria-hidden="true" className="size-4" />
              </motion.button>

              <button
                type="button"
                onClick={onClear}
                className="mt-2 w-full text-center text-[11px] font-semibold text-[#8f6f3b] transition-colors hover:text-[#692336]"
              >
                Clear cart
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

const navigation: { tab: AppTab; label: string; icon: LucideIcon }[] = [
  { tab: "home", label: "Home", icon: Home },
  { tab: "menu", label: "Menu", icon: Utensils },
  { tab: "orders", label: "Orders", icon: ShoppingBag },
  { tab: "visit", label: "Visit", icon: MapPin },
];

export default function RestaurantApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [category, setCategory] = useState<MenuCategory>("All");
  const [search, setSearch] = useState("");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("Dine in");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [activeOrder, setActiveOrder] = useState<PublicOrder | null>(null);
  const [orderStorageReady, setOrderStorageReady] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const isScrolledDown = useIsScrolledDown();

  const cartCount = useMemo(
    () => Object.values(quantities).reduce((total, quantity) => total + quantity, 0),
    [quantities]
  );
  const cartTotal = useMemo(
    () => menuItems.reduce((total, item) => total + item.price * (quantities[item.id] ?? 0), 0),
    [quantities]
  );

  useEffect(() => {
    setActiveOrder(readPendingOrder());
    setOrderStorageReady(true);
  }, []);

  useEffect(() => {
    if (!orderStorageReady) return;
    try {
      if (activeOrder) window.localStorage.setItem(pendingOrderStorageKey, JSON.stringify(activeOrder));
      else window.localStorage.removeItem(pendingOrderStorageKey);
    } catch {
      return;
    }
  }, [activeOrder, orderStorageReady]);

  useEffect(() => {
    if (!orderStorageReady || !activeOrder || ["rejected", "delivered"].includes(activeOrder.status)) return;
    let cancelled = false;
    const refreshStatus = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(activeOrder.code)}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { order: PublicOrder; csrfToken?: string };
        if (!cancelled && isPendingOrder(result.order)) {
          setActiveOrder(result.order);
        }
      } catch {
        return;
      }
    };
    void refreshStatus();
    const interval = window.setInterval(() => void refreshStatus(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeOrder?.code, activeOrder?.status, orderStorageReady]);

  const changeQuantity = (itemId: string, change: number) => {
    setQuantities((current) => {
      const nextQuantity = Math.max((current[itemId] ?? 0) + change, 0);
      const next = { ...current };
      if (nextQuantity === 0) delete next[itemId];
      else next[itemId] = nextQuantity;
      return next;
    });
  };

  const handlePlaceOrder = async () => {
    const items = menuItems.filter((item) => (quantities[item.id] ?? 0) > 0).map((item) => ({ id: item.id, quantity: quantities[item.id] }));
    if (!items.length) return;
    setOrderError(null);
    setIsPlacingOrder(true);
    try {
      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillment, items }),
      });
      const createData = await createRes.json() as { order?: unknown; csrfToken?: string; error?: string };
      if (!createRes.ok || !isPendingOrder(createData.order) || typeof createData.csrfToken !== "string") {
        throw new Error(createData.error ?? "Could not create order.");
      }

      const submitRes = await fetch(`/api/orders/${encodeURIComponent(createData.order.code)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": createData.csrfToken,
        },
        body: JSON.stringify({ action: "submit" }),
      });
      const submitData = await submitRes.json() as { order?: unknown; error?: string };
      if (!submitRes.ok || !isPendingOrder(submitData.order)) {
        throw new Error(submitData.error ?? "Could not place order.");
      }

      setActiveOrder(submitData.order);
      setQuantities({});
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : "Could not place your order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const startAnotherOrder = () => {
    setActiveOrder(null);
    setOrderError(null);
    setActiveTab("menu");
  };

  const clearCart = () => setQuantities({});

  // Reviewing always opens the order screen — even while an older order is being
  // tracked — so items added with "+" are never hidden behind the tracker.
  const reviewCart = () => {
    if (activeOrder) setActiveOrder(null);
    setOrderError(null);
    setActiveTab("orders");
  };

  const cartCountOrOrder = cartCount > 0 || activeOrder !== null;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#322624]">
      <MacOSMenuBar className="hidden md:block" onNavigate={setActiveTab} hidden={isScrolledDown} />
      <MobileHeader cartCount={cartCount} hasOrder={activeOrder !== null} onNavigate={setActiveTab} isScrolledDown={isScrolledDown} />

      <main className="mx-auto max-w-7xl px-4 pb-36 pt-6 sm:px-6 md:pt-24 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          >
            {activeTab === "home" && (
              <HomeView
                category={category}
                onCategory={(next) => { setCategory(next); setActiveTab("menu"); }}
                search={search}
                onSearch={setSearch}
                quantities={quantities}
                onQuantity={changeQuantity}
                onNavigate={setActiveTab}
                fulfillment={fulfillment}
                onFulfillment={setFulfillment}
              />
            )}
            {activeTab === "menu" && (
              <MenuView
                category={category}
                onCategory={setCategory}
                search={search}
                onSearch={setSearch}
                quantities={quantities}
                onQuantity={changeQuantity}
              />
            )}
            {activeTab === "orders" && (
              activeOrder?.status && activeOrder.status !== "draft" ? (
                <OrderTrackingView order={activeOrder} onStartAnotherOrder={startAnotherOrder} />
              ) : (
                <OrderReviewView
                  selectedItems={menuItems.filter((item) => (quantities[item.id] ?? 0) > 0)}
                  quantities={quantities}
                  onQuantity={changeQuantity}
                  fulfillment={fulfillment}
                  isPlacingOrder={isPlacingOrder}
                  error={orderError}
                  onPlaceOrder={() => void handlePlaceOrder()}
                  onNavigate={setActiveTab}
                />
              )
            )}
            {activeTab === "visit" && <VisitView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Auto-opening cart: the guest sees what a "+" tap just added */}
      <AnimatePresence>
        {cartCount > 0 && activeTab !== "orders" && (
          <FloatingCart
            items={menuItems.filter((item) => (quantities[item.id] ?? 0) > 0)}
            quantities={quantities}
            onQuantity={changeQuantity}
            onClear={clearCart}
            onReview={reviewCart}
            cartCount={cartCount}
            cartTotal={cartTotal}
            activeOrderCode={activeOrder?.code ?? null}
          />
        )}
      </AnimatePresence>

      {/* Bottom Floating Navigation for Mobile */}
      <nav
        aria-label="App navigation"
        className="fixed inset-x-4 bottom-[max(env(safe-area-inset-bottom),0.75rem)] z-40 mx-auto max-w-md rounded-full border border-white/40 bg-white/85 px-3 py-1.5 shadow-[0_12px_36px_rgba(51,33,28,0.14)] backdrop-blur-xl md:hidden"
      >
        <div className="grid grid-cols-4">
          {navigation.map(({ tab, label, icon: Icon }) => {
            const isActive = activeTab === tab;
            return (
              <motion.button
                key={tab}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex min-h-12 flex-col items-center justify-center gap-1 rounded-full text-[10px] font-medium transition-colors ${isActive ? "text-[#692336] font-semibold" : "text-[#81766f]"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabMobile"
                    className="absolute inset-0 rounded-full bg-[#692336]/10"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <span className="relative">
                  <Icon aria-hidden="true" className="size-[18px]" />
                  {tab === "orders" && cartCountOrOrder && (
                    <span className="absolute -right-2 -top-1 size-2 rounded-full bg-[#692336] ring-2 ring-white" />
                  )}
                </span>
                {label}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
