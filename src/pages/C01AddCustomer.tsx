import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { apiPost } from "../api.ts";

const ch = challengeById("c01")!;

// The acceptance check talks straight to the API, bypassing the form, to prove
// the server enforces its own validation and never trusts the client.
async function runChecks(): Promise<CheckRow[]> {
  const cases: { label: string; body: unknown; expectStatus: number }[] = [
    { label: "empty name is rejected (400)", body: { name: "   ", email: "a@b.com" }, expectStatus: 400 },
    { label: "malformed email is rejected (400)", body: { name: "Jo", email: "not-an-email" }, expectStatus: 400 },
    { label: "missing email is rejected (400)", body: { name: "Jo" }, expectStatus: 400 },
    { label: "valid customer is accepted (201)", body: { name: "Valid Person", email: `ok${Date.now()}@example.com` }, expectStatus: 201 },
  ];
  const rows: CheckRow[] = [];
  for (const c of cases) {
    const { status } = await apiPost("/api/customers", c.body);
    rows.push({ label: c.label, pass: status === c.expectStatus, detail: `got ${status}` });
  }
  return rows;
}

export function C01AddCustomer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string>("");

  async function submit() {
    // Client-side convenience checks only; the server is the real gate.
    const { status, data } = await apiPost<{ id?: number; error?: string }>(
      "/api/customers",
      { name, email }
    );
    setResult(status === 201 ? `Created #${data.id}` : `Rejected (${status}): ${data.error}`);
  }

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="New customer">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email">
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <button className="btn" onClick={() => void submit()}>Create</button>
        {result && <p className="notice" style={{ marginTop: 10 }}>{result}</p>}
      </Card>
    </div>
  );
}
