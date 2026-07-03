import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";

const ch = challengeById("c27")!;

export interface DisplaySettings {
  pageSize: number;
  theme: "dark" | "light";
  currency: string;
}

export const DEFAULT_SETTINGS: DisplaySettings = {
  pageSize: 25,
  theme: "dark",
  currency: "USD",
};

// Restore saved display settings from storage. Anything unusable (missing,
// corrupt, legacy format) falls back to the defaults — loading never fails.
export function loadSettings(raw: string | null): DisplaySettings {
  if (raw === null) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function tryLoad(raw: string | null): { ok: true; v: DisplaySettings } | { ok: false; err: string } {
  try {
    return { ok: true, v: loadSettings(raw) };
  } catch (e) {
    return { ok: false, err: e instanceof Error ? e.message : String(e) };
  }
}

function runChecks(): CheckRow[] {
  const rows: CheckRow[] = [];

  const missing = tryLoad(null);
  rows.push({
    label: "nothing stored → defaults",
    pass: missing.ok && missing.v.pageSize === 25 && missing.v.theme === "dark",
  });

  const partial = tryLoad('{"pageSize":50}');
  rows.push({
    label: "stored pageSize 50 merges over defaults",
    pass: partial.ok && partial.v.pageSize === 50 && partial.v.currency === "USD",
  });

  const corrupt = tryLoad('{"pageSize":50,');
  rows.push({
    label: "corrupt stored value → defaults, no crash",
    pass: corrupt.ok && corrupt.v.pageSize === 25,
    detail: corrupt.ok ? "loaded defaults" : `threw: ${corrupt.err}`,
  });

  return rows;
}

export function C27SettingsLoader() {
  const [raw, setRaw] = useState('{"pageSize":50,');
  const result = tryLoad(raw);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Load saved settings">
        <Field
          label="Stored value (simulates what's in localStorage)"
          hint="Corrupt values happen: interrupted writes, old app versions…"
        >
          <textarea rows={2} className="mono" value={raw} onChange={(e) => setRaw(e.target.value)} />
        </Field>
        {result.ok ? (
          <p className="metric">
            Loaded: <span className="mono">{JSON.stringify(result.v)}</span>
          </p>
        ) : (
          <p className="notice">Settings failed to load: {result.err}</p>
        )}
      </Card>
    </div>
  );
}
