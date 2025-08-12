import type { NewsItem } from "@/app/types/search";

// 공용 텍스트 클리너(엔티티 디코드 → 태그 제거)
const clean = (s?: string) =>
  (s ?? "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "");

// YouTube Search API 최소 타입(사용하는 필드만)
type YTId = { videoId?: string } | string | undefined;
type YTSnippet =
  | {
      title?: string;
      description?: string;
      channelTitle?: string;
      publishedAt?: string;
    }
  | undefined;

interface YTItem {
  id?: YTId;
  snippet?: YTSnippet;
}

interface YTSearchResponse {
  items?: YTItem[];
  nextPageToken?: string;
}

// 반환 타입: 현재 컴포넌트 스키마에 맞춰 NewsItem[] 유지
export function normalizeYouTube(json: YTSearchResponse) {
  const items: NewsItem[] = [];

  for (const it of json.items ?? []) {
    // videoId 추출 (없으면 스킵)
    const vid = typeof it.id === "string" ? it.id : (it.id as { videoId?: string } | undefined)?.videoId;

    if (!vid) continue;

    const sn = it.snippet ?? {};
    items.push({
      id: vid,
      source: "youtube",
      title: clean(sn.title),
      summary: clean(sn.description),
      url: `https://www.youtube.com/watch?v=${vid}`, // ✅ 표준 URL
      author: sn.channelTitle,
      publishedAt: sn.publishedAt,
      host: "youtube.com",
    });
  }

  return { items, nextPageToken: json.nextPageToken };
}
