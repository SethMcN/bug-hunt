import { Router } from "express";
import { db } from "../db.ts";

export const customersRouter = Router();

customersRouter.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 2000);
  const rows = db.prepare("SELECT * FROM customers ORDER BY id LIMIT ?").all(limit);
  res.json(rows);
});

// Search backing the search-as-you-type page.
customersRouter.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) return res.json([]);
  const rows = db
    .prepare(
      "SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? ORDER BY id LIMIT 25"
    )
    .all(`%${q}%`, `%${q}%`);
  res.json(rows);
});

// Create a customer. Server-side validation is the contract: never trust the
// client. Reject empty names and malformed emails with 400 before inserting.
customersRouter.post("/", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name : "";
  const email = typeof req.body?.email === "string" ? req.body.email : "";
  const info = db
    .prepare("INSERT INTO customers (name, email, created_at) VALUES (?, ?, ?)")
    .run(name.trim(), email.trim(), new Date().toISOString());
  res.status(201).json({ id: Number(info.lastInsertRowid) });
});
