import type { ReactNode } from "react";

export function PageHeader({ title, num, group }: { title: string; num: number; group: string }) {
  return (
    <div className="pagehead">
      <span className="pagehead__num">#{String(num).padStart(2, "0")}</span>
      <h1>{title}</h1>
      <span className="pagehead__group">{group}</span>
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="card">
      {title && <h3 className="card__title">{title}</h3>}
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

// Pass/fail indicator for a challenge. Carries a glyph and a label so the
// status is readable without color vision and by screen readers.
export function StatusDot({ solved }: { solved: boolean | undefined }) {
  const label = solved === undefined ? "not checked yet" : solved ? "solved" : "unsolved";
  const cls = solved === undefined ? "dot--unknown" : solved ? "dot--pass" : "dot--fail";
  return <span className={`dot ${cls}`} role="img" aria-label={label} title={label} />;
}
