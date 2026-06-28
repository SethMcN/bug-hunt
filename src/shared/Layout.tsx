import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { CHALLENGES, type Group } from "../challenges.ts";
import { useAcceptanceState } from "./acceptanceStore.ts";

const GROUPS: Group[] = ["Data entry", "Performance"];

export function Layout({ children }: { children: ReactNode }) {
  const acceptance = useAcceptanceState();

  return (
    <div className="layout">
      <aside className="sidebar">
        <NavLink to="/" className="sidebar__brand">
          🐛 Bug Hunt
        </NavLink>
        {GROUPS.map((group) => (
          <div key={group} className="sidebar__group">
            <div className="sidebar__grouptitle">{group}</div>
            {CHALLENGES.filter((c) => c.group === group).map((c) => {
              const solved = acceptance[c.id];
              return (
                <NavLink
                  key={c.id}
                  to={`/${c.id}`}
                  className={({ isActive }) =>
                    `sidebar__link${isActive ? " is-active" : ""}`
                  }
                >
                  <span
                    className={`dot ${
                      solved === undefined
                        ? "dot--unknown"
                        : solved
                          ? "dot--pass"
                          : "dot--fail"
                    }`}
                  />
                  <span className="sidebar__num">{String(c.num).padStart(2, "0")}</span>
                  <span className="sidebar__title">{c.title}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
