import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c02")!;

// The feature under test: decide whether an email address is valid.
export function isValidEmail(input: string): boolean {
  const value = input.trim();
  return /^.+@.+$/.test(value);
}

function runChecks(): CheckRow[] {
  const valid = ["a@b.com", "first.last@sub.domain.co", "user+tag@example.org"];
  const invalid = ["no-at-sign.com", "two@@at.com", "trailing@dot.", "@no-local.com", "spaces in@email.com"];
  const rows: CheckRow[] = [];
  for (const v of valid) {
    rows.push({ label: `accepts "${v}"`, pass: isValidEmail(v) === true });
  }
  for (const v of invalid) {
    rows.push({ label: `rejects "${v}"`, pass: isValidEmail(v) === false });
  }
  return rows;
}

export function C02EmailValidator() {
  const [value, setValue] = useState("");
  const valid = value.length > 0 ? isValidEmail(value) : null;
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Try the validator">
        <Field label="Email">
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="type an address" />
        </Field>
        {valid !== null && (
          <p className={valid ? "" : "notice"}>{valid ? "✓ looks valid" : "✗ rejected"}</p>
        )}
      </Card>
    </div>
  );
}
