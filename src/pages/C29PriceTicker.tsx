import { useEffect, useReducer, useState } from "react";
import { challengeById } from "../challenges.ts";
import { AcceptancePanel, type CheckRow } from "../shared/AcceptancePanel.tsx";
import { PageHeader, Card } from "../shared/ui.tsx";
import { makeCounter } from "../shared/useRenderCount.ts";
import { renderOffscreen } from "../shared/offscreen.ts";
import { sleep, formatMoney } from "../shared/util.ts";

const ch = challengeById("c29")!;

// Counts every background poll any ticker instance performs.
export const tickWork = makeCounter();

// Shows a live price, polling for a fresh value a few times a second while the
// ticker is on screen.
export function LivePriceTicker({ work = tickWork }: { work?: ReturnType<typeof makeCounter> }) {
  const [price, setPrice] = useState(10000);

  useEffect(() => {
    const t = setInterval(() => {
      work.bump();
      setPrice((p) => Math.max(100, p + Math.round((Math.random() - 0.5) * 30)));
    }, 100);
    return () => clearInterval(t);
  }, [work]);

  return (
    <p className="metric">
      ACME <strong>{formatMoney(price)}</strong> <span className="muted">(live)</span>
    </p>
  );
}

// Mount a ticker off-screen, remove it, and verify the polling stops with it.
async function runChecks(): Promise<CheckRow[]> {
  const work = makeCounter();
  const { cleanup } = renderOffscreen(<LivePriceTicker work={work} />);
  await sleep(350); // ticker visible: polling expected
  cleanup(); // ticker removed
  const atUnmount = work.get();
  await sleep(500); // nothing should happen in this window
  const after = work.get() - atUnmount;
  return [
    {
      label: "ticker polls while it is visible",
      pass: atUnmount > 0,
      detail: `polls while mounted: ${atUnmount}`,
    },
    {
      label: "polling stops once the ticker is removed",
      pass: after === 0,
      detail: `polls after removal: ${after} (target 0)`,
    },
  ];
}

export function C29PriceTicker() {
  const [show, setShow] = useState(true);
  const [, force] = useReducer((n: number) => n + 1, 0);

  // Page-level readout of total background polls (refreshes twice a second).
  useEffect(() => {
    const t = setInterval(force, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <PageHeader title={ch.title} num={ch.num} group={ch.group} />
      <AcceptancePanel challenge={ch} run={runChecks} />
      <Card title="Market widget">
        {show ? <LivePriceTicker /> : <p className="muted">(ticker hidden)</p>}
        <button className="btn btn--ghost btn--sm" onClick={() => setShow((v) => !v)}>
          {show ? "Hide ticker" : "Show ticker"}
        </button>
        <p className="metric" style={{ marginTop: 12 }}>
          Total background polls this session: <strong>{tickWork.get()}</strong>
        </p>
        <p className="muted">Watch this number after hiding the ticker.</p>
      </Card>
    </div>
  );
}
