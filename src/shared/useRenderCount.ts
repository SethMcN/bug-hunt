import { useRef } from "react";

// Counts how many times the calling component has rendered. Returns the live
// count. Used by performance challenges whose symptom is excessive re-rendering.
export function useRenderCount(): number {
  const count = useRef(0);
  count.current += 1;
  return count.current;
}

// A mutable external counter the AcceptancePanel can poll. A component bumps it
// on each render (or each invocation of some work) and the panel reads the
// number without forcing its own re-render.
export function makeCounter() {
  let n = 0;
  return {
    bump: () => {
      n += 1;
    },
    get: () => n,
    reset: () => {
      n = 0;
    },
  };
}
