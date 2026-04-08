"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { group: "엘리먼트 관리" },
  { href: "/admin/dashboard", label: "대시보드", icon: "📊" },
  { href: "/admin/questions", label: "문항 관리", icon: "📝" },
  { href: "/admin/types", label: "유형 관리", icon: "🔮" },
  { group: "TQ 규칙 관리" },
  { href: "/admin/tq-rules", label: "의사결정 테이블", icon: "⚙️" },
  { group: "학원 관리" },
  { href: "/admin/academy", label: "학원 계정 관리", icon: "🏫" },
];

const s = {
  layout: { display: "flex", minHeight: "100vh", background: "#F8F9FA", fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif" },
  sidebar: { width: 240, background: "#1E293B", color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 },
  logo: { padding: "24px 20px", fontSize: 18, fontWeight: 700, borderBottom: "1px solid #334155", letterSpacing: -0.5 },
  navGroup: { padding: "16px 20px 6px", fontSize: 10, fontWeight: 600, color: "#64748B", letterSpacing: 1, textTransform: "uppercase" },
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
  main: { flex: 1, padding: "32px 40px", overflowY: "auto", maxWidth: 1200 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: 16, color: "#64748B" },
};

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(null); // null=loading, true/false

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

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (auth === null) return <div style={s.loading}>인증 확인 중...</div>;
  if (!auth) return null;

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
        <div style={s.logo}>🔧 SF Admin</div>
        <nav style={s.nav}>
          {NAV_ITEMS.map((item, i) => (
            item.group
              ? <div key={"g"+i} style={s.navGroup}>{item.group}</div>
              : <a key={item.href} href={item.href} style={s.navItem(pathname === item.href)}>
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
