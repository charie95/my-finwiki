type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<any>>();
const order: string[] = []; // 아주 단순한 LRU 큐
const inflight = new Map<string, Promise<any>>();

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
  const e = store.get(key);
  if (!e) return null;
  if (now() > e.expiresAt) {
    store.delete(key);
    return null;
  }
  touch(key);
  return e.value as T;
}

export function setCache<T>(key: string, value: T, ttlMs: number) {
  store.set(key, { value, expiresAt: ttl(ttlMs) });
  touch(key);
  cap();
}

export async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existed = inflight.get(key);
  if (existed) return existed as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

export function cacheEnabled() {
  return (process.env.SEARCH_CACHE_ENABLED ?? "false").toLowerCase() === "true";
}

export function seconds(n: number) {
  return n * 1000;
}
