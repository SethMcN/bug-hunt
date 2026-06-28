import { useCallback, useEffect, useRef, useState } from "react";
import { reportAcceptance } from "./acceptanceStore.ts";
import type { Challenge } from "../challenges.ts";

export interface CheckRow {
  label: string;
  pass: boolean;
  detail?: string;
}

interface AcceptancePanelProps {
  challenge: Challenge;
  // Runs the behavior checks and returns one row per case/metric. Derived from
  // the spec, never from the implementation. May be async (API-backed).
  run: () => CheckRow[] | Promise<CheckRow[]>;
  // When true the panel re-runs on an interval so live metrics (render counts,
  // request counts) stay current as you interact with the page.
  live?: boolean;
}

export function AcceptancePanel({ challenge, run, live }: AcceptancePanelProps) {
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [running, setRunning] = useState(false);
  const runRef = useRef(run);
  runRef.current = run;
  const inFlight = useRef(false);

  const doRun = useCallback(async () => {
    if (inFlight.current) return; // never overlap async runs
    inFlight.current = true;
    setRunning(true);
    try {
      const result = await runRef.current();
      setRows(result);
      const solved = result.length > 0 && result.every((r) => r.pass);
      reportAcceptance(challenge.id, solved);
    } finally {
      inFlight.current = false;
      setRunning(false);
    }
  }, [challenge.id]);

  useEffect(() => {
    void doRun();
    if (!live) return;
    const t = setInterval(() => void doRun(), 800);
    return () => clearInterval(t);
  }, [doRun, live]);

  const solved = rows.length > 0 && rows.every((r) => r.pass);

  return (
    <section
      className="acceptance"
      data-state={solved ? "pass" : "fail"}
      aria-live="polite"
    >
      <header className="acceptance__head">
        <span className={`badge ${solved ? "badge--pass" : "badge--fail"}`}>
          {solved ? "PASS" : "FAIL"}
        </span>
        <h2>Acceptance check</h2>
        <button className="btn btn--ghost" onClick={() => void doRun()} disabled={running}>
          {running ? "Checking…" : "Re-check"}
        </button>
      </header>

      <div className="acceptance__brief">
        <p>
          <strong>Expected:</strong> {challenge.expected}
        </p>
        <p>
          <strong>Observed:</strong> {challenge.observed}
        </p>
      </div>

      <ul className="acceptance__rows">
        {rows.map((r, i) => (
          <li key={i} className={r.pass ? "row--pass" : "row--fail"}>
            <span className="row__mark">{r.pass ? "✓" : "✗"}</span>
            <span className="row__label">{r.label}</span>
            {r.detail && <span className="row__detail">{r.detail}</span>}
          </li>
        ))}
        {rows.length === 0 && <li className="row--muted">No checks run yet.</li>}
      </ul>
    </section>
  );
}
