import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import type { Order } from "../../shared/types.ts";

const ch = challengeById("c20")!;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Format an ISO date string from the API ("2026-03-07T…") for display,
// e.g. "Mar 7, 2026".
export function formatOrderDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function runChecks(): CheckRow[] {
  const cases: { iso: string; expect: string }[] = [
    { iso: "2026-03-07T12:00:00Z", expect: "Mar 7, 2026" },
    { iso: "2025-01-15T08:30:00Z", expect: "Jan 15, 2025" },
    { iso: "2024-06-01T00:00:00Z", expect: "Jun 1, 2024" },
    { iso: "2026-12-31T23:59:00Z", expect: "Dec 31, 2026" },
  ];
  return cases.map((c) => {
    const got = formatOrderDate(c.iso);
    return {
      label: `${c.iso.slice(0, 10)} → "${c.expect}"`,
      pass: got === c.expect,
      detail: `got "${got}"`,
    };
  });
}

export function C20DateFormatter() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    void apiGet<Order[]>("/api/orders/recent").then(setOrders);
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Recent orders">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Raw created_at</th>
              <th>Displayed date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td className="mono muted">{o.created_at.slice(0, 10)}</td>
                <td>{formatOrderDate(o.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
