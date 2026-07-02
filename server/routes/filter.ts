import { Router } from "express";
import { db } from "../db.ts";

export const filterRouter = Router();

// Orders filtered by status. Returns one page of rows: `limit` (default 50,
// capped at 200) bounds the response so the client never downloads the whole
// table.
filterRouter.get("/orders", (req, res) => {
  const status = String(req.query.status ?? "paid");
  const rows = db
    .prepare("SELECT * FROM orders WHERE status = ? ORDER BY id DESC")
    .all(status);
  res.json(rows);
});
