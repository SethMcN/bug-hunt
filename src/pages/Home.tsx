import { Link } from "react-router-dom";
import { CHALLENGES, type Group } from "../challenges.ts";
import { useAcceptanceState } from "../shared/acceptanceStore.ts";

const GROUPS: Group[] = ["Data entry", "Performance"];

export function Home() {
  const acceptance = useAcceptanceState();
  const total = CHALLENGES.length;
  const solved = CHALLENGES.filter((c) => acceptance[c.id] === true).length;

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
                    <span
                      className={`dot ${
                        s === undefined ? "dot--unknown" : s ? "dot--pass" : "dot--fail"
                      }`}
                    />
                    <span className="home-card__num">
                      #{String(c.num).padStart(2, "0")}
                    </span>
                    <strong>{c.title}</strong>
                    <span style={{ marginLeft: "auto" }}>
                      {s === undefined ? (
                        <span className="pill">not visited</span>
                      ) : s ? (
                        <span className="badge badge--pass">PASS</span>
                      ) : (
                        <span className="badge badge--fail">FAIL</span>
                      )}
                    </span>
                  </div>
                  <div className="home-card__sym">{c.observed}</div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
