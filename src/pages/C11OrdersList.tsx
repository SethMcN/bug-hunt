import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGetWithMeta } from "../api.ts";
import { formatMoney } from "../shared/util.ts";
import type { OrderWithCustomer } from "../../shared/types.ts";

const ch = challengeById("c11")!;
const LIMIT = 100;

async function runChecks(): Promise<CheckRow[]> {
  const { data, queryCount } = await apiGetWithMeta<OrderWithCustomer[]>(
    `/api/orders/with-customers?limit=${LIMIT}`
  );
  const qc = queryCount ?? -1;
  return [
    {
      label: `loading ${data.length} orders uses 1 DB query`,
      pass: qc === 1,
      detail: `queries: ${qc} (target 1)`,
    },
  ];
}

export function C11OrdersList() {
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  useEffect(() => {
    void apiGetWithMeta<OrderWithCustomer[]>(
      `/api/orders/with-customers?limit=${LIMIT}`
    ).then((r) => setOrders(r.data));
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title={`Orders (${orders.length})`}>
        <div className="scroller">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.status}</td>
                  <td>{formatMoney(o.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
