import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { formatMoney } from "../shared/util.ts";

const ch = challengeById("c18")!;

export interface Summary {
  revenue: number;
  customers: number;
  orders: number;
}

// Load the three independent summary tiles. They have no data dependency on
// each other, so they are fetched in parallel — total time ≈ the slowest one.
export async function loadSummary(): Promise<Summary> {
  const [revenue, customers, orders] = await Promise.all([
    apiGet<{ v: number }>("/api/stats/revenue"),
    apiGet<{ v: number }>("/api/stats/customers"),
    apiGet<{ v: number }>("/api/stats/orders"),
  ]);
  return { revenue: revenue.v, customers: customers.v, orders: orders.v };
}

async function runChecks(): Promise<CheckRow[]> {
  const t0 = performance.now();
  await loadSummary();
  const ms = Math.round(performance.now() - t0);
  return [
    {
      label: "summary tiles load in parallel",
      pass: ms < 300,
      detail: `load time: ${ms}ms (target < 300ms)`,
    },
  ];
}

export function C18DashboardSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    void loadSummary().then(setSummary);
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Dashboard summary">
        {summary === null ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="summary">
            <div className="stat">
              <div className="muted">Revenue</div>
              <b>{formatMoney(summary.revenue)}</b>
            </div>
            <div className="stat">
              <div className="muted">Customers</div>
              <b>{summary.customers}</b>
            </div>
            <div className="stat">
              <div className="muted">Orders</div>
              <b>{summary.orders}</b>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
