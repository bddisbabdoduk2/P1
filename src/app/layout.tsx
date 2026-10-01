import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { reviewMode, siteUrl } from "@/lib/config";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "원단랭킹 · 우리 아이 상태에 맞는 원단 찾기",
    template: "%s | 원단랭킹",
  },
  description:
    "0~3세 아이를 위한 원단·제품 표시사항과 연구 근거를 함께 확인하세요.",
  robots: reviewMode
    ? { index: false, follow: false }
    : { index: true, follow: true },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        {reviewMode && (
          <div className="review-banner">
            개발 검토용 · 수집 자료는 공개 추천 순위가 아닙니다
          </div>
        )}
        <header>
          <div className="header-top shell">
            <span>아이의 피부에 닿는 선택</span>
            <Link className="brand" href="/">
              원단랭킹<span>우리 아이의 원단 길잡이</span>
            </Link>
            <Link href="/account">회원 공간</Link>
          </div>
          <nav className="shell" aria-label="주 메뉴">
            <Link href="/find">우리 아이 원단</Link>
            <Link href="/fabrics">원단 알아보기</Link>
            <Link href="/compare">원단 비교</Link>
            <Link href="/products">제품 표시사항</Link>
            <Link href="/evidence">선정 기준·출처</Link>
            <Link href="/community">육아톡톡</Link>
          </nav>
        </header>
        <main id="main" className="shell">
          {children}
        </main>
        <footer className="shell">
          <b>원단랭킹</b>
          <p>
            원단 정보와 개별 제품의 검증 결과는 구분합니다. 소재명만으로 개인별
            적합성이나 치료 효과를 판단하지 않습니다.
          </p>
          <Link href="/evidence">자료의 범위와 한계</Link> ·{" "}
          <Link href="/community">육아톡톡</Link>
        </footer>
      </body>
    </html>
  );
}
