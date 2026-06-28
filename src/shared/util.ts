export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// A minimal debounce: the wrapped function only runs after `ms` have passed
// without another call. Returned function shares the same signature.
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function formatMoney(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
