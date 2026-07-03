import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import type { Customer } from "../../shared/types.ts";

const ch = challengeById("c22")!;
const PAGE_SIZE = 25;

// Return the rows visible on the given zero-based page.
export function pageSlice<T>(rows: T[], page: number, size: number): T[] {
  return rows.slice(page * size, size);
}

function runChecks(): CheckRow[] {
  const items = Array.from({ length: 95 }, (_, i) => i + 1);
  const p0 = pageSlice(items, 0, 25);
  const p1 = pageSlice(items, 1, 25);
  const p3 = pageSlice(items, 3, 25);
  return [
    {
      label: "page 1 shows rows 1–25",
      pass: p0.length === 25 && p0[0] === 1 && p0[24] === 25,
      detail: `${p0.length} rows`,
    },
    {
      label: "page 2 shows rows 26–50",
      pass: p1.length === 25 && p1[0] === 26 && p1[24] === 50,
      detail: `${p1.length} rows${p1.length ? `, first ${p1[0]}` : ""}`,
    },
    {
      label: "last page shows the remaining 20",
      pass: p3.length === 20 && p3[0] === 76 && p3[19] === 95,
      detail: `${p3.length} rows${p3.length ? `, first ${p3[0]}` : ""}`,
    },
  ];
}

export function C22Pagination() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    void apiGet<Customer[]>("/api/customers?limit=120").then(setCustomers);
  }, []);

  const visible = pageSlice(customers, page, PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(customers.length / PAGE_SIZE));

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title={`Customers (${customers.length} total)`}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td className="muted">{c.email}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  (no rows on this page)
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="row-actions" style={{ marginTop: 12 }}>
          <button className="btn btn--sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span className="muted">
            Page {page + 1} / {pageCount}
          </span>
          <button
            className="btn btn--sm"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
}
