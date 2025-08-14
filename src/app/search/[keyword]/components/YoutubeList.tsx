import type { NewsItem } from "@/app/types/search";

export default function YoutubeList({ items = [] }: { items?: NewsItem[] }) {
  const has = items.length > 0;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {has ? (
        items.map((v) => (
          <li
            key={v.id}
            className="rounded-2xl border overflow-hidden transition
                       bg-white border-neutral-200 hover:bg-neutral-50
                       dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            {/* 썸네일 */}
            {v.thumbnail && (
              <a href={v.url} target="_blank" rel="noopener noreferrer" className="block">
                <img src={v.thumbnail} alt={v.title} loading="lazy" className="w-full object-cover" />
              </a>
            )}

            {/* 텍스트 영역 */}
            <div className="p-4">
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block font-medium hover:underline
                         text-blue-600 dark:text-blue-300
                         text-base sm:text-lg line-clamp-2"
              >
                {v.title}
              </a>

              {v.summary && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-white/60 line-clamp-3">{v.summary}</p>
              )}

              {v.author && <p className="mt-3 text-xs text-neutral-500 dark:text-white/40">{v.author}</p>}
            </div>
          </li>
        ))
      ) : (
        <li className="text-neutral-500 dark:text-white/50">영상이 없습니다.</li>
      )}
    </ul>
  );
}
