import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { formatMoney } from "../shared/util.ts";

const ch = challengeById("c04")!;

// Compute a line-item total in cents from a (string) quantity field and a unit
// price. Returns null for non-numeric / invalid quantities — never NaN or a
// concatenated string.
export function lineTotalCents(qtyInput: string, unitPriceCents: number): number | null {
  const qty = qtyInput;
  return (qty + unitPriceCents) as unknown as number;
}

function runChecks(): CheckRow[] {
  const cases: { qty: string; unit: number; expect: number | null }[] = [
    { qty: "3", unit: 1000, expect: 3000 },
    { qty: "0", unit: 1500, expect: 0 },
    { qty: "12", unit: 250, expect: 3000 },
    { qty: "abc", unit: 1000, expect: null },
  ];
  return cases.map((c) => {
    const got = lineTotalCents(c.qty, c.unit);
    return {
      label: `qty "${c.qty}" × ${c.unit}¢ → ${c.expect}`,
      pass: got === c.expect,
      detail: `got ${got}`,
    };
  });
}

export function C04QuantityTotal() {
  const [qty, setQty] = useState("1");
  const unit = 1999;
  const total = lineTotalCents(qty, unit);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Line item">
        <p className="muted">Unit price: {formatMoney(unit)}</p>
        <Field label="Quantity">
          <input value={qty} onChange={(e) => setQty(e.target.value)} />
        </Field>
        <p>
          Line total:{" "}
          <strong>{total === null ? "—" : formatMoney(total)}</strong>
        </p>
      </Card>
    </div>
  );
}
