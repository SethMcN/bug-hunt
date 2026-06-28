import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { makeCounter } from "../shared/useRenderCount.ts";
import { sleep, formatMoney } from "../shared/util.ts";
import type { Product } from "../../shared/types.ts";

const ch = challengeById("c17")!;

// Counts how many times the expensive report calculation has run.
const heavyRuns = makeCounter();

// Deliberately expensive: simulates a real aggregation heavy enough to block
// the main thread if it runs on every render.
export function computeReport(products: Product[]): number {
  heavyRuns.bump();
  let total = 0;
  for (let pass = 0; pass < 400; pass++) {
    for (const p of products) total += p.price_cents * p.stock;
  }
  return Math.round(total / 400);
}

// The heavy calculation must run only when its inputs change — never when an
// unrelated field updates. Measure recomputes across one unrelated tick.
async function runChecks(): Promise<CheckRow[]> {
  await sleep(600); // let data load and the first compute settle
  const before = heavyRuns.get();
  await sleep(800); // an unrelated tick happens in this window
  const delta = heavyRuns.get() - before;
  return [
    {
      label: "report does not recompute on unrelated updates",
      pass: delta === 0,
      detail: `recomputes/tick: ${delta} (target 0)`,
    },
  ];
}

export function C17RevenueReport() {
  const [products, setProducts] = useState<Product[]>([]);
  const [note, setNote] = useState("");
  const [, setTick] = useState(0);

  useEffect(() => {
    void apiGet<Product[]>("/api/products?limit=400").then(setProducts);
  }, []);

  // Unrelated background updates (stand-in for "every keystroke elsewhere").
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 600);
    return () => clearInterval(t);
  }, []);

  const report = computeReport(products);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} live />
      <Card title="Revenue report">
        <p className="metric">
          Weighted revenue index: <strong>{formatMoney(report)}</strong>
        </p>
        <Field label="Unrelated note (typing here should stay smooth)">
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
      </Card>
    </div>
  );
}
