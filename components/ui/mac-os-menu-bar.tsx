"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, ChevronDown, MapPin, Menu, MessageCircle, X } from "lucide-react";

import { brandShortName, countryLabel, directionsUrl, siteName, whatsappHref } from "@/lib/contact";

type AppTab = "home" | "menu" | "orders" | "visit";

interface MacOSMenuBarProps {
  className?: string;
  onNavigate: (tab: AppTab) => void;
}

const menus = [
  {
    label: "Browse",
    items: [
      { label: "Home", tab: "home" as const },
      { label: "Full menu", tab: "menu" as const },
    ],
  },
  {
    label: "Rogers",
    items: [
      { label: "Your order", tab: "orders" as const },
      { label: "Visit and services", tab: "visit" as const },
    ],
  },
];

export default function MacOSMenuBar({ className = "", onNavigate }: MacOSMenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [qatarTime, setQatarTime] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // iOS-style pop: the panel springs out of its menu title, then the rows blur-in one by one.
  const panelVariants: Variants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.1 } },
      }
    : {
        hidden: { opacity: 0, scale: 0.92, y: -10 },
        show: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: "spring", stiffness: 460, damping: 32, mass: 0.6, staggerChildren: 0.04, delayChildren: 0.03 },
        },
        exit: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.16 } },
      };

  const rowVariants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 420, damping: 30 } },
        exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
      };

  useEffect(() => {
    const updateTime = () => {
      setQatarTime(
        new Intl.DateTimeFormat("en-QA", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "Asia/Qatar",
        }).format(new Date())
      );
    };

    updateTime();
    const interval = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeMenu && !mobileOpen) return;

    const closeMenus = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeMenu, mobileOpen]);

  return (
    <header className={`fixed inset-x-3 top-3 z-[110] mx-auto max-w-7xl md:inset-x-6 md:top-5 ${className}`}>
      <nav
        ref={navRef}
        aria-label="Main navigation"
        className="relative flex h-14 items-center justify-between rounded-md border border-white/20 bg-[#251d1b]/85 px-3 text-white shadow-[0_12px_38px_rgba(22,10,12,0.25)] backdrop-blur-xl md:px-5"
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex min-w-0 items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          aria-label={`${siteName} home`}
        >
          <img src="/brand/rogers-mark.svg" alt="" className="size-9 shrink-0 object-contain" />
          <span className="flex flex-col leading-none">
            <span className="text-xs font-semibold tracking-[0.2em]">{brandShortName}</span>
            <span className="mt-1 text-[9px] tracking-[0.14em] text-white/55">{countryLabel}</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {menus.map((menu) => {
            const isOpen = activeMenu === menu.label;
            const menuId = `menu-${menu.label.toLowerCase()}`;

            return (
              <div className="relative" key={menu.label}>
                <motion.button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={menuId}
                  onClick={() => setActiveMenu(isOpen ? null : menu.label)}
                  whileTap={{ scale: 0.96 }}
                  className={`flex h-10 items-center gap-1.5 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e5ce9a] ${
                    isOpen ? "bg-white/10 text-white" : "text-white/80 hover:text-white"
                  }`}
                >
                  {menu.label}
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="grid place-items-center"
                  >
                    <ChevronDown aria-hidden="true" className="size-3.5" />
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key={menuId}
                      id={menuId}
                      role="menu"
                      aria-label={menu.label}
                      variants={panelVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      style={{ transformOrigin: "top left" }}
                      className="absolute left-0 top-[calc(100%+12px)] min-w-52 rounded-xl border border-white/15 bg-[#251d1b]/95 p-1.5 shadow-[0_18px_48px_rgba(12,6,8,0.45)] backdrop-blur-xl"
                    >
                      {menu.items.map((item) => (
                        <motion.button
                          type="button"
                          role="menuitem"
                          key={item.label}
                          variants={rowVariants}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onNavigate(item.tab);
                            setActiveMenu(null);
                          }}
                          className="group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {item.label}
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-3.5 -translate-x-1 text-white/60 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                          />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <button type="button" onClick={() => onNavigate("visit")} className="px-3 py-2 text-sm text-white/80 transition-colors hover:text-white">
            Hospitality
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <a href="/gallery" className="hidden text-xs font-medium text-white/75 transition-colors hover:text-white lg:inline">Gallery</a>
          <a href="/reviews" className="hidden text-xs font-medium text-white/75 transition-colors hover:text-white lg:inline">Reviews</a>
          <span className="hidden text-xs tabular-nums text-white/65 lg:inline">{qatarTime} · Qatar</span>
          {whatsappHref !== null && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Message ${siteName} on WhatsApp`}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-[#d8bd86] px-2.5 text-xs font-semibold text-[#28191b] transition-colors hover:bg-[#ead8b0] sm:px-3.5 sm:text-sm"
          >
            <MessageCircle aria-hidden="true" className="size-3.5" />
            <span>WhatsApp</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
          )}
          {directionsUrl !== null && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Find ${siteName} on the map`}
            className="hidden size-9 place-items-center rounded-sm border border-white/25 text-white transition-colors hover:bg-white/10 sm:grid"
          >
            <MapPin aria-hidden="true" className="size-4" />
          </a>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            className="grid size-9 place-items-center rounded-sm border border-white/20 text-white md:hidden"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                className="grid place-items-center"
              >
                {mobileOpen ? <X aria-hidden="true" className="size-4" /> : <Menu aria-hidden="true" className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-nav"
              variants={panelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ transformOrigin: "top center" }}
              className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-xl border border-white/15 bg-[#251d1b]/95 p-1.5 shadow-[0_18px_48px_rgba(12,6,8,0.45)] backdrop-blur-xl md:hidden"
            >
              {[
                { label: "Home", href: "/" },
                { label: "Gallery", href: "/gallery" },
                { label: "Reviews", href: "/reviews" },
                ...(directionsUrl ? [{ label: "Directions", href: directionsUrl }] : []),
              ].map((item) => (
                <motion.a
                  key={item.label}
                  variants={rowVariants}
                  whileTap={{ scale: 0.98 }}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-sm text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                  <ArrowUpRight
                    aria-hidden="true"
                    className={`size-3.5 ${item.href.startsWith("http") ? "text-white/55" : "text-white/25"}`}
                  />
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}