"use client";
import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";

function fmtDate(ts: number) {
  try {
    return new Date(ts).toLocaleString("ko-KR");
  } catch {
    return "";
  }
}

export default function BookmarksPage() {
  const { list, remove } = useBookmarks(); // list: Bookmark[] | null

  return (
    <main className="mx-auto max-w-4xl px-4 md:px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">북마크</h1>

      <ul className="space-y-4">
        {list === null ? (
          <li className="text-gray-400">불러오는 중…</li>
        ) : list.length === 0 ? (
          <li className="text-gray-400">저장한 항목이 없습니다.</li>
        ) : (
          list.map((b) => (
            <li key={b.keyword}>
              <div
                className="group flex items-stretch justify-between rounded-2xl border border-gray-100 dark:border-white/10
                           bg-white/70 dark:bg-white/5 overflow-hidden hover:shadow-md transition"
              >
                {/* 카드 전체를 클릭하면 이동: Link를 flex-1로 확장 */}
                <Link
                  href={`/search/${encodeURIComponent(b.keyword)}`}
                  className="flex-1 p-4 block focus:outline-none focus:ring-2 focus:ring-blue-400"
                  prefetch
                >
                  <div className="font-semibold text-blue-700 dark:text-blue-300 group-hover:underline">
                    {b.keyword}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{fmtDate(b.savedAt)}</div>
                </Link>

                {/* 삭제 버튼: 링크 클릭과 충돌 방지 */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    remove(b.keyword);
                  }}
                  className="m-3 px-3 py-1.5 text-sm rounded-lg border hover:bg-gray-50 dark:hover:bg-white/10"
                  aria-label={`${b.keyword} 북마크 삭제`}
                >
                  삭제
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
