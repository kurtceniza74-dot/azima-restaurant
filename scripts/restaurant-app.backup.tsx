"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Copy,
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
import { formatPrice, menuCategories, menuItems, type MenuCategory, type MenuItem } from "@/lib/menu";
import type { Fulfillment, OrderItem, OrderStatus, PublicOrder } from "@/lib/order-types";
import {
  deliveryPartners,
  directionsUrl,
  mapCode,
  officialProfileUrl,
  phoneDisplay,
  phoneHref,
  whatsappDisplay,
  whatsappHref,
} from "@/lib/contact";

type AppTab = "home" | "menu" | "orders" | "visit";
const pendingOrderStorageKey = "azima-pending-order";
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

function buildOrderWhatsAppUrl(order: PublicOrder) {
  const message = [
    "AZIMA I WANT TO ORDER",
    `Order type: ${order.fulfillment}`,
    ...order.items.map((item) => `${item.quantity} x ${item.name} - ${formatPrice(item.price * item.quantity)}`),
    `Subtotal: ${formatPrice(order.subtotal)}`,
    `ORDER CODE #${order.code}`,
  ].join("\n");
  return `${whatsappHref}?text=${encodeURIComponent(message)}`;
}

interface QuantityControlProps {
  item: MenuItem;
  quantity: number;
  onChange: (itemId: string, change: number) => void;
}

function QuantityControl({ item, quantity, onChange }: QuantityControlProps) {
  if (quantity === 0) {
    return (
      <button type="button" aria-label={`Add ${item.name}`} onClick={() => onChange(item.id, 1)} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#692336] text-white transition-colors hover:bg-[#4f1929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f6f3b] focus-visible:ring-offset-2">
        <Plus aria-hidden="true" className="size-4" />
      </button>
    );
  }

  return (
    <div className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#692336] px-2 text-white">
      <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => onChange(item.id, -1)} className="grid size-7 place-items-center rounded-full hover:bg-white/15"><Minus aria-hidden="true" className="size-3.5" /></button>
      <span className="min-w-3 text-center text-sm font-semibold tabular-nums">{quantity}</span>
      <button type="button" aria-label={`Add one ${item.name}`} onClick={() => onChange(item.id, 1)} className="grid size-7 place-items-center rounded-full hover:bg-white/15"><Plus aria-hidden="true" className="size-3.5" /></button>
    </div>
  );
}

function ProductRow({ item, quantity, onChange }: QuantityControlProps) {
  return (
    <article className="flex min-w-0 items-center gap-3 rounded-md border border-[#ded6c9] bg-white p-3 shadow-[0_4px_18px_rgba(51,33,28,0.035)] sm:gap-4">
      <img src={item.imageUrl} alt={item.name} decoding="async" className="size-[84px] shrink-0 rounded-sm object-cover sm:size-[88px]" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-[#322624]">{item.name}</p>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-[#81766f]">{item.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs"><span className="font-semibold text-[#692336]">{formatPrice(item.price)}</span><span className="text-[#b2a79b]">·</span><span className="flex items-center gap-1 text-[#81766f]"><Clock3 aria-hidden="true" className="size-3" /> {item.prepTime} min</span></div>
      </div>
      <QuantityControl item={item} quantity={quantity} onChange={onChange} />
    </article>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-md border border-[#ded6c9] bg-white px-4 text-[#81766f] focus-within:border-[#8f6f3b]">
      <Search aria-hidden="true" className="size-4 shrink-0" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search dishes and drinks" className="min-w-0 flex-1 bg-transparent text-sm text-[#322624] outline-none placeholder:text-[#a69b91]" aria-label="Search menu" />
    </label>
  );
}

function CategoryTabs({ active, onSelect }: { active: MenuCategory; onSelect: (category: MenuCategory) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Menu categories">
      {menuCategories.map((category) => <button key={category} type="button" aria-pressed={active === category} onClick={() => onSelect(category)} className={`h-9 shrink-0 rounded-full px-4 text-xs font-medium transition-colors ${active === category ? "bg-[#692336] text-white" : "border border-[#ded6c9] bg-white text-[#6b625b] hover:border-[#8f6f3b]"}`}>{category}</button>)}
    </div>
  );
}

function MobileHeader({ cartCount, hasOrder, onNavigate }: { cartCount: number; hasOrder: boolean; onNavigate: (tab: AppTab) => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e0d5] bg-[#f7f4ee]/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-xl items-center justify-between">
        <button type="button" onClick={() => onNavigate("home")} className="flex items-center gap-2.5 text-left"><img src="/brand/azima-profile.png" alt="" className="size-10 shrink-0 object-cover" /><span><span className="block text-sm font-semibold tracking-[0.16em] text-[#322624]">AZIMA</span><span className="mt-0.5 block text-[10px] text-[#81766f]">DOHA, QATAR</span></span></button>
        <button type="button" onClick={() => onNavigate("orders")} aria-label={hasOrder ? "Track current order" : `Open order, ${cartCount} items`} className="relative grid size-10 place-items-center rounded-full border border-[#ded6c9] bg-white text-[#692336]"><ShoppingBag aria-hidden="true" className="size-[18px]" />{(cartCount > 0 || hasOrder) && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[#692336] px-1 text-[10px] font-semibold leading-5 text-white">{cartCount || "•"}</span>}</button>
      </div>
    </header>
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
  const visibleItems = menuItems.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase())).slice(0, 3);
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10"><div className="min-w-0"><div className="mb-5"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">Good food, close by</p><h1 className="mt-2 font-display text-[30px] leading-tight text-[#322624] sm:text-4xl">What sounds good today?</h1><p className="mt-2 text-sm text-[#81766f]">A warm welcome from Azima Restaurant, Doha.</p></div>
      <SearchField value={search} onChange={onSearch} />
      <div className="mt-4 flex h-11 w-full rounded-md bg-[#eae5da] p-1" role="group" aria-label="Choose dining option">{(["Dine in", "Takeaway"] as const).map((option) => <button key={option} type="button" aria-pressed={fulfillment === option} onClick={() => onFulfillment(option)} className={`flex-1 rounded-sm text-sm font-medium transition-colors ${fulfillment === option ? "bg-white text-[#692336] shadow-sm" : "text-[#6b625b]"}`}>{option}</button>)}</div>
      <button type="button" onClick={() => onNavigate("menu")} className="group relative mt-6 flex min-h-44 w-full items-end overflow-hidden rounded-md bg-[#2b1c1c] p-5 text-left text-white sm:min-h-52 sm:p-7" style={{ backgroundImage: "linear-gradient(90deg, rgba(35,22,22,.92), rgba(35,22,22,.25)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85')", backgroundPosition: "center", backgroundSize: "cover" }}><span className="relative block max-w-sm"><span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#e3c98f]">Made for sharing</span><span className="mt-2 block font-display text-3xl leading-tight sm:text-4xl">A little more Azima.</span><span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90">Browse the menu <ArrowRight aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-1" /></span></span></button>
      <div className="mt-7 flex items-center justify-between gap-3"><h2 className="font-display text-2xl text-[#322624]">Find your favourite</h2><button type="button" onClick={() => onNavigate("menu")} className="text-xs font-semibold text-[#692336]">Full menu</button></div><div className="mt-3"><CategoryTabs active={category} onSelect={onCategory} /></div><div className="mt-4 space-y-3">{visibleItems.length ? visibleItems.map((item) => <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />) : <p className="rounded-md border border-dashed border-[#cfc5b6] px-4 py-8 text-center text-sm text-[#81766f]">No menu items match that search.</p>}</div>
      </div><aside className="hidden lg:block"><div className="sticky top-24 border-l border-[#ded6c9] pl-7 pt-1"><p className="text-[10px] font-semibold uppercase tracking-[0.19em] text-[#8f6f3b]">The Azima touch</p><h2 className="mt-3 font-display text-3xl leading-tight text-[#322624]">A table with heart.</h2><p className="mt-3 text-sm leading-6 text-[#6b625b]">Generous hospitality, vibrant flavours, and the simple pleasure of sharing a meal.</p><div className="mt-7 space-y-4 border-y border-[#ded6c9] py-5 text-sm text-[#6b625b]"><p className="flex items-center gap-3"><Utensils aria-hidden="true" className="size-4 text-[#692336]" /> Dine in, takeaway, and gatherings</p><p className="flex items-center gap-3"><MapPin aria-hidden="true" className="size-4 text-[#692336]" /> Doha, Qatar</p></div><button type="button" onClick={() => onNavigate("visit")} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#692336]">More about Azima <ArrowUpRight aria-hidden="true" className="size-4" /></button></div></aside></div>
  );
}

function MenuView({ category, onCategory, search, onSearch, quantities, onQuantity }: { category: MenuCategory; onCategory: (category: MenuCategory) => void; search: string; onSearch: (value: string) => void; quantities: Record<string, number>; onQuantity: (itemId: string, change: number) => void }) {
  const visibleItems = menuItems.filter((item) => (category === "All" || item.category === category) && `${item.name} ${item.description}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="mx-auto max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">From the Azima kitchen</p><h1 className="mt-2 font-display text-[30px] leading-tight text-[#322624] sm:text-4xl">The menu</h1><p className="mt-2 text-sm text-[#81766f]">Prices shown in Qatari riyals.</p><div className="mt-6"><SearchField value={search} onChange={onSearch} /></div><div className="mt-4"><CategoryTabs active={category} onSelect={onCategory} /></div><div className="mt-5 space-y-3">{visibleItems.length ? visibleItems.map((item) => <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />) : <p className="rounded-md border border-dashed border-[#cfc5b6] px-4 py-10 text-center text-sm text-[#81766f]">No menu items match that search.</p>}</div></section>;
}

function OrderTrackingView({ order, onStartAnotherOrder }: { order: PublicOrder; onStartAnotherOrder: () => void }) {
  const isRejected = order.status === "rejected";
  const isDelivered = order.status === "delivered";
  const isConfirmed = order.status === "confirmed" || isDelivered;
  const isSubmitted = order.status === "submitted";

  const statusTitle = isSubmitted
    ? "Order Confirmed"
    : order.status === "confirmed"
      ? "Order Accepted & Preparing"
      : isRejected
        ? "Order Not Accepted"
        : "Order Delivered";

  return (
    <section className="mx-auto max-w-2xl" aria-labelledby="order-status-title">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6f3b]">Order · #{order.code}</p>
        <span className="rounded-full bg-[#f4ece1] px-2.5 py-0.5 text-xs font-semibold capitalize text-[#692336]">{order.fulfillment}</span>
      </div>

      <h1 id="order-status-title" className="mt-2 font-display text-[28px] leading-tight text-[#322624] sm:text-4xl">
        {statusTitle}
      </h1>

      {isSubmitted && (
        <div className="mt-4 rounded-lg border border-[#b48a43]/30 bg-[#fdfbf7] p-4 text-sm text-[#4a3b32]">
          <p className="font-semibold text-[#692336]">
            Order confirmed! Please wait for a response from the cooking team.
          </p>
          <p className="mt-1 text-xs text-[#81766f]">
            Thank you for your patience — our chefs have received your order.
          </p>
        </div>
      )}

      {isConfirmed && !isDelivered && (
        <div className="mt-4 rounded-lg border border-[#28634c]/30 bg-[#f4f9f6] p-4 text-sm text-[#28634c]">
          <p className="font-semibold">The kitchen is preparing your dishes!</p>
          <p className="mt-1 text-xs text-[#4b6a5a]">
            Your order has been accepted. We will let you know once it is ready.
          </p>
        </div>
      )}

      <div role="status" aria-live="polite" className="mt-5 flex items-center gap-3 border-y border-[#ded6c9] py-3.5">
        <span className={`size-2.5 rounded-full ${isSubmitted ? "animate-pulse bg-[#b48a43]" : isRejected ? "bg-[#ad392b]" : "bg-[#28634c]"}`} />
        <span className="text-sm font-semibold text-[#322624]">
          {isSubmitted
            ? "Awaiting kitchen response"
            : order.status === "confirmed"
              ? "Kitchen preparing your meal"
              : isRejected
                ? "Azima could not accept this order"
                : "Delivered · Enjoy your meal!"}
        </span>
      </div>

      <div className="mt-6 border-b border-[#ded6c9]">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 border-t border-[#ded6c9] py-3 text-sm">
            <span>{item.quantity} x {item.name}</span>
            <span className="font-medium text-[#692336]">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-[#ded6c9] py-3 text-sm">
          <span className="text-[#81766f]">Subtotal</span>
          <span className="font-semibold text-[#322624]">{formatPrice(order.subtotal)}</span>
        </div>
      </div>

      <ol className="mt-6">
        <li className="border-b border-[#ded6c9] py-4 text-sm">
          <strong>Order placed · #{order.code}</strong>
          <p className="mt-1 text-xs text-[#81766f]">
            {order.submittedAt ? new Date(order.submittedAt).toLocaleString("en-QA", { dateStyle: "medium", timeStyle: "short" }) : "Placed online"}
          </p>
        </li>
        <li className="border-b border-[#ded6c9] py-4 text-sm">
          <strong>Kitchen status</strong>
          <p className="mt-1 text-xs text-[#81766f]">
            {isSubmitted ? "Waiting for kitchen response" : isRejected ? "Declined" : "Confirmed & preparing"}
          </p>
        </li>
        <li className="py-4 text-sm">
          <strong className={isDelivered ? "text-[#322624]" : "text-[#81766f]"}>Fulfillment status</strong>
          <p className="mt-1 text-xs text-[#81766f]">
            {isDelivered ? "Completed / Delivered" : isRejected ? "No delivery will follow" : "In progress"}
          </p>
        </li>
      </ol>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={buildOrderWhatsAppUrl(order)}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-center gap-2 border border-[#28634c] bg-[#f4f9f6] px-4 text-sm font-semibold text-[#28634c] hover:bg-[#e7f3ec]"
        >
          <MessageCircle aria-hidden="true" className="size-4" /> Notify us on WhatsApp? <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
        {(isRejected || isDelivered) && (
          <button type="button" onClick={onStartAnotherOrder} className="min-h-11 border border-[#ded6c9] px-5 text-sm font-semibold text-[#692336] hover:bg-white">
            Start another order
          </button>
        )}
      </div>
    </section>
  );
}


function OrderReviewView({
  order,
  selectedItems,
  quantities,
  onQuantity,
  fulfillment,
  isPlacingOrder,
  error,
  onPlaceOrder,
  onNavigate,
}: {
  order: PublicOrder | null;
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
        <div className="mt-8 border border-dashed border-[#cfc5b6] bg-white/60 px-5 py-12 text-center">
          <ShoppingBag aria-hidden="true" className="mx-auto size-8 text-[#8f6f3b]" />
          <h2 className="mt-4 font-display text-2xl text-[#322624]">Your bag is waiting</h2>
          <p className="mt-2 text-sm text-[#81766f]">Add a favourite from the menu to get started.</p>
          <button
            type="button"
            onClick={() => onNavigate("menu")}
            className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[#692336] px-5 text-sm font-semibold text-white"
          >
            Browse menu <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-sm text-[#81766f]">{fulfillment} · {reviewItems.reduce((sum, item) => sum + item.quantity, 0)} items</p>
          <div className="mt-6 space-y-3">
            {selectedItems.map((item) => (
              <ProductRow key={item.id} item={item} quantity={quantities[item.id] ?? 0} onChange={onQuantity} />
            ))}
          </div>

          <div className="mt-6 border-t border-[#ded6c9] pt-5">
            <div className="flex items-center justify-between text-sm text-[#6b625b]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#322624]">{formatPrice(subtotal)}</span>
            </div>

            {error && <p role="alert" className="mt-3 text-sm text-[#ad392b]">{error}</p>}

            <button
              type="button"
              disabled={isPlacingOrder}
              onClick={onPlaceOrder}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded bg-[#692336] px-5 text-base font-semibold text-white shadow-md hover:bg-[#521b2b] disabled:opacity-60"
            >
              {isPlacingOrder ? "Sending order to kitchen..." : "Order Now"}
            </button>

            <p className="mt-3 text-center text-xs text-[#81766f]">
              Direct to kitchen · Real-time status updates
            </p>
          </div>
        </>
      )}
    </section>
  );
}


function VisitView() {
  return <section className="mx-auto max-w-3xl"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8f6f3b]">A table with heart</p><h1 className="mt-2 font-display text-[30px] leading-tight text-[#322624] sm:text-4xl">Welcome to Azima.</h1><p className="mt-4 text-base leading-7 text-[#6b625b]">A welcoming Doha table for generous hospitality, vibrant flavours, and the simple pleasure of sharing a meal.</p><div className="mt-8 divide-y divide-[#ded6c9] border-y border-[#ded6c9]"><article className="flex gap-4 py-5"><Utensils aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#692336]" /><div><h2 className="font-semibold text-[#322624]">Dine in</h2><p className="mt-1 text-sm leading-6 text-[#81766f]">Settle in for a relaxed meal and thoughtful hospitality in Doha.</p></div></article><article className="flex gap-4 py-5"><ShoppingBag aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#692336]" /><div><h2 className="font-semibold text-[#322624]">Takeaway</h2><p className="mt-1 text-sm leading-6 text-[#81766f]">Take your Azima favourites with you and make any table feel like home.</p></div></article><article className="flex gap-4 py-5"><UsersRound aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#692336]" /><div><h2 className="font-semibold text-[#322624]">Gather together</h2><p className="mt-1 text-sm leading-6 text-[#81766f]">Bring friends and family together for milestones, reunions, and shared plates.</p></div></article></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><a href={phoneHref} className="flex min-h-12 items-center justify-center gap-2 border border-[#ded6c9] bg-white px-4 text-sm font-semibold text-[#692336]"><Phone aria-hidden="true" className="size-4" /> Call {phoneDisplay}</a><a href={whatsappHref} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 bg-[#28634c] px-4 text-sm font-semibold text-white"><MessageCircle aria-hidden="true" className="size-4" /> WhatsApp {whatsappDisplay}</a></div><a href={directionsUrl} target="_blank" rel="noreferrer" className="mt-3 flex min-h-12 items-center justify-center gap-2 bg-[#692336] px-4 text-sm font-semibold text-white"><MapPin aria-hidden="true" className="size-4" /> Directions to Azima, Doha <ArrowUpRight aria-hidden="true" className="size-4" /></a></section>;
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
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [orderStorageReady, setOrderStorageReady] = useState(false);
  const [guestCsrfToken, setGuestCsrfToken] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const cartCount = Object.values(quantities).reduce((total, quantity) => total + quantity, 0);
  const cartTotal = menuItems.reduce((total, item) => total + item.price * (quantities[item.id] ?? 0), 0);

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
    setGuestCsrfToken(null);
    setWhatsappOpened(false);
    setOrderError(null);
    setActiveTab("menu");
  };

  const cartCountOrOrder = cartCount > 0 || activeOrder !== null;

  return (
    <div className="min-h-screen bg-[#f7f4ee] text-[#322624]">
      <MacOSMenuBar className="hidden md:block" onNavigate={setActiveTab} />
      <MobileHeader cartCount={cartCount} hasOrder={activeOrder !== null} onNavigate={setActiveTab} />
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 md:pt-24 lg:px-10">
        {activeTab === "home" && <HomeView category={category} onCategory={(next) => { setCategory(next); setActiveTab("menu"); }} search={search} onSearch={setSearch} quantities={quantities} onQuantity={changeQuantity} onNavigate={setActiveTab} fulfillment={fulfillment} onFulfillment={setFulfillment} />}
        {activeTab === "menu" && <MenuView category={category} onCategory={setCategory} search={search} onSearch={setSearch} quantities={quantities} onQuantity={changeQuantity} />}
        {activeTab === "orders" && (activeOrder?.status && activeOrder.status !== "draft" ? (
          <OrderTrackingView order={activeOrder} onStartAnotherOrder={startAnotherOrder} />
        ) : (
          <OrderReviewView
            order={activeOrder}
            selectedItems={menuItems.filter((item) => (quantities[item.id] ?? 0) > 0)}
            quantities={quantities}
            onQuantity={changeQuantity}
            fulfillment={fulfillment}
            isPlacingOrder={isPlacingOrder}
            error={orderError}
            onPlaceOrder={() => void handlePlaceOrder()}
            onNavigate={setActiveTab}
          />
        ))}
        {activeTab === "visit" && <VisitView />}
      </main>
      {cartCount > 0 && activeTab !== "orders" && !activeOrder && <button type="button" onClick={() => setActiveTab("orders")} className="fixed inset-x-4 bottom-[88px] z-40 mx-auto flex min-h-12 max-w-xl items-center justify-between rounded-sm bg-[#692336] px-4 text-left text-white shadow-lg md:bottom-6 md:left-auto md:right-8 md:mx-0 md:w-80"><span className="text-sm font-semibold">Review order · {cartCount} {cartCount === 1 ? "item" : "items"}</span><span className="flex items-center gap-2 text-sm font-semibold">{formatPrice(cartTotal)} <ArrowRight aria-hidden="true" className="size-4" /></span></button>}
      <nav aria-label="App navigation" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-md border border-[#e8e0d5] bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-[0_10px_35px_rgba(51,33,28,0.13)] backdrop-blur-lg md:hidden"><div className="grid grid-cols-4">{navigation.map(({ tab, label, icon: Icon }) => <button key={tab} type="button" aria-current={activeTab === tab ? "page" : undefined} onClick={() => setActiveTab(tab)} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${activeTab === tab ? "text-[#692336]" : "text-[#81766f]"}`}><span className="relative"><Icon aria-hidden="true" className="size-[18px]" />{tab === "orders" && cartCountOrOrder && <span className="absolute -right-2 -top-1 size-2 rounded-full bg-[#b58b45]" />}</span>{label}</button>)}</div></nav>
    </div>
  );
}
