import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c03")!;

// A required field is only satisfied by actual, non-whitespace content.
export function isRequiredFilled(value: string): boolean {
  return value.trim().length > 0;
}

function runChecks(): CheckRow[] {
  return [
    { label: 'empty "" is not filled', pass: isRequiredFilled("") === false },
    { label: 'spaces "   " is not filled', pass: isRequiredFilled("   ") === false },
    { label: 'tabs/newlines is not filled', pass: isRequiredFilled("\t\n  ") === false },
    { label: '" hi " is filled', pass: isRequiredFilled(" hi ") === true },
  ];
}

export function C03RequiredNotes() {
  const [notes, setNotes] = useState("");
  const filled = isRequiredFilled(notes);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Account note (required)">
        <Field label="Note">
          <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <button className="btn" disabled={!filled}>
          {filled ? "Save note" : "Note required"}
        </button>
      </Card>
    </div>
  );
}
