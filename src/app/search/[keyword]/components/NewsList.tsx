import type { NewsItem } from "@/app/types/search";

export default function NewsList({ items = [] }: { items?: NewsItem[] }) {
  if (!items?.length) {
    return (
      <ul className="grid grid-cols-1">
        <li className="text-gray-400">뉴스가 없습니다.</li>
      </ul>
    );
  }

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((it) => {
        const dateText = it.publishedAt
          ? new Date(it.publishedAt).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })
          : undefined;

        // 안전 URL (없을 때는 링크 비활성)
        const href = it.url ?? "#";
        const isClickable = Boolean(it.url);

        return (
          <li key={it.id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={it.title}
              className={[
                "block rounded-2xl border border-white/10 bg-white/5 p-5",
                "hover:bg-white/10 transition",
                "no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
                !isClickable && "pointer-events-none opacity-60",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* 출처/호스트 배지 */}
              {(it.host || it.source) && (
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
                  {it.host && (
                    <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
                      {it.host}
                    </span>
                  )}
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-white/50">
                    {it.source}
                  </span>
                </div>
              )}

              {/* 제목 */}
              <h3 className="text-[15px] sm:text-base font-semibold text-white/90 line-clamp-2">
                {it.title}
                <span aria-hidden className="ml-1 align-middle text-white/40">
                  ↗
                </span>
              </h3>

              {/* 요약 */}
              {it.summary && <p className="mt-2 text-sm text-white/60 line-clamp-3">{it.summary}</p>}

              {/* 날짜 */}
              {dateText && <p className="mt-3 text-xs text-white/40">{dateText}</p>}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
