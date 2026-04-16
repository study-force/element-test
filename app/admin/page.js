"use client";
import React from "react";

const SECTIONS = [
  {
    href: "/admin/dashboard",
    icon: "🔥",
    title: "엘리먼트 관리",
    desc: "학습성향 검사 문항, 유형, 통계 관리",
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    href: "/admin/tq-rules",
    icon: "📘",
    title: "TQ 규칙 관리",
    desc: "TQ 의사결정 테이블, 경계값 관리",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
];

const s = {
  wrapper: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: 40 },
  inner: { maxWidth: 700, width: "100%" },
  title: { fontSize: 28, fontWeight: 700, color: "#1E293B", marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, color: "#64748B", marginBottom: 40, textAlign: "center" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card: (bg) => ({
    background: bg, borderRadius: 16, padding: "32px 24px", textDecoration: "none",
    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  }),
  cardIcon: { fontSize: 40, marginBottom: 12 },
  cardTitle: (color) => ({ fontSize: 17, fontWeight: 700, color, marginBottom: 6 }),
  cardDesc: { fontSize: 13, color: "#64748B", lineHeight: 1.5 },
};

export default function AdminHome() {
  return (
    <div style={s.wrapper}>
      <div style={s.inner}>
        <div style={s.title}>관리할 영역을 선택하세요</div>
        <div style={s.subtitle}>각 프로젝트별 관리 도구로 이동합니다</div>
        <div style={s.grid}>
          {SECTIONS.map(sec => (
            <a key={sec.href} href={sec.href} style={s.card(sec.bg)}>
              <div style={s.cardIcon}>{sec.icon}</div>
              <div style={s.cardTitle(sec.color)}>{sec.title}</div>
              <div style={s.cardDesc}>{sec.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
