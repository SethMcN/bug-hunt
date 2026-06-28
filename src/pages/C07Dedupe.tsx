import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c07")!;

// Normalize a name so trivial differences (casing, surrounding whitespace)
// collapse to the same key for duplicate detection.
export function normalizeKey(name: string): string {
  return name;
}

// Add a name only if no existing entry normalizes to the same key.
export function addUnique(list: string[], name: string): string[] {
  const key = normalizeKey(name);
  const exists = list.some((n) => normalizeKey(n) === key);
  return exists ? list : [...list, name.trim()];
}

function runChecks(): CheckRow[] {
  let list: string[] = [];
  list = addUnique(list, "Seth");
  list = addUnique(list, "seth ");
  list = addUnique(list, " SETH");
  const afterDupes = list.length;
  list = addUnique(list, "Mara");
  return [
    { label: '"Seth", "seth ", " SETH" → one entry', pass: afterDupes === 1, detail: `count ${afterDupes}` },
    { label: 'adding "Mara" → two entries', pass: list.length === 2, detail: `count ${list.length}` },
  ];
}

export function C07Dedupe() {
  const [list, setList] = useState<string[]>(["Seth"]);
  const [name, setName] = useState("");
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Customer list">
        <Field label="Add name">
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <button
          className="btn"
          onClick={() => {
            setList((l) => addUnique(l, name));
            setName("");
          }}
        >
          Add
        </button>
        <ul style={{ marginTop: 12 }}>
          {list.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
        <p className="muted">{list.length} customer(s)</p>
      </Card>
    </div>
  );
}
