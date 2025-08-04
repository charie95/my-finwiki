import SearchBar from "@/components/SearchBar";
import RecommendedKeywords from "@/components/RecommendedKeywords";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">금융 키워드 검색 서비스</h1>
      <SearchBar />
      <RecommendedKeywords />
    </main>
  );
}