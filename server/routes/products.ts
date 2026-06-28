import { Router } from "express";
import { db } from "../db.ts";

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 2000, 2000);
  const rows = db.prepare("SELECT * FROM products ORDER BY id LIMIT ?").all(limit);
  res.json(rows);
});
