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
  thumbnail?: string;
}

export interface SearchResponse {
  isFinance: boolean;
  keyword: string;
  description: string;
  news: NewsItem[];
  videos: NewsItem[];
  next?: { naverStart?: number; ytPage?: string };
}

export interface YouTubeLite {
  id: string;
  title: string;
  description?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnail?: string;
}

export const ytToNews = (v: YouTubeLite): NewsItem => ({
  id: v.id,
  source: "youtube",
  title: v.title,
  summary: v.description ?? "",
  url: `https://www.youtube.com/watch?v=${v.id}`,
  author: v.channelTitle,
  publishedAt: v.publishedAt,
  host: "youtube.com",
  thumbnail: v.thumbnail ?? (v.id ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` : undefined),
});
