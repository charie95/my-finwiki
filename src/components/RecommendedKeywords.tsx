"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RECOMMENDED_KEYWORDS } from "@/data/recommendedKeywords";
import { AnimatePresence, motion } from "framer-motion";

const KEYWORD_COUNT = 6;
const INTERVAL = 3000;

export default function RecommendedKeywords() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [motionKey, setMotionKey] = useState(0); // 키워드 세트 고유 key

  // 랜덤 키워드 추출
  const getRandomKeywords = () => {
    return RECOMMENDED_KEYWORDS.slice()
      .sort(() => Math.random() - 0.5)
      .slice(0, KEYWORD_COUNT);
  };

  useEffect(() => {
    setKeywords(getRandomKeywords());
    const intervalId = setInterval(() => {
      setKeywords(getRandomKeywords());
      setMotionKey((prev) => prev + 1); // 바뀔 때마다 key 변경
    }, INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  if (keywords.length === 0) return null;

  return (
    <section className="my-8 w-full max-w-xl mx-auto">
      <div className="mb-2 text-gray-400 font-semibold text-center">추천 키워드</div>
      <div className="relative h-12 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={motionKey}
            className="flex flex-wrap gap-2 justify-center py-1"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {keywords.map((keyword) => (
              <button
                key={keyword}
                onClick={() => router.push(`/search/${encodeURIComponent(keyword)}`)}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition text-sm"
              >
                {keyword}
              </button>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
