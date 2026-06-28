import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c05")!;

export const STOCK_MIN = 0;
export const STOCK_MAX = 1000;

// Validate a stock value against its allowed bounds.
export function validateStock(value: number): { ok: boolean; reason?: string } {
  if (!Number.isFinite(value)) return { ok: false, reason: "not a number" };
  if (value < STOCK_MIN) return { ok: false, reason: "below minimum" };
  if (value > STOCK_MAX) return { ok: false, reason: "above maximum" };
  return { ok: true };
}

function runChecks(): CheckRow[] {
  const cases: { v: number; ok: boolean }[] = [
    { v: 50, ok: true },
    { v: 0, ok: true },
    { v: 1000, ok: true },
    { v: -5, ok: false },
    { v: 5000, ok: false },
  ];
  return cases.map((c) => {
    const r = validateStock(c.v);
    return { label: `${c.v} → ${c.ok ? "allowed" : "rejected"}`, pass: r.ok === c.ok };
  });
}

export function C05StockAdjust() {
  const [raw, setRaw] = useState("50");
  const result = validateStock(Number(raw));
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Adjust stock">
        <Field label={`New stock level (${STOCK_MIN}–${STOCK_MAX})`}>
          <input value={raw} onChange={(e) => setRaw(e.target.value)} />
        </Field>
        <button className="btn" disabled={!result.ok}>
          {result.ok ? "Apply" : `Invalid: ${result.reason}`}
        </button>
      </Card>
    </div>
  );
}
