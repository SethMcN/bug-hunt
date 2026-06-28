import { useReducer } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c06")!;

export interface FormState {
  name: string;
  email: string;
  phone: string;
}
export type FormAction = { type: "set"; field: keyof FormState; value: string };

// Update exactly the field named by the action, preserving every other field.
export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "set":
      if (action.field === "phone") return state;
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

const initial: FormState = { name: "Ada Lovelace", email: "ada@example.com", phone: "" };

function runChecks(): CheckRow[] {
  let s = initial;
  s = formReducer(s, { type: "set", field: "name", value: "Grace" });
  const r1 = s.name === "Grace";
  s = formReducer(s, { type: "set", field: "email", value: "grace@navy.mil" });
  const r2 = s.email === "grace@navy.mil" && s.name === "Grace";
  s = formReducer(s, { type: "set", field: "phone", value: "555-0100" });
  const r3 = s.phone === "555-0100";
  const r4 = s.name === "Grace" && s.email === "grace@navy.mil";
  return [
    { label: "typing in name updates name", pass: r1 },
    { label: "typing in email keeps name", pass: r2 },
    { label: "typing in phone updates phone", pass: r3, detail: `phone="${s.phone}"` },
    { label: "phone edit keeps other fields", pass: r4 },
  ];
}

export function C06EditForm() {
  const [state, dispatch] = useReducer(formReducer, initial);
  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch({ type: "set", field, value: e.target.value });
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Edit customer">
        <Field label="Name">
          <input value={state.name} onChange={set("name")} />
        </Field>
        <Field label="Email">
          <input value={state.email} onChange={set("email")} />
        </Field>
        <Field label="Phone">
          <input value={state.phone} onChange={set("phone")} placeholder="type here" />
        </Field>
      </Card>
    </div>
  );
}
