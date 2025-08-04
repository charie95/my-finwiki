"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [input, setInput] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSearch = () => {
    const trimmed = input.trim();
    if (trimmed.length === 0) return;
    // 라우팅: /search/키워드
    router.push(`/search/${encodeURIComponent(trimmed)}`);
    setInput(""); // 검색 후 입력창 비우기 (선택)
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-xl mx-auto">
      <input
        type="text"
        placeholder="궁금한 금융/경제 용어를 검색하세요"
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-500"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
      >
        검색
      </button>
    </div>
  );
}