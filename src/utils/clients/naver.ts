import { normalizeNaver } from "@/utils/normalizers/naver";
import { isFinanceContent } from "@/utils/filters/isFinanceContent";
import type { NewsItem } from "@/app/types/search";

const NAVER_NEWS_URL = "https://openapi.naver.com/v1/search/news.json";
const CID = process.env.NAVER_CLIENT_ID!;
const CSEC = process.env.NAVER_CLIENT_SECRET!;

/** strict 검색 시 붙일 앵커 */
const FIN_ANCHORS = ["경제", "증시", "주식", "증권", "금융", "투자", "채권", "금리"];

/** 신뢰 매체(화이트리스트) */
const WL = new Set([
  "hankyung.com",
  "mk.co.kr",
  "yna.co.kr",
  "yonhapnews.co.kr",
  "news.mt.co.kr",
  "sedaily.com",
  "fnnews.com",
  "edaily.co.kr",
  "asiae.co.kr",
]);

/** ---- 초간단 캐시 ---- */
const cache = new Map<string, { at: number; data: any }>();
const TTL = 10 * 60 * 1000;
const now = () => Date.now();
const get = <T>(k: string): T | null => {
  const v = cache.get(k);
  if (!v) return null;
  if (now() - v.at > TTL) {
    cache.delete(k);
    return null;
  }
  return v.data as T;
};
const set = (k: string, d: any) => cache.set(k, { at: now(), data: d });

/**
 * 네이버 뉴스 호출(기본형)
 * - query: 검색어
 * - start/display: 네이버 페이징(1-based)
 * - 반환: { items, next }
 */
export async function fetchNaver(query: string, start = 1, display = 6) {
  if (!CID || !CSEC) return { items: [] as NewsItem[], next: start + display };

  const url = new URL(NAVER_NEWS_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("display", String(display));
  url.searchParams.set("start", String(start));
  url.searchParams.set("sort", "date");

  const key = `naver:${url.searchParams.toString()}`;
  const hit = get<any>(key);
  if (hit) return hit;

  const res = await fetch(url.toString(), {
    headers: { "X-Naver-Client-Id": CID, "X-Naver-Client-Secret": CSEC },
  });
  if (!res.ok) return { items: [] as NewsItem[], next: start + display };

  const json = await res.json();
  const out = normalizeNaver(json); // title/summary 디코딩+strip, host 정리
  set(key, out);
  return out as { items: NewsItem[]; next: number };
}

/**
 * strict 검색:
 * - FIN_ANCHORS를 붙여 범위를 좁혀 여러 번 호출
 * - isFinanceContent(공통 스코어 필터)로 후처리
 * - WL(화이트리스트) 매체는 우선 통과
 */
export async function searchNaverStrict(keyword: string, need = 6, start = 1, display = 6) {
  let all: NewsItem[] = [];

  // 앵커를 붙여 순차 호출 (불필요한 동시성 방지)
  for (const a of FIN_ANCHORS) {
    const q = `${keyword} ${a}`;
    const { items } = await fetchNaver(q, start, display);
    all.push(...items);
    if (all.length >= need * 2) break; // 여유분 확보
  }

  // 공통 스코어 필터 적용(+WL은 우선 통과)
  const filtered = all.filter((it) => {
    const txt = `${it.title} ${it.summary ?? ""}`;
    const inWL = !!it.host && WL.has(it.host);
    return inWL || isFinanceContent(txt, it.host ?? "", 1);
  });

  // 중복 제거(원본 url > title)
  const seen = new Set<string>();
  const merged = filtered
    .filter((it) => {
      const k = it.url ?? it.title;
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => {
      const ta = a.publishedAt ? +new Date(a.publishedAt) : 0;
      const tb = b.publishedAt ? +new Date(b.publishedAt) : 0;
      return tb - ta;
    });

  // 결과가 너무 적으면 앵커 없는 기본 호출로 보강
  if (merged.length < Math.max(2, Math.ceil(need / 2))) {
    const { items } = await fetchNaver(keyword, start, display);
    const s2 = new Set(seen);
    for (const it of items) {
      const k = it.url ?? it.title;
      if (k && !s2.has(k)) {
        // 보강분도 스코어 필터 한 번 더
        const ok =
          isFinanceContent(`${it.title} ${it.summary ?? ""}`, it.host ?? "", 1) || (it.host && WL.has(it.host));
        if (!ok) continue;
        merged.push(it);
        s2.add(k);
      }
    }
  }

  return merged.slice(0, need);
}
