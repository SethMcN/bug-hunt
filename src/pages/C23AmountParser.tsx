import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { formatMoney } from "../shared/util.ts";

const ch = challengeById("c23")!;

// Parse a typed money amount ("$12", "12.50", "1,234.56") into integer cents.
// Returns null when the input isn't a recognizable amount.
export function parseAmount(input: string): number | null {
  const cleaned = input.trim().replace(/^\$/, "");
  const n = parseFloat(cleaned);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

function runChecks(): CheckRow[] {
  const cases: { input: string; expect: number | null }[] = [
    { input: "$12", expect: 1200 },
    { input: "12.50", expect: 1250 },
    { input: "1,234.56", expect: 123456 },
    { input: "2,000", expect: 200000 },
    { input: "abc", expect: null },
  ];
  return cases.map((c) => {
    const got = parseAmount(c.input);
    return {
      label: `"${c.input}" → ${c.expect === null ? "rejected" : `${c.expect} cents`}`,
      pass: got === c.expect,
      detail: `got ${got === null ? "rejected" : `${got} cents`}`,
    };
  });
}

export function C23AmountParser() {
  const [raw, setRaw] = useState("1,234.56");
  const cents = parseAmount(raw);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Record a payment">
        <Field label="Amount" hint='Accepts "$12", "12.50", "1,234.56"'>
          <input value={raw} onChange={(e) => setRaw(e.target.value)} />
        </Field>
        <p className="metric">
          Will be stored as:{" "}
          <strong>{cents === null ? "— not a valid amount —" : formatMoney(cents)}</strong>
        </p>
      </Card>
    </div>
  );
}
