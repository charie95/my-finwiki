type Entry<T = unknown> = { value: T; expiresAt: number };

// HMR에서도 유지하려고 globalThis에 저장해둠(선택적)
const g = globalThis as typeof globalThis & {
  __searchCache?: {
    store: Map<string, Entry<unknown>>;
    order: string[];
    inflight: Map<string, Promise<unknown>>;
  };
};

g.__searchCache ??= {
  store: new Map<string, Entry<unknown>>(),
  order: [],
  inflight: new Map<string, Promise<unknown>>(),
};

const store = g.__searchCache.store;
const order = g.__searchCache.order;
const inflight = g.__searchCache.inflight;

function now() {
  return Date.now();
}
function ttl(ms: number) {
  return now() + ms;
}
function cap() {
  const limit = Number(process.env.SEARCH_CACHE_MAX_KEYS ?? 500);
  while (order.length > limit) {
    const oldest = order.shift();
    if (oldest) store.delete(oldest);
  }
}
function touch(key: string) {
  const i = order.indexOf(key);
  if (i >= 0) order.splice(i, 1);
  order.push(key);
}

export function getCache<T>(key: string): T | null {
  const e = store.get(key) as Entry<T> | undefined;
  if (!e) return null;
  if (now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  touch(key);
  return e.value;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: ttl(ttlMs) });
  touch(key);
  cap();
}

export async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existed = inflight.get(key) as Promise<T> | undefined;
  if (existed) return existed;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p as Promise<unknown>);
  return p;
}

export function cacheEnabled() {
  return (process.env.SEARCH_CACHE_ENABLED ?? "false").toLowerCase() === "true";
}

export function seconds(n: number) {
  return n * 1000;
}
