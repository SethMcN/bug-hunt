import { DatabaseSync, type StatementSync } from "node:sqlite";
import { AsyncLocalStorage } from "node:async_hooks";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.join(__dirname, "..", "data.db");

// Per-request query-count instrumentation. Each HTTP request runs inside a
// store that carries a mutable counter; every prepared-statement execution
// bumps it. Middleware reads the count and returns it as a response header so
// the AcceptancePanel can assert on real DB query volume.
interface RequestStore {
  queryCount: number;
}
export const queryContext = new AsyncLocalStorage<RequestStore>();

function bump(): void {
  const store = queryContext.getStore();
  if (store) store.queryCount++;
}

const rawDb = new DatabaseSync(DB_PATH);
rawDb.exec("PRAGMA journal_mode = WAL;");

// Wrap prepare() so every statement execution increments the per-request
// counter. Transparent to callers — they still get a StatementSync-shaped
// object with get/all/run.
const realPrepare = rawDb.prepare.bind(rawDb);
function countingPrepare(source: string): StatementSync {
  const stmt = realPrepare(source);
  const get = stmt.get.bind(stmt);
  const all = stmt.all.bind(stmt);
  const run = stmt.run.bind(stmt);
  const proxy = {
    get: (...args: Parameters<typeof get>) => {
      bump();
      return get(...args);
    },
    all: (...args: Parameters<typeof all>) => {
      bump();
      return all(...args);
    },
    run: (...args: Parameters<typeof run>) => {
      bump();
      return run(...args);
    },
  };
  return proxy as unknown as StatementSync;
}

export const db = {
  prepare: countingPrepare,
  exec: (sql: string) => rawDb.exec(sql),
};

export function initSchema(): void {
  rawDb.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      category TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
  `);
}
