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

  return <ElementTest academy={academyData} />;
}
