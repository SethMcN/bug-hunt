import { memo, useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { makeCounter } from "../shared/useRenderCount.ts";
import { sleep, formatMoney } from "../shared/util.ts";
import type { Product } from "../../shared/types.ts";

const ch = challengeById("c13")!;

// Counts how many times any product row body has rendered.
const rowRenders = makeCounter();

const ProductRow = memo(function ProductRow({
  product,
  rowStyle,
}: {
  product: Product;
  rowStyle: React.CSSProperties;
}) {
  rowRenders.bump();
  return (
    <tr style={rowStyle}>
      <td>{product.id}</td>
      <td>{product.name}</td>
      <td>{formatMoney(product.price_cents)}</td>
    </tr>
  );
});

// A memoized row should not re-render when unrelated page state (the activity
// ticker) changes. Measure row re-renders across one activity tick: a healthy
// page does zero.
async function runChecks(): Promise<CheckRow[]> {
  await sleep(500); // let rows mount and settle
  const before = rowRenders.get();
  await sleep(800); // at least one activity tick passes
  const delta = rowRenders.get() - before;
  return [
    {
      label: "rows do not re-render on unrelated updates",
      pass: delta === 0,
      detail: `row re-renders/tick: ${delta} (target 0)`,
    },
  ];
}

export function C13MemoRows() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState(0);

  useEffect(() => {
    void apiGet<Product[]>("/api/products?limit=30").then(setProducts);
  }, []);

  // Unrelated background activity that should not affect the rows.
  useEffect(() => {
    const t = setInterval(() => setActivity((a) => a + 1), 600);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} live />
      <Card title={`Products — background activity tick: ${activity}`}>
        <div className="scroller">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <ProductRow key={p.id} product={p} rowStyle={{}} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
