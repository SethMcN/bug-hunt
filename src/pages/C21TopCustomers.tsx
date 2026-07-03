import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";

const ch = challengeById("c21")!;

// Rows as they arrive from the finance team's CSV export — revenue comes
// through as strings.
export interface CsvCustomer {
  name: string;
  revenue: string;
}

// Rank customers by revenue, highest first.
export function rankByRevenue(rows: CsvCustomer[]): CsvCustomer[] {
  return [...rows].sort((a, b) => (a.revenue > b.revenue ? -1 : 1));
}

function runChecks(): CheckRow[] {
  const rows: CsvCustomer[] = [
    { name: "A", revenue: "900" },
    { name: "B", revenue: "1200" },
    { name: "C", revenue: "12000" },
    { name: "D", revenue: "300" },
  ];
  const ranked = rankByRevenue(rows);
  const order = ranked.map((r) => r.name).join(" → ");
  return [
    {
      label: "highest revenue ($12,000) ranks first",
      pass: ranked[0]?.name === "C",
      detail: `first: ${ranked[0]?.name} ($${ranked[0]?.revenue})`,
    },
    {
      label: "full order is C → B → A → D",
      pass: order === "C → B → A → D",
      detail: `got ${order}`,
    },
  ];
}

const CSV_ROWS: CsvCustomer[] = [
  { name: "Mara Wilson", revenue: "4200" },
  { name: "Ivy Clarke", revenue: "900" },
  { name: "Theo Hughes", revenue: "12000" },
  { name: "Sam Roberts", revenue: "1200" },
  { name: "Ruby Walker", revenue: "300" },
  { name: "Leo Green", revenue: "7500" },
];

export function C21TopCustomers() {
  const ranked = rankByRevenue(CSV_ROWS);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Top customers by revenue (from CSV import)">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Customer</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => (
              <tr key={r.name}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td className="metric">${Number(r.revenue).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
