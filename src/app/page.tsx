import SearchBar from "@/components/SearchBar";
import RecommendedKeywords from "@/components/RecommendedKeywords";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4min-h-[70vh]pt-16 sm:pt-20 lg:pt-24flex flex-col items-center">
      <h1 className="mb-6 text-center text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
        금융 키워드 검색 서비스
      </h1>
      <SearchBar />
      <div className="mt-8 w-full">
        <RecommendedKeywords />
      </div>
    </main>
  );
}
