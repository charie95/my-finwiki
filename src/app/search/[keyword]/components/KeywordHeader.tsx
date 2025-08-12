"use client";
import { useEffect, useMemo, useState } from "react";

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
    // 타입 가드(필수 필드만 확인)
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

  // 현재 페이지 URL (SSR 안전)
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.href;
    return `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/search/${encodeURIComponent(keyword)}`;
  }, [keyword]);

  // 진입/키워드 변경 시 북마크 여부 동기화
  useEffect(() => {
    const has = readBookmarks().some((b) => b.keyword === keyword);
    setBookmarked(has);

    // 다른 탭에서 변경될 때 동기화
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

  const handleBookmark = () => {
    const list = readBookmarks();
    if (bookmarked) {
      writeBookmarks(list.filter((b) => b.keyword !== keyword));
      setBookmarked(false);
      showToast("북마크를 해제했어요.");
    } else {
      const item: Bookmark = { keyword, url: shareUrl, savedAt: Date.now() };
      // 중복 제거 후 맨 앞에
      const next = [item, ...list.filter((b) => b.keyword !== keyword)];
      writeBookmarks(next);
      setBookmarked(true);
      showToast("북마크에 저장했어요.");
    }
  };

  const handleShare = async () => {
    try {
      // 모바일/지원 브라우저: 네이티브 공유
      if (navigator.share) {
        await navigator.share({ title: keyword, url: shareUrl });
        showToast("공유를 시작했어요.");
        return;
      }
      // 폴백: 클립보드 복사
      await navigator.clipboard.writeText(shareUrl);
      showToast("링크를 복사했어요.");
    } catch {
      showToast("복사/공유에 실패했어요.");
    }
  };

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

      {/* 가벼운 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-black/80 text-white text-sm px-3 py-2">
          {toast}
        </div>
      )}
    </header>
  );
}
