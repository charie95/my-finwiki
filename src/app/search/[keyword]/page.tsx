type Props = {
  params: { keyword: string }
}

export default function SearchResultPage({ params }: Props) {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-xl font-semibold">
        검색결과 페이지
      </div>
      <div className="mt-4 text-gray-500">
        입력 키워드: <span className="font-bold">{params.keyword}</span>
      </div>
      {/* 나중에 여기에 KeywordResult, NewsList 등 추가 */}
    </div>
  );
}