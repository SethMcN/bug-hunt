import express from "express";
import cors from "cors";
import { initSchema, queryContext } from "./db.ts";
import { customersRouter } from "./routes/customers.ts";
import { ordersRouter } from "./routes/orders.ts";
import { productsRouter } from "./routes/products.ts";
import { statsRouter } from "./routes/stats.ts";

initSchema();

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

const PORT = Number(process.env.API_PORT) || 4519;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
