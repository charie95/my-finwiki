import type { NewsItem } from "@/app/types/search";

export default function YoutubeList({ items = [] }: { items?: NewsItem[] }) {
  const has = items.length > 0;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {has ? (
        items.map((v) => (
          <li
            key={v.id}
            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition"
          >
            {/* 썸네일 */}
            <a href={v.url} target="_blank" rel="noopener noreferrer" className="block">
              <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt={v.title} className="w-full object-cover" />
            </a>

            {/* 텍스트 영역 */}
            <div className="p-4">
              <a
                href={v.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-400 hover:underline text-base sm:text-lg line-clamp-2"
              >
                {v.title}
              </a>
              {v.summary && <p className="text-sm mt-2 text-gray-400 line-clamp-3">{v.summary}</p>}
              {v.author && <p className="mt-3 text-xs text-gray-500">{v.author}</p>}
            </div>
          </li>
        ))
      ) : (
        <li className="text-gray-400">영상이 없습니다.</li>
      )}
    </ul>
  );
}
