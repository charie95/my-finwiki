import { NextRequest, NextResponse } from "next/server";
import { SearchResponse, NewsItem, ytToNews } from "@/app/types/search";
import { isFinanceKeyword } from "@/utils/filters/isFinance";
import { isFinanceContent } from "@/utils/filters/isFinanceContent";
import { fetchNaver, searchNaverStrict } from "@/utils/clients/naver";
import { fetchYouTube } from "@/utils/clients/youtube";
import { getCache, setCache, dedupe, cacheEnabled, seconds } from "@/utils/cache";
import { keyAll, keyNews, keyVideos } from "@/utils/searchCacheKey";

const LOG = process.env.SEARCH_CACHE_LOG === "1" || process.env.NODE_ENV !== "production";
type LogFn = (...args: unknown[]) => void;
function mkLogger() {
  const trace = Math.random().toString(36).slice(2, 8);
  const t0 = Date.now();
  const log: LogFn = (...args) => {
    if (LOG) console.log("[search]", trace, ...args);
  };
  const since = () => Date.now() - t0;
  return { log, since, trace };
}
// ──────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { log, since } = mkLogger();

  const u = new URL(req.url);
  const keyword = (u.searchParams.get("query") || "").trim();
  const strict = u.searchParams.get("strict") === "1";
  const need = Math.max(3, Math.min(12, Number(u.searchParams.get("limit") ?? 6)));

  // 경량 플래그들(더보기/부분호출)
  const only = u.searchParams.get("only"); // "news" | "videos" | null
  const assumeFinance = u.searchParams.get("assumeFinance") === "1";
  const naverStart = Number(u.searchParams.get("naverStart") ?? 1);
  const ytPage = u.searchParams.get("ytPage") ?? undefined;

  log("start", { keyword, strict, need, only, assumeFinance, naverStart, ytPage });

  if (!keyword) {
    log("no-keyword -> early-return", { tookMs: since() });
    return NextResponse.json(<SearchResponse>{ isFinance: false, keyword, description: "", news: [], videos: [] });
  }
  // [FAST PATH] 게이트 전에 캐시 먼저 확인 (히트면 바로 반환)
  if (cacheEnabled()) {
    const branch = only === "news" ? "news" : only === "videos" ? "videos" : "all";
    const preKey =
      branch === "news"
        ? keyNews(keyword, strict, naverStart, need)
        : branch === "videos"
        ? keyVideos(keyword, strict, ytPage ?? "first", need)
        : keyAll(keyword, strict, need);
    const preHit = getCache<SearchResponse>(preKey);
    if (preHit) {
      log("cacheHit-fast", { branch, key: preKey, beforeGate: true });
      return NextResponse.json(preHit);
    } else {
      log("cacheMiss-fast", { branch, key: preKey, beforeGate: true });
    }
  }

  // 첫 호출이거나 명시적으로 스킵 안 했으면 게이트 통과 필요
  if (!assumeFinance) {
    const tGate = Date.now();
    const { isFinance } = await isFinanceKeyword(keyword);
    log("finance-gate", { isFinance, tookMs: Date.now() - tGate });
    if (!isFinance) {
      log("gate-blocked -> early-return", { tookMs: since() });
      return NextResponse.json(<SearchResponse>{ isFinance: false, keyword, description: "", news: [], videos: [] });
    }
  }

  // ──────────────────────────────────────────
  // 뉴스만(더보기) - OpenAI/유튜브 비용 없이 가볍게
  if (only === "news") {
    const ttl = Number(process.env.SEARCH_CACHE_TTL_NEWS ?? 180);
    const key = keyNews(keyword, strict, naverStart, need);

    const hit = cacheEnabled() ? getCache<SearchResponse>(key) : null;
    log(hit ? "cacheHit" : "cacheMiss", { branch: "news", key });
    if (hit) {
      log("done", { branch: "news", totalMs: since() });
      return NextResponse.json(hit);
    }

    const tFetch = Date.now();
    const result = await dedupe(key, async () => {
      const newsRaw: NewsItem[] = strict
        ? await searchNaverStrict(keyword, need, naverStart, 6)
        : (await fetchNaver(keyword, naverStart, 6)).items.slice(0, need);

      const news = newsRaw.filter((it: NewsItem) =>
        isFinanceContent(`${it.title} ${it.summary ?? ""}`, it.host ?? "", 1)
      );

      return <SearchResponse>{ isFinance: true, keyword, description: "", news };
    });
    log("fetch", { branch: "news", tookMs: Date.now() - tFetch, newsCount: result.news?.length ?? 0 });

    if (cacheEnabled()) {
      setCache(key, result, seconds(ttl));
      log("cacheSet", { branch: "news", ttl });
    }
    log("done", { branch: "news", totalMs: since() });
    return NextResponse.json(result);
  }

  // ──────────────────────────────────────────
  // 영상만(더보기)
  if (only === "videos") {
    const ttl = Number(process.env.SEARCH_CACHE_TTL_VIDEOS ?? 480);
    const pageKey = ytPage ?? "first";
    const key = keyVideos(keyword, strict, pageKey, need);

    const hit = cacheEnabled() ? getCache<SearchResponse>(key) : null;
    log(hit ? "cacheHit" : "cacheMiss", { branch: "videos", key });
    if (hit) {
      log("done", { branch: "videos", totalMs: since() });
      return NextResponse.json(hit);
    }

    const tFetch = Date.now();
    const result = await dedupe(key, async () => {
      const yt = await fetchYouTube(keyword, ytPage, need, { strict });
      return <SearchResponse>{
        isFinance: true,
        keyword,
        description: "",
        news: [],
        videos: yt.items.map(ytToNews),
        next: { ytPage: yt.nextPageToken },
      };
    });
    log("fetch", { branch: "videos", tookMs: Date.now() - tFetch, videosCount: result.videos?.length ?? 0 });

    if (cacheEnabled()) {
      setCache(key, result, seconds(ttl));
      log("cacheSet", { branch: "videos", ttl });
    }
    log("done", { branch: "videos", totalMs: since() });
    return NextResponse.json(result);
  }

  // ──────────────────────────────────────────
  // 최초 로드: 설명 + 뉴스 + 영상
  {
    const ttl = Number(process.env.SEARCH_CACHE_TTL_ALL ?? 360);
    const key = keyAll(keyword, strict, need);

    const hit = cacheEnabled() ? getCache<SearchResponse>(key) : null;
    log(hit ? "cacheHit" : "cacheMiss", { branch: "all", key });
    if (hit) {
      log("done", { branch: "all", totalMs: since() });
      return NextResponse.json(hit);
    }

    const tFetch = Date.now();

    const pNews = (async () => {
      const t = Date.now();
      const out = strict
        ? await searchNaverStrict(keyword, need)
        : (await fetchNaver(keyword, 1, 6)).items.slice(0, need);
      log("subfetch", { part: "naver", tookMs: Date.now() - t, rawCount: out.length });
      return out;
    })();

    const pYT = (async () => {
      const t = Date.now();
      const out = await fetchYouTube(keyword, undefined, need, { strict });
      log("subfetch", { part: "youtube", tookMs: Date.now() - t, rawCount: out.items.length });
      return out;
    })();

    const pDesc = (async () => {
      const t = Date.now();
      try {
        const mod = await import("@/utils/clients/openai");
        const desc = await mod.openaiExplain(keyword);
        log("subfetch", { part: "openai", tookMs: Date.now() - t, descLen: desc?.length ?? 0 });
        return desc;
      } catch (e: unknown) {
        log("subfetch-error", {
          part: "openai",
          tookMs: Date.now() - t,
          message: e instanceof Error ? e.message : String(e),
        });
        return "";
      }
    })();

    const [newsRaw, yt, desc] = await Promise.all([pNews, pYT, pDesc]);
    log("fetch", { branch: "all", tookMs: Date.now() - tFetch });

    const news: NewsItem[] = newsRaw.filter((it: NewsItem) =>
      isFinanceContent(`${it.title} ${it.summary ?? ""}`, it.host ?? "", 1)
    );

    const result = <SearchResponse>{
      isFinance: true,
      keyword,
      description: desc || "",
      news,
      videos: yt.items,
      next: { naverStart: 7, ytPage: yt.nextPageToken },
    };

    if (cacheEnabled()) {
      setCache(key, result, seconds(ttl));
      log("cacheSet", { branch: "all", ttl });
    }
    log("done", { branch: "all", totalMs: since() });
    return NextResponse.json(result);
  }
}
