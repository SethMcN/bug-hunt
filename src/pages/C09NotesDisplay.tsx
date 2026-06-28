import { useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { renderOffscreen } from "../shared/offscreen.ts";

const ch = challengeById("c09")!;

// Renders a user-supplied note. User input is displayed as plain text — markup
// in the note must be shown literally, never interpreted by the browser.
export function NoteView({ text }: { text: string }) {
  return <p className="mono" data-note>{text}</p>;
}

function runChecks(): CheckRow[] {
  const payloads = [
    `<img src=x onerror="window.__xss=1">`,
    `<b>bold</b>`,
    `<script>window.__xss=1</script>`,
  ];
  const rows: CheckRow[] = [];
  for (const p of payloads) {
    const { container, cleanup } = renderOffscreen(<NoteView text={p} />);
    const injectedEl = container.querySelector("img, b, script") !== null;
    const shownAsText = (container.textContent ?? "").includes(p);
    cleanup();
    rows.push({
      label: `markup "${p.slice(0, 20)}…" shown as text`,
      pass: !injectedEl && shownAsText,
    });
  }
  return rows;
}

export function C09NotesDisplay() {
  const [text, setText] = useState(`<img src=x onerror="alert('xss')">`);
  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Customer note">
        <Field label="Note text (try typing some HTML)">
          <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <div style={{ marginTop: 8 }}>
          <div className="muted">Rendered note:</div>
          <NoteView text={text} />
        </div>
      </Card>
    </div>
  );
}
