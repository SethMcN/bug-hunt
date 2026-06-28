import { Router } from "express";
import { db } from "../db.ts";
import type { OrderWithCustomer } from "../../shared/types.ts";

export const ordersRouter = Router();

// Orders joined with their customer. A single JOIN returns everything the list
// view needs — no per-row customer lookups.
ordersRouter.get("/with-customers", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 2000);
  const rows = db
    .prepare(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email
       FROM orders o
       JOIN customers c ON c.id = o.customer_id
       ORDER BY o.id DESC
       LIMIT ?`
    )
    .all(limit) as unknown as OrderWithCustomer[];
  res.json(rows);
});

// Raw orders (no customer data) for client-side enrichment demos.
ordersRouter.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 300, 2000);
  const rows = db.prepare("SELECT * FROM orders ORDER BY id LIMIT ?").all(limit);
  res.json(rows);
});

ordersRouter.get("/recent", (_req, res) => {
  const rows = db.prepare("SELECT * FROM orders ORDER BY id DESC LIMIT 10").all();
  res.json(rows);
});
