import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://my-finwiki.vercel.app"), // ⭐️ 절대 URL 계산 기준
  title: "my-finwiki - 금융 키워드 검색 서비스",
  description: "금융/경제 키워드에 대한 뉴스와 유튜브 영상을 한 번에!",
  openGraph: {
    type: "website",
    url: "/", // metadataBase 기준으로 절대 URL로 변환됨
    siteName: "my-finwiki",
    title: "my-finwiki - 금융 키워드 검색 서비스",
    description: "금융/경제 키워드에 대한 뉴스와 유튜브 영상을 한 번에!",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "my-finwiki 메인 미리보기 이미지" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "my-finwiki - 금융 키워드 검색 서비스",
    description: "금융/경제 키워드에 대한 뉴스와 유튜브 영상을 한 번에!",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-neutral-950 text-neutral-200`}
      >
        <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-transparent">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold no-underline hover:no-underline">
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] leading-none text-white/90">
                FIN
              </span>
              <span className="text-white/90">my-finwiki</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                href="/bookmarks"
                className="no-underline rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 transition"
              >
                북마크
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} my-finwiki
        </footer>
      </body>
    </html>
  );
}
