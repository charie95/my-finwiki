# 📚 my-finwiki

> **금융 키워드 검색 서비스**  
> 금융/경제 용어를 검색하고, 관련 뉴스와 유튜브 영상을 한 곳에서 확인할 수 있는 다크 테마 기반 웹 애플리케이션입니다.  
> 최신 금융 트렌드와 콘텐츠를 빠르고 직관적으로 탐색하세요.

---

## ✨ Features

- **🔍 금융 키워드 검색**
  - 실시간으로 금융/경제 용어 관련 뉴스와 유튜브 영상 검색
  - 키워드 필터링(`strict` 모드)로 더 정교한 결과 제공

- **📰 뉴스**
  - 네이버 뉴스 API 기반 최신 금융 뉴스 제공
  - 제목·요약·출처 호스트 정보 표시
  - 신뢰 매체(화이트리스트) 우선 표시

- **🎥 영상**
  - YouTube Data API 기반 금융 관련 영상 제공
  - 채널명, 설명, 업로드 날짜, 썸네일 지원

- **🔖 북마크**
  - 관심 있는 뉴스/영상 북마크 저장
  - 로컬스토리지로 새로고침 후에도 유지

- **💡 설명 생성**
  - OpenAI API를 통해 키워드에 대한 간단한 설명 자동 생성

- **🎨 UI**
  - 다크 모드 기반의 세련된 디자인
  - 헤더 고정(sticky header)로 어디서든 홈/북마크 접근 가능

---

## 🖥️ Tech Stack

| Category        | Stack |
|-----------------|-------|
| **Framework**   | [Next.js 14](https://nextjs.org/) |
| **Language**    | [TypeScript](https://www.typescriptlang.org/) |
| **UI**          | [Tailwind CSS](https://tailwindcss.com/) |
| **API**         | Naver News API, YouTube Data API, OpenAI API |
| **Deploy**      | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/your-username/my-finwiki.git
cd my-finwiki
