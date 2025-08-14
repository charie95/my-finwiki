"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Bookmark = {
  keyword: string;
  url: string;
  savedAt: number;
};

const LS_KEY = "myfinwiki.bookmarks";

function readBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list = raw ? (JSON.parse(raw) as Bookmark[]) : [];
    return Array.isArray(list) ? list.filter((b) => b && typeof b.keyword === "string") : [];
  } catch {
    return [];
  }
}
function writeBookmarks(list: Bookmark[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

interface KeywordHeaderProps {
  keyword: string;
}

export default function KeywordHeader({ keyword }: KeywordHeaderProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ✅ 현재 경로/쿼리 반영
  const pathname = usePathname(); // e.g. /search/삼성전자
  const searchParams = useSearchParams(); // e.g. strict=1&ytPage=2

  // ✅ 항상 최신 URL 생성 (SSR 안전)
  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const qs = searchParams?.toString();
    const path = pathname || `/search/${encodeURIComponent(keyword)}`;
    return `${origin}${path}${qs ? `?${qs}` : ""}`;
  }, [pathname, searchParams, keyword]);

  // 북마크 여부 동기화 (키워드 기준 + 다른 탭 동기화)
  useEffect(() => {
    const has = readBookmarks().some((b) => b.keyword === keyword);
    setBookmarked(has);

    const onStorage = (e: StorageEvent) => {
      if (e.key !== LS_KEY) return;
      const nowHas = readBookmarks().some((b) => b.keyword === keyword);
      setBookmarked(nowHas);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [keyword]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1500);
  };

  // ✅ 최신 shareUrl로 북마크 저장(같은 키워드는 갱신)
  const handleBookmark = useCallback(() => {
    const list = readBookmarks();
    if (bookmarked) {
      writeBookmarks(list.filter((b) => b.keyword !== keyword));
      setBookmarked(false);
      showToast("북마크를 해제했어요.");
    } else {
      const item: Bookmark = { keyword, url: shareUrl, savedAt: Date.now() };
      const next = [item, ...list.filter((b) => b.keyword !== keyword)];
      writeBookmarks(next);
      setBookmarked(true);
      showToast("북마크에 저장했어요.");
    }
  }, [bookmarked, keyword, shareUrl]);

  // ✅ 네이티브 공유 → 폴백 순서, 항상 최신 shareUrl 사용
  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: keyword, url: shareUrl });
        showToast("공유를 시작했어요.");
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      showToast("링크를 복사했어요.");
    } catch {
      showToast("복사/공유에 실패했어요.");
    }
  }, [keyword, shareUrl]);

  return (
    <header className="flex items-center justify-center gap-3 mb-4">
      <h1 className="text-3xl font-extrabold tracking-tight">{keyword}</h1>

      <button
        type="button"
        onClick={handleBookmark}
        aria-pressed={bookmarked}
        className={`px-3 py-1.5 rounded-xl text-sm transition
          ${
            bookmarked
              ? "bg-yellow-400 text-yellow-950 hover:bg-yellow-300"
              : "bg-yellow-200 text-yellow-900 hover:bg-yellow-300"
          }`}
      >
        {bookmarked ? "⭐ 북마크됨" : "☆ 북마크"}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className="px-3 py-1.5 rounded-xl text-sm transition bg-blue-200 text-blue-900 hover:bg-blue-300"
      >
        🔗 공유
      </button>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-black/80 text-white text-sm px-3 py-2">
          {toast}
        </div>
      )}
    </header>
  );
}
