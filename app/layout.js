import "./globals.css";

export const metadata = {
  title: "엘리멘트 학습성향 검사",
  description: "나의 공부 스타일은 어떤 유형일까? 엘리멘트 학습성향 검사로 알아보세요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
