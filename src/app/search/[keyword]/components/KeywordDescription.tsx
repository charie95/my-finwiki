export default function KeywordDescription({ description }: { description: string }) {
  if (!description) return null; // 비금융 or 설명 없음이면 섹션 자체 비표시
  return <p className="leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-line">{description}</p>;
}
