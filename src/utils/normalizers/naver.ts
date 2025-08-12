import { NewsItem } from "@/app/types/search";

// HTML 엔티티 디코딩 함수
const decodeEntities = (s?: string) =>
  (s ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

// HTML 태그 제거 + 디코딩
const cleanText = (s?: string) => decodeEntities(s).replace(/<[^>]+>/g, "");

const hostOf = (u?: string) => {
  try {
    return u ? new URL(u).host.replace(/^www\./, "") : "";
  } catch {
    return "";
  }
};

export function normalizeNaver(json: any) {
  const items: NewsItem[] = (json.items ?? []).map((it: any, i: number) => ({
    id: it.link || String(i),
    source: "naver",
    title: cleanText(it.title),
    summary: cleanText(it.description),
    url: it.link,
    author: it.bloggername ?? undefined,
    publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : undefined,
    host: hostOf(it.originallink) || hostOf(it.link),
  }));
  const next = (json.start ?? 1) + (json.display ?? items.length);
  return { items, next };
}
