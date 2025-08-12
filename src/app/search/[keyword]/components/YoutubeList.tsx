import type { NewsItem } from "@/app/types/search";

export default function YoutubeList({ items = [] }: { items?: NewsItem[] }) {
  const has = items.length > 0;

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
      {has ? (
        items.map((v) => (
          <li key={v.id} className="rounded-2xl border p-6">
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
            >
              {v.title}
            </a>
            {v.summary && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">{v.summary}</p>}
            {v.author && <p className="mt-3 text-xs text-gray-400">{v.author}</p>}
          </li>
        ))
      ) : (
        <li className="text-gray-400">영상이 없습니다.</li>
      )}
    </ul>
  );
}
