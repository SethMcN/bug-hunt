import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { apiGetWithMeta } from "../api.ts";
import { formatMoney } from "../shared/util.ts";
import type { Order } from "../../shared/types.ts";

const ch = challengeById("c28")!;
const LIMIT = 50;

async function runChecks(): Promise<CheckRow[]> {
  const { data } = await apiGetWithMeta<Order[]>(
    `/api/filter/orders?status=paid&limit=${LIMIT}`
  );
  return [
    {
      label: `response respects the requested page size (≤ ${LIMIT})`,
      pass: data.length > 0 && data.length <= LIMIT,
      detail: `rows returned: ${data.length} (target ≤ ${LIMIT})`,
    },
  ];
}

const STATUSES = ["pending", "paid", "shipped", "cancelled"] as const;

export function C28StatusFilter() {
  const [status, setStatus] = useState<string>("paid");
  const [rows, setRows] = useState<Order[]>([]);

  useEffect(() => {
    void apiGetWithMeta<Order[]>(`/api/filter/orders?status=${status}&limit=${LIMIT}`).then(
      (r) => setRows(r.data)
    );
  }, [status]);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Filter orders by status">
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <p className="metric">
          Rows downloaded: <strong>{rows.length}</strong>
        </p>
        <div className="scroller">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 15).map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.status}</td>
                  <td>{formatMoney(o.total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 15 && (
          <p className="muted">…showing 15 of the {rows.length} rows downloaded.</p>
        )}
      </Card>
    </div>
  );
}
