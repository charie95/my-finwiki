import { NewsItem } from "@/app/types/search";

// HTML 엔티티 디코딩
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

/** --- Naver 원본 타입(필요 최소) --- */
type NaverRawItem = {
  title?: string;
  originallink?: string;
  link?: string;
  description?: string;
  pubDate?: string;
  bloggername?: string; // 뉴스 응답엔 거의 없음(블로그 API 필드), 옵션으로 둠
};
type NaverRawResponse = {
  items?: NaverRawItem[];
  start?: number;
  display?: number;
};

export function normalizeNaver(json: NaverRawResponse): { items: NewsItem[]; next: number } {
  const items: NewsItem[] = (json.items ?? []).map(
    (it, i): NewsItem => ({
      id: it.link || String(i),
      source: "naver",
      title: cleanText(it.title),
      summary: cleanText(it.description),
      url: it.link,
      author: it.bloggername || undefined,
      publishedAt: it.pubDate ? new Date(it.pubDate).toISOString() : undefined,
      host: hostOf(it.originallink) || hostOf(it.link),
    })
  );

  const next = (json.start ?? 1) + (json.display ?? items.length);
  return { items, next };
}
