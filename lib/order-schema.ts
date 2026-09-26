import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { Fulfillment, OrderItem, OrderStatus } from "@/lib/order-types";

export const orders = sqliteTable(
  "rogers_orders",
  {
    code: text("code").primaryKey(),
    items: text("items", { mode: "json" }).$type<OrderItem[]>().notNull(),
    fulfillment: text("fulfillment").$type<Fulfillment>().notNull(),
    subtotal: integer("subtotal").notNull(),
    status: text("status").$type<OrderStatus>().notNull(),
    trackingTokenHash: text("tracking_token_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    submittedAt: text("submitted_at"),
  },
  (table) => [index("rogers_orders_status_created_idx").on(table.status, table.createdAt)]
);