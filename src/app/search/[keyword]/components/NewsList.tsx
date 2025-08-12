import type { NewsItem } from "@/app/types/search";

export default function NewsList({ items = [] }: { items?: NewsItem[] }) {
  const has = items.length > 0;

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
      {has ? (
        items.map((it) => (
          <li key={it.id} className="rounded-2xl border p-6">
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 dark:text-blue-300 hover:underline"
            >
              {it.title}
            </a>
            {it.summary && <p className="text-sm mt-2 text-gray-600 dark:text-gray-400 line-clamp-3">{it.summary}</p>}
            {it.publishedAt && (
              <p className="text-xs text-gray-400 mt-2">{new Date(it.publishedAt).toLocaleDateString("ko-KR")}</p>
            )}
          </li>
        ))
      ) : (
        <li className="text-gray-400">뉴스가 없습니다.</li>
      )}
    </ul>
  );
}
