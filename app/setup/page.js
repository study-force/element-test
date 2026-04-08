"use client";
import { useState, useEffect } from "react";

export default function SetupPage() {
  const [adminPw, setAdminPw] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [academies, setAcademies] = useState([]);

  useEffect(() => {
    fetch("/api/academy").then(r => r.json()).then(d => {
      if (d.academies) setAcademies(d.academies);
    }).catch(() => {});
  }, [result]);

  const handleCreate = async () => {
    setError(""); setResult(null); setLoading(true);
    try {
      const res = await fetch("/api/academy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPw, slug: slug.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.slug);
      setSlug(""); setPassword("");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1E293B", marginBottom: 8 }}>학원 계정 생성</h1>
        <p style={{ fontSize: 13, color: "#64748B", marginBottom: 32 }}>본사 관리자 전용</p>

        {/* 관리자 비밀번호 */}
        <label style={labelStyle}>관리자 비밀번호</label>
        <input type="password" value={adminPw} onChange={e => setAdminPw(e.target.value)}
          placeholder="관리자 비밀번호 입력" style={inputStyle} />

        {/* 학원 slug */}
        <label style={labelStyle}>학원 ID (영문)</label>
        <input value={slug} onChange={e => setSlug(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
          placeholder="예: bundang, ironman" style={inputStyle} />
        {slug && <p style={{ fontSize: 11, color: "#94A3B8", margin: "-8px 0 12px" }}>
          앱 주소: {baseUrl}/{slug.toLowerCase()}
        </p>}

        {/* 학원장 비밀번호 */}
        <label style={labelStyle}>학원장 비밀번호</label>
        <input value={password} onChange={e => setPassword(e.target.value)}
          placeholder="학원장이 설정 시 사용할 비밀번호" style={inputStyle} />

        {/* 생성 버튼 */}
        <button onClick={handleCreate} disabled={loading || !adminPw || !slug || !password}
          style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>
          {loading ? "생성 중..." : "학원 계정 생성"}
        </button>

        {/* 결과 */}
        {result && (
          <div style={{ marginTop: 20, padding: 16, background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 8 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#166534", margin: "0 0 8px" }}>생성 완료!</p>
            <p style={{ fontSize: 12, color: "#166534", margin: "0 0 4px" }}>앱 주소: <strong>{baseUrl}/{result}</strong></p>
            <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>설정 주소: <strong>{baseUrl}/{result}/setting</strong></p>
          </div>
        )}
        {error && (
          <div style={{ marginTop: 20, padding: 12, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: "#DC2626", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* 학원 목록 */}
        {academies.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1E293B", marginBottom: 12 }}>등록된 학원 ({academies.length})</h2>
            <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
              {academies.map((a, i) => (
                <div key={a.slug} style={{ padding: "10px 14px", borderBottom: i < academies.length - 1 ? "1px solid #F1F5F9" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{a.slug}</span>
                    {a.name && <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8 }}>{a.name}</span>}
                  </div>
                  <span style={{ fontSize: 11, color: a.name ? "#059669" : "#D97706" }}>{a.name ? "설정완료" : "미설정"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "10px 12px", fontSize: 14, border: "1px solid #D1D5DB", borderRadius: 8, marginBottom: 16, outline: "none", boxSizing: "border-box" };
const btnStyle = { width: "100%", padding: "12px", fontSize: 14, fontWeight: 600, color: "#fff", background: "#1E293B", border: "none", borderRadius: 8, cursor: "pointer" };
