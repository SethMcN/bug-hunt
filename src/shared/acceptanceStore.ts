// Tiny pub/sub store tracking each challenge's solved/unsolved state so the
// Home page can show a live badge for every page. Persisted to localStorage so
// badges survive reloads; updated whenever a page's AcceptancePanel re-checks.
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "bughunt.acceptance";

type State = Record<string, boolean>;

function load(): State {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as State;
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
  if (state[id] === solved) return;
  state = { ...state, [id]: solved };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAcceptanceState(): State {
  return useSyncExternalStore(subscribe, () => state, () => state);
}
