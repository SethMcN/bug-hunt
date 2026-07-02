import express from "express";
import cors from "cors";
import { db, initSchema, queryContext } from "./db.ts";
import { runSeed } from "./seedCore.ts";
import { customersRouter } from "./routes/customers.ts";
import { ordersRouter } from "./routes/orders.ts";
import { productsRouter } from "./routes/products.ts";
import { statsRouter } from "./routes/stats.ts";
import { devRouter } from "./routes/dev.ts";

initSchema();

// First-run convenience: an empty database means `npm run seed` was never run,
// so seed it now instead of serving confusing zero-row pages.
const customerCount = (db.prepare("SELECT COUNT(*) AS c FROM customers").get() as { c: number }).c;
if (customerCount === 0) {
  console.warn("Database is empty — seeding the training dataset (~13k rows)...");
  const { total } = runSeed();
  console.warn(`Seeded ${total} rows.`);
}

const app = express();
app.use(cors({ exposedHeaders: ["X-Query-Count"] }));
app.use(express.json());

// Wrap every request in a query-counting context and return the count as a
// header. The AcceptancePanel on performance pages reads X-Query-Count.
app.use((_req, res, next) => {
  queryContext.run({ queryCount: 0 }, () => {
    const store = queryContext.getStore()!;
    const origEnd = res.end.bind(res);
    res.end = ((...args: Parameters<typeof origEnd>) => {
      if (!res.headersSent) res.setHeader("X-Query-Count", String(store.queryCount));
      return origEnd(...args);
    }) as typeof res.end;
    next();
  });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/customers", customersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/products", productsRouter);
app.use("/api/stats", statsRouter);
if (process.env.NODE_ENV !== "production") {
  app.use("/api/dev", devRouter);
}

const PORT = Number(process.env.API_PORT) || 4519;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
