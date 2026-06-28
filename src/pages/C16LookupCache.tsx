import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c16")!;

const MAX_ENTRIES = 50;
const cache = new Map<string, number>();

// A bounded cache: results are remembered, but the cache evicts its
// least-recently-used entry once it exceeds the cap, so it never grows without
// limit no matter how many distinct queries arrive.
export function cachedLookup(key: string): number {
  if (cache.has(key)) {
    const v = cache.get(key)!;
    cache.delete(key);
    cache.set(key, v); // refresh recency
    return v;
  }
  const value = key.length; // stand-in for an expensive computation
  cache.set(key, value);
  return value;
}

export const cacheSize = () => cache.size;
export const cacheClear = () => cache.clear();

function runChecks(): CheckRow[] {
  cacheClear();
  for (let i = 0; i < 200; i++) cachedLookup(`query-${i}`);
  const size = cacheSize();
  return [
    {
      label: "cache stays bounded after 200 distinct lookups",
      pass: size <= MAX_ENTRIES,
      detail: `cache size: ${size} (target ≤ ${MAX_ENTRIES})`,
    },
  ];
}

export function C16LookupCache() {
  const [q, setQ] = useState("");
  const [size, setSize] = useState(cacheSize());
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Customer lookup">
        <Field label="Search (each new term is cached)">
          <input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              if (v) cachedLookup(v);
              setSize(cacheSize());
            }}
          />
        </Field>
        <p className="metric">
          Cache entries: <strong>{size}</strong>
        </p>
      </Card>
    </div>
  );
}
