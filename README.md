# Bug Hunt — Admin Dashboard Training Harness

A local-only training app. One admin dashboard (Customers / Orders / Products)
whose **29 feature pages each contain exactly one deliberately planted, realistic
bug**. Every page shows its own challenge (Expected vs Observed) and a live
**Acceptance check** that turns green only when the behavior is correct.

You fix the bugs. The clean reference lives on git tags:

- `answer-key` — the intended fixes for challenges **01–19**
- `answer-key-2` — the intended fixes for challenges **20–29**

> ⚠️ **SPOILER WARNING — the `answer-key*` tags are the answer sheet.**
> They contain the fully-fixed code for the challenges they cover. **Don't check
> them out or diff against them unless you actually want the answers.** Do your
> hunting on `main`; only peek when you've given up on a page. Looking is one
> command away — so don't look by accident.

- Frontend: React + TypeScript + Vite (strict mode)
- Backend: Express + TypeScript + SQLite (Node's built-in `node:sqlite`)
- Dataset: ~13,000 seeded rows so performance bugs actually manifest

## Requirements

- Node 22.5+ (uses the built-in `node:sqlite` module; enforced via `engines`,
  developed on Node 26)
- npm

## Install & run

```bash
npm install
npm run dev
```

One command brings up **both** servers (Express API + Vite) via `concurrently`:

- App: http://localhost:5173
- API: http://localhost:4519 (proxied under `/api` by Vite)

On first run the server notices the database is empty and **seeds it
automatically** (2,000 customers · 400 products · 3,000 orders · ~7,500 items).
You can reseed any time with `npm run seed`, or with the **Reseed DB** button at
the bottom of the sidebar (dev only) — useful because a few acceptance checks
write real rows while exercising the API. The SQLite file `data.db` is
git-ignored.

If port 4519 is taken, set `API_PORT` — it moves both the Express listener and
the Vite proxy.

## The workflow

1. `npm run dev`, open http://localhost:5173.
2. The sidebar lists all 29 challenges grouped **Data entry**, **Performance**
   and **Async & state**, each with a pass/fail dot, plus a solved-count
   progress bar. The Home page shows the same as a scoreboard (with per-page
   "failing/passing since" times and a **Reset progress** button).
3. Open a challenge. Read the **Acceptance check**: *Expected* vs *Observed*.
   - **Correctness** pages run example inputs through the real feature and show
     pass/fail per case.
   - **Performance / async** pages show a live metric vs a target (DB queries,
     requests, row re-renders, rows mounted, lookup ops, cache size, load
     time…).
4. Find and fix the bug in the code until the panel turns **green**. Prev/next
   links at the bottom of each page step through the challenges in order.
5. Verify against the reference without spoiling it:

   ```bash
   # See the intended fix for one page only when you choose to:
   git diff answer-key   -- src/pages/C07Dedupe.tsx      # challenges 01–19
   git diff answer-key-2 -- src/pages/C22Pagination.tsx  # challenges 20–29
   ```

> Don't peek before solving. `main` is broken by design; the `answer-key*` tags
> are correct.

## Acceptance panel & instrumentation

- `<AcceptancePanel>` (top of every page) is the oracle. It checks **behavior
  only** — it never names the cause or the fix.
- Query counting: Express middleware counts DB queries per request and returns
  `X-Query-Count`; the panel reads it (N+1 page).
- Render/work counters: `makeCounter()` / `useRenderCount()` track re-renders and
  heavy-work invocations.
- Request counting: the shared API client counts calls per endpoint (refetch /
  debounce pages).
- Debug drawer (dev only, bottom of the panel): per-case expected/actual table,
  run duration, recent-runs history, and a log of the last API requests with
  status, timing and query counts.

## Scripts

| Command            | What it does                                  |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Run API + web together                        |
| `npm run seed`     | (Re)seed the SQLite database                  |
| `npm run typecheck`| Typecheck frontend and backend                |
| `npm run build`    | Production build of the frontend              |

## Layout

```
server/            Express API (TS) + node:sqlite
  routes/          one router per resource (customers, orders, products,
                   stats, filter) + dev-only helpers (reseed)
  db.ts            DB + per-request query-count instrumentation
  seedCore.ts      large dataset generator (shared by CLI + reseed endpoint)
  seed.ts          CLI wrapper for the generator
shared/types.ts    types shared by client + server
src/
  challenges.ts    the 29 challenges (titles + symptom-only briefs)
  api.ts           fetch client + request/query-count instrumentation
  shared/          AcceptancePanel, Layout, counters, debug helpers, utils
  pages/           Home + C01..C29 (one per challenge)
```

## Optional: push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin main
git push origin answer-key answer-key-2   # push the hidden answer-key tags too
```
