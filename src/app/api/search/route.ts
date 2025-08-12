import { NextRequest, NextResponse } from "next/server";
import type { SearchResponse, NewsItem } from "@/app/types/search";
import { isFinanceKeyword } from "@/utils/filters/isFinance";
import { isFinanceContent } from "@/utils/filters/isFinanceContent";
import { fetchNaver, searchNaverStrict } from "@/utils/clients/naver";
import { fetchYouTube } from "@/utils/clients/youtube";

export async function GET(req: NextRequest) {
  const u = new URL(req.url);
  const keyword = (u.searchParams.get("query") || "").trim();
  const strict = u.searchParams.get("strict") === "1";
  const need = Math.max(3, Math.min(12, Number(u.searchParams.get("limit") ?? 6)));

  // 경량 플래그들(더보기/부분호출)
  const only = u.searchParams.get("only"); // "news" | "videos" | null
  const assumeFinance = u.searchParams.get("assumeFinance") === "1";
  const naverStart = Number(u.searchParams.get("naverStart") ?? 1);
  const ytPage = u.searchParams.get("ytPage") ?? undefined;

  if (!keyword) {
    return NextResponse.json(<SearchResponse>{ isFinance: false, keyword, description: "", news: [], videos: [] });
  }

  // 첫 호출이거나 명시적으로 스킵 안 했으면 게이트 통과 필요
  if (!assumeFinance) {
    const { isFinance } = await isFinanceKeyword(keyword);
    if (!isFinance) {
      return NextResponse.json(<SearchResponse>{ isFinance: false, keyword, description: "", news: [], videos: [] });
    }
  }

  // ──────────────────────────────────────────
  // 뉴스만(더보기) - OpenAI/유튜브 비용 없이 가볍게
  if (only === "news") {
    const newsRaw: NewsItem[] = strict
      ? await searchNaverStrict(keyword, need, naverStart, 6)
      : (await fetchNaver(keyword, naverStart, 6)).items.slice(0, need);

    // 공통 스코어 필터(제목+요약, 채널/호스트)
    const news = newsRaw.filter((it: NewsItem) =>
      isFinanceContent(`${it.title} ${it.summary ?? ""}`, it.host ?? "", 1)
    );

    return NextResponse.json(<SearchResponse>{
      isFinance: true,
      keyword,
      description: "",
      news,
    });
  }

  // 영상만(더보기)
  if (only === "videos") {
    const yt = await fetchYouTube(keyword, ytPage, need, { strict });
    return NextResponse.json(<SearchResponse>{
      isFinance: true,
      keyword,
      description: "",
      news: [],
      videos: yt.items,
      next: { ytPage: yt.nextPageToken },
    });
  }

  // ──────────────────────────────────────────
  // 최초 로드: 설명 + 뉴스 + 영상
  const [newsRaw, yt, desc] = await Promise.all([
    strict ? searchNaverStrict(keyword, need) : (await fetchNaver(keyword, 1, 6)).items.slice(0, need),
    fetchYouTube(keyword, undefined, need, { strict }),
    // 설명은 원 키워드 기준 (utils/clients/openai.ts)
    (async () => {
      try {
        const mod = await import("@/utils/clients/openai");
        return await mod.openaiExplain(keyword);
      } catch {
        return "";
      }
    })(),
  ] as const);

  // 뉴스에도 동일 필터 적용
  const news: NewsItem[] = newsRaw.filter((it: NewsItem) =>
    isFinanceContent(`${it.title} ${it.summary ?? ""}`, it.host ?? "", 1)
  );

  return NextResponse.json(<SearchResponse>{
    isFinance: true,
    keyword,
    description: desc || "",
    news,
    videos: yt.items,
    next: { naverStart: 7, ytPage: yt.nextPageToken },
  });
}
