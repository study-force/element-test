"use client";
import { useState, useEffect, use } from "react";

export default function SettingPage({ params }) {
  const { academy } = use(params);
  const [academyData, setAcademyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/academy/${encodeURIComponent(academy)}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(data => { setAcademyData(data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [academy]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const testUrl = `${baseUrl}/${academy}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(testUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <p style={{ color: "#94A3B8" }}>로딩 중...</p>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 8 }}>🔍</p>
        <p style={{ fontSize: 16, color: "#1E293B", fontWeight: 600 }}>등록되지 않은 학원입니다.</p>
        <p style={{ fontSize: 13, color: "#94A3B8" }}>본사에 문의해 주세요.</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1E293B", marginBottom: 6 }}>학원 정보</h1>
        <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 32 }}>학원 ID: {academy}</p>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 12, letterSpacing: 1 }}>학원 정보</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#1E293B", marginBottom: 4 }}>{academyData?.name}</p>
          <p style={{ fontSize: 14, color: "#64748B" }}>{academyData?.tel}</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, marginBottom: 12, letterSpacing: 1 }}>학생/학부모 배포용 링크</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 16, wordBreak: "break-all" }}>{testUrl}</p>
          <button onClick={handleCopy} style={btnStyle}>
            {copied ? "✅ 복사됐습니다!" : "링크 복사"}
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  width: "100%", padding: "12px", fontSize: 14, fontWeight: 600,
  color: "#fff", background: "#1E293B", border: "none", borderRadius: 8, cursor: "pointer"
};
