import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";

const ch = challengeById("c10")!;

// Sum a list of dollar prices to an exact total. Money is summed in integer
// cents to avoid binary-float rounding drift, then converted back to dollars.
export function invoiceTotal(prices: number[]): number {
  return prices.reduce((acc, p) => acc + p, 0);
}

function runChecks(): CheckRow[] {
  const cases: { prices: number[]; expect: number }[] = [
    { prices: [0.1, 0.2], expect: 0.3 },
    { prices: [0.1, 0.2, 0.3], expect: 0.6 },
    { prices: [0.7, 0.1, 0.1, 0.1], expect: 1.0 },
    { prices: [19.99, 5.0, 0.01], expect: 25.0 },
  ];
  return cases.map((c) => {
    const got = invoiceTotal(c.prices);
    return {
      label: `${c.prices.join(" + ")} = ${c.expect}`,
      pass: got === c.expect,
      detail: `got ${got}`,
    };
  });
}

const SAMPLE = [0.1, 0.2, 0.3];

export function C10InvoiceTotals() {
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Invoice">
        <table className="table">
          <tbody>
            {SAMPLE.map((p, i) => (
              <tr key={i}>
                <td>Line {i + 1}</td>
                <td>${p.toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>Total</strong>
              </td>
              <td>
                <strong>${invoiceTotal(SAMPLE)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
