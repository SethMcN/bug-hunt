import { db, initSchema } from "./db.ts";

// Deterministic seed: a large dataset so performance bugs actually manifest.
// Without volume, N+1 queries and unpaginated lists look fine.
// Exported as a function so both the CLI (`npm run seed`) and the dev-only
// reseed endpoint can restore the pristine dataset.

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const FIRST = ["Ava", "Liam", "Noah", "Emma", "Olivia", "Mia", "Lucas", "Ethan", "Sophia", "Aria", "Leo", "Maya", "Jack", "Ruby", "Theo", "Ivy", "Max", "Nora", "Sam", "Cleo"];
const LAST = ["Smith", "Jones", "Brown", "Taylor", "Wilson", "Davies", "Evans", "Thomas", "Roberts", "Walker", "Wright", "Hughes", "Green", "Hall", "Wood", "Clarke"];
const CATEGORIES = ["Audio", "Cables", "Storage", "Displays", "Input", "Power", "Networking", "Accessories"];
const PRODUCT_NOUNS = ["Hub", "Cable", "Dock", "Adapter", "Drive", "Monitor", "Keyboard", "Mouse", "Charger", "Router", "Switch", "Speaker", "Webcam", "Stand", "Case"];
const STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;

function isoDate(daysAgo: number): string {
  const d = new Date("2026-06-01T12:00:00Z");
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export interface SeedResult {
  counts: { customers: number; products: number; orders: number; order_items: number };
  total: number;
}

export function runSeed(): SeedResult {
  initSchema();

  // Fresh RNG per run so every reseed reproduces the exact same dataset.
  const rand = makeRng(42);
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  db.exec("DELETE FROM order_items; DELETE FROM orders; DELETE FROM products; DELETE FROM customers;");
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('order_items','orders','products','customers');");

  const insertCustomer = db.prepare("INSERT INTO customers (name, email, created_at) VALUES (?, ?, ?)");
  const insertProduct = db.prepare("INSERT INTO products (name, price_cents, stock, category) VALUES (?, ?, ?, ?)");
  const insertOrder = db.prepare("INSERT INTO orders (customer_id, status, created_at, total_cents) VALUES (?, ?, ?, ?)");
  const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, qty, unit_price_cents) VALUES (?, ?, ?, ?)");
  const updateOrderTotal = db.prepare("UPDATE orders SET total_cents = ? WHERE id = ?");

  const N_CUSTOMERS = 2000;
  const N_PRODUCTS = 400;
  const N_ORDERS = 3000;

  const seedAll = () => {
    for (let i = 1; i <= N_CUSTOMERS; i++) {
      const first = pick(FIRST);
      const last = pick(LAST);
      const name = `${first} ${last}`;
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;
      insertCustomer.run(name, email, isoDate(Math.floor(rand() * 700)));
    }

    const productPrices: number[] = [];
    for (let i = 1; i <= N_PRODUCTS; i++) {
      const name = `${pick(CATEGORIES)} ${pick(PRODUCT_NOUNS)} ${i}`;
      const price = 499 + Math.floor(rand() * 49900); // cents
      productPrices[i] = price;
      insertProduct.run(name, price, Math.floor(rand() * 500), pick(CATEGORIES));
    }

    for (let o = 1; o <= N_ORDERS; o++) {
      const customerId = 1 + Math.floor(rand() * N_CUSTOMERS);
      const status = pick(STATUSES as unknown as string[]);
      const nItems = 1 + Math.floor(rand() * 4);
      let total = 0;
      const orderId = Number(insertOrder.run(customerId, status, isoDate(Math.floor(rand() * 365)), 0).lastInsertRowid);
      for (let k = 0; k < nItems; k++) {
        const productId = 1 + Math.floor(rand() * N_PRODUCTS);
        const qty = 1 + Math.floor(rand() * 5);
        const unit = productPrices[productId];
        total += qty * unit;
        insertItem.run(orderId, productId, qty, unit);
      }
      updateOrderTotal.run(total, orderId);
    }
  };

  db.exec("BEGIN");
  seedAll();
  db.exec("COMMIT");

  const counts = {
    customers: (db.prepare("SELECT COUNT(*) c FROM customers").get() as { c: number }).c,
    products: (db.prepare("SELECT COUNT(*) c FROM products").get() as { c: number }).c,
    orders: (db.prepare("SELECT COUNT(*) c FROM orders").get() as { c: number }).c,
    order_items: (db.prepare("SELECT COUNT(*) c FROM order_items").get() as { c: number }).c,
  };
  const total = counts.customers + counts.products + counts.orders + counts.order_items;
  return { counts, total };
}
