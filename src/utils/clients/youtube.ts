import { normalizeYouTube } from "@/utils/normalizers/youtube";
import { isFinanceContent } from "@/utils/filters/isFinanceContent";

/** ---- 최소 YouTube Raw 타입 ---- */
type YTRawId = { videoId?: string };
type YTRawThumb = { url?: string };
type YTRawSnippet = {
  title?: string;
  description?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnails?: {
    default?: YTRawThumb;
    medium?: YTRawThumb;
    high?: YTRawThumb;
    maxres?: YTRawThumb;
    standard?: YTRawThumb;
  };
};
type YTRawItem = { id?: YTRawId; snippet?: YTRawSnippet };
export type YTRawResponse = {
  items?: YTRawItem[];
  nextPageToken?: string;
};

/** normalize 이후(사용할 필드만) */
export type YouTubeItem = {
  id: string; // videoId
  title: string;
  description?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnail?: string;
};
export type YouTubeNormalized = {
  items: YouTubeItem[];
  nextPageToken?: string;
};

const YT_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_KEY = process.env.YOUTUBE_API_KEY!;

export async function fetchYouTube(
  query: string,
  pageToken?: string,
  maxResults = 6,
  opts?: { strict?: boolean }
): Promise<YouTubeNormalized> {
  if (!YT_KEY) return { items: [], nextPageToken: undefined };

  const anchored = opts?.strict ? `${query} 경제 금융 투자` : query;

  const params = new URLSearchParams({
    key: YT_KEY,
    q: anchored,
    part: "snippet",
    type: "video",
    maxResults: String(maxResults),
    relevanceLanguage: "ko",
    regionCode: "KR",
    safeSearch: "moderate",
    order: "relevance",
    videoDuration: "medium",
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${YT_URL}?${params.toString()}`);
  if (!res.ok) return { items: [], nextPageToken: undefined };

  const json = (await res.json()) as YTRawResponse;

  // 제목+설명(+채널명)으로 금융 스코어 필터
  const threshold = opts?.strict ? 2 : 1;
  const filtered: YTRawItem[] = (json.items ?? []).filter((it: YTRawItem) => {
    const title = it.snippet?.title ?? "";
    const desc = it.snippet?.description ?? "";
    const ch = it.snippet?.channelTitle ?? "";
    return isFinanceContent(`${title} ${desc}`, ch, threshold);
  });

  const filteredJson: YTRawResponse = {
    ...json,
    items: filtered,
  };

  // normalizeYouTube가 YTRawResponse를 받아 YouTubeNormalized를 돌려준다고 가정
  return normalizeYouTube(filteredJson) as YouTubeNormalized;
}
