"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const ELEMENT_NAV = [
  { href: "/admin/dashboard", label: "대시보드", icon: "📊" },
  { href: "/admin/questions", label: "문항 관리", icon: "📝" },
  { href: "/admin/types", label: "유형 관리", icon: "🔮" },
];

// 사이드바가 필요한 페이지 (Element 관리)
const SIDEBAR_PATHS = ["/admin/dashboard", "/admin/questions", "/admin/types"];
// 사이드바 없이 풀 화면 (TQ, 학원 등)
const FULLSCREEN_PATHS = ["/admin/tq-rules", "/admin/academy"];

const s = {
  layout: { display: "flex", height: "100vh", overflow: "hidden", background: "#F8F9FA", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" },
  sidebar: { width: 240, background: "#1E293B", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0, height: "100vh", overflowY: "auto" },
  logo: { padding: "24px 20px", fontSize: 18, fontWeight: 700, borderBottom: "1px solid #334155", letterSpacing: -0.5, cursor: "pointer", textDecoration: "none", color: "#fff", display: "block" },
  nav: { padding: "12px 0", flex: 1 },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
    color: active ? "#fff" : "#94A3B8", background: active ? "#334155" : "transparent",
    textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer",
    borderLeft: active ? "3px solid #3B82F6" : "3px solid transparent",
    transition: "all 0.15s",
  }),
  logoutBtn: {
    margin: "12px 16px 20px", padding: "10px 0", background: "transparent", border: "1px solid #475569",
    color: "#94A3B8", borderRadius: 8, cursor: "pointer", fontSize: 13, textAlign: "center",
  },
  main: { flex: 1, padding: "32px 40px", overflowY: "auto", overflowX: "hidden", height: "100vh" },
  mainFull: { flex: 1, overflow: "hidden", height: "100vh" },
  // 풀스크린용 상단바
  topBar: {
    height: 56, background: "#1E293B", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", flexShrink: 0,
  },
  topLogo: { fontSize: 16, fontWeight: 700, color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  topLogout: { background: "transparent", border: "1px solid #475569", color: "#94A3B8", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 16, color: "#64748B" },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) { setAuth(true); }
        else {
          setAuth(false);
          if (pathname !== "/admin/login") router.replace("/admin/login");
        }
      })
      .catch(() => { setAuth(false); router.replace("/admin/login"); });
  }, [pathname, router]);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  const adminHead = (
    <>
      <title>SF Admin</title>
      <link rel="icon" type="image/svg+xml" href="/favicon-admin.svg" />
    </>
  );

  if (pathname === "/admin/login") return <>{adminHead}{children}</>;
  if (auth === null) return <>{adminHead}<div style={s.loading}>인증 확인 중...</div></>;
  if (!auth) return <>{adminHead}</>;

  const isSidebar = SIDEBAR_PATHS.some(p => pathname.startsWith(p));
  const isFullscreen = FULLSCREEN_PATHS.some(p => pathname.startsWith(p));

  // 풀스크린 레이아웃 (TQ, 학원): 상단바 + 풀 콘텐츠
  if (isFullscreen) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div style={s.topBar}>
          <a style={s.topLogo} href="/admin">← SF Admin</a>
          <button style={s.topLogout} onClick={handleLogout}>로그아웃</button>
        </div>
        <div style={s.mainFull}>{children}</div>
      </div>
    );
  }

  // 사이드바 레이아웃 (Element 관리)
  if (isSidebar) {
    return (
      <div style={s.layout}>
        <aside style={s.sidebar}>
          <a style={s.logo} href="/admin">⭐ SF Admin</a>
          <nav style={s.nav}>
            {ELEMENT_NAV.map(item => (
              <a key={item.href} href={item.href} style={s.navItem(pathname === item.href)}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <button style={s.logoutBtn} onClick={handleLogout}>로그아웃</button>
        </aside>
        <main style={s.main}>{children}</main>
      </div>
    );
  }

  // 선택 화면 (/admin): 사이드바 없음
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={s.topBar}>
        <span style={{ ...s.topLogo, cursor: "default" }}>⭐ SF Admin</span>
        <button style={s.topLogout} onClick={handleLogout}>로그아웃</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>{children}</div>
    </div>
  );
}
