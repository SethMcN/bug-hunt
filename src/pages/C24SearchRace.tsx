import { useMemo, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { sleep } from "../shared/util.ts";
import type { Customer } from "../../shared/types.ts";

const ch = challengeById("c24")!;

// Load results for a query and hand them to the UI. Rapid consecutive queries
// are fine: whatever the user typed last is what ends up shown.
export function createResultLoader<T>(
  fetchImpl: (q: string) => Promise<T>,
  onResults: (q: string, results: T) => void
): (q: string) => void {
  let latest = 0;
  return (q: string) => {
    const mine = ++latest;
    void fetchImpl(q).then((results) => {
      if (mine === latest) onResults(q, results);
    });
  };
}

async function runChecks(): Promise<CheckRow[]> {
  let shownFor = "";
  const loader = createResultLoader(
    // Deterministic stand-in for network jitter: the shorter (earlier) query
    // takes much longer to come back than the longer (later) one.
    (q) => sleep(q === "ab" ? 250 : 40).then(() => [`${q}-result`]),
    (q) => {
      shownFor = q;
    }
  );
  loader("ab"); // user typed "ab"…
  loader("abc"); // …then immediately "abc"
  await sleep(400); // wait for both responses to land
  return [
    {
      label: "results shown are for the latest query",
      pass: shownFor === "abc",
      detail: `showing results for "${shownFor}"`,
    },
  ];
}

export function C24SearchRace() {
  const [query, setQuery] = useState("");
  const [shownFor, setShownFor] = useState("");
  const [results, setResults] = useState<Customer[]>([]);

  const search = useMemo(
    () =>
      createResultLoader(
        async (q) => {
          // Simulated network jitter: broader (shorter) queries take longer,
          // like a real backend scanning more rows.
          await sleep(Math.max(60, 400 - q.length * 80));
          return apiGet<Customer[]>(`/api/customers/search?q=${encodeURIComponent(q)}`);
        },
        (q, rows) => {
          setShownFor(q);
          setResults(rows);
        }
      ),
    []
  );

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Customer search (jittery network)">
        <Field label="Search by name or email" hint="Type a few characters quickly, then stop.">
          <input
            value={query}
            onChange={(e) => {
              const q = e.target.value;
              setQuery(q);
              if (!q) {
                setShownFor("");
                setResults([]);
                return;
              }
              search(q);
            }}
          />
        </Field>
        {shownFor && (
          <p className="muted">
            Showing results for: <span className="mono">"{shownFor}"</span>
          </p>
        )}
        <table className="table">
          <tbody>
            {results.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="muted">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
