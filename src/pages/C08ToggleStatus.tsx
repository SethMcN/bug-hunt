import { useReducer } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";

const ch = challengeById("c08")!;

export interface RowState {
  status: string;
  prev: string | null; // value to restore if the save fails
  saving: boolean;
}
export type RowAction =
  | { type: "optimistic"; next: string }
  | { type: "saved" }
  | { type: "failed" };

// Optimistic UI: show the new status immediately, remember the previous value,
// and roll back to it if the save fails.
export function rowReducer(state: RowState, action: RowAction): RowState {
  switch (action.type) {
    case "optimistic":
      return { status: action.next, prev: state.status, saving: true };
    case "saved":
      return { ...state, prev: null, saving: false };
    case "failed":
      return { status: state.prev ?? state.status, prev: null, saving: false };
    default:
      return state;
  }
}

function runChecks(): CheckRow[] {
  let s: RowState = { status: "pending", prev: null, saving: false };
  s = rowReducer(s, { type: "optimistic", next: "shipped" });
  const shownImmediately = s.status === "shipped";
  s = rowReducer(s, { type: "failed" });
  const rolledBack = s.status === "pending";
  let s2: RowState = { status: "pending", prev: null, saving: false };
  s2 = rowReducer(s2, { type: "optimistic", next: "paid" });
  s2 = rowReducer(s2, { type: "saved" });
  const committed = s2.status === "paid";
  return [
    { label: "new status shows immediately", pass: shownImmediately },
    { label: "failed save rolls back to previous", pass: rolledBack, detail: `status="${s.status}"` },
    { label: "successful save keeps new status", pass: committed },
  ];
}

export function C08ToggleStatus() {
  const [state, dispatch] = useReducer(rowReducer, {
    status: "pending",
    prev: null,
    saving: false,
  });

  // Simulate a save that always fails, to exercise the rollback path.
  function toggleWithFailingSave() {
    const next = state.status === "pending" ? "shipped" : "pending";
    dispatch({ type: "optimistic", next });
    setTimeout(() => dispatch({ type: "failed" }), 400);
  }

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Order #1042">
        <p>
          Status: <span className="pill">{state.status}</span>{" "}
          {state.saving && <span className="muted">saving…</span>}
        </p>
        <button className="btn" onClick={toggleWithFailingSave} disabled={state.saving}>
          Toggle status (save will fail)
        </button>
      </Card>
    </div>
  );
}
