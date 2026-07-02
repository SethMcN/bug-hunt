import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { formatMoney } from "../shared/util.ts";
import type { Product } from "../../shared/types.ts";

const ch = challengeById("c26")!;

// Return the products ordered by ascending price for the preview, leaving the
// incoming feed order untouched.
export function sortByPrice(products: Product[]): Product[] {
  return products.sort((a, b) => a.price_cents - b.price_cents);
}

function runChecks(): CheckRow[] {
  const sample: Product[] = [
    { id: 1, name: "Dock", price_cents: 4500, stock: 5, category: "Accessories" },
    { id: 2, name: "Cable", price_cents: 900, stock: 40, category: "Cables" },
    { id: 3, name: "Monitor", price_cents: 18900, stock: 3, category: "Displays" },
  ];
  const sorted = sortByPrice(sample);
  const sortedIds = sorted.map((p) => p.id).join(",");
  const originalIds = sample.map((p) => p.id).join(",");
  return [
    {
      label: "preview is ordered by ascending price",
      pass: sortedIds === "2,1,3",
      detail: `preview order: ${sortedIds}`,
    },
    {
      label: "original feed keeps its order (1,2,3)",
      pass: originalIds === "1,2,3",
      detail: `feed order: ${originalIds}`,
    },
  ];
}

export function C26SortedView() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showSorted, setShowSorted] = useState(false);

  useEffect(() => {
    void apiGet<Product[]>("/api/products?limit=6").then(setProducts);
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Incoming feed order">
        <ol>
          {products.map((p) => (
            <li key={p.id}>
              {p.name} — {formatMoney(p.price_cents)}
            </li>
          ))}
        </ol>
        <button className="btn btn--ghost btn--sm" onClick={() => setShowSorted((v) => !v)}>
          {showSorted ? "Hide sorted preview" : "Show sorted preview"}
        </button>
      </Card>
      {showSorted && (
        <Card title="Sorted by price (preview)">
          <ol>
            {sortByPrice(products).map((p) => (
              <li key={p.id}>
                {p.name} — {formatMoney(p.price_cents)}
              </li>
            ))}
          </ol>
        </Card>
      )}
    </div>
  );
}
