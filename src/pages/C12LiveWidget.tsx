import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet, getRequestCount, resetRequestCount } from "../api.ts";
import { sleep } from "../shared/util.ts";
import type { Order } from "../../shared/types.ts";

const ch = challengeById("c12")!;
const ENDPOINT = "/api/orders/recent";

// Measure requests during an idle window: after the widget has mounted and made
// its legitimate one-time fetch, a healthy widget makes zero further requests.
async function runChecks(): Promise<CheckRow[]> {
  await sleep(400); // let the initial mount fetch settle
  resetRequestCount(ENDPOINT);
  await sleep(700); // observe a quiet window
  const n = getRequestCount(ENDPOINT);
  return [
    {
      label: "no repeat requests during an idle window",
      pass: n === 0,
      detail: `requests/0.7s: ${n} (target 0)`,
    },
  ];
}

export function C12LiveWidget() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Keep the widget's data fresh.
  useEffect(() => {
    void apiGet<Order[]>(ENDPOINT).then(setOrders);
  }, [orders]);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Recent orders">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.status}</td>
                <td>{o.created_at.slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
