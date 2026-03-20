import "./globals.css";

export const metadata = {
  title: "엘리먼트 학습성향 검사",
  description: "나의 공부 스타일은 어떤 유형일까? 엘리먼트 학습성향 검사로 알아보세요.",
  openGraph: {
    title: "엘리먼트 학습성향 검사",
    description: "나의 공부 스타일은 어떤 유형일까? 4가지 원소 유형으로 알아보세요.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "엘리먼트 학습성향 검사",
    description: "나의 공부 스타일은 어떤 유형일까?",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
