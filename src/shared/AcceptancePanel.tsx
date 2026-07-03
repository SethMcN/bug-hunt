import { useCallback, useEffect, useRef, useState } from "react";
import { reportAcceptance } from "./acceptanceStore.ts";
import { getRequestLog } from "../api.ts";
import { sleep } from "./util.ts";
import { DEBUG_ENABLED } from "./debug.ts";
import type { Challenge } from "../challenges.ts";

export interface CheckRow {
  label: string;
  pass: boolean;
  detail?: string;
  // Optional richer fields for the debug breakdown. Pages may set these, but the
  // panel falls back to `label` (as the expected/case description) and `detail`
  // (as the observed value) when they are absent, so no page has to change.
  expected?: string | number;
  actual?: string | number;
  metric?: string; // e.g. "queries"
  target?: string | number; // e.g. 1
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

type Phase = "idle" | "running" | "done";

interface RunRecord {
  at: number;
  ms: number; // how long the check itself took (excluding the min-animation wait)
  solved: boolean;
}

// Minimum time the "Checking…" state stays visible on a manual run so every
// re-check visibly resets before showing the new verdict, even when the check
// resolves instantly.
const MIN_ANIM_MS = 350;

const HISTORY_MAX = 10;

export function AcceptancePanel({ challenge, run, live }: AcceptancePanelProps) {
  // Result state. `phase` gates the derived verdict so a fresh run visibly
  // resets to "running" before the next PASS/FAIL is shown — nothing survives
  // from a previous run except what we choose to display in the debug section.
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastRun, setLastRun] = useState<{ at: number; ms: number; rows: CheckRow[] } | null>(
    null
  );
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  // Always call the current run(); on HMR the page passes a new closure and we
  // must exercise *that*, never a captured stale one.
  const runRef = useRef(run);
  runRef.current = run;
  // Monotonic run id: the newest run wins. A stale in-flight run that resolves
  // late is discarded instead of overwriting a fresher verdict, and a new run
  // is never dropped just because an older one is still pending.
  const seqRef = useRef(0);
  // How many runs are currently executing. Live interval ticks skip while a run
  // is in flight (so a slow check whose duration exceeds the poll interval can
  // still complete instead of being perpetually superseded); manual/mount/HMR
  // runs always proceed and win via seqRef.
  const inFlightRef = useRef(0);

  const doRun = useCallback(
    async (opts: { animate: boolean; skipIfBusy?: boolean }) => {
      const { animate, skipIfBusy } = opts;
      if (skipIfBusy && inFlightRef.current > 0) return;

      const mySeq = ++seqRef.current;
      inFlightRef.current++;
      if (animate) {
        // Reset visible result from scratch for this run.
        setPhase("running");
        setRows([]);
      }
      const started = Date.now();

      try {
        let result: CheckRow[];
        try {
          result = await runRef.current();
        } catch (err) {
          // Behavior we couldn't exercise can't be judged correct. A check that
          // throws/rejects (e.g. the API is down) is a FAIL, never a retained
          // PASS — otherwise the badge would show a stale green not derived from
          // the page's current behavior.
          result = [
            {
              label: "acceptance check could not run",
              pass: false,
              detail: err instanceof Error ? err.message : String(err),
            },
          ];
        }
        const durationMs = Date.now() - started;

        if (animate && durationMs < MIN_ANIM_MS) await sleep(MIN_ANIM_MS - durationMs);

        // Superseded by a newer run (or a reset)? Drop this stale result.
        if (mySeq !== seqRef.current) return;

        setRows(result);
        setPhase("done");
        setLastRun({ at: Date.now(), ms: durationMs, rows: result });
        const solved = result.length > 0 && result.every((r) => r.pass);
        setHistory((h) =>
          [...h, { at: Date.now(), ms: durationMs, solved }].slice(-HISTORY_MAX)
        );
        // Same live verdict the panel shows drives the Home/sidebar badges, so
        // they can never disagree with the panel.
        reportAcceptance(challenge.id, solved);
      } finally {
        inFlightRef.current--;
      }
    },
    [challenge.id, run]
  );

  useEffect(() => {
    // Re-evaluate on mount and whenever `run` changes (HMR after a fix), so a
    // fixed page flips to green with no page reload. Manual/mount runs animate;
    // the live poll below refreshes quietly (no reset flash) so it doesn't
    // strobe, and skips a tick if a previous run is still in flight.
    void doRun({ animate: true });
    if (!live) return;
    const t = setInterval(() => void doRun({ animate: false, skipIfBusy: true }), 800);
    return () => clearInterval(t);
  }, [doRun, live]);

  const running = phase === "running";
  const solved = phase === "done" && rows.length > 0 && rows.every((r) => r.pass);
  const state: string = running ? "running" : solved ? "pass" : "fail";

  const reset = useCallback(() => {
    seqRef.current++; // invalidate any in-flight run
    setPhase("idle");
    setRows([]);
    setLastRun(null);
    setHistory([]);
  }, []);

  return (
    <section className="acceptance" data-state={state} aria-live="polite" aria-busy={running}>
      <header className="acceptance__head">
        <span
          className={`badge ${
            running ? "badge--running" : solved ? "badge--pass" : "badge--fail"
          }`}
        >
          {running ? (
            <>
              <span className="acceptance__spinner" aria-hidden="true" /> CHECKING…
            </>
          ) : solved ? (
            "PASS"
          ) : (
            "FAIL"
          )}
        </span>
        <h2>Acceptance check</h2>
        <button
          className="btn btn--ghost"
          onClick={() => void doRun({ animate: true })}
          disabled={running}
        >
          {running ? "Checking…" : "Check"}
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
        {running && rows.length === 0 && (
          <li className="row--muted">Checking current behavior…</li>
        )}
        {rows.map((r, i) => (
          <li key={i} className={r.pass ? "row--pass" : "row--fail"}>
            <span className="row__mark">{r.pass ? "✓" : "✗"}</span>
            <span className="row__label">{r.label}</span>
            {r.detail && <span className="row__detail">{r.detail}</span>}
          </li>
        ))}
        {!running && rows.length === 0 && <li className="row--muted">No checks run yet.</li>}
      </ul>

      {DEBUG_ENABLED && (
        <DebugSection
          challenge={challenge}
          rows={rows}
          phase={phase}
          lastRun={lastRun}
          history={history}
          open={showDebug}
          onToggle={() => setShowDebug((v) => !v)}
          onRerun={() => void doRun({ animate: true })}
          onReset={reset}
        />
      )}
    </section>
  );
}

function fmtTime(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleTimeString()}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

function fmtClock(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function DebugSection({
  challenge,
  rows,
  phase,
  lastRun,
  history,
  open,
  onToggle,
  onRerun,
  onReset,
}: {
  challenge: Challenge;
  rows: CheckRow[];
  phase: Phase;
  lastRun: { at: number; ms: number; rows: CheckRow[] } | null;
  history: RunRecord[];
  open: boolean;
  onToggle: () => void;
  onRerun: () => void;
  onReset: () => void;
}) {
  const requests = getRequestLog().slice(-8).reverse();
  return (
    <div className="acceptance__debug">
      <button className="acceptance__debughead" onClick={onToggle} aria-expanded={open}>
        <span className="acceptance__caret">{open ? "▾" : "▸"}</span> Debug ·{" "}
        {challenge.id} · phase: {phase}
        {lastRun && (
          <span className="acceptance__ts">
            last run {fmtTime(lastRun.at)} · {lastRun.ms}ms
          </span>
        )}
      </button>
      {open && (
        <div className="acceptance__debugbody">
          <div className="acceptance__debugbtns">
            <button className="btn btn--ghost btn--sm" onClick={onRerun}>
              Re-run
            </button>
            <button className="btn btn--ghost btn--sm" onClick={onReset}>
              Reset panel state
            </button>
          </div>

          <table className="acceptance__cases">
            <thead>
              <tr>
                <th></th>
                <th>case</th>
                <th>expected</th>
                <th>actual</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="row--muted">
                    (no measured values yet)
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const expected =
                  r.expected !== undefined
                    ? String(r.expected)
                    : r.target !== undefined
                      ? `${r.metric ? r.metric + " " : ""}${r.target}`
                      : "—";
                const actual =
                  r.actual !== undefined ? String(r.actual) : r.detail ?? "—";
                return (
                  <tr key={i} className={r.pass ? "row--pass" : "row--fail"}>
                    <td className="row__mark">{r.pass ? "✓" : "✗"}</td>
                    <td>{r.label}</td>
                    <td>{expected}</td>
                    <td className="acceptance__actual">{actual}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {history.length > 0 && (
            <div className="acceptance__history">
              <span className="muted">recent runs:</span>
              {history
                .slice()
                .reverse()
                .map((h, i) => (
                  <span
                    key={i}
                    className={h.solved ? "row--pass" : "row--fail"}
                    title={`${fmtClock(h.at)} · ${h.ms}ms`}
                  >
                    <span className="row__mark">{h.solved ? "✓" : "✗"}</span>
                    {h.ms}ms
                  </span>
                ))}
            </div>
          )}

          <div className="acceptance__reqlog">
            <div className="muted">recent API requests (newest first)</div>
            {requests.length === 0 ? (
              <p className="row--muted">(none yet)</p>
            ) : (
              <table className="acceptance__cases">
                <thead>
                  <tr>
                    <th>time</th>
                    <th>method</th>
                    <th>path</th>
                    <th>status</th>
                    <th>ms</th>
                    <th>queries</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r, i) => (
                    <tr key={i}>
                      <td className="acceptance__actual">{fmtClock(r.at)}</td>
                      <td>{r.method}</td>
                      <td className="mono acceptance__reqpath">{r.path}</td>
                      <td className={r.status !== null && r.status < 400 ? "" : "row--fail"}>
                        {r.status ?? "ERR"}
                      </td>
                      <td className="acceptance__actual">{r.ms}</td>
                      <td className="acceptance__actual">{r.queryCount ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <details className="acceptance__raw">
            <summary>raw measured values</summary>
            <pre>{JSON.stringify(lastRun?.rows ?? rows, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}
