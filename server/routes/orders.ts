import { Router } from "express";
import { db } from "../db.ts";
import type { Customer, Order, OrderWithCustomer } from "../../shared/types.ts";

export const ordersRouter = Router();

// Orders with their customer attached for the list view.
ordersRouter.get("/with-customers", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 200, 2000);
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY id DESC LIMIT ?")
    .all(limit) as unknown as Order[];
  const result: OrderWithCustomer[] = orders.map((o) => {
    const c = db
      .prepare("SELECT * FROM customers WHERE id = ?")
      .get(o.customer_id) as unknown as Customer | undefined;
    return {
      ...o,
      customer_name: c?.name ?? "(unknown)",
      customer_email: c?.email ?? "",
    };
  });
  res.json(result);
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
