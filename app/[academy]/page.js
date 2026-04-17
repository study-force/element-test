"use client";
import { useState, useEffect, use } from "react";
import ElementTest from "../ElementTest";

export default function AcademyPage({ params }) {
  const { academy } = use(params);
  const [academyData, setAcademyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/academy/${encodeURIComponent(academy)}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(data => { setAcademyData(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [academy]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <p style={{ color: "#94A3B8", fontSize: 14 }}>로딩 중...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 8 }}>🔍</p>
        <p style={{ fontSize: 16, color: "#1E293B", fontWeight: 600 }}>페이지를 찾을 수 없습니다.</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>
        <ElementTest academy={academyData} />
      </div>
      <footer style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "10px 20px", background: "#F1EDE5",
        borderTop: "1px solid #E2D9CE", fontSize: 12, color: "#94A3B8",
      }}>
        <span>© 2026 스터디포스 언어과학연구소</span>
        <span style={{ fontWeight: 600, color: "#64748B" }}>{academyData.name}</span>
      </footer>
    </div>
  );
}
