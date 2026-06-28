import express from "express";
import cors from "cors";
import { db, initSchema, queryContext } from "./db.ts";
import type { OrderWithCustomer } from "../shared/types.ts";

initSchema();

const app = express();
app.use(cors({ exposedHeaders: ["X-Query-Count"] }));
app.use(express.json());

// Wrap every request in a query-counting context and return the count as a
// header. The AcceptancePanel on performance pages reads X-Query-Count.
app.use((_req, res, next) => {
  queryContext.run({ queryCount: 0 }, () => {
    res.on("close", () => {});
    const store = queryContext.getStore()!;
    const origEnd = res.end.bind(res);
    // Set the header just before the body is sent.
    res.end = ((...args: Parameters<typeof origEnd>) => {
      if (!res.headersSent) res.setHeader("X-Query-Count", String(store.queryCount));
      return origEnd(...args);
    }) as typeof res.end;
    next();
  });
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// ---- Customers ----------------------------------------------------------

app.get("/api/customers", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 2000);
  const rows = db
    .prepare("SELECT * FROM customers ORDER BY id LIMIT ?")
    .all(limit);
  res.json(rows);
});

// Search endpoint backing the search-as-you-type page.
app.get("/api/customers/search", (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json([]);
  const rows = db
    .prepare(
      "SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY id LIMIT 25"
    )
    .all(`%${q}%`, `%${q}%`);
  res.json(rows);
});

// Create a customer. Server-side validation is the contract here: never trust
// the client. Reject empty names and malformed emails with 400.
app.post("/api/customers", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : "";
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  if (name.trim().length === 0) {
    return res.status(400).json({ error: "name is required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "email is invalid" });
  }
  const info = db
    .prepare("INSERT INTO customers (name, email, created_at) VALUES (?, ?, ?)")
    .run(name.trim(), email.trim(), new Date().toISOString());
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});

// ---- Orders -------------------------------------------------------------

// Orders joined with their customer. A single query returns everything the
// list view needs — no per-row lookups.
app.get("/api/orders-with-customers", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 2000);
  const rows = db
    .prepare(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.id DESC
       LIMIT ?`
    )
    .all(limit) as OrderWithCustomer[];
  res.json(rows);
});

// Recent orders feed for the dashboard widget page.
app.get("/api/orders/recent", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 10")
    .all();
  res.json(rows);
});

// ---- Products -----------------------------------------------------------

app.get("/api/products", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 2000, 2000);
  const rows = db
    .prepare("SELECT * FROM products ORDER BY id LIMIT ?")
    .all(limit);
  res.json(rows);
});

// ---- Stats (artificially delayed; used by the dashboard summary page) ----
// Each independent stat takes ~150ms. Fetched in parallel the page loads in
// ~150ms; serialized it takes ~450ms.

app.get("/api/stats/revenue", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COALESCE(SUM(total_cents),0) AS v FROM orders").get();
  res.json(row);
});
app.get("/api/stats/customers", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COUNT(*) AS v FROM customers").get();
  res.json(row);
});
app.get("/api/stats/orders", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COUNT(*) AS v FROM orders").get();
  res.json(row);
});

const PORT = Number(process.env.API_PORT) || 4519;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
