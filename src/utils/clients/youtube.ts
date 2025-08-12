import { normalizeYouTube } from "@/utils/normalizers/youtube";
import { isFinanceContent } from "@/utils/filters/isFinanceContent";

const YT_URL = "https://www.googleapis.com/youtube/v3/search";
const YT_KEY = process.env.YOUTUBE_API_KEY!;

export async function fetchYouTube(
  query: string,
  pageToken?: string,
  maxResults = 6,
  opts?: { strict?: boolean } // ⬅️ 선택 옵션 받도록
) {
  if (!YT_KEY) return { items: [], nextPageToken: undefined };

  // (선택) strict면 앵커를 덧붙여 검색 범위를 좁힐 수 있음
  const anchored = opts?.strict ? `${query} 경제 금융 투자` : query;

  const params = new URLSearchParams({
    key: YT_KEY,
    q: anchored, // ⬅️ anchored 사용
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

  const json = await res.json();

  // ⬇️⬇️ 여기 “한 줄”이 핵심: 제목+설명(+채널명)으로 금융 점수 필터
  const threshold = opts?.strict ? 2 : 1;
  json.items = (json.items ?? []).filter((it: any) => {
    const title = it?.snippet?.title ?? "";
    const desc = it?.snippet?.description ?? "";
    const ch = it?.snippet?.channelTitle ?? "";
    return isFinanceContent(`${title} ${desc}`, ch, threshold);
  });

  return normalizeYouTube(json);
}
