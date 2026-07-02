// Shared API client. Besides fetching JSON it exposes three pieces of
// instrumentation:
//   1. a per-endpoint request counter (how many times the frontend hit an
//      endpoint) — used by the refetch-storm and debounce challenges.
//   2. the X-Query-Count response header surfaced from the backend — used by
//      the N+1 challenge.
//   3. a ring buffer of recent requests (method, path, status, duration,
//      query count) — shown in the AcceptancePanel's debug drawer.

type Counter = Record<string, number>;
const requestCounts: Counter = {};

function keyOf(path: string): string {
  // Count by pathname only, ignoring query string, so "?q=ab" and "?q=abc"
  // collapse to the same endpoint.
  const p = path.split("?")[0];
  return p;
}

export function getRequestCount(path: string): number {
  return requestCounts[keyOf(path)] ?? 0;
}

export function resetRequestCount(path: string): void {
  requestCounts[keyOf(path)] = 0;
}

// --- request log (debug drawer) ---------------------------------------------

export interface RequestLogEntry {
  at: number; // ms epoch
  method: string;
  path: string;
  status: number | null; // null = network error, no response
  ms: number;
  queryCount: number | null;
}

const LOG_MAX = 30;
const requestLog: RequestLogEntry[] = [];

function record(entry: RequestLogEntry): void {
  requestLog.push(entry);
  if (requestLog.length > LOG_MAX) requestLog.splice(0, requestLog.length - LOG_MAX);
}

export function getRequestLog(): readonly RequestLogEntry[] {
  return requestLog;
}

// --- fetch helpers -----------------------------------------------------------

export interface ApiResult<T> {
  data: T;
  queryCount: number | null;
}

export async function apiGet<T>(path: string): Promise<T> {
  return (await apiGetWithMeta<T>(path)).data;
}

export async function apiGetWithMeta<T>(path: string): Promise<ApiResult<T>> {
  const k = keyOf(path);
  requestCounts[k] = (requestCounts[k] ?? 0) + 1;
  const t0 = performance.now();
  let status: number | null = null;
  let queryCount: number | null = null;
  try {
    const res = await fetch(path);
    status = res.status;
    const qc = res.headers.get("X-Query-Count");
    queryCount = qc === null ? null : Number(qc);
    const data = (await res.json()) as T;
    return { data, queryCount };
  } finally {
    record({
      at: Date.now(),
      method: "GET",
      path,
      status,
      ms: Math.round(performance.now() - t0),
      queryCount,
    });
  }
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<{ status: number; data: T }> {
  const k = keyOf(path);
  requestCounts[k] = (requestCounts[k] ?? 0) + 1;
  const t0 = performance.now();
  let status: number | null = null;
  let queryCount: number | null = null;
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    status = res.status;
    const qc = res.headers.get("X-Query-Count");
    queryCount = qc === null ? null : Number(qc);
    const data = (await res.json().catch(() => ({}))) as T;
    return { status: res.status, data };
  } finally {
    record({
      at: Date.now(),
      method: "POST",
      path,
      status,
      ms: Math.round(performance.now() - t0),
      queryCount,
    });
  }
}
