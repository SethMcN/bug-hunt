import { Router } from "express";
import { runSeed } from "../seedCore.ts";

// Dev-only helpers (never mounted in production). Reseeding restores the
// pristine dataset — handy because some acceptance checks insert real rows.
export const devRouter = Router();

devRouter.post("/reseed", (_req, res) => {
  const { counts, total } = runSeed();
  console.log("Reseeded via /api/dev/reseed:", counts);
  res.json({ ok: true, counts, total });
});
