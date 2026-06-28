import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { formatMoney } from "../shared/util.ts";
import type { Product } from "../../shared/types.ts";

const ch = challengeById("c14")!;
const PAGE_SIZE = 25;

// Count how many row elements are actually mounted in the table.
function runChecks(): CheckRow[] {
  const mounted = document.querySelectorAll('[data-rows="c14"] tr').length;
  return [
    {
      label: "only a page of rows is mounted",
      pass: mounted > 0 && mounted <= 50,
      detail: `rows mounted: ${mounted} (target ≤ 50)`,
    },
  ];
}

export function C14AllProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    void apiGet<Product[]>("/api/products?limit=2000").then(setProducts);
  }, []);

  const visible = products;
  const pageCount = Math.ceil(products.length / PAGE_SIZE);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} live />
      <Card title={`Products (${products.length} total)`}>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody data-rows="c14">
            {visible.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{formatMoney(p.price_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="row-actions" style={{ marginTop: 12 }}>
          <button className="btn btn--sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span className="muted">
            Page {page + 1} / {pageCount || 1}
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
