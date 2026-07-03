import { useEffect, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card, Field } from "../shared/ui.tsx";
import { sleep } from "../shared/util.ts";

const ch = challengeById("c25")!;

// Persist the new note, then refresh the list so it includes what was saved.
export async function saveAndRefresh(
  save: () => Promise<void>,
  refresh: () => Promise<void>
): Promise<void> {
  save();
  await refresh();
}

async function runChecks(): Promise<CheckRow[]> {
  let saved = false;
  let refreshSawSave: boolean | null = null;
  await saveAndRefresh(
    async () => {
      await sleep(120); // server round-trip for the save
      saved = true;
    },
    async () => {
      refreshSawSave = saved; // what the refresh would read back
    }
  );
  await sleep(200); // let the save land either way before reporting
  return [
    {
      label: "refresh runs only after the save has completed",
      pass: refreshSawSave === true,
      detail: `refresh saw saved=${String(refreshSawSave)}`,
    },
  ];
}

// In-memory stand-in for the notes service, with realistic latency.
const serverNotes: string[] = ["Called about invoice #1042"];
async function saveNote(text: string): Promise<void> {
  await sleep(150);
  serverNotes.push(text);
}
async function fetchNotes(): Promise<string[]> {
  await sleep(30);
  return [...serverNotes];
}

export function C25SaveRefresh() {
  const [notes, setNotes] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    void fetchNotes().then(setNotes);
  }, []);

  async function add() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await saveAndRefresh(
      () => saveNote(text),
      async () => setNotes(await fetchNotes())
    );
  }

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Account notes">
        <Field label="New note">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} />
        </Field>
        <div className="row-actions">
          <button className="btn" onClick={() => void add()}>
            Add note
          </button>
          <button
            className="btn btn--ghost"
            onClick={() => void fetchNotes().then(setNotes)}
          >
            Refresh list
          </button>
        </div>
        <ul style={{ marginTop: 12 }}>
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
        <p className="muted">{notes.length} note(s)</p>
      </Card>
    </div>
  );
}
