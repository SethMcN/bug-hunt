import { Link } from "react-router-dom";
import { CHALLENGES, GROUPS } from "../challenges.ts";
import { resetProgress, useAcceptanceState } from "../shared/acceptanceStore.ts";
import { StatusDot } from "../shared/ui.tsx";

function since(at: number): string {
  if (!at) return "";
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function Home() {
  const acceptance = useAcceptanceState();
  const total = CHALLENGES.length;
  const solved = CHALLENGES.filter((c) => acceptance[c.id]?.solved).length;

  return (
    <div>
      <div className="pagehead">
        <h1>Bug Hunt — Admin Dashboard</h1>
      </div>

      <div className="summary">
        <div className="stat">
          <div className="muted">Solved</div>
          <b>
            {solved} / {total}
          </b>
        </div>
        <div className="stat">
          <div className="muted">Remaining</div>
          <b>{total - solved}</b>
        </div>
        <button
          className="btn btn--ghost btn--sm summary__reset"
          onClick={() => {
            if (window.confirm("Clear all recorded pass/fail badges and start fresh?")) {
              resetProgress();
            }
          }}
        >
          Reset progress
        </button>
      </div>

      <p className="muted" style={{ maxWidth: 720 }}>
        Each page below hides exactly one planted bug. Open a page, read its
        acceptance check (Expected vs Observed), and fix the code until the panel
        turns green. Visit a page to refresh its badge here.
      </p>

      {GROUPS.map((group) => (
        <div key={group}>
          <h2 style={{ fontSize: 16, marginTop: 22 }}>{group}</h2>
          <div className="home-grid">
            {CHALLENGES.filter((c) => c.group === group).map((c) => {
              const s = acceptance[c.id];
              return (
                <Link key={c.id} to={`/${c.id}`} className="home-card">
                  <div className="home-card__top">
                    <StatusDot solved={s?.solved} />
                    <span className="home-card__num">
                      #{String(c.num).padStart(2, "0")}
                    </span>
                    <strong>{c.title}</strong>
                    <span style={{ marginLeft: "auto" }}>
                      {s === undefined ? (
                        <span className="pill">not visited</span>
                      ) : s.solved ? (
                        <span className="badge badge--pass">PASS</span>
                      ) : (
                        <span className="badge badge--fail">FAIL</span>
                      )}
                    </span>
                  </div>
                  <div className="home-card__sym">{c.observed}</div>
                  {s !== undefined && s.at > 0 && (
                    <div className="home-card__ts">
                      {s.solved ? "passing" : "failing"} since {since(s.at)}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
