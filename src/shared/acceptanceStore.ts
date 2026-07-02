// Tiny pub/sub store tracking each challenge's solved/unsolved state so the
// Home page can show a live badge for every page. Persisted to localStorage so
// badges survive reloads; updated whenever a page's AcceptancePanel re-checks.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "bughunt.acceptance";

export interface AcceptanceEntry {
  solved: boolean;
  at: number; // when this status was first recorded (ms epoch); 0 = unknown
}

type State = Record<string, AcceptanceEntry>;

function load(): State {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Record<
      string,
      boolean | AcceptanceEntry
    >;
    // Migrate the pre-timestamp format (bare booleans) in place.
    const state: State = {};
    for (const [id, v] of Object.entries(raw)) {
      state[id] = typeof v === "boolean" ? { solved: v, at: 0 } : v;
    }
    return state;
  } catch {
    return {};
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function reportAcceptance(id: string, solved: boolean): void {
  if (state[id]?.solved === solved) return;
  state = { ...state, [id]: { solved, at: Date.now() } };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emit();
}

// Clear every recorded badge (used to start a fresh training round).
export function resetProgress(): void {
  state = {};
  localStorage.removeItem(STORAGE_KEY);
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAcceptanceState(): State {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
