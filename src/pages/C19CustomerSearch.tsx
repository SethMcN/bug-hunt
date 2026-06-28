import { useMemo, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { apiGet } from "../api.ts";
import { debounce, sleep } from "../shared/util.ts";
import type { Customer } from "../../shared/types.ts";

const ch = challengeById("c19")!;

// Build the search trigger for the box: it waits for a pause in typing before
// actually firing the provided fetch, so a burst of keystrokes makes one call.
export function createSearch(fetchImpl: (q: string) => void): (q: string) => void {
  return debounce((q: string) => fetchImpl(q), 300);
}

async function runChecks(): Promise<CheckRow[]> {
  let calls = 0;
  const search = createSearch(() => {
    calls += 1;
  });
  for (const c of "abcde") search(c); // five rapid keystrokes
  await sleep(450); // wait past the typing pause
  return [
    {
      label: "a burst of keystrokes makes one request",
      pass: calls === 1,
      detail: `requests for 5 keystrokes: ${calls} (target 1)`,
    },
  ];
}

export function C19CustomerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);

  const search = useMemo(
    () =>
      createSearch((q: string) => {
        if (!q) return setResults([]);
        void apiGet<Customer[]>(`/api/customers/search?q=${encodeURIComponent(q)}`).then(
          setResults
        );
      }),
    []
  );

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Customer search">
        <Field label="Search by name or email">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              search(e.target.value);
            }}
          />
        </Field>
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
