export function normalizeQuery(q: string) {
  return q.trim().replace(/\s+/g, " ").toLowerCase();
}

export function keyAll(q: string, strict: boolean, need: number) {
  return `search:all:${normalizeQuery(q)}:${strict ? 1 : 0}:${need}`;
}

export function keyNews(q: string, strict: boolean, start: number, need: number) {
  return `search:news:${normalizeQuery(q)}:${strict ? 1 : 0}:${start}:${need}`;
}

export function keyVideos(q: string, strict: boolean, pageKey: string | undefined, need: number) {
  return `search:videos:${normalizeQuery(q)}:${strict ? 1 : 0}:${pageKey ?? "first"}:${need}`;
}
