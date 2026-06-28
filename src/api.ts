// Shared API client. Besides fetching JSON it exposes two pieces of
// instrumentation the AcceptancePanel relies on:
//   1. a per-endpoint request counter (how many times the frontend hit an
//      endpoint) — used by the refetch-storm and debounce challenges.
//   2. the X-Query-Count response header surfaced from the backend — used by
//      the N+1 challenge.

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
  const res = await fetch(path);
  const qc = res.headers.get("X-Query-Count");
  const data = (await res.json()) as T;
  return { data, queryCount: qc === null ? null : Number(qc) };
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<{ status: number; data: T }> {
  const k = keyOf(path);
  requestCounts[k] = (requestCounts[k] ?? 0) + 1;
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T;
  return { status: res.status, data };
}
