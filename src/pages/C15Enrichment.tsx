import { useEffect, useMemo, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { makeCounter } from "../shared/useRenderCount.ts";
import type { Customer, Order } from "../../shared/types.ts";

const ch = challengeById("c15")!;

export interface EnrichedOrder extends Order {
  customer_name: string;
}

// Counts customer-lookup steps performed while enriching.
export const lookupOps = makeCounter();

// Attach each order's customer name. Uses an id→customer index so each order
// costs one lookup — total work scales linearly with the number of orders.
export function enrichOrders(orders: Order[], customers: Customer[]): EnrichedOrder[] {
  return orders.map((o) => {
    const c = customers.find((cust) => {
      lookupOps.bump();
      return cust.id === o.customer_id;
    });
    return { ...o, customer_name: c?.name ?? "(unknown)" };
  });
}

function runChecks(): CheckRow[] {
  // Independent dataset so the metric is deterministic.
  const N = 300;
  const customers: Customer[] = Array.from({ length: N }, (_, i) => ({
    id: i + 1,
    name: `Cust ${i + 1}`,
    email: `c${i + 1}@x.com`,
    created_at: "",
  }));
  const orders: Order[] = Array.from({ length: N }, (_, i) => ({
    id: i + 1,
    customer_id: ((i * 7) % N) + 1,
    status: "paid",
    created_at: "",
    total_cents: 0,
  }));
  lookupOps.reset();
  enrichOrders(orders, customers);
  const ops = lookupOps.get();
  return [
    {
      label: `enriching ${N} orders scales linearly`,
      pass: ops <= N * 4,
      detail: `lookup ops: ${ops} (target ~${N})`,
    },
  ];
}

export function C15Enrichment() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    void apiGet<Order[]>("/api/orders?limit=200").then(setOrders);
    void apiGet<Customer[]>("/api/customers?limit=2000").then(setCustomers);
  }, []);

  const enriched = useMemo(
    () => enrichOrders(orders, customers),
    [orders, customers]
  );

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title={`Enriched orders (${enriched.length})`}>
        <div className="scroller">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enriched.slice(0, 100).map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
