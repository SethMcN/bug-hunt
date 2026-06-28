import { Router } from "express";
import { db } from "../db.ts";

export const statsRouter = Router();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Three independent summary tiles. Each is artificially slow (~150ms) so the
// difference between parallel and serial fetching is visible: parallel ~150ms,
// serial ~450ms.

statsRouter.get("/revenue", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COALESCE(SUM(total_cents),0) AS v FROM orders").get();
  res.json(row);
});

statsRouter.get("/customers", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COUNT(*) AS v FROM customers").get();
  res.json(row);
});

statsRouter.get("/orders", async (_req, res) => {
  await sleep(150);
  const row = db.prepare("SELECT COUNT(*) AS v FROM orders").get();
  res.json(row);
});
