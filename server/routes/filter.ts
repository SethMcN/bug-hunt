import { Router } from "express";
import { db } from "../db.ts";

export const filterRouter = Router();

// Orders filtered by status. Returns one page of rows: `limit` (default 50,
// capped at 200) bounds the response so the client never downloads the whole
// table.
filterRouter.get("/orders", (req, res) => {
  const status = String(req.query.status ?? "paid");
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const rows = db
    .prepare("SELECT * FROM orders WHERE status = ? ORDER BY id DESC LIMIT ?")
    .all(status, limit);
  res.json(rows);
});
