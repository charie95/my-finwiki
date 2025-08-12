export type Source = "naver" | "youtube";

export interface NewsItem {
  id: string;
  source: Source;
  title: string;
  summary?: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  host?: string;
}

export interface SearchResponse {
  isFinance: boolean;
  keyword: string;
  description: string;
  news: NewsItem[];
  videos: NewsItem[];
  next?: { naverStart?: number; ytPage?: string };
}
