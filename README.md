# Bug Hunt — Admin Dashboard Training Harness

A local-only training app. One admin dashboard (Customers / Orders / Products)
whose **19 feature pages each contain exactly one deliberately planted, realistic
bug**. Every page shows its own challenge (Expected vs Observed) and a live
**Acceptance check** that turns green only when the behavior is correct.

You fix the bugs. The clean reference lives on the `answer-key` git tag.

> ⚠️ **SPOILER WARNING — `answer-key` is the answer sheet.**
> The `answer-key` tag (and `origin/answer-key`) contains the fully-fixed code for
> all 19 challenges. **Don't check it out or diff against it unless you actually
> want the answers.** Do your hunting on `main`; only peek when you've given up on
> a page. Looking is one command away — so don't look by accident.

- Frontend: React + TypeScript + Vite (strict mode)
- Backend: Express + TypeScript + SQLite (Node's built-in `node:sqlite`)
- Dataset: ~13,000 seeded rows so performance bugs actually manifest

## Requirements

- Node 22+ (uses the built-in `node:sqlite` module; developed on Node 26)
- npm

## Install

```bash
npm install
```

## Seed the database (required, first run)

Generates ~13k rows (2,000 customers · 400 products · 3,000 orders · ~7,500 items):

```bash
npm run seed
```

The SQLite file `data.db` is git-ignored.

## Run

One command brings up **both** servers (Express API + Vite) via `concurrently`:

```bash
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:4519 (proxied under `/api` by Vite)

If port 4519 is taken, set `API_PORT` and update `vite.config.ts`'s proxy target
to match.

## The workflow

1. `npm run dev`, open http://localhost:5173.
2. The sidebar lists all 19 challenges grouped **Data entry** and **Performance**,
   each with a red/green dot. The Home page shows the same as a scoreboard.
3. Open a challenge. Read the **Acceptance check**: *Expected* vs *Observed*.
   - **Correctness** pages run example inputs through the real feature and show
     pass/fail per case.
   - **Performance** pages show a live metric vs a target (DB queries, requests,
     row re-renders, rows mounted, lookup ops, cache size, load time…).
4. Find and fix the bug in the code until the panel turns **green**.
5. Verify against the reference without spoiling it:

   ```bash
   # See the intended fix for one page only when you choose to:
   git diff answer-key -- src/pages/C07Dedupe.tsx
   ```

> Don't peek before solving. `main` is broken by design; `answer-key` is correct.

## Acceptance panel & instrumentation

- `<AcceptancePanel>` (top of every page) is the oracle. It checks **behavior
  only** — it never names the cause or the fix.
- Query counting: Express middleware counts DB queries per request and returns
  `X-Query-Count`; the panel reads it (N+1 page).
- Render/work counters: `makeCounter()` / `useRenderCount()` track re-renders and
  heavy-work invocations.
- Request counting: the shared API client counts calls per endpoint (refetch /
  debounce pages).

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
  routes/          one router per resource (customers, orders, products, stats)
  db.ts            DB + per-request query-count instrumentation
  seed.ts          large dataset generator
shared/types.ts    types shared by client + server
src/
  challenges.ts    the 19 challenges (titles + symptom-only briefs)
  api.ts           fetch client + request/query-count instrumentation
  shared/          AcceptancePanel, Layout, counters, utils
  pages/           Home + C01..C19 (one per challenge)
```

## Optional: push to GitHub

```bash
git remote add origin <your-repo-url>
git push -u origin main
git push origin answer-key   # push the hidden answer-key tag too
```
