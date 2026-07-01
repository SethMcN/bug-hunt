import { useCallback, useEffect, useRef, useState } from "react";
import { reportAcceptance } from "./acceptanceStore.ts";
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

// Minimum time the "Checking…" state stays visible on a manual run so every
// re-check visibly resets before showing the new verdict, even when the check
// resolves instantly.
const MIN_ANIM_MS = 350;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Debug affordances are dev-only. They can also be forced on from a harness via
// a global toggle, so this is clearly a debug tool and never part of a challenge.
const DEBUG_ENABLED =
  (import.meta.env?.DEV ?? false) ||
  !!(globalThis as { __PANEL_DEBUG__?: boolean }).__PANEL_DEBUG__;

export function AcceptancePanel({ challenge, run, live }: AcceptancePanelProps) {
  // Result state. `phase` gates the derived verdict so a fresh run visibly
  // resets to "running" before the next PASS/FAIL is shown — nothing survives
  // from a previous run except what we choose to display in the debug section.
  const [rows, setRows] = useState<CheckRow[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastRun, setLastRun] = useState<{ at: number; rows: CheckRow[] } | null>(null);
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

        if (animate) {
          const elapsed = Date.now() - started;
          if (elapsed < MIN_ANIM_MS) await sleep(MIN_ANIM_MS - elapsed);
        }

        // Superseded by a newer run (or a reset)? Drop this stale result.
        if (mySeq !== seqRef.current) return;

        setRows(result);
        setPhase("done");
        setLastRun({ at: Date.now(), rows: result });
        const solved = result.length > 0 && result.every((r) => r.pass);
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
  }, []);

  return (
    <section className="acceptance" data-state={state} aria-live="polite" aria-busy={running}>
      <style>{PANEL_CSS}</style>
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

function DebugSection({
  challenge,
  rows,
  phase,
  lastRun,
  open,
  onToggle,
  onRerun,
  onReset,
}: {
  challenge: Challenge;
  rows: CheckRow[];
  phase: Phase;
  lastRun: { at: number; rows: CheckRow[] } | null;
  open: boolean;
  onToggle: () => void;
  onRerun: () => void;
  onReset: () => void;
}) {
  return (
    <div className="acceptance__debug">
      <button className="acceptance__debughead" onClick={onToggle} aria-expanded={open}>
        <span className="acceptance__caret">{open ? "▾" : "▸"}</span> Debug ·{" "}
        {challenge.id} · phase: {phase}
        {lastRun && <span className="acceptance__ts">last run {fmtTime(lastRun.at)}</span>}
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

          <details className="acceptance__raw">
            <summary>raw measured values</summary>
            <pre>{JSON.stringify(lastRun?.rows ?? rows, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
}

const PANEL_CSS = `
.acceptance[data-state="running"] { border-left-color: var(--muted); }
.badge--running { background: rgba(139,148,158,0.15); color: var(--muted); display: inline-flex; align-items: center; gap: 6px; }
.acceptance__spinner {
  display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid currentColor; border-top-color: transparent;
  animation: acceptance-spin 0.6s linear infinite; vertical-align: middle;
}
@keyframes acceptance-spin { to { transform: rotate(360deg); } }
.acceptance__rows li, .acceptance[data-state] { transition: color 0.2s ease, border-color 0.2s ease; }
.acceptance__debug { margin-top: 12px; border-top: 1px dashed var(--border); padding-top: 8px; }
.acceptance__debughead {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 12px; padding: 2px 0; display: flex; align-items: center; gap: 6px; width: 100%;
}
.acceptance__caret { width: 10px; }
.acceptance__ts { margin-left: auto; font-variant-numeric: tabular-nums; }
.acceptance__debugbody { margin-top: 8px; }
.acceptance__debugbtns { display: flex; gap: 8px; margin-bottom: 8px; }
.acceptance__cases { width: 100%; border-collapse: collapse; font-size: 12px; }
.acceptance__cases th { text-align: left; color: var(--muted); font-weight: 600; padding: 2px 6px; }
.acceptance__cases td { padding: 2px 6px; vertical-align: top; }
.acceptance__cases .row__mark { width: 14px; }
.acceptance__actual { font-variant-numeric: tabular-nums; }
.acceptance__raw { margin-top: 8px; font-size: 12px; color: var(--muted); }
.acceptance__raw pre { background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; overflow: auto; max-height: 180px; }
`;
