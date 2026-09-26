"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, ClipboardList, Clock, Loader2, LockKeyhole, LogOut, PackageCheck, RotateCw, X } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

import { formatPrice } from "@/lib/menu";
import type { OrderStatus, PublicOrder } from "@/lib/order-types";

type Screen = "checking" | "setup" | "login" | "dashboard";

interface SessionResponse {
  configured: boolean;
  authenticated: boolean;
  csrfToken: string | null;
}

const statusLabels: Record<OrderStatus, string> = {
  draft: "Draft",
  submitted: "Needs Review",
  confirmed: "Confirmed",
  rejected: "Cancelled",
  delivered: "Completed",
};

const statusOrder: OrderStatus[] = ["submitted", "confirmed", "delivered", "rejected"];

const nextActions: Partial<Record<OrderStatus, { status: OrderStatus; label: string; tone: "primary" | "quiet" | "danger" }[]>> = {
  submitted: [
    { status: "confirmed", label: "Confirm", tone: "primary" },
    { status: "rejected", label: "Decline", tone: "danger" },
  ],
  confirmed: [{ status: "delivered", label: "Mark delivered", tone: "primary" }],
};

const sectionConfig: Record<OrderStatus, { label: string; icon: typeof Clock; color: string }> = {
  submitted: { label: "Needs Review", icon: Clock, color: "#8f6f3b" },
  confirmed: { label: "Confirmed", icon: Check, color: "#692336" },
  draft: { label: "Draft", icon: ClipboardList, color: "#81766f" },
  rejected: { label: "Cancelled", icon: X, color: "#ad392b" },
  delivered: { label: "Completed", icon: PackageCheck, color: "#3d6b4f" },
};

const chipStyles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  submitted: { bg: "#f3ead8", text: "#8f6f3b", border: "#e2d3b4" },
  confirmed: { bg: "#f6ebe8", text: "#692336", border: "#e4cfc8" },
  draft: { bg: "#f3efe9", text: "#81766f", border: "#ded6c9" },
  rejected: { bg: "#f8ecea", text: "#ad392b", border: "#e7cfcb" },
  delivered: { bg: "#eef4ef", text: "#3d6b4f", border: "#d5e3d8" },
};

function orderTimestamp(value: string) {
  return new Date(value).toLocaleString("en-QA", { dateStyle: "medium", timeStyle: "short" });
}


function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={isInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function OrderCard({
  order,
  index,
  busyCode,
  onStatusChange,
}: {
  order: PublicOrder;
  index: number;
  busyCode: string | null;
  onStatusChange: (code: string, status: OrderStatus) => Promise<void>;
}) {
  const reduceMotion = useReducedMotion();
  const isMoving = busyCode === order.code;
  const actions = nextActions[order.status] ?? [];
  const chip = chipStyles[order.status];

  return (
    <motion.article
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.2, delay: Math.min(index, 8) * 0.045 }}
      className="rounded-md border border-[#ded6c9] bg-white p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-sm font-semibold text-[#692336]">#{order.code}</code>
            <motion.span
              key={order.status}
              initial={reduceMotion ? false : { opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: chip.bg, color: chip.text, borderColor: chip.border }}
            >
              {statusLabels[order.status]}
            </motion.span>
          </div>
          <p className="mt-1 text-sm text-[#6b625b]">
            {order.items.length} item{order.items.length === 1 ? "" : "s"} · {order.fulfillment}
          </p>
          <p className="text-xs text-[#81766f]">{orderTimestamp(order.createdAt)}</p>
        </div>
        <span className="font-display text-sm font-bold text-[#322624]">{formatPrice(order.subtotal)}</span>
      </div>

      {order.items.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-[#efe8dc] pt-3 text-sm text-[#6b625b]">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">{item.quantity} × {item.name}</span>
              <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={isMoving}
              onClick={() => void onStatusChange(order.code, action.status)}
              className={`inline-flex min-h-9 items-center gap-1.5 border px-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8f6f3b] disabled:opacity-60 ${
                action.tone === "primary"
                  ? "border-[#692336] bg-[#692336] text-white hover:bg-[#57202d]"
                  : action.tone === "danger"
                    ? "border-[#e7cfcb] bg-[#f8ecea] text-[#ad392b] hover:bg-[#f3e3e0]"
                    : "border-[#ded6c9] bg-[#f6f1e6] text-[#322624] hover:bg-[#efe6d6]"
              }`}
            >
              {isMoving ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.article>
  );
}


export default function AdminDashboard() {
  const [screen, setScreen] = useState<Screen>("checking");
  const [orders, setOrders] = useState<PublicOrder[]>([]);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const reduceMotion = useReducedMotion();

  const loadOrders = async () => {
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    if (response.status === 401) { setScreen("login"); setCsrfToken(null); return; }
    const result = await response.json() as { orders?: PublicOrder[]; error?: string };
    if (!response.ok || !Array.isArray(result.orders)) throw new Error(result.error ?? "Could not load orders.");
    setOrders(result.orders);
    setScreen("dashboard");
  };

  const checkSession = async () => {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" });
      const result = await response.json() as SessionResponse;
      if (!result.configured) { setScreen("setup"); return; }
      if (!result.authenticated) { setScreen("login"); return; }
      setCsrfToken(result.csrfToken);
      await loadOrders();
    } catch { setError("Could not reach the admin service. Try again."); setScreen("login"); }
  };

  useEffect(() => { void checkSession(); }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = await response.json() as { authenticated?: boolean; csrfToken?: string; error?: string };
      if (!response.ok || !result.authenticated || !result.csrfToken) {
        if (response.status === 503) setScreen("setup");
        throw new Error(result.error ?? "Sign-in failed.");
      }
      setCsrfToken(result.csrfToken);
      setPassword("");
      await loadOrders();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign-in failed.");
    } finally {
      setIsLoggingIn(false);
      setUsername("");
    }
  };

  const handleLogout = async () => {
    try {
      if (csrfToken) await fetch("/api/admin/session", { method: "DELETE", headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken } });
    } catch { /* silent */ }
    setCsrfToken(null);
    setOrders([]);
    setScreen("login");
  };

  const handleStatusChange = async (orderCode: string, newStatus: OrderStatus) => {
    if (!csrfToken) return;
    setBusyCode(orderCode);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error ?? `Could not update order ${orderCode}.`);
      }
      setOrders((current) =>
        current.map((order) => (order.code === orderCode ? { ...order, status: newStatus } : order))
      );
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Could not update order status.");
    } finally {
      setBusyCode(null);
    }
  };

  const refreshOrders = () => { void loadOrders(); };

  const ordersByStatus = useMemo(() => {
    const grouped: Record<OrderStatus, PublicOrder[]> = { draft: [], submitted: [], confirmed: [], rejected: [], delivered: [] };
    orders.forEach((order) => { if (grouped[order.status]) grouped[order.status].push(order); });
    return grouped;
  }, [orders]);

  const totalOrders = orders.length;
  const needsReviewCount = ordersByStatus.submitted.length;

  if (screen !== "dashboard") {
    return (
      <main className="min-h-screen bg-[#f7f4ee] px-4 py-16 text-[#322624]">
        {screen === "checking" && <p className="text-center text-sm text-[#81766f]">Checking admin session…</p>}

        {screen === "setup" && (
          <section className="mx-auto max-w-md border border-[#ded6c9] bg-white p-6" aria-labelledby="admin-setup-title">
            <LockKeyhole aria-hidden="true" className="size-5 text-[#692336]" />
            <h1 id="admin-setup-title" className="mt-4 font-display text-3xl">Admin setup required</h1>
            <p className="mt-3 text-sm leading-6 text-[#6b625b]">Create a private admin account from the project terminal, then restart the app.</p>
            <code className="mt-5 block border border-[#ded6c9] bg-[#f7f4ee] px-4 py-3 text-sm text-[#692336]">npm run admin:setup</code>
          </section>
        )}

        {screen === "login" && (
          <section className="mx-auto max-w-md" aria-labelledby="admin-login-title">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6f3b]">Staff access</p>
            <h1 id="admin-login-title" className="mt-3 font-display text-3xl">Sign in to Rogers Cafe</h1>
            <p className="mt-2 text-sm text-[#81766f]">Buyers can continue ordering without an account.</p>
            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              <label className="block text-sm font-medium text-[#322624]">
                Username
                <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required maxLength={64} className="mt-2 h-12 w-full border border-[#ded6c9] bg-white px-3 text-sm outline-none focus:border-[#8f6f3b]" />
              </label>
              <label className="block text-sm font-medium text-[#322624]">
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required maxLength={256} className="mt-2 h-12 w-full border border-[#ded6c9] bg-white px-3 text-sm outline-none focus:border-[#8f6f3b]" />
              </label>
              {error && <p role="alert" className="text-sm text-[#ad392b]">{error}</p>}
              <button type="submit" disabled={isLoggingIn} className="flex h-12 w-full items-center justify-center gap-2 bg-[#692336] px-4 text-sm font-semibold text-white disabled:opacity-60">
                <LockKeyhole aria-hidden="true" className="size-4" />
                {isLoggingIn ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </section>
        )}
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f4ee] text-[#322624]">
      <header className="sticky top-0 z-10 border-b border-[#ded6c9] bg-[#f7f4ee]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#692336] bg-[#692336] flex items-center justify-center">
              <span className="text-xs font-bold text-white">R</span>
            </div>
            <span className="font-display text-lg tracking-tight text-[#322624]">Rogers Cafe</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#81766f] sm:block">Admin · Qatar</span>
            <button type="button" onClick={handleLogout} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#ded6c9] bg-white px-3 text-xs font-medium text-[#6b625b] transition-colors hover:bg-[#faf7f1] focus:outline-none focus:ring-2 focus:ring-[#8f6f3b]">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6f3b]">Rogers · Qatar</p>
            <h1 className="mt-2 font-display text-4xl text-[#322624]">Orders</h1>
            <p className="mt-2 text-sm text-[#81766f]">Review requests and update their status.</p>
          </div>
          <button type="button" onClick={refreshOrders} className="inline-flex min-h-10 items-center gap-2 border border-[#ded6c9] bg-white px-3 text-xs font-semibold text-[#692336] focus:outline-none focus:ring-2 focus:ring-[#8f6f3b]">
            <RotateCw aria-hidden="true" className="size-3.5" /> Refresh
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total", value: totalOrders, color: "#322624" },
            { label: "Needs Review", value: needsReviewCount, color: "#8f6f3b" },
            { label: "Confirmed", value: ordersByStatus.confirmed.length, color: "#692336" },
            { label: "Completed", value: ordersByStatus.delivered.length, color: "#692336" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.05 * i }}
              className="rounded-md border border-[#ded6c9] bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#81766f]">{stat.label}</p>
              <p className="mt-1 text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {error && <p role="alert" className="mb-4 text-sm text-[#ad392b]">{error}</p>}

        <div className="space-y-10">
          {statusOrder.map((status) => {
            const sectionOrders = ordersByStatus[status];
            const cfg = sectionConfig[status];
            const SectionIcon = cfg.icon;

            return (
              <ScrollReveal key={status}>
                <section aria-labelledby={`status-${status}`} className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-[#ded6c9] pb-3">
                    <div className="flex size-8 items-center justify-center rounded-full border border-[#ded6c9] bg-white">
                      <SectionIcon className="size-4" style={{ color: cfg.color }} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id={`status-${status}`} className="font-display text-xl text-[#322624]">{cfg.label}</h2>
                      <p className="text-[11px] text-[#81766f]">{sectionOrders.length} order{sectionOrders.length === 1 ? "" : "s"}</p>
                    </div>
                  </div>

                  {sectionOrders.length === 0 ? (
                    <p className="border border-dashed border-[#ded6c9] bg-white px-4 py-6 text-sm text-[#81766f]">No orders in this section.</p>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {sectionOrders.map((order, index) => (
                          <OrderCard
                            key={order.code}
                            order={order}
                            index={index}
                            busyCode={busyCode}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </section>
              </ScrollReveal>
            );
          })}
        </div>
      </section>
    </main>
  );
}

