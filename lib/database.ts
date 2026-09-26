import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import * as schema from "@/lib/order-schema";

const dataDirectory = join(process.cwd(), ".data");
const databasePath = join(dataDirectory, "rogers.sqlite");
mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });

type AppDatabase = BetterSQLite3Database<typeof schema>;
const globalDatabase = globalThis as typeof globalThis & {
  rogersSqlite?: InstanceType<typeof Database>;
  rogersDatabase?: AppDatabase;
};

const sqlite = globalDatabase.rogersSqlite ?? new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS rogers_orders (
    code TEXT PRIMARY KEY NOT NULL CHECK(length(code) = 4),
    items TEXT NOT NULL,
    fulfillment TEXT NOT NULL CHECK(fulfillment IN ('Dine in', 'Takeaway')),
    subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
    status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'confirmed', 'rejected', 'delivered')),
    tracking_token_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    submitted_at TEXT
  );
  CREATE INDEX IF NOT EXISTS rogers_orders_status_created_idx
  ON rogers_orders(status, created_at);
`);

export const db = globalDatabase.rogersDatabase ?? drizzle(sqlite, { schema });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.rogersSqlite = sqlite;
  globalDatabase.rogersDatabase = db;
}