import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { CHALLENGES, GROUPS } from "../challenges.ts";
import { useAcceptanceState } from "./acceptanceStore.ts";
import { StatusDot } from "./ui.tsx";
import { DEBUG_ENABLED } from "./debug.ts";
import { apiPost } from "../api.ts";

const pad = (n: number) => String(n).padStart(2, "0");

export function Layout({ children }: { children: ReactNode }) {
  const acceptance = useAcceptanceState();
  const solved = CHALLENGES.filter((c) => acceptance[c.id]?.solved).length;

  return (
    <div className="layout">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar__brand">
          🐛 Bug Hunt
        </NavLink>
        <div className="sidebar__progress">
          <span className="muted">Solved</span>
          <b>
            {solved} / {CHALLENGES.length}
          </b>
          <span className="progressbar" role="progressbar" aria-valuenow={solved} aria-valuemin={0} aria-valuemax={CHALLENGES.length}>
            <i style={{ width: `${(solved / CHALLENGES.length) * 100}%` }} />
          </span>
        </div>
        {GROUPS.map((group) => (
          <div key={group} className="sidebar__group">
            <div className="sidebar__grouptitle">{group}</div>
            {CHALLENGES.filter((c) => c.group === group).map((c) => (
              <NavLink
                key={c.id}
                to={`/${c.id}`}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? " is-active" : ""}`
                }
              >
                <StatusDot solved={acceptance[c.id]?.solved} />
                <span className="sidebar__num">{pad(c.num)}</span>
                <span className="sidebar__title">{c.title}</span>
              </NavLink>
            ))}
          </div>
        ))}
        {DEBUG_ENABLED && <DevTools />}
      </aside>
      <main className="content">
        {children}
        <ChallengeNav />
      </main>
    </div>
  );
}

// Prev/next wayfinding between challenges, derived from the current route so
// no challenge page needs to know about it.
function ChallengeNav() {
  const { pathname } = useLocation();
  const idx = CHALLENGES.findIndex((c) => `/${c.id}` === pathname);
  if (idx === -1) return null;
  const prev = CHALLENGES[idx - 1];
  const next = CHALLENGES[idx + 1];
  return (
    <nav className="challenge-nav" aria-label="Challenge navigation">
      {prev ? (
        <Link to={`/${prev.id}`}>
          ← #{pad(prev.num)} {prev.title}
        </Link>
      ) : (
        <span />
      )}
      <Link to="/">All challenges</Link>
      {next ? (
        <Link to={`/${next.id}`}>
          #{pad(next.num)} {next.title} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

// Dev-only utilities. Reseeding restores the pristine dataset — useful because
// some acceptance checks write real rows while you exercise them.
function DevTools() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function reseed() {
    if (!window.confirm("Reseed the database? All data resets to the pristine dataset.")) return;
    setBusy(true);
    setMsg("");
    try {
      const { status, data } = await apiPost<{ total?: number }>("/api/dev/reseed", {});
      setMsg(status === 200 ? `reseeded ✓ ${data.total ?? "?"} rows` : `failed (${status})`);
    } catch {
      setMsg("failed (API down?)");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="devtools">
      <div className="sidebar__grouptitle">Dev tools</div>
      <button
        className="btn btn--ghost btn--sm"
        onClick={() => void reseed()}
        disabled={busy}
        title="Restore the seeded dataset (pages refetch on next visit/check)"
      >
        {busy ? "Reseeding…" : "Reseed DB"}
      </button>
      {msg && <span className="devtools__msg">{msg}</span>}
    </div>
  );
}
