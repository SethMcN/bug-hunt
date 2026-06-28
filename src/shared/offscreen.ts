import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import type { ReactElement } from "react";

// Synchronously render a React element into a detached container so an
// acceptance check can inspect the resulting DOM (used by the notes-display
// challenge to verify user markup is shown as text, not interpreted).
export function renderOffscreen(element: ReactElement): {
  container: HTMLElement;
  cleanup: () => void;
} {
  const container = document.createElement("div");
  const root = createRoot(container);
  flushSync(() => root.render(element));
  return {
    container,
    cleanup: () => {
      flushSync(() => root.unmount());
    },
  };
}
