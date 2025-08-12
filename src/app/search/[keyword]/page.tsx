import KeywordHeader from "./components/KeywordHeader";
import KeywordDescription from "./components/KeywordDescription";
import NewsList from "./components/NewsList";
import YoutubeList from "./components/YoutubeList";
import type { SearchResponse } from "@/app/types/search";
import { headers } from "next/headers";

async function getSearchData(keyword: string): Promise<SearchResponse> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? (host ? `${proto}://${host}` : "");

  const url = `${base}/api/search?query=${encodeURIComponent(keyword)}&limit=6`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return { isFinance: false, keyword, description: "", news: [], videos: [] };
  return res.json();
}

export default async function SearchPage(
  props: { params: Promise<{ keyword: string }> } // 👈 Promise 로 받고
) {
  const { keyword } = await props.params; // 👈 await 해서 꺼냄
  const decodedKeyword = decodeURIComponent(keyword || "");
  const data = await getSearchData(decodedKeyword);

  return (
    <main className="mx-auto max-w-5xl px-4 md:px-6 py-8 space-y-12">
      <KeywordHeader keyword={decodedKeyword} />

      {data.isFinance && data.description && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">{decodedKeyword}</h2>
          <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white/70 dark:bg-white/5 p-6">
            <KeywordDescription description={data.description} />
          </div>
        </section>
      )}

      {data.isFinance && (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">관련 뉴스</h2>
            <NewsList items={data.news} />
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">관련 유튜브 영상</h2>
            <YoutubeList items={data.videos} />
          </section>
        </>
      )}

      {!data.isFinance && (
        <p className="text-sm text-muted-foreground">금융/경제 용어가 아니거나 관련 자료가 없습니다.</p>
      )}
    </main>
  );
}
