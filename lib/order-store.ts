import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { and, desc, eq, ne } from "drizzle-orm";

import { db } from "@/lib/database";
import { menuItems } from "@/lib/menu";
import { orders } from "@/lib/order-schema";
import type { Fulfillment, OrderItem, OrderStatus, PublicOrder } from "@/lib/order-types";

export class OrderStoreError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPublicOrder(order: typeof orders.$inferSelect): PublicOrder {
  const { trackingTokenHash: _trackingTokenHash, ...publicOrder } = order;
  return publicOrder;
}

function orderCode() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return Array.from({ length: 4 }, () => alphabet[randomInt(alphabet.length)]).join("");
}

function tokenMatches(storedHash: string, token: string) {
  const expected = Buffer.from(storedHash, "hex");
  const provided = createHash("sha256").update(token).digest();
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function createDraftOrder(input: unknown): Promise<{ order: PublicOrder; trackingToken: string }> {
  if (!isRecord(input)) throw new OrderStoreError("Invalid order details.", 400);
  if (input.fulfillment !== "Dine in" && input.fulfillment !== "Takeaway") {
    throw new OrderStoreError("Choose dine in or takeaway.", 400);
  }
  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 20) {
    throw new OrderStoreError("Add between 1 and 20 menu items.", 400);
  }

  const quantities = new Map<string, number>();
  for (const value of input.items) {
    if (!isRecord(value) || typeof value.id !== "string" || !Number.isInteger(value.quantity)) {
      throw new OrderStoreError("Invalid menu item.", 400);
    }
    const quantity = Number(value.quantity);
    if (quantity < 1 || quantity > 99) throw new OrderStoreError("Invalid menu item quantity.", 400);
    quantities.set(value.id, (quantities.get(value.id) ?? 0) + quantity);
  }

  const items: OrderItem[] = [...quantities.entries()].map(([id, quantity]) => {
    const menuItem = menuItems.find((item) => item.id === id);
    if (!menuItem || quantity > 99) throw new OrderStoreError("This menu item is unavailable.", 400);
    return { id, name: menuItem.name, price: menuItem.price, quantity };
  });
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const trackingToken = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = orderCode();
    const existing = await db.select({ code: orders.code }).from(orders).where(eq(orders.code, code)).limit(1);
    if (existing.length) continue;

    try {
      const [created] = await db.insert(orders).values({
        code,
        items,
        fulfillment: input.fulfillment as Fulfillment,
        subtotal,
        status: "draft",
        trackingTokenHash: createHash("sha256").update(trackingToken).digest("hex"),
        createdAt: now,
        updatedAt: now,
        submittedAt: null,
      }).returning();

      if (!created) throw new OrderStoreError("Could not create the order.", 500);
      return { order: toPublicOrder(created), trackingToken };
    } catch (error) {
      if (String(error).includes("UNIQUE constraint failed: rogers_orders.code")) continue;
      throw error;
    }
  }

  throw new OrderStoreError("Could not generate an order code. Please try again.", 503);
}

export async function getGuestOrder(code: string, trackingToken: string): Promise<PublicOrder | null> {
  const [order] = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!order || !tokenMatches(order.trackingTokenHash, trackingToken)) return null;
  return toPublicOrder(order);
}

export async function submitGuestOrder(code: string, trackingToken: string): Promise<PublicOrder> {
  const [current] = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!current || !tokenMatches(current.trackingTokenHash, trackingToken)) {
    throw new OrderStoreError("Order not found.", 404);
  }
  if (current.status !== "draft") return toPublicOrder(current);

  const now = new Date().toISOString();
  const [updated] = await db.update(orders)
    .set({ status: "submitted", submittedAt: now, updatedAt: now })
    .where(and(eq(orders.code, code), eq(orders.status, "draft")))
    .returning();

  if (!updated) throw new OrderStoreError("This order has already changed.", 409);
  return toPublicOrder(updated);
}

export async function listAdminOrders(): Promise<PublicOrder[]> {
  const result = await db.select().from(orders)
    .where(ne(orders.status, "draft"))
    .orderBy(desc(orders.createdAt));
  return result.map(toPublicOrder);
}

export async function updateAdminOrder(code: string, nextStatus: unknown): Promise<PublicOrder> {
  if (nextStatus !== "confirmed" && nextStatus !== "rejected" && nextStatus !== "delivered") {
    throw new OrderStoreError("Invalid order status.", 400);
  }

  const [current] = await db.select().from(orders).where(eq(orders.code, code)).limit(1);
  if (!current || current.status === "draft") throw new OrderStoreError("Order not found.", 404);

  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    draft: [],
    submitted: ["confirmed", "rejected"],
    confirmed: ["delivered"],
    rejected: [],
    delivered: [],
  };
  if (!allowedTransitions[current.status].includes(nextStatus)) {
    throw new OrderStoreError("This order can no longer change to that status.", 409);
  }

  const [updated] = await db.update(orders)
    .set({ status: nextStatus, updatedAt: new Date().toISOString() })
    .where(and(eq(orders.code, code), eq(orders.status, current.status)))
    .returning();

  if (!updated) throw new OrderStoreError("This order has already changed.", 409);
  return toPublicOrder(updated);
}

export function createGuestCsrfToken(code: string, trackingToken: string) {
  return createHmac("sha256", trackingToken).update(`rogers-order-submit:${code}`).digest("base64url");
}

export function verifyGuestCsrfToken(code: string, trackingToken: string, providedToken: string | null) {
  if (!providedToken) return false;
  const expected = Buffer.from(createGuestCsrfToken(code, trackingToken));
  const provided = Buffer.from(providedToken);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}