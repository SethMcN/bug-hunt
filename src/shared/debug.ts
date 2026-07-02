// Dev-only debug affordances (the panel's debug drawer, the sidebar dev tools).
// They can also be forced on from a harness via a global toggle, so they are
// clearly debug tooling and never part of a challenge.
export const DEBUG_ENABLED =
  (import.meta.env?.DEV ?? false) ||
  !!(globalThis as { __PANEL_DEBUG__?: boolean }).__PANEL_DEBUG__;
